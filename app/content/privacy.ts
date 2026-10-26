// Facts the privacy page states. The analytics section is built from the same
// ANALYTICS config that loads the scripts, so turning a tool on without
// disclosing it is impossible: tests/content.test.ts checks every tool.

import { ANALYTICS } from '../lib/analytics'

// TODO(launch): set to the day the page goes live on mickeymullin.com (#690),
// and bump it whenever the policy's substance changes.
export const PRIVACY_UPDATED = '2026-10-26'

export type AnalyticsConfig = typeof ANALYTICS

export type Disclosure = {
  key: 'ga4' | 'umami' | 'clarity'
  name: string
  what: string
  cookies: string
  optOut?: { label: string; href: string }
}

const TOOLS: Disclosure[] = [
  {
    key: 'ga4',
    name: 'Google Analytics',
    what:
      'counts visits: which pages are viewed, how visitors found the site, and general device, browser and location (city or region, not street address). It also records when someone clicks the email link or sends the contact form, but never what the form says.',
    cookies: 'Sets first-party cookies (_ga and _ga_*) to tell a returning visitor from a new one.',
    optOut: { label: 'Google Analytics opt-out add-on', href: 'https://tools.google.com/dlpage/gaoptout' },
  },
  {
    key: 'umami',
    name: 'Umami',
    what: 'counts page views and the same clicks as above, to show which pages are useful.',
    cookies: 'Uses no cookies and does not store your IP address.',
  },
  {
    key: 'clarity',
    name: 'Microsoft Clarity',
    what:
      'shows how pages are used (clicks, scrolling and anonymized replays of visits) so layout problems can be found and fixed. Anything typed into a form is masked and never recorded.',
    cookies: 'Sets cookies (_clck and _clsk) to group the pages of one visit.',
    optOut: { label: 'Microsoft privacy statement', href: 'https://privacy.microsoft.com/privacystatement' },
  },
]

// The tools whose IDs are filled in, i.e. the ones that actually load.
export function analyticsDisclosures(cfg: AnalyticsConfig = ANALYTICS): Disclosure[] {
  const on = { ga4: Boolean(cfg.ga4), umami: Boolean(cfg.umamiSrc && cfg.umamiId), clarity: Boolean(cfg.clarity) }
  return TOOLS.filter((t) => on[t.key])
}
