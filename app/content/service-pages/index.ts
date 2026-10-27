// Every service page, for the tests. Each one also needs a PAGES entry with
// group 'Services', a route in app/routes.ts, and an `href` on its services.ts entry.

import type { ServicePageContent } from './types'
import { WIFI } from './wifi'

export const SERVICE_PAGES: ServicePageContent[] = [WIFI]
