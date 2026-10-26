// Mail transport behind a small interface. Production uses nodemailer over SMTP
// (Google Workspace); tests pass a fake through the request context.

import nodemailer from 'nodemailer'
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

// Writes the message to the server log instead of sending it. Local
// development only: opt in with CONTACT_TRANSPORT=log.
export const logMailer: Mailer = {
  async send(message) {
    console.info('[contact] CONTACT_TRANSPORT=log, not sending:\n%s', JSON.stringify(message, null, 2))
  },
}

// Reads CONTACT_TO, CONTACT_FROM, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.
// Returns null when SMTP is not fully configured.
export function mailSetupFromEnv(env: Env = process.env): MailSetup | null {
  const get = (key: string) => singleLine(env[key] ?? '')
  const to = get('CONTACT_TO')
  const from = get('CONTACT_FROM')

  if (get('CONTACT_TRANSPORT') === 'log') {
    return { mailer: logMailer, to: to || 'info@mickeymullin.com', from: from || 'website@mickeymullin.com' }
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
