import { type RouteConfig, index, route } from '@react-router/dev/routes'

// Pages to pre-render are listed in app/content/pages.ts. Unknown paths fall
// through to the root ErrorBoundary with a 404 status.
export default [
  index('routes/home.tsx'),
  route('networking/troubleshooting', 'routes/networking-troubleshooting.tsx'),
  route('networking/wifi', 'routes/networking-wifi.tsx'),
  route('networking/unifi', 'routes/networking-unifi.tsx'),
  route('networking/small-office', 'routes/networking-small-office.tsx'),
  route('networking/cabling', 'routes/networking-cabling.tsx'),
  route('networking/contractors', 'routes/networking-contractors.tsx'),
  route('software/mockup-to-production', 'routes/software-mockup-to-production.tsx'),
  route('software/custom-software', 'routes/software-custom-software.tsx'),
  route('privacy', 'routes/privacy.tsx'),
  route('robots.txt', 'routes/robots.ts'),
  route('sitemap.xml', 'routes/sitemap.ts'),
  route('llms.txt', 'routes/llms.ts'),
] satisfies RouteConfig
