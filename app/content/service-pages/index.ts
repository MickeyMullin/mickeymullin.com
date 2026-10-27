// Every service page, for the tests. Each one also needs a PAGES entry with
// group 'Services', a route in app/routes.ts, and an `href` on its services.ts entry.

import { CABLING } from './cabling'
import { CONTRACTORS } from './contractors'
import { CUSTOM_SOFTWARE } from './custom-software'
import { INTEGRATIONS } from './integrations-automation'
import { MOCKUP_TO_PRODUCTION } from './mockup-to-production'
import { SMALL_OFFICE } from './small-office'
import { TROUBLESHOOTING } from './troubleshooting'
import type { ServicePageContent } from './types'
import { UNIFI } from './unifi'
import { WEBSITES } from './websites'
import { WIFI } from './wifi'
import { WIRELESS_BRIDGES } from './wireless-bridges'

export const SERVICE_PAGES: ServicePageContent[] = [TROUBLESHOOTING, WIFI, UNIFI, SMALL_OFFICE, CABLING, WIRELESS_BRIDGES, CONTRACTORS, MOCKUP_TO_PRODUCTION, CUSTOM_SOFTWARE, INTEGRATIONS, WEBSITES]
