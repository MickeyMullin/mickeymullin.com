import { describe, expect, test } from 'bun:test'
import { FAQ } from '../app/content/faq'
import { PAGES } from '../app/content/pages'
import { PRICES } from '../app/content/pricing'
import { analyticsDisclosures } from '../app/content/privacy'
import { NETWORKING_SERVICES, OFFERS, SOFTWARE_SERVICES } from '../app/content/services'
import { homeJsonLd } from '../app/content/structured-data'
import { llmsTxt, robotsTxt, sitemapXml } from '../app/content/text-files'
import { SERVICE_PAGES } from '../app/content/service-pages'
import { servicePageJsonLd } from '../app/content/structured-data'
import { pageMeta } from '../app/lib/seo'
import { listOf } from '../app/lib/text'
import { TOWNS } from '../app/content/towns'
import { LEGAL_NAME, SITE, legalLine } from '../app/content/site'
import { ANALYTICS } from '../app/lib/analytics'
import { analyticsCsp, analyticsHostAllowed } from '../server/analytics.js'
import { INDEXNOW_KEY, indexNowPayload } from '../scripts/indexnow'
import { readFileSync } from 'node:fs'
import { missingSerialCommas } from './text-checks'

describe('structured data', () => {
  const blocks = homeJsonLd()
  const byType = (type: string) => blocks.find((b) => b['@type'] === type) as Record<string, any>

  test('has the four schema.org entities', () => {
    expect(blocks.map((b) => b['@type'])).toEqual(['ProfessionalService', 'Person', 'WebSite', 'FAQPage'])
  })

  test('FAQPage comes from the same FAQ data as the page', () => {
    const faq = byType('FAQPage').mainEntity as any[]
    expect(faq.map((q) => [q.name, q.acceptedAnswer.text])).toEqual(FAQ.map((f) => [f.question, f.answer]))
  })

  test('OfferCatalog lists the services with offers, in order', () => {
    const items = byType('ProfessionalService').hasOfferCatalog.itemListElement as any[]
    expect(items.map((i) => i.itemOffered.name)).toEqual([
      'Network troubleshooting',
      'Business and home Wi-Fi design and installation',
      'UniFi network installation',
      'Small-office network setup',
      'Network cabling',
      'Low-voltage network subcontracting for general contractors',
      'Custom software development',
      'AI prototype to production',
      'Integrations and automation',
      'Small-business websites',
    ])
    expect(items).toHaveLength(OFFERS.length)
  })

  test('the business carries the same phone number as the page and llms.txt', () => {
    expect(SITE.tel).toMatch(/^\+1\d{10}$/)
    expect(SITE.tel.slice(2)).toBe(SITE.phone.replace(/\D/g, ''))
    expect(byType('ProfessionalService').telephone).toBe(SITE.tel)
    expect(llmsTxt()).toContain(`- Phone: ${SITE.phone}`)
  })

  test('areaServed covers every town in the service area', () => {
    const cities = (byType('ProfessionalService').areaServed as any[]).filter((a) => a['@type'] === 'City')
    expect(cities.map((c) => c.name)).toEqual([...TOWNS])
  })
})

describe('pages and head tags (#684)', () => {
  const metaFor = (path: string) => pageMeta(PAGES.find((p) => p.path === path)!) as Record<string, any>[]
  const canonical = (path: string) => metaFor(path).find((m) => m.rel === 'canonical')?.href

  test('every page has a unique title, description, and canonical URL', () => {
    for (const key of ['title', 'description'] as const) {
      const values = PAGES.map((p) => p[key])
      expect(new Set(values).size).toBe(values.length)
      for (const v of values) expect(v.length).toBeGreaterThan(10)
    }
    const urls = PAGES.map((p) => canonical(p.path))
    expect(urls).toEqual(PAGES.map((p) => `https://mickeymullin.com${p.path}`))
    expect(new Set(urls).size).toBe(urls.length)
  })

  test('each page gets title, description, Open Graph, and Twitter tags', () => {
    for (const p of PAGES) {
      const meta = metaFor(p.path)
      expect(meta[0]).toEqual({ title: p.title })
      const content = (attr: string, name: string) => meta.find((m) => m[attr] === name)?.content
      expect(content('name', 'description')).toBe(p.description)
      expect(content('property', 'og:url')).toBe(`https://mickeymullin.com${p.path}`)
      expect(content('property', 'og:image')).toBe(p.ogImage ?? SITE.ogImage)
      for (const tag of ['og:type', 'og:site_name', 'og:locale', 'og:title', 'og:description']) {
        expect(content('property', tag)).toBeString()
      }
      for (const tag of ['robots', 'twitter:card', 'twitter:site', 'twitter:creator']) expect(content('name', tag)).toBeString()
    }
  })

  test('inner pages get a BreadcrumbList ending at the page itself; the home page has none', () => {
    const jsonLd = (path: string) => (metaFor(path).find((m) => m['script:ld+json'])?.['script:ld+json'] ?? []) as any[]
    expect(jsonLd('/').some((b) => b['@type'] === 'BreadcrumbList')).toBe(false)
    for (const p of PAGES.filter((p) => p.path !== '/')) {
      const crumbs = jsonLd(p.path).filter((b) => b['@type'] === 'BreadcrumbList')
      expect(crumbs).toHaveLength(1)
      const items = crumbs[0].itemListElement as any[]
      expect(items[0]).toMatchObject({ position: 1, name: 'Home', item: 'https://mickeymullin.com/' })
      expect(items.at(-1)).toMatchObject({ position: items.length, name: p.label, item: `https://mickeymullin.com${p.path}` })
    }
  })
})

