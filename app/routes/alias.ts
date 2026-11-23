import { redirect } from 'react-router'
import { aliasLocation } from '../content/aliases'
import type { Route } from './+types/alias'

// One loader for every path in app/content/aliases.ts. A temporary redirect:
// search engines drop the fragment, so this is for visitors, not for ranking.
export function loader({ request }: Route.LoaderArgs) {
  const { pathname, search } = new URL(request.url)
  const to = aliasLocation(pathname, search)
  if (!to) throw new Response('Not Found', { status: 404 })
  return redirect(to, 302)
}
