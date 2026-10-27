# Analytics

Config: `server/analytics.js` (`ANALYTICS`). Every value is public and committed. Each tool loads only when its ID is set, and only on the hosts in `ANALYTICS.domains` (`mickeymullin.com`). Umami enforces that through `data-domains`; `startAnalytics()` in `app/lib/analytics.ts` checks it for GA4 and Clarity. The local preview (`mm.home.vorheim.com`), `react-router dev`, and any `*.hostingersite.com` copy send nothing.

## Tools

| Tool | Where to look | Account |
| --- | --- | --- |
| GA4 `G-SFEFD4XDKT` | analytics.google.com → property `mickeymullin.com` → Reports → Realtime (events in the last 30 min), or Admin → Data display → Events | pyrolupus@ |
| Umami Cloud `7052ef9d-…` | cloud.umami.is → mickeymullin.com → Events | Umami Cloud |
| Search Console | URL-prefix property `https://mickeymullin.com/`, linked to GA4 | pyrolupus@ |
| Bing Webmaster Tools | imported from Search Console | mickeymullin@live.com |

## Events the site sends

Sent by `track()` to GA4 and Umami together, from one click listener and the contact form.

| Event | Fires when | Parameters | GA4 key event |
| --- | --- | --- | --- |
| `generate_lead` | the contact form is accepted (server returned the thank-you) | `form: contact` | yes |
| `click_to_call` | any `tel:` link is clicked | `link_url` | no |
| `click_to_email` | any `mailto:` link is clicked | `link_url` | no |
| `cta_click` | a link with `data-cta` is clicked (`hero`, `header`) | `location` | no |

GA4 also records its own enhanced-measurement events (`page_view`, `scroll`, `form_start`, `user_engagement`, and so on). `qualify_lead` and `close_convert_lead` are GA defaults from the setup goal; the site never sends them.

To add a tracked CTA, put `data-cta="<where>"` on the link. `tel:` and `mailto:` links are tracked automatically.

## End-to-end check (#727, 2026-10-26)

A real browser on https://mickeymullin.com with `fetch`/`sendBeacon` instrumented:

- Page load: `gtag/js?id=G-SFEFD4XDKT` loaded, `_ga` set, Umami `script.js` loaded.
- Hero CTA, header CTA, the contact `mailto:`, and `tel:` links: GA4 `g/collect` carried `cta_click` (`location=hero`, then `header`), `click_to_email`, and `click_to_call` once each; Umami `/api/send` returned 200 once per event with the same names.
- One labeled form submission (`Luci (analytics test #727)`): the form returned the thank-you, and GA4 and Umami each got exactly one `generate_lead` (`form: contact`). GA4's own `form_start` also fired; it isn't a duplicate lead.

To repeat it, open the site in a browser, wrap `window.fetch` and `navigator.sendBeacon` to log URLs and bodies, click each element, and read the `en=` values (GA4 puts single events in the query string, batched ones one per line in the body).
