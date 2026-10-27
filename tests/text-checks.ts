// Matches the checker flagged that were read and are correct as written: the
// "and" or "or" joins a compound item ("business and home Wi-Fi") or starts a
// clause, rather than ending a list that lacks its serial comma.
const REVIEWED = new Set([
  'troubleshooting, business and home',
  'cabling, wireless bridges and internet',
  'development, reviewed and tested',
  'install, home or small',
  'collects, analytics and cookies',
  'NH, plus custom software and integrations',
  'dropping, or unreliable Wi-Fi and wired',
  'walk, wired access points or mesh',
  'panels, tested and labeled',
  'bid, rough-in and trim-out',
  'logins, your email and CRM',
  'check, so customers and staff',
])

// "A, B and C" (no serial comma) in a list of three or more. A heuristic: it
// can't tell a list from a clause, so it looks at a few words per item and
// skips the matches above.
export function missingSerialCommas(text: string) {
  return [...text.matchAll(/[\w’'-]+, [\w’'-]+(?: [\w’'-]+){0,2} (?:and|or) [\w’'-]+/g)]
    .map((m) => m[0])
    .filter((m) => !REVIEWED.has(m))
}

// The visible text of an HTML fragment, entities decoded, whitespace collapsed
export function visibleText(html: string) {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/ ([,.:;?!])/g, '$1')
    .trim()
}
