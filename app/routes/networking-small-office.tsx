import type { Route } from './+types/networking-small-office'
import { ServicePage } from '../components/ServicePage'
import { SMALL_OFFICE } from '../content/service-pages/small-office'
import { servicePageJsonLd } from '../content/structured-data'
import { pageMeta } from '../lib/seo'

export const meta: Route.MetaFunction = () => pageMeta(SMALL_OFFICE.page, { jsonLd: servicePageJsonLd(SMALL_OFFICE) })

export default function SmallOffice() {
  return <ServicePage content={SMALL_OFFICE} />
}
