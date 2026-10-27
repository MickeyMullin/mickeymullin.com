// End-to-end: builds the app, then runs the real Express app (server/app.js)
// against the build and checks what a browser or crawler would get.

import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import net, { type AddressInfo } from 'node:net'
import path from 'node:path'
import type { Server } from 'node:http'
import type { ServerBuild } from 'react-router'
import { FAQ } from '../app/content/faq'
import { PAGES } from '../app/content/pages'
import { analyticsDisclosures } from '../app/content/privacy'
import type { MailMessage, MailSetup } from '../app/lib/mailer.server'
// @ts-expect-error plain JS module without type declarations
import { createApp } from '../server/app.js'

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
  // the second half of `npm run build`, which server.js and the smoke test need
  const copy = Bun.spawnSync(['node', 'scripts/copy-runtime.mjs'], { cwd: ROOT, stdout: 'pipe', stderr: 'pipe' })
  if (copy.exitCode !== 0) throw new Error(`copy-runtime failed:\n${copy.stderr.toString()}`)
  build = await import(path.join(ROOT, 'build/server/index.js'))
}, 180_000)

afterAll(() => {
  for (const s of servers) s.close()
})

type Started = { url: string; port: number; sent: MailMessage[] }

async function start(
  options: { mail?: MailSetup | null; limit?: number; logClientIp?: (line: string) => void } = {},
): Promise<Started> {
  const sent: MailMessage[] = []
  const mail =
    options.mail !== undefined
      ? options.mail
      : { mailer: { send: async (m: MailMessage) => void sent.push(m) }, to: 'to@example.com', from: 'from@example.com' }
  const app = createApp({ build, mail, rateLimit: { limit: options.limit ?? 5 }, logClientIp: options.logClientIp })
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s))
  })
  servers.push(server)
  const port = (server.address() as AddressInfo).port
  return { url: `http://127.0.0.1:${port}`, port, sent }
}

// Sends a raw HTTP/1.1 request (for bodies fetch won't send, such as chunked
// uploads without Content-Length) and resolves with the status code.
function rawStatus(port: number, head: string, body: string | Buffer = ''): Promise<number> {
  return new Promise((resolve, reject) => {
    const socket = net.connect(port, '127.0.0.1', () => {
      socket.write(head)
      if (body.length) socket.write(body)
    })
    let data = ''
    socket.on('data', (chunk) => {
      data += chunk.toString('latin1')
      const m = data.match(/^HTTP\/1\.1 (\d{3})/)
      if (m) {
        socket.destroy()
        resolve(Number(m[1]))
      }
    })
    socket.on('error', (e: NodeJS.ErrnoException) => (e.code === 'EPIPE' || e.code === 'ECONNRESET' ? undefined : reject(e)))
  })
}

function chunked(payload: string) {
  return `${payload.length.toString(16)}\r\n${payload}\r\n0\r\n\r\n`
}

