# TODO: mickeymullin.com

Ordered roughly by when it blocks something. `[decide]` = needs a call from Mickey.

## Before launch (blocking)

- [ ] **[decide] Business name.** The site uses "Mickey Mullin · Networks & Software" for now. Whatever the LLC/DBA ends up being, the name, address and phone (NAP) must match exactly on the site, the Google Business Profile, Bing Places, Apple Business Connect, the Chamber and the BBB. Update `index.html` (title, wordmark, JSON-LD `name`), `llms.txt`, the footer and the OG image together.
- [ ] **[decide] Confirm prices.** The pricing table uses planning estimates (troubleshooting $150–500, Wi-Fi/UniFi $600–2,500, cabling 4–12 drops $1,000–3,000). Check them against Frankie's per-job numbers and adjust for NH.
- [ ] **[decide] Cabling at launch, or Wi-Fi/troubleshooting only** until the Electricians' Board and Manchester building-dept permit answers are in? If it's pulled, remove the "Network cabling" and "For general contractors" rows, the pricing row, and the matching JSON-LD offers and llms.txt lines.
- [ ] **Email.** Create `hello@` (or the address of your choice) and `website@` (the form's From address) in Google Workspace. MX already points at Google.
- [ ] **Contact form.** Set `TO_ADDRESS`/`FROM_ADDRESS` in `contact.php`, deploy, and send a real test. PHP `mail()` on shared hosting often lands in spam. If it does, switch to SMTP (Workspace or Hostinger mailbox) or Postmark/Resend. Add SPF/DKIM/DMARC records for the sending path. Make sure `private/contact-rate` sits outside `public_html` (or add a `Deny from all` .htaccess).
- [ ] **Remove WordPress.** In hPanel: back up and export WordPress first (nothing needs to carry over, but keep the export), delete the WP install and database, then upload `site/` into `public_html`. Cancel the Astra/ConvertKit/Site Kit bits that bill or email.
- [ ] **Photo.** Replace the "MM" placeholder in the About section with a real photo (4:5, ≥800px wide, WebP). Add it to the JSON-LD `Person.image`.
- [ ] **Review the copy** for anything not true yet (FAQ answers, hours line, "within one business day", the "security architect" description).
- [ ] **Privacy policy page** (`/privacy`). Required once GA4/Clarity are on and the form collects contact info. Link it from the footer.

## Analytics and search (launch week)

- [ ] **GA4.** Create a property, put the `G-…` ID in `window.SITE.ga4`, mark `generate_lead` as a key event, and link GA4 to Search Console.
- [ ] **Google Search Console.** Verify by DNS TXT at Namecheap (covers http/https/www) and submit `sitemap.xml`.
- [ ] **Bing Webmaster Tools.** Import from GSC and submit the sitemap. Bing feeds ChatGPT search and Copilot, so it matters more than the traffic share suggests.
- [ ] **Umami (optional, cookieless).** Haroldragan.com self-hosts it at `umami.haroldragan.com`. Options: run it on Ghostwolf behind a public hostname (for example `umami.mickeymullin.com` via Cloudflare Tunnel) or use Umami Cloud's free tier. Then fill in `umamiSrc`/`umamiId`.
- [ ] **Microsoft Clarity (optional).** Heatmaps and session replay, free. Disclose it in the privacy policy.
- [ ] **IndexNow.** Add a key file and ping on deploys (Bing and Yandex pick up changes within minutes).
- [ ] Meta Pixel / Facebook domain verification: only if Facebook ads get run.

## Local presence (the part that actually ranks)

- [ ] **Google Business Profile.** Start as a service-area business (address hidden) and switch to a storefront once the office lease exists. Category: "Computer networking service" (primary), plus "Computer support and services" and "Software company". Hours, services and photos of real installs.
- [ ] **Reviews loop.** A direct review link (`g.page/r/…`) on a card and in the post-job email. Ask every client. No incentives and no gating. Once real reviews exist, add a reviews section to the home page and link it to Google. Note that Google ignores self-served `aggregateRating` markup on your own LocalBusiness for star snippets, so it's only for other parsers. The real value is the reviews on the GBP itself.
- [ ] Bing Places, Apple Business Connect, Greater Manchester Chamber, BBB, Nextdoor business page, Yelp: same NAP everywhere.
- [ ] Add the business address, phone and `openingHoursSpecification` to the JSON-LD once they're real. Switch `@type` to `["LocalBusiness","ProfessionalService"]` with an `address` and `geo`.
- [ ] Business phone number (Google Voice / OpenPhone / a VoIP line). Add `telephone` to the JSON-LD and the commented `tel:` line on the contact block.

## Grow the site (after launch)

- [ ] **Move to a static generator** once there are more than about 5 pages, so the header, footer and JSON-LD aren't copy-pasted. Astro or Eleventy both output plain HTML that Hostinger can serve. Keep the current CSS.
- [ ] **One page per service**, each with its own title, H1, FAQ + `FAQPage` schema, a price range and a photo of real work:
  - `/networking/troubleshooting`
  - `/networking/wifi` (business and home)
  - `/networking/unifi`
  - `/networking/small-office`
  - `/networking/cabling` (after the permit check)
  - `/networking/contractors` (low-voltage sub: bid process, COI on request, port-map closeout)
  - `/networking/wireless-bridges`, `/networking/internet-failover`
  - `/software/custom-software`, `/software/integrations-automation`, `/software/websites`
- [ ] **Location pages:** Manchester, Bedford, Goffstown, Hooksett, Londonderry, Derry, Merrimack, Nashua, Concord. Each needs genuinely local content (jobs done there, typical building stock such as mill conversions and colonial homes with plaster walls, local ISPs, a nearby landmark). Templated pages with swapped town names get discounted. Start with 2–3 and add one per real job.
- [ ] **Work / portfolio page:** before-and-after rack and closet photos, Wi-Fi heat maps, port maps (with client permission, no identifying details).
- [ ] **Blog / notes** (haroldragan.com has 127 posts in "Thought Box"). Short, practical posts answer the questions people type into Google and ChatGPT ("why does my Wi-Fi drop in one room", "UniFi vs eero for a small office", "do I need a permit to run Cat6 in NH"). Aim for one a week from real jobs.
- [ ] `BreadcrumbList` schema on inner pages. Keep `sitemap.xml` and `llms.txt` updated as pages are added. Add per-page OG images.

## Brand

- [ ] **Logo.** A wordmark plus a small mark for the favicon, the van magnet and shirts. The placeholder is a spruce square with "MM" and an orange rule (`favicon.svg`). Then generate `favicon.ico` (48), `apple-touch-icon.png` (180) and `icon-192.png`.
- [ ] Re-render `images/og-image.png` from `tools/og-image.html` after the name or logo changes.
- [ ] Self-host the IBM Plex fonts (drops the Google Fonts request and a privacy-policy line).
- [ ] Business cards and a leave-behind with the review QR code.

## Keep separate

- [ ] Keep campaign content and links off this site, and business content off campaign channels. Social `sameAs` links in the JSON-LD point at the personal @MickeyMullin accounts. Swap them for business accounts if those get created.
