import type { Route } from './+types/software-websites'
import { ServicePage } from '../components/ServicePage'
import { WEBSITES } from '../content/service-pages/websites'
import { servicePageJsonLd } from '../content/structured-data'
import { pageMeta } from '../lib/seo'

export const meta: Route.MetaFunction = () => pageMeta(WEBSITES.page, { jsonLd: servicePageJsonLd(WEBSITES) })

export default function Websites() {
  return <ServicePage content={WEBSITES} />
}
