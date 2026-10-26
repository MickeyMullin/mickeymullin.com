#!/bin/zsh
# deploy/deploy.sh — operator-run deploy of the local preview at mm.home.vorheim.com
#
# Builds ~/dev/mickeymullin.com as it is on disk (uncommitted edits included: it is a preview) and
# (re)starts the real Node server under launchd. Nothing invokes this automatically: no package
# script, git hook, or launch agent calls it, and it does nothing without a subcommand.
# Production is Hostinger, which builds from GitHub; this script never touches it. See deploy/README.md.
set -euo pipefail

APP_DIR="$HOME/dev/mickeymullin.com"
LABEL="com.mickey.mickeymullin-preview"
TEMPLATE_NAME="$LABEL.plist"
PLIST_TEMPLATE="$APP_DIR/deploy/$TEMPLATE_NAME"
PLIST_DEST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG_FILE="$HOME/Library/Logs/mickeymullin-preview.log"
ERR_FILE="$HOME/Library/Logs/mickeymullin-preview.err.log"
PORT=4310
BASE_URL="http://127.0.0.1:$PORT"
DOMAIN="gui/$(id -u)"
LOCK_STAMP="$APP_DIR/node_modules/.preview-deploy-lock.sha256"
MIN_NODE="22.12"
SCRIPT_DIR="${0:A:h}"

autoload -Uz is-at-least

usage() {
  cat >&2 <<'EOF'
usage: deploy.sh <check|render|deploy> [--reinstall]

  check        dry run: validate the checkout, Node, the port and the plist, print the plan, change nothing
  render       print the launchd plist the deploy would install, change nothing
  deploy       install dependencies if package-lock.json changed, build, smoke-test the build,
               install or refresh the launch agent, restart it, and check the running server
  --reinstall  with deploy: run npm ci even if package-lock.json is unchanged
EOF
}

log() { print -r -- "mm-preview: $*" }
fail() { print -r -- "mm-preview: $*" >&2; exit 1 }

# The plist needs an absolute path, and launchd has no useful PATH. Homebrew's node comes first:
# whatever `node` is first on an interactive PATH may be a copy bundled with some other tool (Hermes
# links its own into ~/.local/bin), which can move or change version when that tool updates. The
# Homebrew symlink is kept as is (not resolved into the Cellar), so `brew upgrade node` does not
# leave the plist pointing at a deleted version. MM_PREVIEW_NODE overrides both.
resolve_node() {
  local found
  if [[ -n "${MM_PREVIEW_NODE:-}" ]]; then
    [[ -x "$MM_PREVIEW_NODE" ]] || fail "MM_PREVIEW_NODE=$MM_PREVIEW_NODE is not executable"
    print -r -- "$MM_PREVIEW_NODE"
    return
  fi
  if [[ -x /opt/homebrew/bin/node ]]; then
    print -r -- /opt/homebrew/bin/node
    return
  fi
  found="$(command -v node 2>/dev/null || true)"
  [[ -n "$found" && -x "$found" ]] || fail "node not found at /opt/homebrew/bin/node or on PATH"
  print -r -- "$found"
}

# The npm that ships with that node, so install, build and smoke run on the same Node as the service.
resolve_npm() {
  local node="$1"
  [[ -x "${node:h}/npm" ]] || fail "no npm next to $node"
  print -r -- "${node:h}/npm"
}

check_node_version() {
  local node="$1" version
  version="$("$node" -p 'process.versions.node' 2>/dev/null)" || fail "could not run $node"
  is-at-least "$MIN_NODE" "$version" || fail "$node is $version; package.json needs >=$MIN_NODE"
  print -r -- "$version"
}

# Read-only. Refuses anything the deploy cannot work with; fixes nothing up.
preflight() {
  [[ -d "$APP_DIR" ]] || fail "no checkout at $APP_DIR"
  local top
  top="$(git -C "$APP_DIR" rev-parse --show-toplevel 2>/dev/null)" || fail "$APP_DIR is not a git checkout"
  [[ "${top:A}" == "${APP_DIR:A}" ]] || fail "$APP_DIR is inside another repository ($top), not a checkout of its own"
  [[ -f "$APP_DIR/package-lock.json" ]] || fail "$APP_DIR has no package-lock.json; is this the React Router version of the site?"
  [[ -f "$APP_DIR/server.js" ]] || fail "$APP_DIR has no server.js"
  if [[ "${SCRIPT_DIR:A}" != "${APP_DIR:A}/deploy" ]]; then
    log "note: running the copy of deploy.sh in $SCRIPT_DIR; it always deploys $APP_DIR"
  fi
}

