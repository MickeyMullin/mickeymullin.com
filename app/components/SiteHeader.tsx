import { SITE } from '../content/site'
import { Logo } from './Logo'

export function SiteHeader() {
  return (
    <header className="site-head">
      <div className="wrap head-row">
        <a className="mark" href="/" aria-label={`${SITE.name}, home`}>
          <Logo />
          <span className="mark-text">
            <span className="mark-name">{SITE.name}</span>
            <span className="mark-sub">{SITE.tagline}</span>
          </span>
        </a>
        <nav className="nav" aria-label="Primary">
          <a href="/#about">About</a>
          <a href="/#networking">Networking</a>
          <a href="/#software">Software</a>
          <a href="/#pricing">Pricing</a>
          <a href="/#area">Service area</a>
          <a className="btn btn-sm" href="/#contact" data-cta="header">
            Get a quote
          </a>
        </nav>
      </div>
    </header>
  )
}
