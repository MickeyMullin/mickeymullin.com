import type { Route } from './+types/networking-wifi'
import { ServicePage } from '../components/ServicePage'
import { WIFI } from '../content/service-pages/wifi'
import { servicePageJsonLd } from '../content/structured-data'
import { pageMeta } from '../lib/seo'

export const meta: Route.MetaFunction = () => pageMeta(WIFI.page, { jsonLd: servicePageJsonLd(WIFI) })

export default function Wifi() {
  return <ServicePage content={WIFI} />
}