# A preview builds whatever is on disk, so a branch or uncommitted edits are expected: say so,
# never refuse or touch them.
describe_checkout() {
  local branch head changes
  branch="$(git -C "$APP_DIR" symbolic-ref --quiet --short HEAD 2>/dev/null || print -r -- '(detached)')"
  head="$(git -C "$APP_DIR" log -1 --format='%h %s')"
  log "checkout: $APP_DIR on $branch at $head"
  changes="$(git -C "$APP_DIR" --no-optional-locks status --short)"
  if [[ -n "$changes" ]]; then
    log "uncommitted changes (included in the preview build):"
    print -r -- "$changes" | sed 's/^/    /'
  fi
}

job_pid() {
  launchctl print "$DOMAIN/$LABEL" 2>/dev/null | awk '$1 == "pid" && $2 == "=" { print $3; exit }' || true
}

# Something other than this job on the port (a `npm start` left running, another preview) would
# make the job crash-loop under KeepAlive while the health check talks to the wrong server.
check_port() {
  local listeners job
  listeners="$(lsof -nP -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
  [[ -z "$listeners" ]] && return 0
  job="$(job_pid)"
  local pid
  for pid in ${(f)listeners}; do
    if [[ "$pid" != "$job" ]]; then
      fail "port $PORT is held by pid $pid ($(ps -o command= -p "$pid" 2>/dev/null || print -r -- unknown)), not $LABEL; stop it first"
    fi
  done
}

lock_hash() { shasum -a 256 "$APP_DIR/package-lock.json" | awk '{ print $1 }' }

deps_current() {
  [[ -d "$APP_DIR/node_modules" && -f "$LOCK_STAMP" ]] && [[ "$(<"$LOCK_STAMP")" == "$(lock_hash)" ]]
}

# The checked-out template, so the plist moves in lockstep with the code it launches. Falls back to
# the template beside this script for a checkout that predates deploy/.
template_path() {
  if [[ -f "$PLIST_TEMPLATE" ]]; then
    print -r -- "$PLIST_TEMPLATE"
  elif [[ -f "$SCRIPT_DIR/$TEMPLATE_NAME" ]]; then
    print -r -- "$SCRIPT_DIR/$TEMPLATE_NAME"
  else
    fail "no launchd template at $PLIST_TEMPLATE"
  fi
}

# Renders into $2 and refuses anything launchd could not load: an unresolved placeholder, or a file
# plutil rejects. Callers render into a temporary file, so a bad template never replaces a working plist.
render_plist() {
  local template="$1" dest="$2" node
  node="$(resolve_node)"
  sed -e "s|__HOME__|$HOME|g" -e "s|__NODE__|$node|g" "$template" > "$dest"
  if grep -q '__[A-Z][A-Z]*__' "$dest"; then
    fail "unresolved placeholder in rendered plist from $template"
  fi
  plutil -lint "$dest" >/dev/null || fail "rendered plist from $template does not lint"
}

plist_matches_installed() {
  [[ -f "$PLIST_DEST" ]] &&
    diff -q <(plutil -convert xml1 -o - "$PLIST_DEST") <(plutil -convert xml1 -o - "$1") >/dev/null
}

TMP_PLIST=""
cleanup() { [[ -n "$TMP_PLIST" ]] && rm -f "$TMP_PLIST"; return 0 }
trap cleanup EXIT

new_tmp_plist() { TMP_PLIST="$(mktemp -t mm-preview-plist)" }

cmd_render() {
  new_tmp_plist
  render_plist "$(template_path)" "$TMP_PLIST"
  cat "$TMP_PLIST"
}

cmd_check() {
  preflight
  local node version pid template
  node="$(resolve_node)"
  version="$(check_node_version "$node")"
  log "dry run: nothing is installed, built, copied, or restarted"
  describe_checkout
  log "node: $node ($version)"
  if deps_current; then
    log "dependencies: package-lock.json unchanged since the last deploy; npm ci would be skipped"
  else
    log "dependencies: npm ci would run (no node_modules, no stamp, or package-lock.json changed)"
  fi
  check_port
  pid="$(job_pid)"
  if [[ -n "$pid" ]]; then log "service: $LABEL running as pid $pid"; else log "service: $LABEL not running"; fi

  template="$(template_path)"
  new_tmp_plist
  render_plist "$template" "$TMP_PLIST"
  log "plist: rendered from $template and lints clean"
  if plist_matches_installed "$TMP_PLIST"; then
    log "plist: installed $PLIST_DEST already matches; deploy would kickstart the job"
  elif [[ -f "$PLIST_DEST" ]]; then
    log "plist: installed $PLIST_DEST would change; deploy would reload the job:"
    diff -u <(plutil -convert xml1 -o - "$PLIST_DEST") <(plutil -convert xml1 -o - "$TMP_PLIST") | sed 's/^/    /' || true
  else
    log "plist: none installed at $PLIST_DEST yet; deploy would install and load it"
  fi

  cat <<EOF
mm-preview: 'deploy.sh deploy' would run, in $APP_DIR:
    1. npm ci, only if package-lock.json changed (or with --reinstall)
    2. npm run build
    3. npm run smoke (a throwaway server on a free port; the running preview is not involved)
    4. render deploy/$TEMPLATE_NAME; install it to $PLIST_DEST if it differs
    5. restart $DOMAIN/$LABEL (kickstart -k, or bootout + bootstrap when the plist changed)
    6. check $BASE_URL: a new pid, GET / is 200 with the H1 and a hashed CSP, PUT /?index is 405
EOF
}

