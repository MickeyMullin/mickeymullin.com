import type { Route } from './+types/networking-cabling'
import { ServicePage } from '../components/ServicePage'
import { CABLING } from '../content/service-pages/cabling'
import { servicePageJsonLd } from '../content/structured-data'
import { pageMeta } from '../lib/seo'

export const meta: Route.MetaFunction = () => pageMeta(CABLING.page, { jsonLd: servicePageJsonLd(CABLING) })

export default function Cabling() {
  return <ServicePage content={CABLING} />
}
