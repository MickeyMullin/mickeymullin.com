// IndexNow: tell Bing, Yandex, and the other IndexNow engines which pages exist
// after a deploy, so they recrawl without waiting (#691). The key is public by
// design: it is served as /<key>.txt, and the engines fetch it to check that a
// submission really comes from the site's owner.
//
//   bun scripts/indexnow.ts           submit every sitemap URL now
//   bun scripts/indexnow.ts --wait    first wait until the live sitemap matches
//                                     this checkout (the deploy is live), then submit
//   bun scripts/indexnow.ts --dry-run print what would be sent
//
// The GitHub workflow .github/workflows/indexnow.yml runs it with --wait after
// each push to master that changes the site.

import { PAGES } from '../app/content/pages'
import { SITE, absoluteUrl } from '../app/content/site'
import { sitemapXml } from '../app/content/text-files'

export const INDEXNOW_KEY = '2a11ccb562fdecbf6704bebae5f154e5'
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const WAIT_MS = 15 * 60 * 1000
const POLL_MS = 20 * 1000
const FETCH_TIMEOUT_MS = 15 * 1000
const CACHE_BUST = process.env.GITHUB_SHA || String(Date.now())
const NO_CACHE_HEADERS = { 'cache-control': 'no-cache', pragma: 'no-cache' }

type TextResult = {
  status: number
  body: string
  lastModified: string | null
  age: string | null
  hcdnCacheStatus: string | null
  error?: string
}

export function cacheBustedUrl(url: string, token = CACHE_BUST) {
  const parsed = new URL(url)
  parsed.searchParams.set('v', token)
  return parsed.toString()
}

export function firstDiffSummary(expected: string, actual: string) {
  const expectedLines = expected.split('\n')
  const actualLines = actual.split('\n')
  const line = Array.from({ length: Math.max(expectedLines.length, actualLines.length) }, (_, i) => i).find(
    (i) => expectedLines[i] !== actualLines[i],
  )
  if (line === undefined) return 'no differing line'
  return `first differing line ${line + 1}: expected ${JSON.stringify(expectedLines[line] ?? '')}; received ${JSON.stringify(actualLines[line] ?? '')}`
}

function requestError(label: string, error: unknown) {
  const name = error && typeof error === 'object' && 'name' in error ? String(error.name) : ''
  if (name === 'AbortError' || name === 'TimeoutError') return `${label} timed out after ${FETCH_TIMEOUT_MS / 1000} seconds`
  const message = error instanceof Error ? error.message : String(error)
  return `${label} failed: ${message}`
}

export function byteLength(text: string) {
  return new TextEncoder().encode(text).byteLength
}

export function indexNowPayload() {
  const host = new URL(SITE.url).host
  return {
    host,
    key: INDEXNOW_KEY,
    keyLocation: absoluteUrl(`/${INDEXNOW_KEY}.txt`),
    urlList: PAGES.map((p) => absoluteUrl(p.path)),
  }
}

async function text(url: string, label: string): Promise<TextResult> {
  try {
    const res = await fetch(cacheBustedUrl(url), {
      headers: NO_CACHE_HEADERS,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    return {
      status: res.status,
      body: await res.text(),
      lastModified: res.headers.get('last-modified'),
      age: res.headers.get('age'),
      hcdnCacheStatus: res.headers.get('x-hcdn-cache-status'),
    }
  } catch (error) {
    return {
      status: 0,
      body: '',
      lastModified: null,
      age: null,
      hcdnCacheStatus: null,
      error: requestError(label, error),
    }
  }
}

// The deploy counts as live once the served sitemap matches this checkout and
// the key file is served (the key check covers the first deploy, and any deploy
// whose sitemap didn't change).
async function waitForDeploy() {
  const want = sitemapXml().trim()
  const keyUrl = absoluteUrl(`/${INDEXNOW_KEY}.txt`)
  const deadline = Date.now() + WAIT_MS
  for (;;) {
    const live = await text(absoluteUrl('/sitemap.xml'), 'sitemap poll')
    const key = await text(keyUrl, 'key poll')
    if (live.status === 200 && live.body.trim() === want && key.status === 200 && key.body.trim() === INDEXNOW_KEY) return true
    if (Date.now() >= deadline) {
      const details = live.error ? `error=${live.error}; ` : ''
      console.warn(
        `indexnow: live sitemap still differs at deadline: ${details}status=${live.status}, bytes=${byteLength(live.body)}, last-modified=${live.lastModified ?? 'n/a'}, age=${live.age ?? 'n/a'}, x-hcdn-cache-status=${live.hcdnCacheStatus ?? 'n/a'}; ${firstDiffSummary(want, live.body.trim())}`,
      )
      return false
    }
    await new Promise((r) => setTimeout(r, POLL_MS))
  }
}

async function main(args: string[]) {
  const payload = indexNowPayload()
  if (args.includes('--dry-run')) {
    console.log(JSON.stringify(payload, null, 2))
    return
  }
  if (args.includes('--wait') && !(await waitForDeploy())) {
    // Submitting anyway is harmless; the engines just recrawl what is live.
    console.warn('indexnow: the live sitemap still differs from this checkout after 15 minutes; submitting anyway')
  }
  const key = await text(payload.keyLocation, 'key check')
  if (key.error) throw new Error(`indexnow: ${key.error}; unable to verify the key file`)
  if (key.status !== 200 || key.body.trim() !== INDEXNOW_KEY) {
    throw new Error(`indexnow: ${payload.keyLocation} answered ${key.status}, not the key; is the deploy live?`)
  }
  let res: Response
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8', ...NO_CACHE_HEADERS },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
  } catch (error) {
    throw new Error(`indexnow: ${requestError('IndexNow POST', error)}`)
  }
  // 200 = accepted, 202 = accepted, key validation pending
  if (res.status !== 200 && res.status !== 202) {
    throw new Error(`indexnow: ${res.status} ${await res.text()}`)
  }
  console.log(`indexnow: ${res.status}, submitted ${payload.urlList.length} URLs: ${payload.urlList.join(' ')}`)
}

if (import.meta.main) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
