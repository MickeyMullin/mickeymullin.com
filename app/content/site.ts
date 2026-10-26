// Site-wide facts used by the page, the meta tags, the JSON-LD and llms.txt.

export const SITE = {
  name: 'Mickey Mullin',
  alternateName: 'Mickey Mullin Networks & Software',
  tagline: 'Networks & Software',
  origin: 'https://mickeymullin.com',
  url: 'https://mickeymullin.com/',
  email: 'hello@mickeymullin.com',
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

export function absoluteUrl(path: string) {
  return new URL(path, SITE.origin).href
}
