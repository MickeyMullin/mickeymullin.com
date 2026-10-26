// Analytics bootstrap and event tracking (browser only). Each tool loads only
// when its ID is filled in, so the site ships clean until the accounts exist.
// TODO(analytics): fill these from build-time env vars (GA4_ID, UMAMI_SRC,
// UMAMI_WEBSITE_ID, CLARITY_ID; Dispatch #682/#692/#695) and add each tool's
// hosts to the CSP in server/app.js.

export const ANALYTICS = {
  ga4: '', // e.g. "G-XXXXXXXXXX"
  umamiSrc: '', // e.g. "https://umami.mickeymullin.com/script.js"
  umamiId: '', // Umami website ID (UUID)
  clarity: '', // optional Microsoft Clarity project ID
}

type Params = Record<string, string>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    umami?: { track?: (name: string, params?: Params) => void }
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] }
  }
}

function addScript(src: string, attrs: Record<string, string> = {}) {
  const s = document.createElement('script')
  s.src = src
  s.async = true
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v)
  document.head.appendChild(s)
}

let started = false

export function startAnalytics() {
  if (started) return
  started = true
  const cfg = ANALYTICS

  if (cfg.ga4) {
    window.dataLayer = window.dataLayer || []
    window.gtag = function () {
      // gtag expects the arguments object itself, not an array
      window.dataLayer!.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', cfg.ga4)
    addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(cfg.ga4)}`)
  }
  if (cfg.umamiSrc && cfg.umamiId) {
    addScript(cfg.umamiSrc, { 'data-website-id': cfg.umamiId, defer: '' })
  }
  if (cfg.clarity) {
    const clarity = ((...args: unknown[]) => {
      ;(clarity.q = clarity.q || []).push(args)
    }) as NonNullable<Window['clarity']>
    window.clarity = window.clarity || clarity
    addScript(`https://www.clarity.ms/tag/${encodeURIComponent(cfg.clarity)}`)
  }

  document.addEventListener('click', (ev) => {
    const a = (ev.target as Element | null)?.closest?.('a')
    if (!a) return
    const href = a.getAttribute('href') || ''
    if (href.startsWith('tel:')) track('click_to_call', { link_url: href })
    else if (href.startsWith('mailto:')) track('click_to_email', { link_url: href })
    else if (a.dataset.cta) track('cta_click', { location: a.dataset.cta })
  })
}

// One call that fans out to whichever tools are present.
export function track(name: string, params: Params = {}) {
  try {
    window.gtag?.('event', name, params)
  } catch {}
  try {
    window.umami?.track?.(name, params)
  } catch {}
}
