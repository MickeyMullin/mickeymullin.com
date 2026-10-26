import { type RouteConfig, index, route } from '@react-router/dev/routes'

// Pages to pre-render are listed in app/content/pages.ts. Unknown paths fall
// through to the root ErrorBoundary with a 404 status.
export default [
  index('routes/home.tsx'),
  route('privacy', 'routes/privacy.tsx'),
  route('robots.txt', 'routes/robots.ts'),
  route('sitemap.xml', 'routes/sitemap.ts'),
  route('llms.txt', 'routes/llms.ts'),
] satisfies RouteConfig
