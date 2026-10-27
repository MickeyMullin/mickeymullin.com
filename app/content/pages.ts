// The route list. Every page here is pre-rendered at build time and listed in
// sitemap.xml and llms.txt, and app/lib/seo.ts builds its head tags from it.
// Add service, town and blog pages here as they are built.

import { listOf } from '../lib/text'
import { priceRow } from './pricing'
import { AI_BUILDERS } from './services'

export type Page = {
  path: string
  // Link text in llms.txt, and the page's name in its breadcrumb
  label: string
  // What the page covers, for llms.txt
  summary: string
  // The llms.txt heading the page is listed under (default "Pages")
  group?: 'Services'
  title: string
  description: string
  // Open Graph title and description, when they should differ from title and description
  ogTitle?: string
  ogDescription?: string
  // Absolute URL; defaults to SITE.ogImage
  ogImage?: string
  // Defaults to DEFAULT_ROBOTS in app/lib/seo.ts
  robots?: string
  // Defaults to summary_large_image
  twitterCard?: 'summary' | 'summary_large_image'
  lastmod: string
}

export const PAGES: Page[] = [
  {
    path: '/',
    label: 'Home',
    summary: 'services, pricing, service area, contact',
    title: 'Mickey Mullin — Wi-Fi, Networking & Custom Software | Manchester, NH',
    description:
      'Business and home Wi-Fi, UniFi networks, network cabling, and troubleshooting around Manchester and southern New Hampshire — plus custom software and integrations. One person, start to finish.',
    ogTitle: 'Mickey Mullin — Networks that hold up. Software that fits.',
    ogDescription:
      'Wi-Fi, UniFi, cabling, and troubleshooting for small offices and homes in southern NH, plus custom software and integrations.',
    lastmod: '2026-10-26',
  },
  {
    path: '/networking/troubleshooting',
    label: 'Network troubleshooting',
    group: 'Services',
    summary:
      'on-site diagnosis of slow or dropping Wi-Fi and wired networks: the usual causes, telling an internet provider problem from an inside one, how a visit goes, written findings, when it needs new equipment, and pricing',
    title: 'Network & Wi-Fi Troubleshooting | Manchester, NH',
    description: `Wi-Fi keeps dropping or the office internet is slow? I find the cause on site, fix what I can that visit, and write up the rest. ${priceRow('troubleshooting').price}. Manchester, NH.`,
    lastmod: '2026-10-26',
  },
  {
    path: '/networking/wifi',
    label: 'Business & home Wi-Fi',
    group: 'Services',
    summary:
      'Wi-Fi design and installation for homes and small offices: why the ISP router falls short, the site walk and coverage plan, mesh vs. wired access points, guest networks on their own VLAN, outdoor and outbuilding coverage, UniFi, the hand-off, and pricing',
    title: 'Business & Home Wi-Fi Installation | Manchester, NH',
    description:
      'Wi-Fi that reaches every room, the warehouse, and the back deck: a site walk, wired access points, and a separate guest network. Manchester and southern NH.',
    lastmod: '2026-10-26',
  },
  {
    path: '/networking/unifi',
    label: 'UniFi installs',
    group: 'Services',
    summary:
      'Ubiquiti UniFi installs for small offices and homes: the gateway, PoE switch, and access points, why UniFi over an ISP router or a mesh kit, when it is overkill, how it is set up (VLANs and firewall rules), whose account it is, buying the hardware yourself, and pricing',
    title: 'UniFi Installer: Ubiquiti Network Setup | Manchester, NH',
    description:
      'UniFi installer for offices and homes: a gateway, PoE switch, and access points, set up with VLANs and handed over in your name. Manchester and southern NH.',
    lastmod: '2026-10-27',
  },
  {
    path: '/networking/small-office',
    label: 'Small-office networks',
    group: 'Services',
    summary:
      'network setup for offices of 1 to 20 people: what it includes, when to call before a move, cleaning up the network closet, what ongoing support is and is not offered, the hand-off, and the usual parts of the price',
    title: 'Small Business Network Setup | Manchester, NH',
    description:
      'Office network installation for 1 to 20 people: internet, firewall, switching, Wi-Fi, and a closet someone else can make sense of. Manchester and southern NH.',
    lastmod: '2026-10-27',
  },
  {
    path: '/networking/cabling',
    label: 'Network cabling',
    group: 'Services',
    summary:
      'Cat6 network cabling: what a job includes, how it is installed (plenum or riser cable, firestopping, and J-hooks), how every run is tested and labeled, certification testing, electrical work, cabling in older buildings and finished walls, and pricing',
    title: 'Network Cabling & Cat6 Installation | Manchester, NH',
    description:
      'Cat6 network cabling for small offices: cable runs, patch panels, jacks, and wall plates. Every run tested and labeled at both ends. Manchester and southern NH.',
    lastmod: '2026-10-27',
  },
  {
    path: '/networking/wireless-bridges',
    label: 'Wireless bridges',
    group: 'Services',
    summary:
      'point-to-point wireless bridges that carry a network to a barn, detached garage, shop, or second building: what a bridge is, why the line of sight matters, a bridge compared with a mesh unit or an extender, how the radios are mounted and powered over PoE, security, the equipment, the hand-off, and how the job is quoted',
    title: 'Point-to-Point Wireless Bridges | Manchester, NH',
    description:
      'A point-to-point wireless bridge can carry your network to the barn, detached garage, or shop without trenching. I check the line of sight first. Southern NH.',
    lastmod: '2026-10-27',
  },
  {
    path: '/networking/contractors',
    label: 'For general contractors',
    group: 'Services',
    summary:
      'low-voltage network subcontracting for general contractors and remodelers: bidding from plans, working to the schedule at rough-in and trim-out, what is in the closeout, what is out of scope, and who buys the hardware',
    title: 'Low-Voltage Network Subcontractor | Manchester, NH',
    description:
      'Data and Wi-Fi sub for NH general contractors: an itemized bid from your plans, rough-in and trim-out on your schedule, and a tested, labeled closeout.',
    lastmod: '2026-10-27',
  },
  {
    path: '/software/mockup-to-production',
    label: 'Mockup to production',
    group: 'Services',
    summary: `taking apps built with ${listOf(AI_BUILDERS, 'or')} to production: domain and DNS, email, CRM, hosting, logins, security, reliability, and ownership, starting with a free review and then a fixed quote`,
    title: 'Lovable, Bolt, or Replit App to Production | Mickey Mullin',
    description:
      'Built an app with Lovable, Bolt, Replit, v0, ChatGPT, or Claude? I connect your domain, email, CRM, and logins, and secure it. Free review, then a fixed quote.',
    lastmod: '2026-10-26',
  },
  {
    path: '/software/custom-software',
    label: 'Custom software',
    group: 'Services',
    summary:
      'custom web apps for small businesses (internal tools, portals, and dashboards): when an off-the-shelf product is the better buy, first versions (MVPs) to test an idea, how a project goes, who builds it, who owns the code and accounts, what happens after launch, and pricing by fixed quote',
    title: 'Custom Business Software Developer | Manchester, NH',
    description:
      'Custom software for small businesses: internal tools, portals, and dashboards in place of the spreadsheet. A fixed quote, and you own the code. Manchester, NH.',
    lastmod: '2026-10-27',
  },
  {
    path: '/software/integrations-automation',
    label: 'Integrations & automation',
    group: 'Services',
    summary:
      'connecting the CRM, accounting, scheduling, email, web forms, and spreadsheets a small business already uses: what can be connected (and the API condition), examples, when custom code beats a Zapier or Make workflow, alerts when a connection breaks, who owns the accounts and keys, how it starts, and pricing by fixed quote',
    title: 'Business Automation & CRM Integration | Manchester, NH',
    description:
      "Connect your CRM, QuickBooks, scheduling, and email so data is entered once. Zapier or Make where they fit, custom code where they don't. Manchester, NH.",
    lastmod: '2026-10-27',
  },
  {
    path: '/software/websites',
    label: 'Small-business websites',
    group: 'Services',
    summary:
      'small-business website design and redesign: what a site includes, what search engines read (and why nobody can promise rankings), editing the site yourself (and WordPress for regular posting), moving a site off Wix or Squarespace, what to bring, who owns it, timing, and fixed package prices: $1,500 for up to 4 pages, $2,200 for up to 6, and $250 per extra page',
    title: 'Small Business Website Design | Manchester, NH',
    description:
      'Small business websites that load fast and read well on a phone, with the domain, hosting, and code in your name. From $1,500 for up to 4 pages. Manchester, NH.',
    lastmod: '2026-10-27',
  },
  {
    path: '/privacy',
    label: 'Privacy',
    summary: 'what the contact form collects, analytics and cookies, and how to ask for deletion',
    title: `Privacy | Mickey Mullin`,
    description:
      'What mickeymullin.com collects (the contact form, server logs, any analytics), what Mickey Mullin does with it, and how to ask for it to be deleted.',
    ogDescription: 'What this site collects, and what I do with it.',
    robots: 'index, follow',
    twitterCard: 'summary',
    lastmod: '2026-10-26',
  },
]

// Generated text files, pre-rendered alongside the pages.
export const RESOURCE_PATHS = ['/robots.txt', '/sitemap.xml', '/llms.txt']

export function getPage(path: string): Page {
  const page = PAGES.find((p) => p.path === path)
  if (!page) throw new Error(`No page registered for ${path}`)
  return page
}