# bootout returns before launchd has finished tearing the job down, and bootstrapping into a domain
# that still holds it fails with "Bootstrap failed: 5: Input/output error". Wait for the job to
# disappear, then retry the bootstrap itself.
reload_service() {
  launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || true
  for _ in {1..20}; do
    launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1 || break
    sleep 0.5
  done
  local attempt
  for attempt in {1..10}; do
    if launchctl bootstrap "$DOMAIN" "$PLIST_DEST" 2>&1; then
      return 0
    fi
    if launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1; then
      log "$LABEL was already loaded; continuing"
      return 0
    fi
    log "bootstrap of $LABEL failed, retrying ($attempt)" >&2
    sleep 1
  done
  fail "could not bootstrap $LABEL into $DOMAIN; the preview is NOT running"
}

# Checks the server that answers is a fresh Node process serving this build: a pid other than the
# one before the restart, the page with its H1, the CSP with script hashes that only server.js
# sends, and a 405 for PUT, which only the hardened server gives.
health_check() {
  local previous="$1" pid="" code="" headers method
  for _ in {1..15}; do
    sleep 1
    pid="$(job_pid)"
    [[ -n "$pid" && "$pid" != "$previous" ]] || continue
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 "$BASE_URL/" 2>/dev/null || true)"
    [[ "$code" == 200 ]] && break
  done
  [[ -n "$pid" && "$pid" != "$previous" ]] || fail "$LABEL did not start a new process; see $ERR_FILE"
  [[ "$code" == 200 ]] || fail "GET $BASE_URL/ gave ${code:-no answer}, not 200; see $ERR_FILE"
  curl -fs --max-time 5 "$BASE_URL/" | grep -q '<h1' || fail "GET $BASE_URL/ has no <h1>"
  headers="$(curl -fsS -o /dev/null -D - --max-time 5 "$BASE_URL/")"
  print -r -- "$headers" | grep -qi "^content-security-policy:.*'sha256-" ||
    fail "GET $BASE_URL/ has no hashed Content-Security-Policy; is this the Node server?"
  method="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 -X PUT "$BASE_URL/?index")"
  [[ "$method" == 405 ]] || fail "PUT $BASE_URL/?index gave $method, not 405"
  log "healthy: pid $pid, GET / 200 with H1 and hashed CSP, PUT 405"
}

cmd_deploy() {
  local reinstall="$1"
  preflight
  local node npm version previous template
  node="$(resolve_node)"
  npm="$(resolve_npm "$node")"
  version="$(check_node_version "$node")"
  # npm and the build tools start with `#!/usr/bin/env node`; make that the same node
  path=("${node:h}" $path)
  describe_checkout
  check_port
  previous="$(job_pid)"

  cd "$APP_DIR"
  if [[ "$reinstall" == 1 ]] || ! deps_current; then
    log "installing dependencies: npm ci (node $version)"
    "$npm" ci --no-audit --no-fund
    lock_hash > "$LOCK_STAMP"
  else
    log "dependencies: package-lock.json unchanged; skipping npm ci (use --reinstall to force)"
  fi
  "$npm" run build
  "$npm" run smoke

  template="$(template_path)"
  new_tmp_plist
  render_plist "$template" "$TMP_PLIST"
  if plist_matches_installed "$TMP_PLIST" && [[ -n "$previous" ]]; then
    log "restarting $LABEL (pid $previous)"
    launchctl kickstart -k "$DOMAIN/$LABEL"
  else
    mkdir -p "${PLIST_DEST:h}" "${LOG_FILE:h}"
    # bootstrap reads the plist only once, so it is refreshed before the reload
    cp "$TMP_PLIST" "$PLIST_DEST"
    log "installed $PLIST_DEST; reloading $LABEL"
    reload_service
  fi

  health_check "$previous"
  log "preview deployed: $(git -C "$APP_DIR" rev-parse --short HEAD)$([[ -n "$(git -C "$APP_DIR" --no-optional-locks status --short)" ]] && print -r -- ' plus uncommitted changes'), at $BASE_URL and https://mm.home.vorheim.com"
}

case "${1:-}" in
  check) [[ $# -eq 1 ]] || { usage; exit 2 }; cmd_check ;;
  render) [[ $# -eq 1 ]] || { usage; exit 2 }; cmd_render ;;
  deploy)
    if [[ $# -eq 1 ]]; then
      cmd_deploy 0
    elif [[ $# -eq 2 && "$2" == --reinstall ]]; then
      cmd_deploy 1
    else
      usage
      exit 2
    fi
    ;;
  *)
    usage
    exit 2
    ;;
esac
