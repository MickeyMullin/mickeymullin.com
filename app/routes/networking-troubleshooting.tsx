import type { Route } from './+types/networking-troubleshooting'
import { ServicePage } from '../components/ServicePage'
import { TROUBLESHOOTING } from '../content/service-pages/troubleshooting'
import { servicePageJsonLd } from '../content/structured-data'
import { pageMeta } from '../lib/seo'

export const meta: Route.MetaFunction = () =>
  pageMeta(TROUBLESHOOTING.page, { jsonLd: servicePageJsonLd(TROUBLESHOOTING) })

export default function Troubleshooting() {
  return <ServicePage content={TROUBLESHOOTING} />
}
