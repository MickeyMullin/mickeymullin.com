# Deploying mickeymullin.com to Hostinger

The site runs as a Hostinger **Node.js Web App** (Business Web Hosting plan): React Router v7 in framework mode, served by Express (`server.js`), deployed from GitHub on every push to `master`.

The first deploy happens in two stages so the current WordPress site stays up until the new one has been checked:

1. **Stage 1: temporary domain.** Deploy the app to a free `*.hostingersite.com` address and verify it there. The live site is not touched.
2. **Stage 2: cutover.** Back up and remove WordPress, connect `mickeymullin.com` to the app, fix DNS, add the email settings, and verify again.

> Status: written before the first deploy. Steps marked *(unverified)* come from Hostinger's documentation and haven't been run yet. Update this file with what actually happened.

## Who does what

Hostinger, GitHub authorization, Namecheap and Google Workspace all need Mickey's logins. No credentials go in the repo, in chat or in Dispatch.

| Step | Mickey | Luci |
| --- | --- | --- |
| Build the app (#680), contact form (#681) | review | build, test, push |
| Create the Node.js Web App, connect GitHub | ✔ hPanel + GitHub OAuth | provide settings (below) |
| Verify the temporary-domain deploy | | ✔ checks below |
| Back up WordPress, then delete it (#687) | ✔ irreversible, his call | confirm the backup exists before deletion |
| Connect the domain in hPanel | ✔ | |
| DNS records at Namecheap | ✔ | provide exact records, verify with `dig` |
| Workspace sending address, app password, DKIM (#686) | ✔ | provide records, verify |
| Enter secrets as hPanel env vars | ✔ | name the variables |
| Post-cutover verification, GSC sitemap | GSC login if needed | ✔ |

Optional: a Hostinger API token stored in the browser vault (not in chat) would let Luci read deploy status and logs instead of asking for screenshots.

## Current state (checked 2026-10-26, after cutover)

- The new app serves `https://mickeymullin.com`. WordPress is deleted (#687); its backup is in `~/backup/mickeymullin.com-wordpress-2026-10-26/` and on the NAS.
- DNS is hosted at **Namecheap** (`dns1/dns2.registrar-servers.com`).
- `mickeymullin.com` A → `46.202.183.215`, and `www` A → `46.202.183.215` only. Hostinger kept the same IP for the Node.js app, so the A records didn't change.
- MX → Google (`aspmx.l.google.com`).
- SPF is still `v=spf1 include:mailgun.org ~all`; Mailgun was only WordPress's mailer (WP Mail SMTP). It should become `v=spf1 include:_spf.google.com ~all`, plus Google DKIM and DMARC `p=none` (#686).
- TXT records already present: `google-site-verification=…` (Search Console is verified by DNS, so it survived WordPress and Site Kit going away), `ahrefs-site-verification_…`, `openai-domain-verification=…`.
- The contact form answers 503 with the email fallback until the mail environment variables are set (step 5; Gmail API with a send-only OAuth token, see `docs/gmail-oauth.md`).

## Stage 1: deploy to a temporary domain

Prerequisite: #680 merged to `master`, with `npm ci && npm run build && node server.js` passing locally on Node 22.

Mickey, in hPanel:

1. **Websites → Add Website → Node.js web app.**
2. **Connect with GitHub.** Grant access to `MickeyMullin/mickeymullin.com` only, not all repositories.
3. Choose the repo, and choose **Use temporary domain** *(unverified wording)*.
4. Check the detected settings against this table. Hostinger detects React Router from `react-router` + `@react-router/express` in `package.json`.

   | Field | Value |
   | --- | --- |
   | Framework / application type | `react-router` |
   | Branch | `master` (auto-deploy on push) |
   | Node.js version | 22 |
   | Package manager | npm (from `package-lock.json`) |
   | Build script | `build` |
   | Output directory | `build` |
   | Entry file | `server.js` |

   The build tools (`vite`, `@react-router/dev`) are regular dependencies, so the build works whether or not Hostinger installs devDependencies. `npm ci --omit=dev && npm run build && npm run smoke` was checked locally on Node 22 with npm 10.

   **What Hostinger actually runs** (first deploy, 2026-10-25): it runs `npm install` and `npm run build` in a staging copy of the repo, then copies only the entry file and the output directory (with `package.json` and `node_modules`) into `hbuilds/versions/<build>/nodejs/`, and points `hbuilds/current` at it. Passenger starts the app through Hostinger's own wrapper (`PassengerStartupFile react-router-server.cjs` in `public_html/.htaccess`), which loads `server.js`. Nothing else from the repo is there. The first deploy crashed on every start with `ERR_MODULE_NOT_FOUND` for `server/app.js`, because `server.js` imported it from outside `build/`. Since then `npm run build` copies `server/*.js` into `build/runtime/`, `server.js` imports only from `build/`, and `npm run smoke` runs the server from a directory laid out the same way, so the mistake fails locally first.

   Runtime errors land in the app's runtime log in hPanel and in `domains/<domain>/hbuilds/current/nodejs/stderr.log`. With the Claude Code Hostinger plugin signed in, the read-only operations `hosting_nodejs_build-logs`, `hosting_nodejs_runtime-logs`, `hosting_nodejs_build-settings` and `hosting_nodejs_list-builds` return the same information without hPanel.

5. Environment variables: none are required for stage 1. Without the SMTP settings, the contact form answers HTTP 503 and shows the email address as a fallback instead of sending.
6. **Deploy**, then send Luci the temporary URL. If detection picked anything other than `react-router`, send a screenshot of the settings screen.

Luci then verifies against the temporary URL:

```sh
U=https://<temporary>.hostingersite.com
curl -sI $U/ | grep -iE '^(HTTP|content-security|strict-transport|x-content-type|referrer-policy)'
curl -s $U/ | grep -c '<h1'                         # pre-rendered HTML, not an empty shell
curl -s $U/ | grep -o 'application/ld+json' | wc -l # JSON-LD present (then parse each block)
for p in robots.txt sitemap.xml llms.txt favicon.ico icon-512.png images/og-image.png; do curl -s -o /dev/null -w "%{http_code} $p\n" $U/$p; done
curl -s -o /dev/null -w '%{http_code}\n' $U/no-such-page # expect 404
# contact form without JavaScript: 503 + fallback message without SMTP, 200 once SMTP is set
curl -s -o /dev/null -w '%{http_code}\n' -d 'name=Test&email=test%40example.com&message=Stage+1+check' "$U/?index"
# honeypot: 200 (reports success, sends nothing)
curl -s -o /dev/null -w '%{http_code}\n' -d 'name=Bot&email=bot%40example.com&message=x&company_url=http%3A%2F%2Fspam' "$U/?index"
# rate limit: these two plus four more POSTs from the same IP; the 6th within 15 minutes answers 429
for i in 1 2 3 4; do curl -s -o /dev/null -w '%{http_code} ' -d 'name=T&email=t%40example.com&message=x' "$U/?index"; done; echo
```

The rate limit is per visitor IP, read from the `X-Forwarded-For` header Hostinger's proxy adds (Express `trust proxy` = 1 hop, the default). Confirm the hop count once, without exposing anything publicly:

1. Mickey adds the env var `LOG_CLIENT_IP=1` in hPanel and restarts the app.
2. From a machine whose public IP you know (`curl -4 -s https://ifconfig.me`), request a made-up path: `curl -4 -s -o /dev/null $U/ipcheck-plain` (it 404s, but is logged first). Don't use `/robots.txt`: on the free temporary domain Hostinger's CDN answers it itself, so the request never reaches the app.
3. In the app's runtime log, find the line `[client-ip] GET /ipcheck-plain req.ip=… x-forwarded-for="…" remote=…`. The log is visible in hPanel, or through the Claude Code Hostinger plugin's read-only `hosting_nodejs_runtime-logs`; nothing is added to any response.
4. Read it:
   - `req.ip` is your public IP: one hop is right. Leave `TRUST_PROXY` unset.
   - `req.ip` is a Hostinger or CDN address and your IP is further left in `x-forwarded-for`: count the addresses to the right of yours, add one, and set `TRUST_PROXY` to that number (for example `x-forwarded-for="<you>, 10.0.0.5"` means `TRUST_PROXY=2`). Restart and repeat step 2 until `req.ip` is your IP.
   - `x-forwarded-for` is empty: the proxy doesn't send it. Set `TRUST_PROXY=false` right away and restart (otherwise a visitor could pick their own rate-limit bucket by sending the header), then file a task: every visitor now shares one rate limit.
5. Check the proxy can't be fooled. Repeat step 2 with a made-up address: `curl -4 -s -o /dev/null -H 'X-Forwarded-For: 203.0.113.1' $U/ipcheck-spoof`. `req.ip` must still be your real IP, with `203.0.113.1` further left in `x-forwarded-for`. If `req.ip` is `203.0.113.1`, the proxy passes the header through instead of adding to it, and anyone can dodge the rate limit: set `TRUST_PROXY=false` right away, restart, and file a task.
6. Remove `LOG_CLIENT_IP` and restart. While it's set, every request is logged with the visitor's IP.

**Result on 2026-10-25 (temporary domain):** one hop is right; `TRUST_PROXY` stays unset. From `70.8.175.180`:

```
[client-ip] GET /ipcheck-plain req.ip=70.8.175.180 x-forwarded-for="70.8.175.180, 70.8.175.180,70.8.175.180" remote=127.0.0.1
[client-ip] GET /ipcheck-spoof req.ip=70.8.175.180 x-forwarded-for="203.0.113.1, 70.8.175.180, 203.0.113.1, 70.8.175.180,70.8.175.180" remote=127.0.0.1
```

Hostinger's proxies keep whatever the client sent and append the real address on the right (the chain repeats because the request passes more than one Hostinger layer), so the rightmost entry is always the address Hostinger saw. Requests Hostinger makes itself right after a deploy come from its own IPv6 range (`2a02:4780:…`). Repeat this check after cutover, since the custom domain may sit behind a different CDN path.

Then in a browser: desktop and phone layouts, the form with JavaScript off (the fallback message), and Lighthouse mobile (SEO and Accessibility at least 95).

Stage 1 can be repeated as often as needed. It never touches the live site.

## Stage 2: cutover to mickeymullin.com

Prerequisites: stage 1 verified; the business name (#675) and prices (#676) are decided; the copy review is done (#689); the privacy page (#683) and contact form (#681) are merged; the email setup (#686) is done.

1. **Back up WordPress (Mickey).** In hPanel, generate and **download** a full backup (files + database), plus a WordPress export. Keep them outside Hostinger. Luci confirms the files exist and are non-empty before the next step.
2. **Remove WordPress (Mickey, #687).** Delete the WordPress website for `mickeymullin.com` in hPanel, which releases the domain. Hostinger won't attach a domain that another website on the account is using. The site is down from here until step 4 propagates, so do steps 2 through 4 together.
3. **Connect the domain (Mickey).** On the Node.js app: **Connect domain** → `mickeymullin.com`. hPanel then shows the IP to point at.
4. **DNS at Namecheap (Mickey; Luci provides the exact values).**
   - `@` A → the IP from step 3 (it may still be `46.202.183.215`).
   - `www`: exactly one A record to the same IP (or a CNAME to `mickeymullin.com` if hPanel suggests one). If `dig` shows an extra `www` address that isn't in Advanced DNS, it's a Namecheap redirect: delete the redirect.
   - Leave MX and the verification TXT records alone.
5. **Email and secrets (Mickey).** In hPanel → the app → Environment variables:

   | Variable | Value |
   | --- | --- |
   | `CONTACT_TO` | `info@mickeymullin.com` |
   | `CONTACT_FROM` | `info@mickeymullin.com` (an alias of `mickey@`, listed under Gmail's "Send mail as") |
   | `GMAIL_CLIENT_ID` | the Desktop OAuth client's ID |
   | `GMAIL_CLIENT_SECRET` | that client's secret (entered in hPanel only) |
   | `GMAIL_REFRESH_TOKEN` | the send-only refresh token (entered in hPanel only) |

   The OAuth client and token come from `docs/gmail-oauth.md`; `bun scripts/gmail-oauth.ts copy …` puts each value on the clipboard for pasting. No `SMTP_*` variables: an app password would open the whole mailbox. The mail variables are read when the app starts, so changing one needs a restart (a redeploy also restarts it). Analytics variables (`GA4_ID`, `UMAMI_SRC`, `UMAMI_WEBSITE_ID`, `CLARITY_ID`) get added later by #682/#692/#695; those will be baked into the pre-rendered pages, so changing one needs a redeploy.
6. **Redeploy** from hPanel (or push to `master`).

Luci verifies with the stage 1 checks against `https://mickeymullin.com`, plus:

- `dig +short mickeymullin.com A` and `dig +short www.mickeymullin.com A` return only the new IP.
- HTTPS certificate is valid for both names, and `www` redirects to the apex. The app itself answers a `Host` of exactly `www.mickeymullin.com` (any case, any port) with a 301 to the bare domain; other hosts are served as is.
- `http://` redirects to `https://`. The app doesn't do this redirect itself (the old `.htaccess` did), so it has to come from Hostinger's proxy. If it doesn't, file a task.
- `curl -s https://mickeymullin.com/robots.txt` is ours (starts with `# mickeymullin.com`, ends with the `Sitemap:` line), not Hostinger's stock `User-agent: Googlebot / Disallow: /`, which the CDN serves on the temporary domain. If the stock file shows up on the real domain, stop: it blocks Google. Purge the CDN cache and check hPanel's CDN settings.
- The trust-proxy check from stage 1 (`LOG_CLIENT_IP=1`, plain and spoofed requests, then remove it).
- A real contact submission arrives in the inbox (`info@mickeymullin.com`), and its headers show SPF, DKIM, and DMARC passing.
- `/privacy` names each analytics tool the site loads (GA4 at least, #692). The page says the site uses analytics, and its tool list is generated from the analytics IDs baked into the build, so an empty list means the IDs are missing from this build: fix that before announcing the site. Set `PRIVACY_UPDATED` in `app/content/privacy.ts` to the launch date.
- Search Console: submit `/sitemap.xml` and request indexing of `/` (#693). IndexNow (#691) runs by itself: the GitHub workflow `.github/workflows/indexnow.yml` runs `bun scripts/indexnow.ts --wait` after each push to `master` that changes `app/`, `public/`, or `server/`. The script waits until the live sitemap matches the commit, checks that the key file `/<key>.txt` is served, then submits every sitemap URL. To run it by hand: `bun scripts/indexnow.ts` (or **Run workflow** in GitHub Actions).

**What actually happened (2026-10-26):**

- Steps 1–3 went as written. Mickey downloaded the hPanel files and database backups. Luci verified them before deletion: the archives open cleanly, all posts, pages, and media match a public REST export taken first, and there's a second copy on the NAS.
- Step 4 was nearly a no-op. After **Connect domain**, the apex already worked, because the app got the same IP (`46.202.183.215`). The stray `www` address `192.64.119.234` was not a DNS record: it was a Namecheap **redirect** for `www`, set outside the DNS records, which shows up externally as an A record. Deleting the redirect fixed it. While it existed, HTTPS to that address timed out, so about half of `https://www` visits hung.
- `http://` → `https://` and `www` → apex both come from Hostinger and the app with 301s. The certificate is Let's Encrypt, and HSTS is `max-age=31536000`.
- Robots: ours is served on the real domain, not the stock file.
- Umami: `data-domains` was cut to `mickeymullin.com` only. A real browser visit got `/api/send` 200.
- Old WordPress URLs (posts, `/feed/`, `/wp-admin/`) return 404, as intended.
- Before deleting WordPress, disconnect what it used: the Kit (ConvertKit) WordPress app, Site Kit's Google access (it only ever linked Search Console), and the Mailgun mailer.
- Step 5 used the send-only Gmail API token (`docs/gmail-oauth.md`) instead of an app password. hPanel's **Apply changes** on environment variables restarts the app by itself.
- A real form submission (POST `/?index`) answered 200 with the success message and arrived from `Mickey Mullin website <info@mickeymullin.com>`. Gmail kept the alias and did not rewrite it to `mickey@`. Mail from `info@` to `info@` never leaves Google, so **Show original** shows no SPF, DKIM, or DMARC results. Check those on a copy sent to an outside mailbox instead. A copy to a gmail.com address showed SPF PASS, DMARC PASS, and DKIM PASS, but signed by `mickeymullin-com.20251104.gappssmtp.com` (Google's fallback key), not `mickeymullin.com`. DMARC passed through SPF alignment. The cause: Google Admin's **Authenticate email** still read "Not authenticating email" although the DNS record was published, because **Start authentication** had never been clicked. After clicking it (status: "Authenticating email with DKIM"), the next outside test showed DKIM PASS with domain `mickeymullin.com`, along with SPF PASS and DMARC PASS, within minutes.
- Trust-proxy recheck on the real domain (2026-10-26): one hop is still right, and `TRUST_PROXY` stays unset. From `70.8.175.180`:

  ```
  [client-ip] GET /ipcheck-plain req.ip=70.8.175.180 x-forwarded-for="70.8.175.180" remote=127.0.0.1
  [client-ip] GET /ipcheck-spoof req.ip=70.8.175.180 x-forwarded-for="203.0.113.1, 203.0.113.1,70.8.175.180" remote=127.0.0.1
  ```

  On the real domain the request passes through fewer Hostinger layers than on the temporary domain, but the spoofed entry still stays on the left. `LOG_CLIENT_IP` was then set to `0`. Anything other than `1` turns logging off.
- Still open: the sitemap submission (#693).

## Rollback

- **Stage 1:** nothing to roll back. Delete the temporary app if needed.
- **Stage 2, before WordPress is deleted:** stop. The live site is unaffected.
- **Stage 2, after WordPress is deleted:** fix forward, or restore WordPress from the backup in step 1. A restore is slow, which is why stage 1 has to pass first.
- **A bad later deploy:** revert the commit on `master` and push. Hostinger rebuilds from the new head.

## Later deploys

Push to `master`. Hostinger installs, builds and restarts. The restart matters: the server reads the inline-script hashes for its Content-Security-Policy from the built pages once, at startup, so a build without a restart would serve new pages under old hashes and block their scripts. If a deploy ever looks broken in that way, restart the app in hPanel. After each deploy that changes URLs, ping IndexNow (#691).
