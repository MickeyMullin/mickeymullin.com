// Analytics bootstrap and event tracking (browser only). The IDs live in
// server/analytics.js, which the server also reads to build the CSP. Umami's tag
// is rendered into <head> by app/root.tsx (so its install check can see it); GA4
// and Clarity load from here once their IDs are set (#692).

import { ANALYTICS, analyticsHostAllowed } from '../../server/analytics.js'

export { ANALYTICS }

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
  // Umami enforces this itself through data-domains; GA4 and Clarity don't.
  if (!analyticsHostAllowed(location.hostname, cfg)) return

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
