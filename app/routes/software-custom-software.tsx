import type { Route } from './+types/software-custom-software'
import { ServicePage } from '../components/ServicePage'
import { CUSTOM_SOFTWARE } from '../content/service-pages/custom-software'
import { servicePageJsonLd } from '../content/structured-data'
import { pageMeta } from '../lib/seo'

export const meta: Route.MetaFunction = () => pageMeta(CUSTOM_SOFTWARE.page, { jsonLd: servicePageJsonLd(CUSTOM_SOFTWARE) })

export default function CustomSoftware() {
  return <ServicePage content={CUSTOM_SOFTWARE} />
}
