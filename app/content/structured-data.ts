// JSON-LD for the home page: ProfessionalService (with OfferCatalog), Person, WebSite, FAQPage.
// Inner pages get a BreadcrumbList (app/lib/seo.ts adds it) and point back to
// the business by its @id; service pages add Service and FAQPage.

import { FAQ, type FaqItem } from './faq'
import type { Page } from './pages'
import type { ServicePageContent } from './service-pages/types'
import { OFFERS } from './services'
import { LEGAL_NAME, SITE, absoluteUrl } from './site'
import { REGION, STATE, TOWNS } from './towns'

export const BUSINESS_ID = `${SITE.url}#business`
const PERSON_ID = `${SITE.url}#mickey`
const WEBSITE_ID = `${SITE.url}#website`

export function homeJsonLd() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': BUSINESS_ID,
      name: SITE.name,
      ...(LEGAL_NAME ? { legalName: LEGAL_NAME } : {}),
      url: SITE.url,
      description:
        'Wi-Fi, UniFi networking, network cabling, troubleshooting, and custom software for small offices and homes in southern New Hampshire.',
      email: SITE.email,
      telephone: SITE.tel,
      image: SITE.ogImage,
      logo: SITE.logo,
      priceRange: '$$',
      founder: { '@id': PERSON_ID },
      areaServed: areaServed(),
      knowsAbout: [
        'Business Wi-Fi',
        'Home Wi-Fi',
        'Ubiquiti UniFi',
        'Network cabling',
        'Cat6',
        'Network troubleshooting',
        'VLANs',
        'Guest Wi-Fi',
        'Point-to-point wireless bridges',
        'Internet failover',
        'Custom software development',
        'API integrations',
        'Business automation',
        'Websites',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Networking and software services',
        itemListElement: OFFERS.map((offer) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', ...offer },
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': PERSON_ID,
      name: SITE.name,
      jobTitle: 'Software developer and network installer',
      description:
        'Software developer with 30 years of experience, including engineering and management roles at Microsoft and Yahoo, now building custom enterprise software as a consultant and running networks and custom software for small businesses in southern New Hampshire.',
      knowsAbout: [
        'Software development',
        'AI-assisted software development',
        'TypeScript',
        'React',
        'Node.js',
        'SQL Server',
        'PostgreSQL',
        'Microsoft Azure',
        'Amazon Web Services',
        'Network administration',
        'Wi-Fi',
        'Ubiquiti UniFi',
      ],
      image: `${SITE.origin}/images/mickey-mullin-800.jpg`,
      worksFor: { '@id': BUSINESS_ID },
      url: `${SITE.url}#about`,
      sameAs: [...SITE.sameAs],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      name: SITE.name,
      url: SITE.url,
      publisher: { '@id': BUSINESS_ID },
    },
    faqPageJsonLd(FAQ),
  ]
}

// The on-site service area: southern NH and each town in it.
export function areaServed() {
  return [
    { '@type': 'AdministrativeArea', name: REGION },
    ...TOWNS.map((name) => ({
      '@type': 'City',
      name,
      containedInPlace: { '@type': 'State', name: STATE },
    })),
  ]
}

// Built from the same items the page shows, so the two cannot drift.
export function faqPageJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
}

// Home → page. The section pages (/networking, /software) don't exist yet, and
// Google only accepts a ListItem without `item` in last place, so the section
// level is left out until those pages are built.
export function breadcrumbJsonLd(page: Page) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: page.label, item: absoluteUrl(page.path) },
    ],
  }
}

// Service and FAQPage for a service page. The breadcrumb comes from pageMeta.
export function servicePageJsonLd(content: ServicePageContent) {
  const url = absoluteUrl(content.page.path)
  const { offer } = content.service
  if (!offer?.description) throw new Error(`${content.service.name} needs an offer with a description`)
  const price = content.price.rows[0]
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${url}#service`,
      name: offer.name,
      description: offer.description,
      url,
      provider: { '@id': BUSINESS_ID },
      ...(content.onSite ? { areaServed: areaServed() } : {}),
      ...(price?.range
        ? {
            offers: {
              '@type': 'Offer',
              description: price.plain,
              priceSpecification: {
                '@type': 'PriceSpecification',
                minPrice: price.range[0],
                maxPrice: price.range[1],
                priceCurrency: 'USD',
              },
            },
          }
        : {}),
    },
    faqPageJsonLd(content.faq),
  ]
}
