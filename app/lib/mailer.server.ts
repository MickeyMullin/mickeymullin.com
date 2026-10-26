// Mail transport behind a small interface. Production sends through the Gmail
// API with an OAuth refresh token limited to the gmail.send scope (Google
// Workspace). SMTP with a password stays as a fallback. Tests pass a fake
// through the request context.

import nodemailer from 'nodemailer'
import MailComposer from 'nodemailer/lib/mail-composer'
import { singleLine } from './contact'

export type MailMessage = {
  to: string
  from: { name: string; address: string }
  replyTo: { name: string; address: string }
  subject: string
  text: string
}

export interface Mailer {
  send(message: MailMessage): Promise<void>
}

// A configured mailer plus the addresses it sends between.
export type MailSetup = { mailer: Mailer; to: string; from: string }

type Env = Record<string, string | undefined>

export function createSmtpMailer(options: {
  host: string
  port: number
  user: string
  pass: string
}): Mailer {
  const transport = nodemailer.createTransport({
    host: options.host,
    port: options.port,
    // 465 is implicit TLS; other ports (587) upgrade with STARTTLS.
    secure: options.port === 465,
    auth: { user: options.user, pass: options.pass },
  })
  return {
    async send(message) {
      await transport.sendMail(message)
    },
  }
}

export const GMAIL_TOKEN_URL = 'https://oauth2.googleapis.com/token'
export const GMAIL_SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send'

type FetchLike = (url: string, init: RequestInit) => Promise<Response>

// Google's error code and description only; never the request or token.
async function googleError(what: string, res: Response): Promise<Error> {
  let reason = ''
  try {
    const body = (await res.json()) as { error?: unknown; error_description?: unknown }
    const err = body.error
    if (typeof err === 'string') reason = [err, body.error_description].filter((s) => typeof s === 'string').join(': ')
    else if (err && typeof err === 'object' && 'message' in err) reason = String((err as { message: unknown }).message)
  } catch {
    // not JSON
  }
  return new Error(`Gmail API ${what} failed: HTTP ${res.status}${reason ? ` (${reason})` : ''}`)
}

// Builds the RFC 822 message with nodemailer's composer, so headers are
// encoded exactly as the SMTP path would encode them.
export async function composeRaw(message: MailMessage): Promise<Buffer> {
  return new MailComposer({ ...message }).compile().build()
}

export function createGmailApiMailer(options: {
  clientId: string
  clientSecret: string
  refreshToken: string
  fetch?: FetchLike
  now?: () => number
}): Mailer {
  const doFetch: FetchLike = options.fetch ?? ((url, init) => fetch(url, init))
  const now = options.now ?? Date.now
  let token: { value: string; expiresAt: number } | undefined
  let refreshing: Promise<string> | undefined

  // Concurrent sends share one in-flight refresh.
  function accessToken(): Promise<string> {
    if (token && token.expiresAt > now()) return Promise.resolve(token.value)
    refreshing ??= refresh().finally(() => {
      refreshing = undefined
    })
    return refreshing
  }

  async function refresh(): Promise<string> {
    const res = await doFetch(GMAIL_TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: options.clientId,
        client_secret: options.clientSecret,
        refresh_token: options.refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) throw await googleError('token refresh', res)
    const body = (await res.json()) as { access_token?: unknown; expires_in?: unknown }
    if (typeof body.access_token !== 'string' || !body.access_token) {
      throw new Error('Gmail API token refresh failed: no access_token in the response')
    }
    const seconds = typeof body.expires_in === 'number' ? body.expires_in : 3600
    // Refresh a minute early so a token never expires mid-request.
    token = { value: body.access_token, expiresAt: now() + Math.max(0, seconds - 60) * 1000 }
    return token.value
  }

  async function post(raw: string): Promise<Response> {
    return doFetch(GMAIL_SEND_URL, {
      method: 'POST',
      headers: { authorization: `Bearer ${await accessToken()}`, 'content-type': 'application/json' },
      body: JSON.stringify({ raw }),
      signal: AbortSignal.timeout(15_000),
    })
  }

  return {
    async send(message) {
      const raw = (await composeRaw(message)).toString('base64url')
      let res = await post(raw)
      if (res.status === 401) {
        // Access token revoked or expired early: refresh once and retry.
        await res.body?.cancel()
        token = undefined
        res = await post(raw)
      }
      if (!res.ok) throw await googleError('send', res)
    },
  }
}

// Writes the message to the server log instead of sending it. Local
// development only: opt in with CONTACT_TRANSPORT=log.
export const logMailer: Mailer = {
  async send(message) {
    console.info('[contact] CONTACT_TRANSPORT=log, not sending:\n%s', JSON.stringify(message, null, 2))
  },
}

// Reads CONTACT_TO and CONTACT_FROM, then either the Gmail API group
// (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN; preferred) or the
// SMTP group (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS). Returns null when
// neither is fully configured. Any GMAIL_* variable selects the Gmail API, so a
// half-entered Gmail group fails closed instead of silently using SMTP.
export function mailSetupFromEnv(env: Env = process.env, log: Pick<Console, 'warn'> = console): MailSetup | null {
  const get = (key: string) => singleLine(env[key] ?? '')
  const to = get('CONTACT_TO')
  const from = get('CONTACT_FROM')

  if (get('CONTACT_TRANSPORT') === 'log') {
    return { mailer: logMailer, to: to || 'info@mickeymullin.com', from: from || 'website@mickeymullin.com' }
  }

  if (!to || !from) return null

  const clientId = get('GMAIL_CLIENT_ID')
  const clientSecret = get('GMAIL_CLIENT_SECRET')
  const refreshToken = get('GMAIL_REFRESH_TOKEN')
  if (clientId || clientSecret || refreshToken) {
    if (!clientId || !clientSecret || !refreshToken) {
      // Names only, never values.
      const missing = Object.entries({ GMAIL_CLIENT_ID: clientId, GMAIL_CLIENT_SECRET: clientSecret, GMAIL_REFRESH_TOKEN: refreshToken })
        .filter(([, value]) => !value)
        .map(([name]) => name)
      log.warn(`[contact] GMAIL_* is incomplete, so mail is off; missing: ${missing.join(', ')}`)
      return null
    }
    return { mailer: createGmailApiMailer({ clientId, clientSecret, refreshToken }), to, from }
  }

  const host = get('SMTP_HOST')
  const user = get('SMTP_USER')
  const pass = env.SMTP_PASS ?? ''
  const port = Number(get('SMTP_PORT') || 465)
  if (!to || !from || !host || !user || !pass || !Number.isInteger(port)) return null

  return { mailer: createSmtpMailer({ host, port, user, pass }), to, from }
}

let cached: { setup: MailSetup | null } | undefined

// The process-wide mail setup, built once from the environment.
export function defaultMailSetup(): MailSetup | null {
  cached ??= { setup: mailSetupFromEnv() }
  return cached.setup
}
