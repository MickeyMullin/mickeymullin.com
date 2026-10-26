// Handles one contact form submission: rate limit, honeypot, validation, send.

import {
  type ContactResult,
  type ContactValues,
  hasErrors,
  readContactForm,
  singleLine,
  validateContact,
} from './contact'
import type { MailMessage, MailSetup } from './mailer.server'

export type ContactDeps = {
  // null when SMTP is not configured
  mail: MailSetup | null
  // set by the express-rate-limit middleware in server.js
  rateLimited: boolean
  ip: string
  log?: Pick<Console, 'warn' | 'error'>
}

export function buildMessage(values: ContactValues, mail: { to: string; from: string }, ip: string): MailMessage {
  const subject = singleLine(`Website inquiry: ${values.name}${values.town ? ` (${values.town})` : ''}`)
  const text = [
    `Name:    ${values.name}`,
    `Email:   ${values.email}`,
    `Phone:   ${values.phone}`,
    `Town:    ${values.town}`,
    `IP:      ${ip}`,
    '',
    values.message,
    '',
  ].join('\n')
  return {
    to: mail.to,
    from: { name: 'Mickey Mullin website', address: mail.from },
    replyTo: { name: values.name, address: values.email },
    subject,
    text,
  }
}

export async function handleContact(
  form: FormData,
  deps: ContactDeps,
): Promise<{ result: ContactResult; status: number }> {
  const log = deps.log ?? console

  if (deps.rateLimited) return { result: { status: 'rate_limited' }, status: 429 }

  const { values, honeypot } = readContactForm(form)

  // Honeypot: bots fill every field. Report success so they move on, send nothing.
  if (honeypot) return { result: { status: 'sent' }, status: 200 }

  const errors = validateContact(values)
  if (hasErrors(errors)) return { result: { status: 'invalid', errors, values }, status: 400 }

  if (!deps.mail) {
    log.warn('[contact] SMTP is not configured (CONTACT_TO, CONTACT_FROM, SMTP_*); message not sent')
    return { result: { status: 'unconfigured' }, status: 503 }
  }

  try {
    await deps.mail.mailer.send(buildMessage(values, deps.mail, deps.ip))
    return { result: { status: 'sent' }, status: 200 }
  } catch (error) {
    log.error('[contact] sending failed:', error)
    return { result: { status: 'failed' }, status: 502 }
  }
}
