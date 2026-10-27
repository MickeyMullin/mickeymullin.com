import type { Route } from './+types/networking-internet-failover'
import { ServicePage } from '../components/ServicePage'
import { INTERNET_FAILOVER } from '../content/service-pages/internet-failover'
import { servicePageJsonLd } from '../content/structured-data'
import { pageMeta } from '../lib/seo'

export const meta: Route.MetaFunction = () => pageMeta(INTERNET_FAILOVER.page, { jsonLd: servicePageJsonLd(INTERNET_FAILOVER) })

export default function InternetFailover() {
  return <ServicePage content={INTERNET_FAILOVER} />
}
