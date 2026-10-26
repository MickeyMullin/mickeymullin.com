import { robotsTxt } from '../content/text-files'

export function loader() {
  return new Response(robotsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
