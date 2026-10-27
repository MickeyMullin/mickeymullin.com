// Analytics configuration, in one place for both sides: the page renders the
// tags from it, and the server's CSP allows exactly the hosts it needs. Each
// tool loads only when its IDs are filled in. Every value here is public (it
// ships in the page HTML), so it is committed rather than kept in env vars.
//
// The build copies this file to build/runtime/ with the rest of server/, and
// the app bundles it through app/lib/analytics.ts, so both always agree.

export const ANALYTICS = {
  // Google Analytics 4 measurement ID, e.g. "G-XXXXXXXXXX" (#692)
  ga4: '',
  // Umami Cloud (#678, #682, #695)
  umamiSrc: 'https://cloud.umami.is/script.js',
  umamiId: '7052ef9d-7fe6-4ea4-98b7-31f2943a1f5f',
  // Umami records visits only on these hosts, so the local preview and any
  // other copy of the site never count.
  umamiDomains: 'mickeymullin.com',
  // Microsoft Clarity project ID (optional)
  clarity: '',
}

// Umami Cloud serves its script from cloud.umami.is but receives visits at
// gateway.umami.is (checked in the live script.js). A self-hosted Umami
// receives them on the host that serves the script.
const UMAMI_CLOUD_SCRIPT = 'https://cloud.umami.is'
const UMAMI_CLOUD_COLLECT = 'https://gateway.umami.is'
const GTM = 'https://www.googletagmanager.com'

/**
 * The extra CSP sources the configured tools need.
 * @param {typeof ANALYTICS} cfg
 * @returns {{ scriptSrc: string[], connectSrc: string[], imgSrc: string[] }}
 */
export function analyticsCsp(cfg = ANALYTICS) {
  const scriptSrc = []
  const connectSrc = []
  const imgSrc = []
  if (cfg.umamiSrc && cfg.umamiId) {
    const origin = new URL(cfg.umamiSrc).origin
    scriptSrc.push(origin)
    connectSrc.push(origin === UMAMI_CLOUD_SCRIPT ? UMAMI_CLOUD_COLLECT : origin)
  }
  // GA4 without Google Ads features, per Google's CSP guide
  // (developers.google.com/tag-platform/security/guides/csp#google_analytics).
  if (cfg.ga4) {
    scriptSrc.push(GTM)
    imgSrc.push(GTM, 'https://*.google-analytics.com')
    connectSrc.push(GTM, 'https://*.google-analytics.com', 'https://*.google.com')
  }
  // Clarity's hosts haven't been checked against its live script yet. Fail the
  // build's tests and the server's startup instead of shipping a CSP that
  // silently blocks it.
  if (cfg.clarity) throw new Error('analytics: add the Clarity hosts to analyticsCsp before setting clarity')
  return { scriptSrc, connectSrc, imgSrc }
}
