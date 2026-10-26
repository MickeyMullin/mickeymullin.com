import { useEffect, type ReactNode } from 'react'
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import type { Route } from './+types/root'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { SITE } from './content/site'
import { startAnalytics } from './lib/analytics'
import { useNonce } from './lib/nonce'
import plexSans400Url from './fonts/ibm-plex-sans-latin-400-normal.woff2?url'
import stylesUrl from './styles.css?url'

export const links: Route.LinksFunction = () => [
  { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
  // Body text weight; the other weights load on demand from styles.css.
  // Font preloads need crossOrigin even on the same origin, or the browser fetches twice.
  { rel: 'preload', href: plexSans400Url, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
  { rel: 'stylesheet', href: stylesUrl },
]

// Only used when no child route supplies meta, i.e. for the error page.
export const meta: Route.MetaFunction = ({ error }) => {
  if (!error) return []
  const notFound = isRouteErrorResponse(error) && error.status === 404
  return [
    { title: `${notFound ? 'Page not found' : 'Something went wrong'} | ${SITE.name}` },
    { name: 'robots', content: 'noindex' },
  ]
}

export function Layout({ children }: { children: ReactNode }) {
  const nonce = useNonce()
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <meta name="theme-color" content={SITE.themeColor} />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  )
}

export default function App() {
  useEffect(startAnalytics, [])
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <main className="hero">
        <div className="wrap">
          <p className="eyebrow">404</p>
          <h1>That page isn't plugged in.</h1>
          <p className="lede">
            The site was rebuilt and the old pages are gone. Everything current is on the home page.
          </p>
          <a className="btn" href="/">
            Go to the home page
          </a>
        </div>
      </main>
    )
  }

  console.error(error)
  return (
    <main className="hero">
      <div className="wrap">
        <p className="eyebrow">Error</p>
        <h1>Something went wrong.</h1>
        <p className="lede">
          Please try again in a minute, or email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
        <a className="btn" href="/">
          Go to the home page
        </a>
      </div>
    </main>
  )
}
