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

## Current state (checked 2026-10-25)

- DNS is hosted at **Namecheap** (`dns1/dns2.registrar-servers.com`).
- `mickeymullin.com` A → `46.202.183.215` (Hostinger, the WordPress site).
- `www.mickeymullin.com` has **two** A records: `46.202.183.215` and `192.64.119.234` (a Namecheap parking/redirect address). About half of `www` visitors may not reach the site. Fix at cutover.
- MX → Google (`aspmx.l.google.com`).
- SPF is `v=spf1 include:mailgun.org ~all`. It does **not** authorize Google, so mail sent through Workspace can fail SPF. No DMARC record. Fixed in #686.
- TXT records already present: `google-site-verification=…` (Search Console is likely already verified for the domain), `ahrefs-site-verification_…`, `openai-domain-verification=…`.

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

5. Environment variables: none are required for stage 1. Without the SMTP settings, the contact form shows the email address as a fallback instead of sending.
6. **Deploy**, then send Luci the temporary URL. If detection picked anything other than `react-router`, send a screenshot of the settings screen.

Luci then verifies against the temporary URL:

```sh
U=https://<temporary>.hostingersite.com
curl -sI $U/ | grep -iE '^(HTTP|content-security|strict-transport|x-content-type|referrer-policy)'
curl -s $U/ | grep -c '<h1'                         # pre-rendered HTML, not an empty shell
curl -s $U/ | grep -o 'application/ld+json' | wc -l # JSON-LD present (then parse each block)
for p in robots.txt sitemap.xml llms.txt favicon.ico icon-512.png images/og-image.png; do curl -s -o /dev/null -w "%{http_code} $p\n" $U/$p; done
curl -s -o /dev/null -w '%{http_code}\n' $U/no-such-page # expect 404
```

Then in a browser: desktop and phone layouts, the form with JavaScript off (the fallback message), and Lighthouse mobile (SEO and Accessibility at least 95).

Stage 1 can be repeated as often as needed. It never touches the live site.

## Stage 2: cutover to mickeymullin.com

Prerequisites: stage 1 verified; the business name (#675) and prices (#676) are decided; the copy review is done (#689); the privacy page (#683) and contact form (#681) are merged; the email setup (#686) is done.

1. **Back up WordPress (Mickey).** In hPanel, generate and **download** a full backup (files + database), plus a WordPress export. Keep them outside Hostinger. Luci confirms the files exist and are non-empty before the next step.
2. **Remove WordPress (Mickey, #687).** Delete the WordPress website for `mickeymullin.com` in hPanel, which releases the domain. Hostinger won't attach a domain that another website on the account is using. The site is down from here until step 4 propagates, so do steps 2 through 4 together.
3. **Connect the domain (Mickey).** On the Node.js app: **Connect domain** → `mickeymullin.com`. hPanel then shows the IP to point at.
4. **DNS at Namecheap (Mickey; Luci provides the exact values).**
   - `@` A → the IP from step 3 (it may still be `46.202.183.215`).
   - `www`: delete **both** existing A records and create one A record to the same IP. Or use a CNAME to `mickeymullin.com` if hPanel suggests one.
   - Leave MX and the verification TXT records alone.
5. **Email and secrets (Mickey).** In hPanel → the app → Environment variables:

   | Variable | Value |
   | --- | --- |
   | `CONTACT_TO` | `hello@mickeymullin.com` |
   | `CONTACT_FROM` | the sending address from #686 |
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `465` |
   | `SMTP_USER` | the sending address |
   | `SMTP_PASS` | a Google **app password** for that address (entered in hPanel only) |

   Analytics variables (`GA4_ID`, `UMAMI_SRC`, `UMAMI_WEBSITE_ID`, `CLARITY_ID`) get added later by #682/#692/#695. Changing a variable needs a redeploy, because pages are pre-rendered at build time.
6. **Redeploy** from hPanel (or push to `master`).

Luci verifies with the stage 1 checks against `https://mickeymullin.com`, plus:

- `dig +short mickeymullin.com A` and `dig +short www.mickeymullin.com A` return only the new IP.
- HTTPS certificate is valid for both names, and `www` redirects to the apex (or the reverse, but consistently).
- `http://` redirects to `https://`.
- A real contact submission arrives in the inbox, and its headers show SPF, DKIM and DMARC passing.
- Search Console: submit `/sitemap.xml` and request indexing of `/` (#693). Then ping IndexNow (#691).

## Rollback

- **Stage 1:** nothing to roll back. Delete the temporary app if needed.
- **Stage 2, before WordPress is deleted:** stop. The live site is unaffected.
- **Stage 2, after WordPress is deleted:** fix forward, or restore WordPress from the backup in step 1. A restore is slow, which is why stage 1 has to pass first.
- **A bad later deploy:** revert the commit on `master` and push. Hostinger rebuilds from the new head.

## Later deploys

Push to `master`. Hostinger installs, builds and restarts. After each deploy that changes URLs, ping IndexNow (#691).