// Every string in a value, however deeply nested
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(strings)
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
  return []
}

describe('serial commas', () => {
  test('listOf always uses one', () => {
    expect(listOf(['A'])).toBe('A')
    expect(listOf(['A', 'B'], 'or')).toBe('A or B')
    expect(listOf(['A', 'B', 'C'])).toBe('A, B, and C')
    expect(listOf(['A', 'B', 'C', 'D'], 'or')).toBe('A, B, C, or D')
  })

  test('the checker catches a missing one and passes a present one', () => {
    expect(missingSerialCommas('Wi-Fi, cabling and software')).toEqual(['Wi-Fi, cabling and software'])
    expect(missingSerialCommas('Wi-Fi, cabling, and software')).toEqual([])
  })

  test('none missing in the pages, service content, JSON-LD, or llms.txt', () => {
    const text = [
      ...strings(PAGES),
      ...strings(SERVICE_PAGES.map(({ page, service, ...rest }) => rest)),
      ...strings(SERVICE_PAGES.map(servicePageJsonLd)),
      ...strings([...NETWORKING_SERVICES, ...SOFTWARE_SERVICES]),
      ...strings(FAQ),
      llmsTxt(),
    ]
    expect(text.flatMap(missingSerialCommas)).toEqual([])
  })
})

describe('service pages', () => {
  test('each one is a PAGES entry in the Services group, linked from its services.ts entry', () => {
    expect(SERVICE_PAGES.map((c) => c.page.path)).toEqual(PAGES.filter((p) => p.group === 'Services').map((p) => p.path))
    for (const c of SERVICE_PAGES) expect(c.service.href).toBe(c.page.path)
    expect(new Set(SERVICE_PAGES.map((c) => c.id)).size).toBe(SERVICE_PAGES.length)
  })

  test('titles fit in 60 characters and name the area; descriptions fit in 160', () => {
    for (const { page, onSite } of SERVICE_PAGES) {
      expect(page.title.length).toBeLessThanOrEqual(60)
      expect(page.description.length).toBeLessThanOrEqual(160)
      if (onSite) expect(page.title).toMatch(/\bNH\b/)
    }
  })

  test('JSON-LD: a Service from this business, plus the FAQPage built from the visible FAQ', () => {
    for (const c of SERVICE_PAGES) {
      const [service, faq] = servicePageJsonLd(c) as Record<string, any>[]
      expect(service['@type']).toBe('Service')
      expect(service.provider).toEqual({ '@id': 'https://mickeymullin.com/#business' })
      expect(service.url).toBe(`https://mickeymullin.com${c.page.path}`)
      expect(service.name).toBe(c.service.offer!.name)
      if (c.onSite) expect(service.areaServed.filter((a: any) => a['@type'] === 'City').map((a: any) => a.name)).toEqual([...TOWNS])
      else expect(service).not.toHaveProperty('areaServed')
      const price = c.price.rows[0]
      if (price.range) expect(service.offers.priceSpecification).toMatchObject({ minPrice: price.range[0], maxPrice: price.range[1], priceCurrency: 'USD' })
      else expect(service).not.toHaveProperty('offers')
      expect(faq['@type']).toBe('FAQPage')
      expect(faq.mainEntity.map((q: any) => [q.name, q.acceptedAnswer.text])).toEqual(c.faq.map((f) => [f.question, f.answer]))
      expect(c.faq.length).toBeGreaterThanOrEqual(4)
      expect(c.faq.length).toBeLessThanOrEqual(6)
    }
  })

  test('prices come from the pricing table', () => {
    for (const c of SERVICE_PAGES) for (const row of c.price.rows) expect(PRICES).toContain(row)
  })
})

