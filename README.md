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

Hostinger detects the app type from `react-router` and `@react-router/express` in `package.json`. `server.js` listens on `process.env.PORT`.

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
| `PORT` | set by Hostinger |

SMTP settings are read when the app starts, so changing one needs a restart or redeploy.

## Contact form

The form posts to the home route's action (`/?index`). Without JavaScript the browser does a normal POST and the server re-renders the page with the result, scrolled to the form. With JavaScript the same action runs through a React Router fetcher and the page stays put.

- Fields: name, email and message are required; phone and town are optional. Every field has a length cap, checked in the browser and again on the server, with per-field error messages.
- Anything that goes into a mail header has CR, LF and other control characters replaced with spaces.
- `company_url` is a honeypot: filled in, the server reports success and sends nothing.
- POSTs are limited to 5 per 15 minutes per IP (express-rate-limit, in-memory). Over the limit, the visitor gets the page back with HTTP 429 and a message to wait or email directly.
- On success the browser calls `track('generate_lead')`, which does nothing until analytics is configured.

## Security headers and CSP

helmet sets HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY` and the rest of its defaults, plus a `Permissions-Policy`. The Content Security Policy has no `'unsafe-inline'` for scripts or styles:

- **Pre-rendered pages** are static files, so a per-request nonce can't be written into them. They contain a few inline scripts from React Router (hydration data, the module loader, scroll restoration), whose content is fixed at build time. At startup `server/prerendered.js` reads every pre-rendered HTML file in `build/client` and adds the sha256 hash of each inline script to `script-src`. The hashes always match the files actually served, and a rebuild updates them on the next start.
- **Pages rendered per request** (the contact form result, the 404 page) get a fresh random nonce in the CSP header, which React Router and React put on their inline scripts.
- JSON-LD blocks are data, not scripts, and CSP doesn't apply to them.
- Styles come only from `/assets` and Google Fonts. The logo SVG uses presentation attributes instead of `style` attributes so no inline styles are needed. Fonts come from `fonts.gstatic.com` until they are self-hosted (Dispatch #685).

When analytics is turned on, each tool's script and beacon hosts have to be added to the CSP in `server/app.js`.

## Caching

Hashed files in `/assets` are cached for a year (`immutable`). Pre-rendered HTML is served with `no-cache` (revalidated with ETag on every visit), `robots.txt`, `sitemap.xml` and `llms.txt` for an hour, images and icons for a day. Pages rendered per request are `no-store`.

## Analytics

Each tool loads only when its ID is set in `ANALYTICS` in `app/lib/analytics.ts` (all empty for now):

- `ga4`: Google Analytics 4 measurement ID
- `umamiSrc` / `umamiId`: self-hosted Umami
- `clarity`: Microsoft Clarity (optional)

Tracked events: `generate_lead` (form sent), `click_to_call`, `click_to_email`, `cta_click`.

© Mickey Mullin. All rights reserved.
