// Site-wide facts used by the page, the meta tags, the JSON-LD and llms.txt.

export const SITE = {
  name: 'Mickey Mullin',
  alternateName: 'Mickey Mullin Networks & Software',
  tagline: 'Networks & Software',
  origin: 'https://mickeymullin.com',
  url: 'https://mickeymullin.com/',
  email: 'info@mickeymullin.com',
  locality: 'Manchester, NH',
  twitter: '@MickeyMullin',
  themeColor: '#140A1F',
  ogImage: 'https://mickeymullin.com/images/og-image.png',
  logo: 'https://mickeymullin.com/icon-512.png',
  sameAs: [
    'https://github.com/MickeyMullin',
    'https://x.com/MickeyMullin',
    'https://www.linkedin.com/in/MickeyMullin',
    'https://www.youtube.com/@MickeyMullin',
  ],
} as const

// The LLC that owns the business. The public name stays SITE.name; once this is
// set, the footer, the privacy page and the JSON-LD say the business is
// "Mickey Mullin" operated by this company. Leave it empty until the
// Certificate of Formation is accepted, and copy the name exactly as filed.
// TODO(#730): set to the filed name after NH accepts Form LLC-1.
export const LEGAL_NAME: string = ''

// "Mullinnovations LLC, doing business as Mickey Mullin", or null before the LLC exists.
export function legalLine(legalName: string = LEGAL_NAME): string | null {
  return legalName ? `${legalName}, doing business as ${SITE.name}` : null
}

export function absoluteUrl(path: string) {
  return new URL(path, SITE.origin).href
}
