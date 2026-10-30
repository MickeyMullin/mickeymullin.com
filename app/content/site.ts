// Site-wide facts used by the page, the meta tags, the JSON-LD and llms.txt.

export const SITE = {
  name: 'Mickey Mullin',
  tagline: 'Networks & Software',
  origin: 'https://mickeymullin.com',
  url: 'https://mickeymullin.com/',
  email: 'info@mickeymullin.com',
  // Mickey's personal number for now (#702); swap for a business line when there is one
  phone: '(603) 660-3913',
  tel: '+16036603913',
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
// "Mickey Mullin" operated by this company. Copy the name exactly as filed.
export const LEGAL_NAME: string = 'MullInnovations LLC'

// "MullInnovations LLC, doing business as Mickey Mullin", or null before the LLC exists.
export function legalLine(legalName: string = LEGAL_NAME): string | null {
  return legalName ? `${legalName}, doing business as ${SITE.name}` : null
}

export function absoluteUrl(path: string) {
  return new URL(path, SITE.origin).href
}
