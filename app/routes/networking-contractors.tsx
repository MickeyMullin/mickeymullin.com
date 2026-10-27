import type { Route } from './+types/networking-contractors'
import { ServicePage } from '../components/ServicePage'
import { CONTRACTORS } from '../content/service-pages/contractors'
import { servicePageJsonLd } from '../content/structured-data'
import { pageMeta } from '../lib/seo'

export const meta: Route.MetaFunction = () => pageMeta(CONTRACTORS.page, { jsonLd: servicePageJsonLd(CONTRACTORS) })

export default function Contractors() {
  return <ServicePage content={CONTRACTORS} />
}
