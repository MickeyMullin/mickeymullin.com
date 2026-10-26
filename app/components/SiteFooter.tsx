import { useEffect, useState } from 'react'
import { SITE, legalLine } from '../content/site'

export function SiteFooter() {
  // Pre-rendered with the build year, then updated in the browser (as the old
  // script did) in case the build is older than the current year.
  const [year, setYear] = useState(__BUILD_YEAR__)
  useEffect(() => setYear(new Date().getFullYear()), [])

  return (
    <footer className="site-foot">
      <div className="wrap foot-row">
        <p>
          <b>{SITE.name}</b> · {SITE.tagline} · {SITE.locality}
        </p>
        <p>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </p>
        <p>
          <a href="/privacy">Privacy</a>
        </p>
        <p className="foot-small">
          © <span id="yr">{year}</span> {legalLine() ?? SITE.name}. Independent installer, not affiliated with Ubiquiti.
        </p>
      </div>
    </footer>
  )
}
