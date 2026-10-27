# Google Business Profile (#698): ready-to-paste setup

Everything here matches the live site, so name, phone, and services stay consistent. Mickey creates the profile at business.google.com under **pyrolupus@** (the same account that owns GA4 and Search Console). Bing Places (#701) can import it afterwards.

**Wait for #730 before verifying.** Google usually verifies service-area businesses by video now, and it asks for proof that you run the business: the NH-stamped Certificate of Formation does that. Creating the draft profile beforehand is fine.

## Decisions for Mickey (defaults in bold)

| | Default | Why |
| --- | --- | --- |
| Business name | **Mickey Mullin** | Must match the site, the JSON-LD `name`, and the trade name (#733). Don't add keywords ("Mickey Mullin Wi-Fi & Networking"): that breaks Google's name rules and gets profiles suspended. |
| Business type | **Service-area business, address hidden** | No storefront. Google still needs the home address for verification but doesn't show it. Switch to a storefront only with a real staffed office (no PO box or virtual office). |
| Phone | **(603) 660-3913** for now | Matches the site. When #702 lands, change the site, GBP, and listings on the same day. |
| Hours | **Mon–Fri 5:30–9 PM, Sat 9 AM–5 PM, Sun closed** | GBP shows "Open"/"Closed" from these, so list only times you can actually answer. Alternative: no hours at all, which shows nothing and reads as "by appointment". |
| Website link | **`https://mickeymullin.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp`** | Tags profile clicks so GA4 and Umami show them as Google Business Profile traffic instead of plain Google search. |
| Appointment link | **`https://mickeymullin.com/#contact`** | The contact form. Leave it empty if you'd rather not show a "Book" button. |
| Opening date | **Month the LLC is approved** | Or leave it blank. |

## Categories

Primary category: **Computer networking service**. It's the most specific fit for the work that gets found in Maps, which is Wi-Fi, cabling, and troubleshooting.

Additional categories (all confirmed on Google's current list; up to 9 allowed, fewer is better):

1. **Telecommunications contractor**: cabling and the GC low-voltage sub work.
2. **Software company**: custom software, integrations, and mockup to production.
3. **Website designer**: small-business websites.
4. *Computer support and services*: the task lists it, but it attracts "fix my laptop/printer" calls. **Include it only if you'll take those.** Otherwise leave it off.

Not recommended: Computer repair service (same problem, worse), Security system installation service (cameras/alarms, which you don't offer), Internet service provider (wrong), and Computer consultant (vague, and it competes with the primary category).

## Service area

Up to 20 areas. Use the site's list (`app/content/towns.ts`), in this order:

Manchester, Bedford, Goffstown, Hooksett, Londonderry, Derry, Merrimack, Nashua, Concord (all NH).

Add more only if you'd really drive there (Auburn, Candia, Litchfield, Hudson, and Bow are the natural next ring).

## Description (≤ 750 characters, no links, no prices)

> I'm Mickey Mullin. I set up and fix networks for small offices and homes around Manchester and southern New Hampshire: business and home Wi-Fi, Ubiquiti UniFi installs, Cat6 cabling, troubleshooting, wireless bridges to outbuildings, and backup internet. General contractors can use me as their low-voltage network sub. I also build custom software, integrations, and small-business websites, and I take apps people built with AI tools the last mile to something customers can use. One person from quote to hand-off: an itemized written quote, then your admin logins, a labeled port map, and a one-page summary of the setup. Evening and Saturday appointments available.

(Run `wc -m` on it before pasting; it is under 750.)

## Services

GBP → Edit services. Add these as custom services under the category shown. Descriptions are trimmed from the site and stay under GBP's 300-character limit. Prices are left off on purpose, because ranges don't fit GBP's single price field and the site has the full table.

**Computer networking service**
- **Network troubleshooting**: Slow, dropping, or flaky networks found and fixed on site, not guessed at over the phone.
- **Business & home Wi-Fi**: Coverage that reaches every room, the warehouse floor, and the back deck. Guest networks kept apart from the business network.
- **UniFi installs**: Ubiquiti UniFi gateways, PoE switches, and access points, set up with sensible VLANs and handed over with your own logins.
- **Small-office networks**: Internet, firewall, switching, and Wi-Fi for a new or reorganized office, plus a rack that someone else can make sense of.
- **Wireless bridges & failover**: Reach the barn or second building without trenching. Automatic backup internet for when the main line goes down.

**Telecommunications contractor**
- **Network cabling**: Cat6 drops, jacks, and patch panels, tested and labeled. Power work goes to a licensed electrician.
- **Low-voltage sub for general contractors**: Itemized bid, rough-in and trim-out on your schedule, and a port map at closeout.

**Software company**
- **Custom software**: Internal tools, portals, and dashboards that replace the spreadsheet, the whiteboard, and the sticky notes.
- **Mockup to production**: You built an app with ChatGPT, Claude, Lovable, Bolt, or Replit and it almost works. I take it the last mile: domain, hosting, logins, email, CRM, backups, and a security check. Free review, then a fixed quote.
- **Integrations & automation**: Connect your CRM, scheduling, invoicing, and email so data is entered once.

**Website designer**
- **Small-business websites**: Fast, clean sites that load quickly, show up in local search, and can be edited without calling anyone.

## Attributes

Set only the ones that are true: **Onsite services: yes**, **Online appointments: yes** (by email or the form). Leave identity attributes (veteran-owned and so on) to Mickey.

## Photos (Google: real, unedited, no stock; JPG/PNG, 10 KB–5 MB, ≥ 720 × 720)

| Slot | What | Source / status |
| --- | --- | --- |
| Logo | Square mark on a solid background, 720 × 720 | `public/icon-512.png` is too small. Export at 720+ from the logo work (#719); fine to add later. |
| Cover | 16:9 (1024 × 576 or larger): Mickey at work, e.g. terminating a patch panel or mounting an AP | New shoot. Pair it with the headshot (#723). |
| Headshot ("Team") | Mickey, same look as the site | #723 (beard). Use the current site headshot until then. |
| At work, 3–5 | Hands on a punch-down tool, a labeled patch panel, a cable tester showing a pass, a ceiling AP, and a tidy rack | The #738 practice gear works if you shoot the panel and tester, but don't caption it as a client job. Add real installs as they happen (ask clients first, and keep their addresses and screens out of frame). |
| Work, ongoing | Before/after of a messy closet you cleaned up; the hand-off port map (sample data) | Add 1–2 a month. Steady photo uploads help ranking. |
| Software | A screenshot of something you built, with no client data, or the site itself | Optional. |

Skip storefront and interior photos, because this is a service-area business.

## After it's created

1. Ask for the short review link (Ask for reviews) and put it on #699 (review loop) and #721 (cards with QR).
2. Add the GBP URL to `SITE.sameAs` in `app/content/site.ts` (#722/#703).
3. Bing Places → import from Google (#701).
4. Post an update every couple of weeks (a finished job, a tip) once there's something real to show.
