# Local preview at `mm.home.vorheim.com`

The preview runs the real Node server (`server.js`) from `~/dev/mickeymullin.com` under launchd as `com.mickey.mickeymullin-preview`, on `127.0.0.1:4310`, with Caddy in front at `https://mm.home.vorheim.com`. It is how the site is checked locally before anything goes to Hostinger.

This is not the production deploy. Production is Hostinger, which builds from GitHub; see [`docs/deploy-hostinger.md`](../docs/deploy-hostinger.md). Nothing here touches Hostinger.

| File | Purpose |
| --- | --- |
| `deploy.sh` | the preview deploy: `check` (dry run), `render`, `deploy` |
| `com.mickey.mickeymullin-preview.plist` | launchd template; `__HOME__` and `__NODE__` are filled in at render time |
| `Caddyfile.snippet` | the `mm.home.vorheim.com` block, installed by hand in `/opt/homebrew/etc/Caddyfile` |
| `deploy.test.ts` | static checks and sandboxed dry runs of the script, part of `bun test` |

## After you edit the site

```bash
~/dev/mickeymullin.com/deploy/deploy.sh deploy
```

That builds the checkout as it is on disk, including uncommitted edits and whatever branch is checked out (it's a preview), and restarts the server. The server serves the built pages, so it never picks up edits on its own.

To see what it would do without changing anything:

```bash
~/dev/mickeymullin.com/deploy/deploy.sh check
```

`deploy` runs these steps and stops at the first failure:

1. Preflight: `~/dev/mickeymullin.com` is its own git checkout with `package-lock.json` and `server.js`; Node is at least 22.12 (Homebrew's `/opt/homebrew/bin/node`, or `MM_PREVIEW_NODE` if set; install, build, smoke test and the service all use that one Node); nothing other than the preview job is listening on port 4310. The branch, commit and any uncommitted changes are printed, never touched.
1. `npm ci`, only when `package-lock.json` has changed since the last deploy (a hash is kept in `node_modules/.preview-deploy-lock.sha256`). `deploy --reinstall` forces it.
1. `npm run build`, then `npm run smoke`, which checks the new build on a throwaway server and port. The running preview is restarted only if the smoke test passes.
1. Render the plist template into a temporary file and lint it. If it matches the installed plist, `launchctl kickstart -k`; otherwise copy it to `~/Library/LaunchAgents/` and reload the job (`bootout`, wait, `bootstrap` with retries).
1. Check `http://127.0.0.1:4310`: a new process ID, `GET /` returns 200 with the H1 and a hashed Content-Security-Policy (which only `server.js` sends), and `PUT /?index` returns 405.

## Boundaries

- Nothing runs `deploy.sh` automatically: no package script, git hook or launch agent calls it, and without a subcommand it prints usage and exits 2.
- It never pulls, fetches, pushes, switches branches, stashes, resets, or deletes anything in the checkout.
- It never touches Caddy or DNS. The Caddy block is a one-time manual step (below).
- The preview listens on `127.0.0.1` only (`LISTEN_HOST=127.0.0.1`), so it is reachable through Caddy and not directly from the LAN.
- The contact form runs with `CONTACT_TRANSPORT=log`: submissions are written to `~/Library/Logs/mickeymullin-preview.log` and nothing is emailed. The template has no SMTP settings, and a test keeps it that way.
- `npm start` or `react-router dev` on port 4310 would block the job; `deploy` and `check` refuse while anything else holds the port. Use another `PORT` for ad hoc runs.

## Logs

- `~/Library/Logs/mickeymullin-preview.log`: server output and logged contact-form messages.
- `~/Library/Logs/mickeymullin-preview.err.log`: errors, including startup failures.

## First-time setup

1. `deploy.sh check`, then `deploy.sh deploy`. The first deploy installs the plist and loads the job.
1. Back up `/opt/homebrew/etc/Caddyfile`, replace its `mm.home.vorheim.com` block with `Caddyfile.snippet`, then `caddy validate --config /opt/homebrew/etc/Caddyfile` and `brew services restart caddy`.
1. Check `https://mm.home.vorheim.com/` loads, and that `curl -X PUT 'https://mm.home.vorheim.com/?index'` returns 405 (the old static setup could not).

## Stopping or removing it

```bash
launchctl bootout gui/$(id -u)/com.mickey.mickeymullin-preview     # stop until the next deploy or login
rm ~/Library/LaunchAgents/com.mickey.mickeymullin-preview.plist     # and remove it for good
```

Then put the previous `mm.home.vorheim.com` block back in the Caddyfile from your backup.
