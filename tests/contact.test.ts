import { describe, expect, mock, test } from 'bun:test'
import { FIELD_LIMITS, readContactForm, singleLine, validateContact } from '../app/lib/contact'
import { buildMessage, handleContact } from '../app/lib/contact.server'
import {
  GMAIL_SEND_URL,
  GMAIL_TOKEN_URL,
  type MailMessage,
  type MailSetup,
  composeRaw,
  createGmailApiMailer,
  mailSetupFromEnv,
} from '../app/lib/mailer.server'

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

  test('rejects anything that could become more than one Reply-To address', () => {
    for (const email of ['a@b.co,bcc@evil.com', 'x@evil.com>,<y.z', 'a;b@example.com', 'pat@exa"mple.com', 'pat@(x)example.com', 'p:t@example.com', 'p[t]@example.com', 'p\\t@example.com']) {
      expect(validateContact(readContactForm(form({ ...valid, email })).values).email).toBeString()
    }
  })

  test('still accepts ordinary addresses with dots, plus tags, apostrophes and subdomains', () => {
    for (const email of ['pat.doe+wifi@example.com', "o'brien@example.ie", 'it@sub.example.co.uk', 'x_y-z@example.org']) {
      expect(validateContact(readContactForm(form({ ...valid, email })).values).email).toBeUndefined()
    }
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

  test('rate limited: the request body is never read', async () => {
    let read = false
    const out = await handleContact(
      async () => {
        read = true
        return form(valid)
      },
      { mail: null, rateLimited: true, ip: '' },
    )
    expect(out.status).toBe(429)
    expect(read).toBe(false)
  })

  test('an unreadable body is a 400 invalid result, not an exception', async () => {
    const { sent, setup } = fakeMail()
    const out = await handleContact(() => Promise.reject(new TypeError('not form data')), {
      mail: setup,
      rateLimited: false,
      ip: '',
    })
    expect(out.status).toBe(400)
    expect(out.result.status).toBe('invalid')
    if (out.result.status !== 'invalid') throw new Error('unreachable')
    expect(Object.keys(out.result.errors).sort()).toEqual(['email', 'message', 'name'])
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
    CONTACT_TO: 'info@mickeymullin.com',
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
    expect(setup?.to).toBe('info@mickeymullin.com')
    expect(setup?.from).toBe('website@mickeymullin.com')
    expect(typeof setup?.mailer.send).toBe('function')
  })

  test('CONTACT_TRANSPORT=log works without SMTP', () => {
    expect(mailSetupFromEnv({ CONTACT_TRANSPORT: 'log' })).not.toBeNull()
  })
})

describe('mailSetupFromEnv with the Gmail API', () => {
  const gmail = {
    CONTACT_TO: 'info@mickeymullin.com',
    CONTACT_FROM: 'info@mickeymullin.com',
    GMAIL_CLIENT_ID: 'client-id.apps.googleusercontent.com',
    GMAIL_CLIENT_SECRET: 'client-secret',
    GMAIL_REFRESH_TOKEN: 'refresh-token',
  }

  test('builds a mailer from the three GMAIL_* variables, no SMTP needed', () => {
    const setup = mailSetupFromEnv(gmail)
    expect(setup?.to).toBe('info@mickeymullin.com')
    expect(setup?.from).toBe('info@mickeymullin.com')
    expect(typeof setup?.mailer.send).toBe('function')
  })

  test('a partial GMAIL_* group fails closed, even with SMTP set, and names what is missing', () => {
    const smtp = { SMTP_HOST: 'smtp.gmail.com', SMTP_USER: 'u@example.com', SMTP_PASS: 'p' }
    for (const key of ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN']) {
      const warnings: string[] = []
      expect(mailSetupFromEnv({ ...gmail, ...smtp, [key]: '' }, { warn: (m: string) => void warnings.push(m) })).toBeNull()
      expect(warnings).toEqual([`[contact] GMAIL_* is incomplete, so mail is off; missing: ${key}`])
      for (const secret of ['client-secret', 'refresh-token']) expect(warnings[0]).not.toContain(secret)
    }
  })

  test('with both groups complete, the Gmail API wins over SMTP', async () => {
    const calls: string[] = []
    const realFetch = globalThis.fetch
    globalThis.fetch = (async (url: string) => {
      calls.push(String(url))
      return String(url) === GMAIL_TOKEN_URL ? Response.json({ access_token: 'a', expires_in: 3600 }) : Response.json({ id: 'm' })
    }) as typeof fetch
    try {
      const smtp = { SMTP_HOST: '127.0.0.1', SMTP_PORT: '1', SMTP_USER: 'u@example.com', SMTP_PASS: 'p' }
      await mailSetupFromEnv({ ...gmail, ...smtp })?.mailer.send({
        to: 'a@example.com',
        from: { name: 'n', address: 'b@example.com' },
        replyTo: { name: 'r', address: 'c@example.com' },
        subject: 's',
        text: 't',
      })
    } finally {
      globalThis.fetch = realFetch
    }
    expect(calls).toEqual([GMAIL_TOKEN_URL, GMAIL_SEND_URL])
  })

  test('still needs CONTACT_TO and CONTACT_FROM', () => {
    expect(mailSetupFromEnv({ ...gmail, CONTACT_TO: '' })).toBeNull()
    expect(mailSetupFromEnv({ ...gmail, CONTACT_FROM: '' })).toBeNull()
  })
})

