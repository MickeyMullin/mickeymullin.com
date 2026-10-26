import { data } from 'react-router'
import type { Route } from './+types/home'
import { About } from '../components/home/About'
import { Contact } from '../components/home/Contact'
import { Faq } from '../components/home/Faq'
import { FirstCalls } from '../components/home/FirstCalls'
import { Hero } from '../components/home/Hero'
import { Networking } from '../components/home/Networking'
import { Pricing } from '../components/home/Pricing'
import { Process } from '../components/home/Process'
import { ServiceArea } from '../components/home/ServiceArea'
import { Software } from '../components/home/Software'
import { getPage } from '../content/pages'
import { SITE, absoluteUrl } from '../content/site'
import { homeJsonLd } from '../content/structured-data'
import { handleContact } from '../lib/contact.server'
import { defaultMailSetup } from '../lib/mailer.server'

const page = getPage('/')

export const meta: Route.MetaFunction = () => [
  { title: page.title },
  { name: 'description', content: page.description },
  { name: 'author', content: SITE.name },
  { tagName: 'link', rel: 'canonical', href: absoluteUrl(page.path) },
  { name: 'robots', content: 'index, follow, max-image-preview:large' },
  { property: 'og:type', content: 'website' },
  { property: 'og:site_name', content: SITE.name },
  { property: 'og:locale', content: 'en_US' },
  { property: 'og:url', content: absoluteUrl(page.path) },
  { property: 'og:title', content: page.ogTitle },
  { property: 'og:description', content: page.ogDescription },
  { property: 'og:image', content: SITE.ogImage },
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:site', content: SITE.twitter },
  { name: 'twitter:creator', content: SITE.twitter },
  { 'script:ld+json': homeJsonLd() },
]

// The contact form posts here (works without JavaScript).
export async function action({ request, context }: Route.ActionArgs) {
  const { result, status } = await handleContact(await request.formData(), {
    mail: context?.mail !== undefined ? context.mail : defaultMailSetup(),
    rateLimited: Boolean(context?.rateLimited),
    ip: context?.clientIp ?? '',
  })
  return data(result, { status })
}

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <About />
      <FirstCalls />
      <Networking />
      <Software />
      <Process />
      <Pricing />
      <Faq />
      <ServiceArea />
      <Contact />
    </main>
  )
}
