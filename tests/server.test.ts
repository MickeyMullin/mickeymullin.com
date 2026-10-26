// End-to-end: builds the app, then runs the real Express app (server/app.js)
// against the build and checks what a browser or crawler would get.

import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import fs from 'node:fs'
import type { AddressInfo } from 'node:net'
import path from 'node:path'
import type { Server } from 'node:http'
import type { ServerBuild } from 'react-router'
import { FAQ } from '../app/content/faq'
import { PAGES } from '../app/content/pages'
import type { MailMessage, MailSetup } from '../app/lib/mailer.server'
// @ts-expect-error plain JS module without type declarations
import { createApp } from '../server/app.js'
// @ts-expect-error plain JS module without type declarations
import { inlineScriptHashes } from '../server/prerendered.js'

const ROOT = path.resolve(import.meta.dir, '..')
const CLIENT = path.join(ROOT, 'build/client')

let build: ServerBuild
const servers: Server[] = []

beforeAll(async () => {
  const result = Bun.spawnSync([path.join(ROOT, 'node_modules/.bin/react-router'), 'build'], {
    cwd: ROOT,
    // bun test sets NODE_ENV=test, which Vite would honor with a development build
    env: { ...process.env, NODE_ENV: 'production' },
    stdout: 'pipe',
    stderr: 'pipe',
  })
  if (result.exitCode !== 0) throw new Error(`build failed:\n${result.stderr.toString()}`)
  build = await import(path.join(ROOT, 'build/server/index.js'))
}, 180_000)

afterAll(() => {
  for (const s of servers) s.close()
})

type Started = { url: string; sent: MailMessage[] }

async function start(options: { mail?: MailSetup | null; limit?: number } = {}): Promise<Started> {
  const sent: MailMessage[] = []
  const mail =
    options.mail !== undefined
      ? options.mail
      : { mailer: { send: async (m: MailMessage) => void sent.push(m) }, to: 'to@example.com', from: 'from@example.com' }
  const app = createApp({ build, mail, rateLimit: { limit: options.limit ?? 5 } })
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s))
  })
  servers.push(server)
  return { url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, sent }
}

function post(url: string, fields: Record<string, string>) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
    redirect: 'manual',
  })
}

const valid = { name: 'Pat Doe', email: 'pat@example.com', town: 'Bedford', message: 'Wi-Fi drops in the back.' }

function jsonLdBlocks(html: string) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1])
}

