# mickeymullin.com

Source for [mickeymullin.com](https://mickeymullin.com/): networking, Wi-Fi and custom software in Manchester and southern New Hampshire.

The previous DocPad site is archived on the [`docpad`](../../tree/docpad) branch.

## Layout

```
site/            → deployed as-is to the web root (Hostinger public_html)
  index.html       single-page site: content, meta, JSON-LD structured data
  styles.css       all styles (no build step)
  script.js        analytics bootstrap, event tracking, contact form
  contact.php      contact form handler (PHP 8, mail())
  robots.txt, sitemap.xml, llms.txt, 404.html, .htaccess, favicon.svg
  images/          og-image.png (1200×630 social card)
tools/
  og-image.html    source for images/og-image.png (render at 1200×630)
TODO.md          everything left to launch and grow the site
```

**Status:** `site/` is the design and content prototype (plain HTML/CSS/JS). The target stack is Bun + React (Vite, prerendered) + Elysia on Node, deployed as a Hostinger Node.js Web App. `contact.php` goes away in that re-platform. See TODO.md.

## Local preview

```sh
cd site && python3 -m http.server 8787
# open http://127.0.0.1:8787/
```

`contact.php` needs PHP to run (`php -S 127.0.0.1:8787 -t site`). Under the Python server the form shows its "didn't send" fallback.

## Analytics

Fill in the IDs in the `window.SITE` block in `index.html`. Each tool loads only when its ID is set:

- `ga4`: Google Analytics 4 measurement ID
- `umamiSrc` / `umamiId`: self-hosted Umami
- `clarity`: Microsoft Clarity (optional)

Tracked events: `generate_lead` (form sent), `click_to_call`, `click_to_email`, `cta_click`.

## Deploy

Upload the contents of `site/` to `public_html/` (hPanel File Manager, SFTP, or Hostinger's Git deploy pointed at this repo with `site/` as the root). See TODO.md for removing the old WordPress install first.

© Mickey Mullin. All rights reserved.