describe('generated text files', () => {
  test('robots.txt allows all crawlers and points at the sitemap', () => {
    const robots = robotsTxt()
    expect(robots).toContain('User-agent: *')
    expect(robots).not.toMatch(/^Disallow: \/\s*$/m)
    expect(robots).toContain('ClaudeBot')
    expect(robots).toContain('Sitemap: https://mickeymullin.com/sitemap.xml')
  })

  test('sitemap.xml lists exactly the pages, each with its lastmod', () => {
    const xml = sitemapXml()
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    expect(locs).toEqual(PAGES.map((p) => `https://mickeymullin.com${p.path}`))
    for (const p of PAGES) {
      expect(p.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(xml).toContain(`<loc>https://mickeymullin.com${p.path}</loc>\n    <lastmod>${p.lastmod}</lastmod>`)
    }
  })

  test('llms.txt lists every page, the prices, and the service area', () => {
    const txt = llmsTxt()
    for (const p of PAGES) expect(txt).toContain(`(https://mickeymullin.com${p.path})`)
    for (const row of PRICES) expect(txt).toContain(`- ${row.plain}`)
    expect(txt).toContain(`${TOWNS.join(', ')}, and nearby towns`)
  })

  test('llms.txt groups the pages, with service pages under Services', () => {
    const txt = llmsTxt()
    const section = (name: string) => txt.split(`\n## ${name}\n`)[1]?.split('\n\n')[0] ?? ''
    for (const p of PAGES) {
      expect(section(p.group ?? 'Pages')).toContain(`- [${p.label}](https://mickeymullin.com${p.path}): ${p.summary}`)
    }
  })

  test('every dollar price in the table also appears in its llms.txt line', () => {
    for (const row of PRICES.filter((r) => r.price.startsWith('$'))) expect(row.plain).toEndWith(row.price)
  })

  test('every dollar price has a matching numeric range, for the JSON-LD offers', () => {
    const usd = (n: number) => n.toLocaleString('en-US')
    for (const row of PRICES) {
      if (row.price.startsWith('$')) expect(`$${usd(row.range![0])}–${usd(row.range![1])}`).toBe(row.price)
      else expect(row.range).toBeUndefined()
    }
  })
})

describe('privacy page analytics disclosures', () => {
  const none = { ga4: '', umamiSrc: '', umamiId: '', clarity: '' }

  test('no tools configured means nothing to disclose', () => {
    expect(analyticsDisclosures(none)).toEqual([])
  })

  test('every tool startAnalytics can load has a disclosure that turns on with it', () => {
    // If a new key is added to ANALYTICS, this fails until the privacy page covers it.
    expect(Object.keys(ANALYTICS).sort()).toEqual(['clarity', 'domains', 'ga4', 'umamiId', 'umamiSrc'])
    const all = analyticsDisclosures({ ga4: 'G-TEST', umamiSrc: 'https://u.example/s.js', umamiId: 'id', clarity: 'c' })
    expect(all.map((d) => d.key)).toEqual(['ga4', 'umami', 'clarity'])
    for (const d of all) {
      expect(d.what.length).toBeGreaterThan(20)
      expect(d.cookies.length).toBeGreaterThan(10)
    }
    expect(analyticsDisclosures({ ...none, ga4: 'G-TEST' }).map((d) => d.key)).toEqual(['ga4'])
    expect(analyticsDisclosures({ ...none, clarity: 'c' }).map((d) => d.key)).toEqual(['clarity'])
  })

  test('Umami is disclosed only when it would actually load (script and site ID)', () => {
    expect(analyticsDisclosures({ ...none, umamiSrc: 'https://u.example/s.js' })).toEqual([])
    expect(analyticsDisclosures({ ...none, umamiId: 'id' })).toEqual([])
    expect(analyticsDisclosures({ ...none, umamiSrc: 'https://u.example/s.js', umamiId: 'id' }).map((d) => d.key)).toEqual(['umami'])
  })
})

describe('analytics CSP sources', () => {
  const none = { ga4: '', umamiSrc: '', umamiId: '', domains: '', clarity: '' }

  test('nothing configured adds nothing', () => {
    expect(analyticsCsp(none)).toEqual({ scriptSrc: [], connectSrc: [], imgSrc: [] })
  })

  test('Umami Cloud: script from cloud.umami.is, visits sent to gateway.umami.is', () => {
    const cloud = { ...none, umamiSrc: 'https://cloud.umami.is/script.js', umamiId: 'id' }
    expect(analyticsCsp(cloud)).toEqual({ scriptSrc: ['https://cloud.umami.is'], connectSrc: ['https://gateway.umami.is'], imgSrc: [] })
  })

  test('self-hosted Umami: script and visits on its own host', () => {
    const own = { ...none, umamiSrc: 'https://umami.example.com/script.js', umamiId: 'id' }
    expect(analyticsCsp(own)).toEqual({ scriptSrc: ['https://umami.example.com'], connectSrc: ['https://umami.example.com'], imgSrc: [] })
  })

  test('GA4 (no Ads features): Google tag script, collection on google-analytics.com', () => {
    expect(analyticsCsp({ ...none, ga4: 'G-TEST' })).toEqual({
      scriptSrc: ['https://www.googletagmanager.com'],
      connectSrc: ['https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://*.google.com'],
      imgSrc: ['https://www.googletagmanager.com', 'https://*.google-analytics.com'],
    })
  })

  test('Clarity without checked hosts fails loudly instead of being blocked silently', () => {
    expect(() => analyticsCsp({ ...none, clarity: 'c' })).toThrow('Clarity')
  })

  test('the committed config is Umami Cloud on the real and temporary domains only', () => {
    expect(ANALYTICS.umamiSrc).toBe('https://cloud.umami.is/script.js')
    expect(ANALYTICS.umamiId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    expect(ANALYTICS.domains.split(',')).toContain('mickeymullin.com')
    expect(ANALYTICS.domains).not.toContain('localhost')
    expect(ANALYTICS.domains).not.toContain('home.vorheim.com')
    // the temporary domain was dropped at cutover (#690)
    expect(ANALYTICS.domains).not.toContain('hostingersite.com')
  })
})

describe('analytics host allowlist (#727)', () => {
  const cfg = { ga4: 'G-TEST', umamiSrc: '', umamiId: '', domains: 'mickeymullin.com', clarity: '' }

  test('only the listed hosts run analytics', () => {
    expect(analyticsHostAllowed('mickeymullin.com', cfg)).toBe(true)
    expect(analyticsHostAllowed('MickeyMullin.com', cfg)).toBe(true)
    for (const h of ['localhost', '127.0.0.1', 'mm.home.vorheim.com', 'x.hostingersite.com', 'evilmickeymullin.com', 'mickeymullin.com.evil.test', ''])
      expect(analyticsHostAllowed(h, cfg)).toBe(false)
  })

  test('an empty list allows nothing', () => {
    expect(analyticsHostAllowed('mickeymullin.com', { ...cfg, domains: '' })).toBe(false)
  })

  test('the committed config runs on the real domain only', () => {
    expect(analyticsHostAllowed('mickeymullin.com')).toBe(true)
    expect(analyticsHostAllowed('localhost')).toBe(false)
    expect(analyticsHostAllowed('mm.home.vorheim.com')).toBe(false)
  })
})

describe('legal name (the LLC behind the public name)', () => {
  test('reads "<LLC>, doing business as Mickey Mullin" once set', () => {
    expect(legalLine('Mullinnovations LLC')).toBe('Mullinnovations LLC, doing business as Mickey Mullin')
  })

  test('nothing names a company until LEGAL_NAME is set', () => {
    expect(legalLine('')).toBeNull()
    const business = homeJsonLd().find((b) => b['@type'] === 'ProfessionalService') as Record<string, unknown>
    if (LEGAL_NAME) expect(business.legalName).toBe(LEGAL_NAME)
    else expect(business).not.toHaveProperty('legalName')
    expect(JSON.stringify(homeJsonLd())).not.toMatch(LEGAL_NAME ? /$^/ : /Mullinnovations/)
  })
})

describe('IndexNow (#691)', () => {
  test('the key file is in public/ and holds exactly the key', () => {
    expect(INDEXNOW_KEY).toMatch(/^[a-f0-9]{32}$/)
    expect(readFileSync(`public/${INDEXNOW_KEY}.txt`, 'utf8')).toBe(INDEXNOW_KEY)
  })
  test('submits every sitemap URL, on the site host, with the key file as keyLocation', () => {
    const p = indexNowPayload()
    const locs = [...sitemapXml().matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    expect(p.urlList).toEqual(locs)
    expect(p.host).toBe(new URL(SITE.url).host)
    expect(p.keyLocation).toBe(`${SITE.url.replace(/\/$/, '')}/${INDEXNOW_KEY}.txt`)
    for (const u of p.urlList) expect(new URL(u).host).toBe(p.host)
  })
})
