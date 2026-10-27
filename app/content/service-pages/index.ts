// Every service page, for the tests. Each one also needs a PAGES entry with
// group 'Services', a route in app/routes.ts, and an `href` on its services.ts entry.

import { MOCKUP_TO_PRODUCTION } from './mockup-to-production'
import { TROUBLESHOOTING } from './troubleshooting'
import type { ServicePageContent } from './types'
import { UNIFI } from './unifi'
import { WIFI } from './wifi'

export const SERVICE_PAGES: ServicePageContent[] = [TROUBLESHOOTING, WIFI, UNIFI, MOCKUP_TO_PRODUCTION]
