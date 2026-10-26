import { describe, expect, test } from 'bun:test'
import { FAQ } from '../app/content/faq'
import { PAGES } from '../app/content/pages'
import { PRICES } from '../app/content/pricing'
import { analyticsDisclosures } from '../app/content/privacy'
import { OFFERS } from '../app/content/services'
import { homeJsonLd } from '../app/content/structured-data'
import { llmsTxt, robotsTxt, sitemapXml } from '../app/content/text-files'
import { TOWNS } from '../app/content/towns'
import { ANALYTICS } from '../app/lib/analytics'

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

  test('areaServed covers every town in the service area', () => {
    const cities = (byType('ProfessionalService').areaServed as any[]).filter((a) => a['@type'] === 'City')
    expect(cities.map((c) => c.name)).toEqual([...TOWNS])
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

  test('sitemap.xml lists every page', () => {
    const xml = sitemapXml()
    for (const p of PAGES) expect(xml).toContain(`<loc>https://mickeymullin.com${p.path}</loc>`)
  })

  test('llms.txt lists every page, the prices, and the service area', () => {
    const txt = llmsTxt()
    for (const p of PAGES) expect(txt).toContain(`(https://mickeymullin.com${p.path})`)
    for (const row of PRICES) expect(txt).toContain(`- ${row.plain}`)
    expect(txt).toContain(`${TOWNS.join(', ')}, and nearby towns`)
  })

  test('every dollar price in the table also appears in its llms.txt line', () => {
    for (const row of PRICES.filter((r) => r.price.startsWith('$'))) expect(row.plain).toEndWith(row.price)
  })
})

describe('privacy page analytics disclosures', () => {
  const none = { ga4: '', umamiSrc: '', umamiId: '', clarity: '' }

  test('no tools configured means nothing to disclose', () => {
    expect(analyticsDisclosures(none)).toEqual([])
  })

  test('every tool startAnalytics can load has a disclosure that turns on with it', () => {
    // If a new key is added to ANALYTICS, this fails until the privacy page covers it.
    expect(Object.keys(ANALYTICS).sort()).toEqual(['clarity', 'ga4', 'umamiId', 'umamiSrc'])
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
