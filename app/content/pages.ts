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
