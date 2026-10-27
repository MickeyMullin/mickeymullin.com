// The route list. Every page here is pre-rendered at build time and listed in
// sitemap.xml and llms.txt, and app/lib/seo.ts builds its head tags from it.
// Add service, town and blog pages here as they are built.

import { priceRow } from './pricing'

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
