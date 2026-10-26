# mickeymullin.com

Source for [mickeymullin.com](https://mickeymullin.com/): networking, Wi-Fi and custom software in Manchester and southern New Hampshire.

The previous DocPad site is archived on the [`docpad`](../../tree/docpad) branch.

## Stack

- [React Router v7](https://reactrouter.com/) in framework mode (Vite, TypeScript, React 19). Every page is pre-rendered to static HTML at build time, so the full content, meta tags and JSON-LD ship without JavaScript.
- [Express](https://expressjs.com/) (`server.js`) serves the build through `@react-router/express`, with helmet (security headers and CSP), compression and express-rate-limit.
- The contact form is a route action on the home page, sending mail with nodemailer over SMTP (Google Workspace). It works without JavaScript.
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
  lib/               contact form validation and sending, mailer, analytics, CSP nonce
  entry.server.tsx   server rendering with the CSP nonce
  styles.css         the single global stylesheet (Mint Dark theme)
public/              favicons, app icons, images (copied to build/client as-is)
server.js            entry file: loads the build and starts Express
server/app.js        the Express app (middleware, static files, React Router handler)
server/prerendered.js  finds pre-rendered pages and hashes their inline scripts for the CSP
scripts/smoke.mjs    npm run smoke: plain-Node smoke test of a build
tests/               bun test suites
tools/og-image.html  source for public/images/og-image.png (render at 1200×630)
assets/              original photos
docs/                deploy runbook
```

To add a page: create the route in `app/routes/`, register it in `app/routes.ts`, and add it to `PAGES` in `app/content/pages.ts`. That list drives pre-rendering, `sitemap.xml` and `llms.txt`.

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

`npm run smoke` checks a build in plain Node (no Bun): it starts `node server.js` on a free port with `CONTACT_TRANSPORT=log`, requests `/` (expects 200 and the H1), `/no-such-page` (404), a form POST to `/?index` (200) and a PUT to `/?index` (405), then stops the server. It exits non-zero if any check fails. Run `npm run build` first.

Without SMTP settings the contact form answers with its "please email me" fallback. To see the full success path locally, start with `CONTACT_TRANSPORT=log`, which prints each message to the server log instead of sending it. Don't set that on Hostinger.

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

Hostinger detects the app type from `react-router` and `@react-router/express` in `package.json`. `server.js` listens on `process.env.PORT`, on every interface unless `HOST` is set. `engines.node` is `>=22.12`, which Vite 7 requires.

The build tools (`@react-router/dev`, `vite`) are in `dependencies`, not `devDependencies`, so the build still works if Hostinger installs with `--omit=dev` or `NODE_ENV=production`. Only TypeScript and the type packages are dev-only; the build doesn't need them.

### Environment variables

Set these in hPanel, never in the repo. All are optional; without the SMTP group the form shows the email address instead of sending.

| Variable | Purpose |
| --- | --- |
| `CONTACT_TO` | where form messages go, e.g. `hello@mickeymullin.com` |
| `CONTACT_FROM` | the sending mailbox (must be allowed to send through the SMTP account) |
| `SMTP_HOST` | `smtp.gmail.com` for Google Workspace |
| `SMTP_PORT` | `465` (implicit TLS, the default) or `587` (STARTTLS) |
| `SMTP_USER` | the SMTP login, usually the sending address |
| `SMTP_PASS` | a Google app password for that login |
| `TRUST_PROXY` | Express "trust proxy" setting. Default `1` (one reverse proxy in front, which is how Hostinger runs Node apps) |
| `LOG_CLIENT_IP` | `1` logs each request's `req.ip`, raw `X-Forwarded-For` and socket address, to confirm the `TRUST_PROXY` hop count after a deploy. Leave unset otherwise |
| `PORT` | set by Hostinger |
| `HOST` | not set on Hostinger (listens on every interface). The local preview sets `127.0.0.1`. |

SMTP settings are read when the app starts, so changing one needs a restart or redeploy.

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
- Styles come only from `/assets` and Google Fonts. The logo SVG uses presentation attributes instead of `style` attributes so no inline styles are needed. Fonts come from `fonts.gstatic.com` until they are self-hosted (Dispatch #685).

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
