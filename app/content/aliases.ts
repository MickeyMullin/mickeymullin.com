// Common addresses that people guess, or that go on a business card or QR code.
// Each answers with a temporary redirect to the home-page section it names
// (app/routes/alias.ts), so /contact lands on /#contact. These paths are not
// pages: they stay out of sitemap.xml, llms.txt, and the JSON-LD. Each alias
// maps to exactly one section; add a section's id to the home page first, and
// tests/content.test.ts fails when a target id is missing from it.

export const ALIASES = {
  '/about': 'about',
  '/about-us': 'about',
  '/contact': 'contact',
  '/contact-us': 'contact',
  '/networking': 'networking',
  '/software': 'software',
  '/pricing': 'pricing',
  '/prices': 'pricing',
  '/area': 'area',
  '/service-area': 'area',
} as const satisfies Record<string, string>

export type AliasPath = keyof typeof ALIASES

/** The home-page location for an alias path, or null. Keeps the query string, so a QR code's tracking parameters survive. */
export function aliasLocation(pathname: string, search = ''): string | null {
  const key = pathname.toLowerCase().replace(/\/+$/, '')
  const id = Object.hasOwn(ALIASES, key) ? ALIASES[key as AliasPath] : null
  return id ? `/${search}#${id}` : null
}
