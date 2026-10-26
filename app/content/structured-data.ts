// JSON-LD for the home page: ProfessionalService (with OfferCatalog), Person, WebSite, FAQPage.

import { FAQ } from './faq'
import { OFFERS } from './services'
import { LEGAL_NAME, SITE } from './site'
import { REGION, STATE, TOWNS } from './towns'

const BUSINESS_ID = `${SITE.url}#business`
const PERSON_ID = `${SITE.url}#mickey`
const WEBSITE_ID = `${SITE.url}#website`

export function homeJsonLd() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': BUSINESS_ID,
      name: SITE.name,
      alternateName: SITE.alternateName,
      ...(LEGAL_NAME ? { legalName: LEGAL_NAME } : {}),
      url: SITE.url,
      description:
        'Wi-Fi, UniFi networking, network cabling, troubleshooting, and custom software for small offices and homes in southern New Hampshire.',
      email: SITE.email,
      image: SITE.ogImage,
      logo: SITE.logo,
      priceRange: '$$',
      founder: { '@id': PERSON_ID },
      areaServed: [
        { '@type': 'AdministrativeArea', name: REGION },
        ...TOWNS.map((name) => ({
          '@type': 'City',
          name,
          containedInPlace: { '@type': 'State', name: STATE },
        })),
      ],
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
        'Software developer with 30 years of experience, including engineering and management roles at Microsoft and Yahoo, now building enterprise software as a consultant and running networks and custom software for small businesses in southern New Hampshire.',
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
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ]
}