describe('pre-rendered home page', () => {
  let res: Response
  let html: string

  beforeAll(async () => {
    const { url } = await start()
    res = await fetch(`${url}/`)
    html = await res.text()
  })

  test('is a static file in build/client', () => {
    expect(fs.existsSync(path.join(CLIENT, 'index.html'))).toBe(true)
  })

  test('returns full HTML with the H1 and the pricing table', () => {
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
    expect(html).toContain('<h1>Networks that hold up. Software that fits.</h1>')
    expect(html).toContain('<table class="prices">')
    expect(html).toContain('<td>$150–500</td>')
    expect(html).toContain('<title>Mickey Mullin — Wi-Fi, Networking &amp; Custom Software | Manchester, NH</title>')
    expect(html).toContain('<link rel="canonical" href="https://mickeymullin.com/"/>')
    expect(html).toContain('id="contactForm"')
    expect(html).toContain('action="/?index#contact" method="post"')
  })

  test('every JSON-LD block is valid JSON with the expected entities', () => {
    const blocks = jsonLdBlocks(html)
    expect(blocks.length).toBeGreaterThan(0)
    const parsed = blocks.flatMap((b) => [JSON.parse(b)].flat())
    expect(parsed.map((e) => e['@type']).sort()).toEqual(['FAQPage', 'Person', 'ProfessionalService', 'WebSite'])
    const faq = parsed.find((e) => e['@type'] === 'FAQPage')
    expect(faq.mainEntity.map((q: any) => q.name)).toEqual(FAQ.map((f) => f.question))
  })

  test('the visible FAQ matches the FAQPage JSON-LD', () => {
    for (const f of FAQ) {
      expect(html).toContain(`<summary>${f.question}</summary>`)
      expect(html).toContain(`<p>${f.answer.replace(/'/g, '&#x27;')}</p>`)
    }
  })

  test('security headers are present', () => {
    const h = res.headers
    expect(h.get('strict-transport-security')).toContain('max-age=31536000')
    expect(h.get('x-content-type-options')).toBe('nosniff')
    expect(h.get('referrer-policy')).toBe('strict-origin-when-cross-origin')
    expect(h.get('x-frame-options')).toBe('DENY')
    expect(h.get('permissions-policy')).toContain('camera=()')
    expect(h.get('x-powered-by')).toBeNull()
    const csp = h.get('content-security-policy') ?? ''
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).not.toContain('unsafe-inline')
    expect(csp).not.toContain('unsafe-eval')
  })

  test('the CSP allows every inline script on the page by hash', () => {
    const csp = res.headers.get('content-security-policy') ?? ''
    const scriptSrc = csp.split(';').find((d) => d.startsWith('script-src ')) ?? ''
    const hashes: Set<string> = inlineScriptHashes(html)
    expect(hashes.size).toBeGreaterThan(0)
    for (const h of hashes) expect(scriptSrc).toContain(h)
  })

  test('HTML revalidates; hashed assets are immutable', async () => {
    expect(res.headers.get('cache-control')).toBe('no-cache')
    const asset = html.match(/href="(\/assets\/[^"]+\.css)"/)?.[1]
    expect(asset).toBeString()
    const { url } = await start()
    const a = await fetch(`${url}${asset}`)
    expect(a.status).toBe(200)
    expect(a.headers.get('cache-control')).toBe('public, max-age=31536000, immutable')
  })
})

describe('static files', () => {
  test('robots.txt, sitemap.xml and llms.txt are built as files and list the routes', async () => {
    const { url } = await start()
    for (const file of ['robots.txt', 'sitemap.xml', 'llms.txt']) {
      expect(fs.existsSync(path.join(CLIENT, file))).toBe(true)
    }
    const robots = await (await fetch(`${url}/robots.txt`)).text()
    expect(robots).toContain('Sitemap: https://mickeymullin.com/sitemap.xml')
    const sitemap = await fetch(`${url}/sitemap.xml`)
    expect(sitemap.headers.get('content-type')).toContain('xml')
    const xml = await sitemap.text()
    const llms = await (await fetch(`${url}/llms.txt`)).text()
    for (const p of PAGES) {
      expect(xml).toContain(`<loc>https://mickeymullin.com${p.path}</loc>`)
      expect(llms).toContain(`(https://mickeymullin.com${p.path})`)
    }
  })

  test('icons and the OG image are served', async () => {
    const { url } = await start()
    for (const p of ['/favicon.ico', '/favicon.svg', '/icon-512.png', '/apple-touch-icon.png', '/images/og-image.png']) {
      expect((await fetch(`${url}${p}`)).status).toBe(200)
    }
  })
})

describe('404', () => {
  test('unknown paths get a real 404 with the site design', async () => {
    const { url } = await start()
    const res = await fetch(`${url}/no-such-page`)
    expect(res.status).toBe(404)
    const html = await res.text()
    expect(html).toContain("That page isn&#x27;t plugged in.")
    expect(html).toContain('<meta name="robots" content="noindex"/>')
    expect(html).toMatch(/href="\/assets\/[^"]+\.css"/)
    expect(res.headers.get('cache-control')).toBe('no-store')
  })

  test('no PHP: /contact.php is gone', async () => {
    const { url } = await start()
    expect((await fetch(`${url}/contact.php`)).status).toBe(404)
  })
})

