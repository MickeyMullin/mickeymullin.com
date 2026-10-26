import { describe, expect, mock, test } from 'bun:test'
import { FIELD_LIMITS, readContactForm, singleLine, validateContact } from '../app/lib/contact'
import { buildMessage, handleContact } from '../app/lib/contact.server'
import { type MailMessage, type MailSetup, mailSetupFromEnv } from '../app/lib/mailer.server'

function form(fields: Record<string, string>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

const valid = { name: 'Pat Doe', email: 'pat@example.com', message: 'The Wi-Fi drops in the back office.' }

function fakeMail() {
  const sent: MailMessage[] = []
  const setup: MailSetup = {
    mailer: { send: async (m) => void sent.push(m) },
    to: 'hello@example.com',
    from: 'website@example.com',
  }
  return { sent, setup }
}

const quietLog = { warn: mock(() => {}), error: mock(() => {}) }

describe('validation', () => {
  test('requires name, a valid email and a message', () => {
    const { values } = readContactForm(form({}))
    expect(Object.keys(validateContact(values)).sort()).toEqual(['email', 'message', 'name'])
  })

  test('accepts a complete submission, phone and town optional', () => {
    expect(validateContact(readContactForm(form(valid)).values)).toEqual({})
  })

  test('rejects malformed email addresses', () => {
    for (const email of ['pat', 'pat@', 'pat@example', 'pat @example.com', '@example.com']) {
      expect(validateContact(readContactForm(form({ ...valid, email })).values).email).toBeString()
    }
  })

  test('caps the length of every field', () => {
    for (const [field, max] of Object.entries(FIELD_LIMITS)) {
      const ok = validateContact(readContactForm(form({ ...valid, [field]: field === 'email' ? `${'a'.repeat(max - 12)}@example.com` : 'x'.repeat(max) })).values)
      expect(ok[field as keyof typeof FIELD_LIMITS]).toBeUndefined()
      const tooLong = validateContact(readContactForm(form({ ...valid, [field]: 'x'.repeat(max + 1) })).values)
      expect(tooLong[field as keyof typeof FIELD_LIMITS]).toContain('Please keep this under')
    }
  })

  test('whitespace-only required fields count as empty', () => {
    const errors = validateContact(readContactForm(form({ ...valid, name: '  \n ', message: ' \r\n ' })).values)
    expect(errors.name).toBeString()
    expect(errors.message).toBeString()
  })
})

describe('header injection', () => {
  test('singleLine strips CR, LF and other control characters', () => {
    expect(singleLine('Pat\r\nBcc: victim@example.com')).toBe('Pat Bcc: victim@example.com')
    expect(singleLine('a\u0000b c\td')).toBe('a b c d')
  })

  test('an email address with an injected header is rejected', () => {
    const { values } = readContactForm(form({ ...valid, email: 'pat@example.com\r\nBcc: victim@example.com' }))
    expect(values.email).not.toMatch(/[\r\n]/)
    expect(validateContact(values).email).toBeString()
  })

  test('nothing that reaches a mail header contains CR or LF', () => {
    const { values } = readContactForm(
      form({ ...valid, name: 'Pat\r\nBcc: victim@example.com', town: 'Bedford\nX-Evil: 1' }),
    )
    const msg = buildMessage(values, { to: 'to@example.com\r\n', from: 'from@example.com' }, '203.0.113.9')
    for (const header of [msg.subject, msg.replyTo.name, msg.replyTo.address, msg.from.name, msg.from.address]) {
      expect(header).not.toMatch(/[\r\n]/)
    }
    expect(msg.subject).toBe('Website inquiry: Pat Bcc: victim@example.com (Bedford X-Evil: 1)')
  })

  test('the message body keeps its line breaks, normalized to LF', () => {
    const { values } = readContactForm(form({ ...valid, message: 'line one\r\nline two\rline three' }))
    expect(values.message).toBe('line one\nline two\nline three')
  })
})

describe('handleContact', () => {
  test('sends a valid message with the visitor as Reply-To', async () => {
    const { sent, setup } = fakeMail()
    const out = await handleContact(form({ ...valid, phone: '603-555-0100', town: 'Bedford' }), {
      mail: setup,
      rateLimited: false,
      ip: '203.0.113.9',
    })
    expect(out).toEqual({ result: { status: 'sent' }, status: 200 })
    expect(sent).toHaveLength(1)
    expect(sent[0].to).toBe('hello@example.com')
    expect(sent[0].from).toEqual({ name: 'Mickey Mullin website', address: 'website@example.com' })
    expect(sent[0].replyTo).toEqual({ name: 'Pat Doe', address: 'pat@example.com' })
    expect(sent[0].subject).toBe('Website inquiry: Pat Doe (Bedford)')
    expect(sent[0].text).toContain('Phone:   603-555-0100')
    expect(sent[0].text).toContain('IP:      203.0.113.9')
    expect(sent[0].text).toContain(valid.message)
  })

  test('honeypot: reports success and sends nothing', async () => {
    const { sent, setup } = fakeMail()
    const out = await handleContact(form({ ...valid, company_url: 'https://spam.example' }), {
      mail: setup,
      rateLimited: false,
      ip: '',
    })
    expect(out).toEqual({ result: { status: 'sent' }, status: 200 })
    expect(sent).toHaveLength(0)
  })

  test('invalid input: 400 with per-field errors and the submitted values', async () => {
    const { sent, setup } = fakeMail()
    const out = await handleContact(form({ name: 'Pat', email: 'nope' }), { mail: setup, rateLimited: false, ip: '' })
    expect(out.status).toBe(400)
    expect(out.result.status).toBe('invalid')
    if (out.result.status !== 'invalid') throw new Error('unreachable')
    expect(Object.keys(out.result.errors).sort()).toEqual(['email', 'message'])
    expect(out.result.values.name).toBe('Pat')
    expect(sent).toHaveLength(0)
  })

  test('rate limited: 429 before anything else happens', async () => {
    const { sent, setup } = fakeMail()
    const out = await handleContact(form(valid), { mail: setup, rateLimited: true, ip: '' })
    expect(out).toEqual({ result: { status: 'rate_limited' }, status: 429 })
    expect(sent).toHaveLength(0)
  })

  test('SMTP not configured: warns, does not crash, tells the visitor to email', async () => {
    const log = { warn: mock(() => {}), error: mock(() => {}) }
    const out = await handleContact(form(valid), { mail: null, rateLimited: false, ip: '', log })
    expect(out).toEqual({ result: { status: 'unconfigured' }, status: 503 })
    expect(log.warn).toHaveBeenCalledTimes(1)
  })

  test('a transport failure is reported, not thrown', async () => {
    const setup: MailSetup = {
      mailer: { send: async () => Promise.reject(new Error('SMTP down')) },
      to: 'a@example.com',
      from: 'b@example.com',
    }
    const out = await handleContact(form(valid), { mail: setup, rateLimited: false, ip: '', log: quietLog })
    expect(out).toEqual({ result: { status: 'failed' }, status: 502 })
  })
})

describe('mailSetupFromEnv', () => {
  const full = {
    CONTACT_TO: 'hello@mickeymullin.com',
    CONTACT_FROM: 'website@mickeymullin.com',
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_PORT: '465',
    SMTP_USER: 'website@mickeymullin.com',
    SMTP_PASS: 'app-password',
  }

  test('returns null when SMTP is unset or incomplete', () => {
    expect(mailSetupFromEnv({})).toBeNull()
    for (const key of ['CONTACT_TO', 'CONTACT_FROM', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS']) {
      expect(mailSetupFromEnv({ ...full, [key]: '' })).toBeNull()
    }
  })

  test('builds an SMTP mailer when fully configured', () => {
    const setup = mailSetupFromEnv(full)
    expect(setup?.to).toBe('hello@mickeymullin.com')
    expect(setup?.from).toBe('website@mickeymullin.com')
    expect(typeof setup?.mailer.send).toBe('function')
  })

  test('CONTACT_TRANSPORT=log works without SMTP', () => {
    expect(mailSetupFromEnv({ CONTACT_TRANSPORT: 'log' })).not.toBeNull()
  })
})
