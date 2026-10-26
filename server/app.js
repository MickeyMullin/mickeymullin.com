// The Express app: security headers, compression, rate limiting, static files
// (hashed assets and pre-rendered pages), then React Router for everything else.

import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequestHandler } from '@react-router/express'
import compression from 'compression'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { loadPrerendered } from './prerendered.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// The contact form action lives on the home route. Without JavaScript the form
// posts to /?index; with JavaScript React Router posts to /_root.data?index.
const CONTACT_PATHS = new Set(['/', '/_root.data'])

// Form posts are a few KB; refuse anything far larger before React Router buffers it.
const MAX_POST_BYTES = 100 * 1024

/**
 * Hostinger runs the app behind its own reverse proxy, which appends the
 * visitor's address to X-Forwarded-For. Trusting exactly one hop makes req.ip
 * that address (so the rate limit is per visitor, not per proxy) while ignoring
 * anything a client puts in the header itself. TRUST_PROXY overrides it with
 * any Express "trust proxy" value if the hosting setup turns out different.
 * @param {string | undefined} value
 */
export function parseTrustProxy(value) {
  if (value === undefined || value === '') return 1
  if (value === 'true') return true
  if (value === 'false') return false
  return /^\d+$/.test(value) ? Number(value) : value
}

/**
 * @param {object} options
 * @param {import('react-router').ServerBuild} options.build
 * @param {string} [options.clientDir] defaults to build/client
 * @param {import('../app/lib/mailer.server').MailSetup | null} [options.mail]
 *   overrides the SMTP setup from env vars (tests)
 * @param {{ windowMs?: number, limit?: number }} [options.rateLimit]
 * @param {boolean | number | string} [options.trustProxy]
 */
export function createApp({
  build,
  clientDir = path.join(ROOT, 'build/client'),
  mail,
  rateLimit: { windowMs = 15 * 60 * 1000, limit = 5 } = {},
  trustProxy = parseTrustProxy(process.env.TRUST_PROXY),
}) {
  const prerendered = loadPrerendered(clientDir)
  const app = express()

  app.set('trust proxy', trustProxy)
  app.disable('x-powered-by')

  // One canonical host: www.mickeymullin.com → mickeymullin.com
  app.use((req, res, next) => {
    if (req.hostname?.startsWith('www.')) {
      return res.redirect(301, `https://${req.hostname.slice(4)}${req.originalUrl}`)
    }
    next()
  })

  // CSP: pre-rendered pages are static files, so their inline scripts (React
  // Router's hydration data and module loader) are allowed by sha256 hash,
  // computed from build/client at startup. Pages rendered per request (the
  // contact form result, the 404 page) carry a fresh nonce instead.
  app.use((req, res, next) => {
    res.locals.cspNonce = randomBytes(16).toString('base64')
    next()
  })
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            ...prerendered.scriptHashes,
            (req, res) => `'nonce-${/** @type {any} */ (res).locals.cspNonce}'`,
          ],
          scriptSrcAttr: ["'none'"],
          // Google Fonts until the fonts are self-hosted (Dispatch #685)
          styleSrc: ["'self'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          manifestSrc: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          objectSrc: ["'none'"],
        },
      },
      frameguard: { action: 'deny' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  )
  app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    next()
  })

  app.use(compression())

  // POSTs: size cap, then 5 per 15 minutes per IP. Over the limit, contact
  // form posts still reach the route action, which answers 429 with the
  // site's own page (or fetcher data) and a readable message; anything else
  // gets a plain 429.
  app.use((req, res, next) => {
    if (req.method !== 'POST') return next()
    const length = req.get('content-length')
    if (length === undefined) return res.status(411).type('text/plain').send('Length required.\n')
    if (Number(length) > MAX_POST_BYTES) return res.status(413).type('text/plain').send('Too large.\n')
    next()
  })
  const postLimiter = rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler(req, res, next) {
      if (CONTACT_PATHS.has(req.path)) {
        res.locals.rateLimited = true
        return next()
      }
      res.status(429).type('text/plain').send('Too many requests. Please wait a few minutes and try again.\n')
    },
  })
  app.use((req, res, next) => (req.method === 'POST' ? postLimiter(req, res, next) : next()))

  // Hashed build assets never change: cache for a year.
  app.use(
    '/assets',
    express.static(path.join(clientDir, 'assets'), { immutable: true, maxAge: '1y', index: false, redirect: false }),
  )

  // Pre-rendered pages below the root (/services/wifi → services/wifi/index.html)
  app.use((req, res, next) => {
    if ((req.method === 'GET' || req.method === 'HEAD') && req.path !== '/') {
      const p = req.path.replace(/\/$/, '')
      if (prerendered.paths.has(p)) req.url = `${p}/index.html${req.url.slice(req.path.length)}`
    }
    next()
  })

  // Everything else in build/client: pre-rendered HTML and generated text files
  // revalidate on every request; images and icons cache for a day.
  app.use(
    express.static(clientDir, {
      cacheControl: false,
      redirect: false,
      setHeaders(res, file) {
        let value = 'public, max-age=86400'
        if (/\.(html|data)$/.test(file)) value = 'no-cache'
        else if (/\.(txt|xml)$/.test(file)) value = 'public, max-age=3600'
        res.setHeader('Cache-Control', value)
      },
    }),
  )

  // Rendered per request: form results, 404s. Never cached.
  app.use(
    (req, res, next) => {
      res.setHeader('Cache-Control', 'no-store')
      next()
    },
    createRequestHandler({
      build,
      getLoadContext: (req, res) => ({
        cspNonce: res.locals.cspNonce,
        clientIp: req.ip,
        rateLimited: Boolean(res.locals.rateLimited),
        ...(mail !== undefined && { mail }),
      }),
    }),
  )

  return app
}
