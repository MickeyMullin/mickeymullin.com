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
import { homeJsonLd } from '../content/structured-data'
import { handleContact } from '../lib/contact.server'
import { defaultMailSetup } from '../lib/mailer.server'
import { pageMeta } from '../lib/seo'

const page = getPage('/')

export const meta: Route.MetaFunction = () => pageMeta(page, { jsonLd: homeJsonLd() })

// The contact form posts here (works without JavaScript).
export async function action({ request, context }: Route.ActionArgs) {
  // server/app.js already refuses other methods; this keeps the action safe on its own.
  if (request.method !== 'POST') return data(null, { status: 405, headers: { Allow: 'POST' } })
  const { result, status } = await handleContact(() => request.formData(), {
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
