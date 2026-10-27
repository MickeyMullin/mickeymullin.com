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

export function indexNowPayload() {
  const host = new URL(SITE.url).host
  return {
    host,
    key: INDEXNOW_KEY,
    keyLocation: absoluteUrl(`/${INDEXNOW_KEY}.txt`),
    urlList: PAGES.map((p) => absoluteUrl(p.path)),
  }
}

async function text(url: string) {
  const res = await fetch(url, { headers: { 'cache-control': 'no-cache' } })
  return { status: res.status, body: await res.text() }
}

async function waitForDeploy() {
  const want = sitemapXml().trim()
  const deadline = Date.now() + WAIT_MS
  for (;;) {
    const live = await text(absoluteUrl('/sitemap.xml')).catch(() => ({ status: 0, body: '' }))
    if (live.status === 200 && live.body.trim() === want) return true
    if (Date.now() > deadline) return false
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
  const key = await text(payload.keyLocation)
  if (key.status !== 200 || key.body.trim() !== INDEXNOW_KEY) {
    throw new Error(`indexnow: ${payload.keyLocation} answered ${key.status}, not the key; is the deploy live?`)
  }
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  })
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
