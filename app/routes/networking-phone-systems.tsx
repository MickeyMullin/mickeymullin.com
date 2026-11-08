import type { Route } from './+types/networking-phone-systems'
import { ServicePage } from '../components/ServicePage'
import { PHONE_SYSTEMS } from '../content/service-pages/phone-systems'
import { servicePageJsonLd } from '../content/structured-data'
import { pageMeta } from '../lib/seo'

export const meta: Route.MetaFunction = () => pageMeta(PHONE_SYSTEMS.page, { jsonLd: servicePageJsonLd(PHONE_SYSTEMS) })

export default function PhoneSystems() {
  return <ServicePage content={PHONE_SYSTEMS} />
}
