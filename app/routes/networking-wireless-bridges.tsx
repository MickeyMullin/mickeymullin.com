import type { Route } from './+types/networking-wireless-bridges'
import { ServicePage } from '../components/ServicePage'
import { WIRELESS_BRIDGES } from '../content/service-pages/wireless-bridges'
import { servicePageJsonLd } from '../content/structured-data'
import { pageMeta } from '../lib/seo'

export const meta: Route.MetaFunction = () => pageMeta(WIRELESS_BRIDGES.page, { jsonLd: servicePageJsonLd(WIRELESS_BRIDGES) })

export default function WirelessBridges() {
  return <ServicePage content={WIRELESS_BRIDGES} />
}
