// The route list. Every page here is pre-rendered at build time and listed in
// sitemap.xml and llms.txt. Add service, town and blog pages here as they are built.

export type Page = {
  path: string
  // Link text in llms.txt
  label: string
  // What the page covers, for llms.txt
  summary: string
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  lastmod: string
}

export const PAGES: Page[] = [
  {
    path: '/',
    label: 'Home',
    summary: 'services, pricing, service area, contact',
    title: 'Mickey Mullin — Wi-Fi, Networking & Custom Software | Manchester, NH',
    description:
      'Business and home Wi-Fi, UniFi networks, network cabling and troubleshooting around Manchester and southern New Hampshire — plus custom software and integrations. One person, start to finish.',
    ogTitle: 'Mickey Mullin — Networks that hold up. Software that fits.',
    ogDescription:
      'Wi-Fi, UniFi, cabling and troubleshooting for small offices and homes in southern NH, plus custom software and integrations.',
    lastmod: '2026-10-25',
  },
  {
    path: '/privacy',
    label: 'Privacy',
    summary: 'what the contact form collects, analytics and cookies, and how to ask for deletion',
    title: `Privacy | Mickey Mullin`,
    description:
      'What mickeymullin.com collects (the contact form, server logs, any analytics), what Mickey Mullin does with it, and how to ask for it to be deleted.',
    ogTitle: 'Privacy | Mickey Mullin',
    ogDescription: 'What this site collects, and what I do with it.',
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
