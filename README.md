# mickeymullin.com

Source for [mickeymullin.com](https://mickeymullin.com/): networking, Wi-Fi and custom software in Manchester and southern New Hampshire.

The previous DocPad site is archived on the [`docpad`](../../tree/docpad) branch.

## Stack

- [React Router v7](https://reactrouter.com/) in framework mode (Vite, TypeScript, React 19). Every page is pre-rendered to static HTML at build time, so the full content, meta tags and JSON-LD ship without JavaScript.
- [Express](https://expressjs.com/) (`server.js`) serves the build through `@react-router/express`, with helmet (security headers and CSP), compression and express-rate-limit.
- The contact form is a route action on the home page. It sends through the Gmail API (Google Workspace) with a send-only OAuth token, composing the message with nodemailer; SMTP stays as a fallback. It works without JavaScript. Setup: `docs/gmail-oauth.md`.
- Bun for local package management, dev and tests. Hostinger builds and runs it with npm on Node 22, so runtime code uses nothing Bun-specific.
- Hosted as a Hostinger Node.js Web App. Deploy steps, who does what, and rollback: [docs/deploy-hostinger.md](docs/deploy-hostinger.md).

## Layout

```
app/
  root.tsx           document shell, global links, header/footer, 404 and error page
  routes.ts          route config
  routes/home.tsx    the home page: meta, JSON-LD, contact form action
  routes/robots.ts, sitemap.ts, llms.ts   generated text files (pre-rendered)
  content/           all copy and data as typed modules (pages, services, pricing, FAQ, towns, JSON-LD)
  components/        header, footer, logo, and one component per home page section
  lib/               contact form validation and sending, mailer, analytics, CSP nonce, head tags (seo.ts)
  entry.server.tsx   server rendering with the CSP nonce
  styles.css         the single global stylesheet (Mint Dark theme)
public/              favicons, app icons, images (copied to build/client as-is)
server.js            entry file: loads the build and starts Express (imports only from build/)
server/app.js        the Express app (middleware, static files, React Router handler)
server/prerendered.js  finds pre-rendered pages and hashes their inline scripts for the CSP
scripts/copy-runtime.mjs  second half of npm run build: copies server/*.js to build/runtime/
scripts/smoke.mjs    npm run smoke: plain-Node smoke test of a build, laid out like Hostinger
tests/               bun test suites
tools/og-image.html  source for public/images/og-image.png (render at 1200×630)
assets/              original photos
docs/                Hostinger deploy runbook
deploy/              local preview at mm.home.vorheim.com: deploy.sh, launchd template, Caddy block
```

To add a page: add it to `PAGES` in `app/content/pages.ts`, create the route in `app/routes/` with `export const meta = () => pageMeta(page)` (from `app/lib/seo.ts`), and register it in `app/routes.ts`. `PAGES` drives pre-rendering, `sitemap.xml`, `llms.txt`, and the head tags: title, description, canonical, robots, Open Graph, Twitter card, and JSON-LD, with a BreadcrumbList on every inner page. Every page uses `SITE.ogImage` unless its entry sets `ogImage`.

## Local development

```sh
bun install
bun run dev         # Vite dev server with hot reload, http://localhost:5173
bun test            # builds the app, then runs unit and end-to-end tests
bun run typecheck   # react-router typegen + tsc
```

`bun run dev` runs React Router's dev server, not `server.js`, so it has no security headers or rate limit. To run exactly what production runs:

```sh
npm run build
PORT=4317 npm start   # or: PORT=4317 node server.js
```

Hostinger runs the app from a copy holding only `server.js`, `build/`, `package.json` and `node_modules`; the rest of the repo is not there. So `server.js` must import only from `build/`, and `npm run build` copies the Express app (`server/*.js`) into `build/runtime/` after `react-router build`. Edit `server/`, never `build/runtime/`.

`npm run smoke` checks a build in plain Node (no Bun). It copies `server.js`, `package.json` and `build/` into an empty temporary directory (with `node_modules` linked), the same layout Hostinger runs, and starts `node server.js` there on a free port with `CONTACT_TRANSPORT=log`, requests `/` (expects 200 and the H1), `/no-such-page` (404), a form POST to `/?index` (200) and a PUT to `/?index` (405), then stops the server. It exits non-zero if any check fails. Run `npm run build` first.

Without SMTP settings the contact form answers with its "please email me" fallback. To see the full success path locally, start with `CONTACT_TRANSPORT=log`, which prints each message to the server log instead of sending it. Don't set that on Hostinger.

### Local preview (`mm.home.vorheim.com`)

The preview runs `server.js` from this checkout under launchd, behind Caddy. It serves the built pages, so it never picks up edits on its own. After you edit the site:

```sh
deploy/deploy.sh deploy   # npm ci if the lockfile changed, build, smoke test, restart, check
deploy/deploy.sh check    # dry run: shows what deploy would do, changes nothing
```

It builds whatever is on disk, uncommitted edits included, and contact-form messages go to `~/Library/Logs/mickeymullin-preview.log` instead of being sent. Details, setup and removal: [`deploy/README.md`](deploy/README.md).

### Lockfile

`package-lock.json` is the only committed lockfile, because Hostinger installs with `npm ci`. `bun install` reads it (and writes a `bun.lock`, which is gitignored). To add or upgrade a dependency, use `npm install <package>` so `package-lock.json` changes, then run `bun install` again.

## Hostinger settings

| Field | Value |
| --- | --- |
| Application type | `react-router` |
| Node.js version | 22 |
| Package manager | npm (from `package-lock.json`) |
| Build script | `build` (runs `react-router build`) |
| Output directory | `build` |
| Entry file | `server.js` |

Hostinger detects the app type from `react-router` and `@react-router/express` in `package.json`. `server.js` listens on `process.env.PORT`, on every interface unless `LISTEN_HOST` is set. `engines.node` is `>=22.12`, which Vite 7 requires.

The build tools (`@react-router/dev`, `vite`) are in `dependencies`, not `devDependencies`, so the build still works if Hostinger installs with `--omit=dev` or `NODE_ENV=production`. Only TypeScript and the type packages are dev-only; the build doesn't need them.

### Environment variables

Set these in hPanel, never in the repo. All are optional. Without `CONTACT_TO`, `CONTACT_FROM`, and a complete sending group (Gmail API or SMTP), the form shows the email address instead of sending.

| Variable | Purpose |
| --- | --- |
| `CONTACT_TO` | where form messages go, e.g. `info@mickeymullin.com` |
| `CONTACT_FROM` | the From address, e.g. `info@mickeymullin.com` (must be the Google user's address or a "Send mail as" alias) |
| `GMAIL_CLIENT_ID` | Gmail API group (preferred): the Desktop OAuth client's ID. See `docs/gmail-oauth.md` |
| `GMAIL_CLIENT_SECRET` | that client's secret |
| `GMAIL_REFRESH_TOKEN` | refresh token with only the `gmail.send` scope, from `bun scripts/gmail-oauth.ts authorize`. If any `GMAIL_*` is set, all three must be, and SMTP is ignored |
| `SMTP_HOST` | SMTP fallback group: `smtp.gmail.com` for Google Workspace |
| `SMTP_PORT` | `465` (implicit TLS, the default) or `587` (STARTTLS) |
| `SMTP_USER` | the SMTP login |
| `SMTP_PASS` | an app password for that login (opens the whole mailbox; prefer the Gmail API group) |
| `TRUST_PROXY` | Express "trust proxy" setting. Default `1` (one reverse proxy in front, which is how Hostinger runs Node apps) |
| `LOG_CLIENT_IP` | `1` logs each request's `req.ip`, raw `X-Forwarded-For` and socket address, to confirm the `TRUST_PROXY` hop count after a deploy. Leave unset otherwise |
| `PORT` | set by Hostinger |
| `LISTEN_HOST` | leave unset on Hostinger (listens on every interface). The local preview sets `127.0.0.1`. |

Mail settings are read when the app starts, so changing one needs a restart or redeploy.

## Contact form

The form posts to the home route's action (`/?index`). Without JavaScript the browser does a normal POST and the server re-renders the page with the result, scrolled to the form. With JavaScript the same action runs through a React Router fetcher and the page stays put.

- Fields: name, email and message are required; phone and town are optional. Every field has a length cap, checked in the browser and again on the server, with per-field error messages.
- Anything that goes into a mail header has CR, LF and other control characters replaced with spaces.
- `company_url` is a honeypot: filled in, the server reports success and sends nothing.
- POSTs are limited to 5 per 15 minutes per IP (express-rate-limit, in-memory), and the limit is checked before the body is read. Over the limit, the visitor gets the page back with HTTP 429 and a message to wait or email directly.
- POSTs need a `Content-Length` of at most 100 KB (otherwise 411 or 413). A body that isn't a form (JSON, broken multipart) gets the form back with HTTP 400 and the usual field errors.
- The server answers only GET, HEAD and POST. Any other method, OPTIONS included, gets 405 with `Allow: GET, HEAD, POST` before the body is read, because React Router would otherwise hand PUT, PATCH and DELETE to the contact action. There is no cross-origin API, so there's nothing to answer a CORS preflight for. The action also refuses anything but POST on its own.
- On success the browser calls `track('generate_lead')`, which does nothing until analytics is configured.

## Security headers and CSP

helmet sets HSTS (`max-age=31536000` without `includeSubDomains` or preload, because not every subdomain of mickeymullin.com is confirmed to serve HTTPS; revisit after the cutover), `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY` and the rest of its defaults, plus a `Permissions-Policy`. The Content Security Policy has no `'unsafe-inline'` for scripts or styles:

- **Pre-rendered pages** are static files, so a per-request nonce can't be written into them. They contain a few inline scripts from React Router (hydration data, the module loader, scroll restoration), whose content is fixed at build time. At startup `server/prerendered.js` reads every pre-rendered HTML file in `build/client` and adds the sha256 hash of each inline script to `script-src`. The hashes always match the files actually served, and a rebuild updates them on the next start.
- **Pages rendered per request** (the contact form result, the 404 page) get a fresh random nonce in the CSP header, which React Router and React put on their inline scripts.
- JSON-LD blocks are data, not scripts, and CSP doesn't apply to them.
- Styles and fonts come only from the site itself (`style-src 'self'`, `font-src 'self'`). The logo SVG uses presentation attributes instead of `style` attributes so no inline styles are needed. IBM Plex is self-hosted from `app/fonts/` (latin subset, SIL OFL 1.1); Vite fingerprints the files into `/assets/`.

When analytics is turned on, each tool's script and beacon hosts have to be added to the CSP in `server/app.js`.

## Canonical host

Requests whose `Host` header is exactly `www.mickeymullin.com` (any port, any case) get a 301 to `https://mickeymullin.com` plus the same path and query. The check uses only the `Host` header, never `X-Forwarded-Host`, and the target is the fixed origin from `app/content/site.ts`, so a request can't produce a redirect to another site. Every other host is served normally.

## Caching

Hashed files in `/assets` are cached for a year (`immutable`). Pre-rendered HTML is served with `no-cache` (revalidated with ETag on every visit), `robots.txt`, `sitemap.xml` and `llms.txt` for an hour, images and icons for a day. Pages rendered per request are `no-store`.

## Analytics

Each tool loads only when its ID is set in `ANALYTICS` in `app/lib/analytics.ts` (all empty for now):

- `ga4`: Google Analytics 4 measurement ID
- `umamiSrc` / `umamiId`: self-hosted Umami
- `clarity`: Microsoft Clarity (optional)

Tracked events: `generate_lead` (form sent), `click_to_call`, `click_to_email`, `cta_click`.

© Mickey Mullin. All rights reserved.
