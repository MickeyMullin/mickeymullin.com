import { sitemapXml } from '../content/text-files'

export function loader() {
  return new Response(sitemapXml(), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
