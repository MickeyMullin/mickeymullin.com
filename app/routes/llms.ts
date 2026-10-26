import { llmsTxt } from '../content/text-files'

export function loader() {
  return new Response(llmsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