describe('Gmail API mailer', () => {
  const message: MailMessage = {
    to: 'info@mickeymullin.com',
    from: { name: 'Mickey Mullin website', address: 'info@mickeymullin.com' },
    replyTo: { name: 'Pat Doe', address: 'pat@example.com' },
    subject: 'Website inquiry: Pat Doe (Bedford)',
    text: 'Name:    Pat Doe\n\nThe Wi-Fi drops.\n',
  }

  type Call = { url: string; init: RequestInit }

  function fakeGoogle(sendStatuses: number[] = [200], tokenStatus = 200) {
    const calls: Call[] = []
    let tokens = 0
    const fetch = async (url: string, init: RequestInit) => {
      calls.push({ url, init })
      if (url === GMAIL_TOKEN_URL) {
        tokens++
        if (tokenStatus !== 200) {
          return Response.json({ error: 'invalid_grant', error_description: 'Token has been expired or revoked.' }, { status: tokenStatus })
        }
        return Response.json({ access_token: `access-${tokens}`, expires_in: 3599, token_type: 'Bearer' })
      }
      const status = sendStatuses.shift() ?? 200
      if (status !== 200) return Response.json({ error: { code: status, message: 'Request had insufficient authentication scopes.' } }, { status })
      return Response.json({ id: 'msg-1', threadId: 't-1', labelIds: ['SENT'] })
    }
    return { calls, fetch, tokenCount: () => tokens }
  }

  const creds = { clientId: 'cid', clientSecret: 'csecret', refreshToken: 'rtoken' }

  test('refreshes a token, then posts the raw message with it', async () => {
    const google = fakeGoogle()
    await createGmailApiMailer({ ...creds, fetch: google.fetch }).send(message)

    expect(google.calls.map((c) => c.url)).toEqual([GMAIL_TOKEN_URL, GMAIL_SEND_URL])
    const tokenBody = new URLSearchParams(String(google.calls[0].init.body))
    expect(Object.fromEntries(tokenBody)).toEqual({
      client_id: 'cid',
      client_secret: 'csecret',
      refresh_token: 'rtoken',
      grant_type: 'refresh_token',
    })

    const send = google.calls[1].init
    expect(send.method).toBe('POST')
    expect((send.headers as Record<string, string>).authorization).toBe('Bearer access-1')
    const raw = Buffer.from(JSON.parse(String(send.body)).raw, 'base64url').toString('utf8')
    expect(raw).toContain('From: Mickey Mullin website <info@mickeymullin.com>')
    expect(raw).toContain('To: info@mickeymullin.com')
    expect(raw).toContain('Reply-To: Pat Doe <pat@example.com>')
    expect(raw).toContain('Subject: Website inquiry: Pat Doe (Bedford)')
    expect(raw).toContain('The Wi-Fi drops.')
  })

  test('the raw message is base64url, as the Gmail API requires', async () => {
    const google = fakeGoogle()
    await createGmailApiMailer({ ...creds, fetch: google.fetch }).send(message)
    expect(JSON.parse(String(google.calls[1].init.body)).raw).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  test('reuses the access token until shortly before it expires', async () => {
    const google = fakeGoogle([200, 200, 200])
    let clock = 0
    const mailer = createGmailApiMailer({ ...creds, fetch: google.fetch, now: () => clock })
    await mailer.send(message)
    clock += 30 * 60 * 1000
    await mailer.send(message)
    expect(google.tokenCount()).toBe(1)
    clock += 29 * 60 * 1000 + 1
    await mailer.send(message)
    expect(google.tokenCount()).toBe(2)
  })

  test('a 401 on send refreshes once and retries with the new token', async () => {
    const google = fakeGoogle([401, 200])
    await createGmailApiMailer({ ...creds, fetch: google.fetch }).send(message)
    expect(google.calls.map((c) => c.url)).toEqual([GMAIL_TOKEN_URL, GMAIL_SEND_URL, GMAIL_TOKEN_URL, GMAIL_SEND_URL])
    expect((google.calls[3].init.headers as Record<string, string>).authorization).toBe('Bearer access-2')
  })

  test('a second 401 throws instead of retrying again', async () => {
    const google = fakeGoogle([401, 401, 200])
    const error = await createGmailApiMailer({ ...creds, fetch: google.fetch }).send(message).catch((e: Error) => e)
    expect((error as Error).message).toContain('HTTP 401')
    expect(google.calls).toHaveLength(4)
  })

  test('concurrent sends share one token refresh', async () => {
    const google = fakeGoogle([200, 200])
    const mailer = createGmailApiMailer({ ...creds, fetch: google.fetch })
    await Promise.all([mailer.send(message), mailer.send(message)])
    expect(google.tokenCount()).toBe(1)
  })

  test('a network failure or timeout makes handleContact answer 502', async () => {
    const fetch = async () => Promise.reject(new DOMException('The operation timed out.', 'TimeoutError'))
    const out = await handleContact(form(valid), {
      mail: { mailer: createGmailApiMailer({ ...creds, fetch }), to: 'a@example.com', from: 'b@example.com' },
      rateLimited: false,
      ip: '',
      log: quietLog,
    })
    expect(out).toEqual({ result: { status: 'failed' }, status: 502 })
  })

  test('a revoked refresh token throws without echoing any secret', async () => {
    const google = fakeGoogle([], 400)
    const error = await createGmailApiMailer({ ...creds, fetch: google.fetch }).send(message).catch((e: Error) => e)
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toContain('HTTP 400 (invalid_grant')
    for (const secret of ['csecret', 'rtoken']) expect((error as Error).message).not.toContain(secret)
  })

  test('a send error carries the status and Google message, and handleContact answers 502', async () => {
    const google = fakeGoogle([403])
    const mailer = createGmailApiMailer({ ...creds, fetch: google.fetch })
    const error = await mailer.send(message).catch((e: Error) => e)
    expect((error as Error).message).toBe('Gmail API send failed: HTTP 403 (Request had insufficient authentication scopes.)')
    expect((error as Error).message).not.toContain('access-1')

    const out = await handleContact(form(valid), {
      mail: { mailer: createGmailApiMailer({ ...creds, fetch: fakeGoogle([403]).fetch }), to: 'a@example.com', from: 'b@example.com' },
      rateLimited: false,
      ip: '',
      log: quietLog,
    })
    expect(out).toEqual({ result: { status: 'failed' }, status: 502 })
  })

  test('composeRaw itself keeps CRLF in the subject or Reply-To name from adding headers', async () => {
    const evil = 'Pat\r\nBcc: x@evil.test'
    const raw = (await composeRaw({ ...message, subject: evil, replyTo: { name: evil, address: 'pat@example.com' } })).toString('utf8')
    expect(raw).not.toMatch(/^Bcc:/im)
    expect(raw).toContain('pat@example.com')
  })
})
