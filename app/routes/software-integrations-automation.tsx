import type { Route } from './+types/software-integrations-automation'
import { ServicePage } from '../components/ServicePage'
import { INTEGRATIONS } from '../content/service-pages/integrations-automation'
import { servicePageJsonLd } from '../content/structured-data'
import { pageMeta } from '../lib/seo'

export const meta: Route.MetaFunction = () => pageMeta(INTEGRATIONS.page, { jsonLd: servicePageJsonLd(INTEGRATIONS) })

export default function IntegrationsAutomation() {
  return <ServicePage content={INTEGRATIONS} />
}