describe('contact form without JavaScript', () => {
  test('a plain form POST sends the message and shows the thank-you', async () => {
    const { url, sent } = await start()
    const res = await post(`${url}/?index`, valid)
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('<p class="form-status ok" role="status" aria-live="polite">Thanks.')
    expect(sent).toHaveLength(1)
    expect(sent[0].replyTo.address).toBe('pat@example.com')
    expect(res.headers.get('cache-control')).toBe('no-store')
  })

  test('per-request pages use a nonce that matches the CSP header', async () => {
    const { url } = await start()
    const res = await post(`${url}/?index`, valid)
    const nonce = res.headers.get('content-security-policy')?.match(/'nonce-([^']+)'/)?.[1]
    expect(nonce).toBeString()
    const html = await res.text()
    const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*ld\+json)([^>]*)>/g)].map((m) => m[1])
    expect(inline.length).toBeGreaterThan(0)
    for (const attrs of inline) expect(attrs).toContain(`nonce="${nonce}"`)
  })

  test('the honeypot "succeeds" without sending', async () => {
    const { url, sent } = await start()
    const res = await post(`${url}/?index`, { ...valid, company_url: 'https://spam.example' })
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('form-status ok')
    expect(sent).toHaveLength(0)
  })

  test('invalid input re-renders the form with per-field errors and the values kept', async () => {
    const { url, sent } = await start()
    const res = await post(`${url}/?index`, { name: 'Pat', email: 'not-an-email', message: '' })
    expect(res.status).toBe(400)
    const html = await res.text()
    expect(html).toContain('id="f-email-err"')
    expect(html).toContain('Please enter a valid email address.')
    expect(html).toContain('id="f-message-err"')
    expect(html).toMatch(/id="f-email"[^>]*aria-invalid="true"/)
    expect(html).toMatch(/value="not-an-email"/)
    expect(sent).toHaveLength(0)
  })

  test('without SMTP the visitor is told to email instead', async () => {
    const { url } = await start({ mail: null })
    const orig = console.warn
    console.warn = () => {}
    const res = await post(`${url}/?index`, valid)
    console.warn = orig
    expect(res.status).toBe(503)
    expect(await res.text()).toContain('Please email <a href="mailto:hello@mickeymullin.com">')
  })

  test('repeat POSTs are rate limited with a readable 429 page', async () => {
    const { url, sent } = await start({ limit: 5 })
    for (let i = 0; i < 5; i++) expect((await post(`${url}/?index`, valid)).status).toBe(200)
    const res = await post(`${url}/?index`, valid)
    expect(res.status).toBe(429)
    const html = await res.text()
    expect(html).toContain('Too many messages from this connection.')
    expect(html).toContain('<h1>')
    expect(sent).toHaveLength(5)
  })

  test('other POSTs over the limit get a plain 429', async () => {
    const { url } = await start({ limit: 1 })
    await post(`${url}/?index`, valid)
    const res = await post(`${url}/robots.txt`, {})
    expect(res.status).toBe(429)
  })

  test('oversized POSTs are refused before parsing', async () => {
    const { url } = await start()
    const res = await post(`${url}/?index`, { ...valid, message: 'x'.repeat(200_000) })
    expect(res.status).toBe(413)
  })
})

describe('contact form with JavaScript (fetcher request)', () => {
  test('posts to the single-fetch data URL and is rate limited the same way', async () => {
    const { url, sent } = await start({ limit: 1 })
    const ok = await post(`${url}/_root.data?index`, valid)
    expect(ok.status).toBe(200)
    expect(await ok.text()).toContain('sent')
    const limited = await post(`${url}/_root.data?index`, valid)
    expect(limited.status).toBe(429)
    expect(await limited.text()).toContain('rate_limited')
    expect(sent).toHaveLength(1)
  })
})

describe('canonical host', () => {
  test('www redirects to the bare domain', async () => {
    const { url } = await start()
    const res = await fetch(`${url}/llms.txt?x=1`, { headers: { Host: 'www.mickeymullin.com' }, redirect: 'manual' })
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('https://mickeymullin.com/llms.txt?x=1')
  })
})
