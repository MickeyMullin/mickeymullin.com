// Contact form fields, sanitizing and validation. Shared by the server action and
// the browser, so both report the same errors.

export const FIELD_LIMITS = {
  name: 120,
  email: 200,
  phone: 40,
  town: 80,
  message: 5000,
} as const

export type ContactField = keyof typeof FIELD_LIMITS
export type ContactValues = Record<ContactField, string>
export type FieldErrors = Partial<Record<ContactField, string>>

export const HONEYPOT_FIELD = 'company_url'
export const CONTACT_FIELDS = Object.keys(FIELD_LIMITS) as ContactField[]

// One plain address. The excluded characters are the ones an address parser reads as a list
// (,;), a group (:), angle brackets, a comment, a quoted part or an escape, so the Reply-To header
// built from it can only ever hold the one address.
const EMAIL_RE = /^[^\s@<>,;:"()[\]\\]+@[^\s@<>,;:"()[\]\\]+\.[^\s@<>,;:"()[\]\\]+$/

export type ContactResult =
  | { status: 'sent' }
  | { status: 'invalid'; errors: FieldErrors; values: ContactValues }
  | { status: 'rate_limited' }
  | { status: 'unconfigured' }
  | { status: 'failed' }

// For anything that can end up in a mail header: CR, LF and other control
// characters become spaces, so a value can never start a new header line.
export function singleLine(value: string) {
  return value
    .replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ')
    .replace(/ {2,}/g, ' ')
    .trim()
}

// For the message body: keep line breaks (normalized to LF), drop other control characters.
export function multiLine(value: string) {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '')
    .trim()
}

export function readContactForm(form: FormData): { values: ContactValues; honeypot: string } {
  const raw = (name: string) => {
    const v = form.get(name)
    return typeof v === 'string' ? v : ''
  }
  const values = {} as ContactValues
  for (const field of CONTACT_FIELDS) {
    values[field] = field === 'message' ? multiLine(raw(field)) : singleLine(raw(field))
  }
  return { values, honeypot: raw(HONEYPOT_FIELD).trim() }
}

export function validateContact(values: ContactValues): FieldErrors {
  const errors: FieldErrors = {}
  for (const field of CONTACT_FIELDS) {
    if (values[field].length > FIELD_LIMITS[field]) {
      errors[field] = `Please keep this under ${FIELD_LIMITS[field].toLocaleString('en-US')} characters.`
    }
  }
  if (!values.name && !errors.name) errors.name = 'Please enter your name.'
  if (!errors.email && !EMAIL_RE.test(values.email)) errors.email = 'Please enter a valid email address.'
  if (!values.message && !errors.message) errors.message = "Please tell me a little about what's going on."
  return errors
}

export function hasErrors(errors: FieldErrors) {
  return Object.keys(errors).length > 0
}
