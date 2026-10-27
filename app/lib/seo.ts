// Head tags for a page in PAGES: title, description, canonical, robots, Open
// Graph, Twitter card, and JSON-LD. Inner pages also get a BreadcrumbList.

import type { MetaDescriptor } from 'react-router'
import type { Page } from '../content/pages'
import { SITE, absoluteUrl } from '../content/site'
import { breadcrumbJsonLd } from '../content/structured-data'

export const DEFAULT_ROBOTS = 'index, follow, max-image-preview:large'

export function pageMeta(page: Page, extra: { jsonLd?: object[] } = {}): MetaDescriptor[] {
  const url = absoluteUrl(page.path)
  const jsonLd = [...(page.path === '/' ? [] : [breadcrumbJsonLd(page)]), ...(extra.jsonLd ?? [])]
  return [
    { title: page.title },
    { name: 'description', content: page.description },
    { name: 'author', content: SITE.name },
    { tagName: 'link', rel: 'canonical', href: url },
    { name: 'robots', content: page.robots ?? DEFAULT_ROBOTS },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE.name },
    { property: 'og:locale', content: 'en_US' },
    { property: 'og:url', content: url },
    { property: 'og:title', content: page.ogTitle ?? page.title },
    { property: 'og:description', content: page.ogDescription ?? page.description },
    { property: 'og:image', content: page.ogImage ?? SITE.ogImage },
    { name: 'twitter:card', content: page.twitterCard ?? 'summary_large_image' },
    { name: 'twitter:site', content: SITE.twitter },
    { name: 'twitter:creator', content: SITE.twitter },
    ...(jsonLd.length ? [{ 'script:ld+json': jsonLd }] : []),
  ]
}
