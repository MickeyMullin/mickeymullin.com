import type { Route } from './+types/networking-unifi'
import { ServicePage } from '../components/ServicePage'
import { UNIFI } from '../content/service-pages/unifi'
import { servicePageJsonLd } from '../content/structured-data'
import { pageMeta } from '../lib/seo'

export const meta: Route.MetaFunction = () => pageMeta(UNIFI.page, { jsonLd: servicePageJsonLd(UNIFI) })

export default function Unifi() {
  return <ServicePage content={UNIFI} />
}