// Every pre-rendered HTML file in build/client
function prerenderedHtmlFiles(dir = CLIENT): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) return e.name === 'assets' ? [] : prerenderedHtmlFiles(full)
    return e.name.endsWith('.html') ? [full] : []
  })
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
    // No includeSubDomains until every subdomain is confirmed HTTPS; no preload
    expect(h.get('strict-transport-security')).toBe('max-age=31536000')
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

  test('the CSP allows Umami and GA4, and nothing else off-site', () => {
    const csp = res.headers.get('content-security-policy') ?? ''
    const directive = (name: string) => csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(`${name} `)) ?? ''
    expect(directive('script-src')).toContain('https://cloud.umami.is')
    expect(directive('script-src')).toContain('https://www.googletagmanager.com')
    expect(directive('connect-src')).toBe(
      "connect-src 'self' https://gateway.umami.is https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com",
    )
    expect(directive('img-src')).toBe("img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com")
  })

  test('every page carries the Umami tag in <head>, limited to the real domain', () => {
    for (const file of prerenderedHtmlFiles()) {
      const html = fs.readFileSync(file, 'utf8')
      const head = html.slice(0, html.indexOf('</head>'))
      const tags = head.match(/<script[^>]*cloud\.umami\.is[^>]*>/g) ?? []
      expect(tags).toHaveLength(1)
      expect(tags[0]).toContain('defer')
      expect(tags[0]).toContain('data-website-id="7052ef9d-7fe6-4ea4-98b7-31f2943a1f5f"')
      expect(tags[0]).toContain('data-domains="mickeymullin.com"')
    }
  })

  test('the served CSP allows every inline script of every pre-rendered page by hash', async () => {
    const files = prerenderedHtmlFiles()
    expect(files.length).toBeGreaterThan(0)
    const { url } = await start()
    for (const file of files) {
      const urlPath = `/${path.relative(CLIENT, file).split(path.sep).join('/')}`.replace(/index\.html$/, '')
      const served = await fetch(`${url}${urlPath}`)
      expect(served.status).toBe(200)
      const scriptSrc =
        (served.headers.get('content-security-policy') ?? '').split(';').find((d) => d.startsWith('script-src ')) ?? ''
      // Independent of server/prerendered.js: every <script> without src that
      // isn't a JSON-LD data block, hashed exactly as written in the file.
      const html = fs.readFileSync(file, 'utf8')
      const inline = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].filter(
        ([, attrs, body]) => body.length > 0 && !attrs.includes(' src=') && !attrs.includes('application/ld+json'),
      )
      expect(inline.length).toBeGreaterThan(0)
      for (const [, , body] of inline) {
        const hash = `'sha256-${createHash('sha256').update(body).digest('base64')}'`
        expect(scriptSrc.split(' ')).toContain(hash)
      }
    }
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

describe('self-hosted fonts', () => {
  let url: string
  let html: string
  let css: string

  beforeAll(async () => {
    ;({ url } = await start())
    html = await (await fetch(`${url}/`)).text()
    const cssHref = html.match(/href="(\/assets\/[^"]+\.css)"/)?.[1]
    css = await (await fetch(`${url}${cssHref}`)).text()
  })

  test('the CSP allows styles and fonts from this origin only', async () => {
    const res = await fetch(`${url}/`)
    const directives = (res.headers.get('content-security-policy') ?? '').split(';').map((d) => d.trim())
    expect(directives).toContain("style-src 'self'")
    expect(directives).toContain("font-src 'self'")
  })

  test('no page or stylesheet asks Google Fonts (or any other host) for styles or fonts', () => {
    for (const file of prerenderedHtmlFiles()) {
      const page = fs.readFileSync(file, 'utf8')
      expect(page).not.toMatch(/fonts\.(googleapis|gstatic)\.com/)
      for (const [tag] of page.matchAll(/<link [^>]*>/g)) {
        if (/rel="(stylesheet|preload|preconnect)"/.test(tag)) expect(tag).not.toMatch(/href="(https?:)?\/\//)
      }
    }
    expect(css).not.toMatch(/fonts\.(googleapis|gstatic)\.com/)
    expect(css).not.toMatch(/@import/)
  })

  test('every @font-face is a swap-displayed woff2 file in /assets, never inlined', async () => {
    const faces = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map((m) => m[1])
    const got = faces.map((f) => `${f.match(/font-family:\s*"?([^";]+)"?/)?.[1]} ${f.match(/font-weight:\s*(\d+)/)?.[1]}`)
    expect(got.sort()).toEqual(
      ['IBM Plex Mono 400', 'IBM Plex Mono 500', 'IBM Plex Sans 400', 'IBM Plex Sans 500', 'IBM Plex Sans 600', 'IBM Plex Sans 700'],
    )
    for (const face of faces) {
      expect(face).toMatch(/font-display:\s*swap/)
      const src = face.match(/url\(([^)]+)\)/)?.[1]?.replace(/["']/g, '') ?? ''
      expect(src).toMatch(/^\/assets\/[^/]+\.woff2$/)
      const res = await fetch(`${url}${src}`)
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('font/woff2')
      expect(res.headers.get('cache-control')).toBe('public, max-age=31536000, immutable')
    }
  })

  test('the body weight is preloaded with crossorigin, using the same file the stylesheet loads', () => {
    const preloads = [...html.matchAll(/<link [^>]*rel="preload"[^>]*as="font"[^>]*>/g)].map((m) => m[0])
    expect(preloads).toHaveLength(1)
    const href = preloads[0].match(/href="([^"]+)"/)?.[1] ?? ''
    expect(href).toMatch(/^\/assets\/ibm-plex-sans-latin-400-normal-[^/]+\.woff2$/)
    expect(preloads[0]).toContain('crossorigin="anonymous"')
    expect(preloads[0]).toContain('type="font/woff2"')
    // a different URL than the stylesheet's would download the font twice
    expect(css).toContain(href)
  })
})

describe('privacy page', () => {
  let url: string
  let res: Response
  let html: string

  beforeAll(async () => {
    ;({ url } = await start())
    res = await fetch(`${url}/privacy`)
    html = await res.text()
  })

  test('is pre-rendered and served as a real page', () => {
    expect(fs.existsSync(path.join(CLIENT, 'privacy/index.html'))).toBe(true)
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe('no-cache')
    expect(html).toContain('<h1>What this site collects, and what I do with it</h1>')
    expect(html).toContain('<link rel="canonical" href="https://mickeymullin.com/privacy"/>')
    expect(html).toContain('info@mickeymullin.com')
  })

  test('discloses exactly the analytics tools that are configured', () => {
    const shown = [...html.matchAll(/data-analytics="([a-z0-9]+)"/g)].map((m) => m[1])
    const configured = analyticsDisclosures().map((d) => d.key)
    expect(shown).toEqual(configured)
    expect(html).not.toContain('no analytics')
  })

  test('the footer and the contact form link to it, and the header anchors work from it', async () => {
    const home = await (await fetch(`${url}/`)).text()
    expect(home.match(/<footer[\s\S]*<\/footer>/)?.[0]).toContain('href="/privacy"')
    expect(home.match(/<form[\s\S]*<\/form>/)?.[0]).toContain('href="/privacy"')
    const header = html.match(/<header[\s\S]*<\/header>/)?.[0] ?? ''
    expect(header).toContain('href="/#contact"')
    expect(header).not.toMatch(/href="#/)
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
    expect(await res.text()).toContain('Please email <a href="mailto:info@mickeymullin.com">')
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
  test('www.mickeymullin.com redirects to the bare domain', async () => {
    const { url } = await start()
    for (const host of ['www.mickeymullin.com', 'WWW.MickeyMullin.com:443']) {
      const res = await fetch(`${url}/llms.txt?x=1`, { headers: { Host: host }, redirect: 'manual' })
      expect(res.status).toBe(301)
      expect(res.headers.get('location')).toBe('https://mickeymullin.com/llms.txt?x=1')
    }
  })

  test('other www hosts are served, never redirected', async () => {
    const { url } = await start()
    const viaHost = await fetch(`${url}/llms.txt`, { headers: { Host: 'www.evil.example' }, redirect: 'manual' })
    expect(viaHost.status).toBe(200)
    const viaForwarded = await fetch(`${url}/llms.txt`, {
      headers: { 'X-Forwarded-Host': 'www.evil.example' },
      redirect: 'manual',
    })
    expect(viaForwarded.status).toBe(200)
    expect(viaForwarded.headers.get('location')).toBeNull()
  })

  test('X-Forwarded-Host cannot trigger the redirect either', async () => {
    const { url } = await start()
    const res = await fetch(`${url}/llms.txt`, {
      headers: { 'X-Forwarded-Host': 'www.mickeymullin.com' },
      redirect: 'manual',
    })
    expect(res.status).toBe(200)
  })
})

describe('methods other than GET, HEAD and POST', () => {
  for (const method of ['PUT', 'PATCH', 'DELETE']) {
    for (const target of ['/?index', '/_root.data?index']) {
      test(`${method} ${target} gets 405 and never reaches the mailer`, async () => {
        const { url, sent } = await start()
        const res = await fetch(`${url}${target}`, {
          method,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(valid).toString(),
        })
        expect(res.status).toBe(405)
        expect(res.headers.get('allow')).toBe('GET, HEAD, POST')
        expect(sent).toHaveLength(0)
      })
    }
  }

  test('still 405 after the visitor is rate limited', async () => {
    const { url, sent } = await start({ limit: 1 })
    await post(`${url}/?index`, valid)
    expect((await post(`${url}/?index`, valid)).status).toBe(429)
    for (const method of ['PUT', 'PATCH', 'DELETE']) {
      const res = await fetch(`${url}/?index`, { method, body: new URLSearchParams(valid).toString() })
      expect(res.status).toBe(405)
    }
    expect(sent).toHaveLength(1)
  })

  test('OPTIONS gets 405 too', async () => {
    const { url } = await start()
    const res = await fetch(`${url}/`, { method: 'OPTIONS' })
    expect(res.status).toBe(405)
    expect(res.headers.get('allow')).toBe('GET, HEAD, POST')
  })

  test('large PUT bodies are refused without being read, with or without Content-Length', async () => {
    const { port, sent } = await start()
    const big = new URLSearchParams({ ...valid, message: 'x'.repeat(3_000_000) }).toString()
    const withLength = await rawStatus(
      port,
      `PUT /?index HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: ${big.length}\r\nConnection: close\r\n\r\n`,
      big,
    )
    expect(withLength).toBe(405)
    const noLength = await rawStatus(
      port,
      'PUT /?index HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Type: application/x-www-form-urlencoded\r\nTransfer-Encoding: chunked\r\nConnection: close\r\n\r\n',
      chunked(big),
    )
    expect(noLength).toBe(405)
    expect(sent).toHaveLength(0)
  })

  test('the contact action itself also refuses anything but POST', async () => {
    const home = build.routes['routes/home']?.module
    expect(typeof home?.action).toBe('function')
    const sent: MailMessage[] = []
    const mail = { mailer: { send: async (m: MailMessage) => void sent.push(m) }, to: 'a@example.com', from: 'b@example.com' }
    for (const method of ['PUT', 'PATCH', 'DELETE']) {
      const request = new Request('http://localhost/?index', {
        method,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(valid).toString(),
      })
      const result: any = await home!.action!({ request, params: {}, context: { mail } } as any)
      expect(result.init?.status).toBe(405)
    }
    expect(sent).toHaveLength(0)
  })
})

describe('POST edge cases', () => {
  test('a POST without Content-Length gets 411', async () => {
    const { port, sent } = await start()
    const body = new URLSearchParams(valid).toString()
    const status = await rawStatus(
      port,
      'POST /?index HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Type: application/x-www-form-urlencoded\r\nTransfer-Encoding: chunked\r\nConnection: close\r\n\r\n',
      chunked(body),
    )
    expect(status).toBe(411)
    expect(sent).toHaveLength(0)
  })

  test('a non-form body gets 400 invalid, not a 500 page', async () => {
    const { url, sent } = await start()
    for (const target of ['/?index', '/_root.data?index']) {
      const res = await fetch(`${url}${target}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valid),
      })
      expect(res.status).toBe(400)
      expect(await res.text()).toContain('invalid')
    }
    const malformed = await fetch(`${url}/?index`, {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data; boundary=nope' },
      body: 'not multipart at all',
    })
    expect(malformed.status).toBe(400)
    expect(sent).toHaveLength(0)
  })

  test('rate limiting is decided before the body is parsed', async () => {
    const { url } = await start({ limit: 1 })
    await post(`${url}/?index`, valid)
    const res = await fetch(`${url}/?index`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not json',
    })
    expect(res.status).toBe(429)
  })
})

describe('fetcher path ordering', () => {
  test('honeypot on /_root.data?index reports success and sends nothing', async () => {
    const { url, sent } = await start()
    const res = await post(`${url}/_root.data?index`, { ...valid, company_url: 'https://spam.example' })
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('sent')
    expect(sent).toHaveLength(0)
  })

  test('over the limit, even honeypot and invalid posts get 429 on /_root.data?index', async () => {
    const { url, sent } = await start({ limit: 1 })
    expect((await post(`${url}/_root.data?index`, valid)).status).toBe(200)
    const honeypot = await post(`${url}/_root.data?index`, { ...valid, company_url: 'x' })
    expect(honeypot.status).toBe(429)
    expect(await honeypot.text()).toContain('rate_limited')
    const invalid = await post(`${url}/_root.data?index`, { name: '' })
    expect(invalid.status).toBe(429)
    expect(sent).toHaveLength(1)
  })
})

describe('LOG_CLIENT_IP diagnostics', () => {
  test('logs req.ip and the raw X-Forwarded-For when enabled', async () => {
    const lines: string[] = []
    const { url } = await start({ logClientIp: (line) => lines.push(line) })
    await fetch(`${url}/llms.txt`, { headers: { 'X-Forwarded-For': '198.51.100.7, 203.0.113.9' } })
    expect(lines).toHaveLength(1)
    expect(lines[0]).toContain('req.ip=203.0.113.9')
    expect(lines[0]).toContain('x-forwarded-for="198.51.100.7, 203.0.113.9"')
    expect(lines[0]).toContain('remote=127.0.0.1')
  })

  test('logs nothing by default', async () => {
    const orig = console.info
    const lines: unknown[] = []
    console.info = (...args: unknown[]) => void lines.push(args)
    try {
      const { url } = await start()
      await fetch(`${url}/llms.txt`, { headers: { 'X-Forwarded-For': '198.51.100.7' } })
    } finally {
      console.info = orig
    }
    expect(lines.filter((l) => String(l).includes('x-forwarded-for'))).toHaveLength(0)
  })
})

describe('npm run smoke', () => {
  test('passes against the build and exits 0', () => {
    const result = Bun.spawnSync(['node', 'scripts/smoke.mjs'], { cwd: ROOT, stdout: 'pipe', stderr: 'pipe' })
    const out = result.stdout.toString()
    expect(out).toContain('smoke: all 4 checks passed')
    expect(result.exitCode).toBe(0)
  }, 30_000)
})
