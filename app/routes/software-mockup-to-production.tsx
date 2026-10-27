import type { Route } from './+types/software-mockup-to-production'
import { ServicePage } from '../components/ServicePage'
import { MOCKUP_TO_PRODUCTION } from '../content/service-pages/mockup-to-production'
import { servicePageJsonLd } from '../content/structured-data'
import { pageMeta } from '../lib/seo'

export const meta: Route.MetaFunction = () =>
  pageMeta(MOCKUP_TO_PRODUCTION.page, { jsonLd: servicePageJsonLd(MOCKUP_TO_PRODUCTION) })

export default function MockupToProduction() {
  return <ServicePage content={MOCKUP_TO_PRODUCTION} />
}
