import type { Config } from '@react-router/dev/config'
import { PAGES, RESOURCE_PATHS } from './app/content/pages'

export default {
  // Server rendering stays on for the contact form action and the 404 page;
  // every page in the route list is also pre-rendered to static HTML.
  ssr: true,
  prerender: [...PAGES.map((p) => p.path), ...RESOURCE_PATHS],
} satisfies Config
