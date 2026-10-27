import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useActionData, useFetcher } from 'react-router'
import { SITE } from '../../content/site'
import { track } from '../../lib/analytics'
import {
  type ContactField,
  type ContactResult,
  type FieldErrors,
  FIELD_LIMITS,
  HONEYPOT_FIELD,
  hasErrors,
  readContactForm,
  validateContact,
} from '../../lib/contact'

export function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="wrap contact-grid">
        <div className="contact-copy">
          <p className="eyebrow eyebrow-light">Get started</p>
          <h2>Tell me what you need.</h2>
          <p>
            A dead zone, a new office, a cabling bid, or software that should exist but doesn't. Send a note and I'll
            get back to you within one business day.
          </p>
          <ContactDirect />
        </div>

        <ContactForm />
      </div>
    </section>
  )
}

// Email, phone, and hours. Clicks on the mailto: and tel: links are counted by
// the delegated listener in app/lib/analytics.ts.
export function ContactDirect() {
  return (
    <ul className="contact-direct">
      <li>
        <span>Email</span>{' '}
        <a href={`mailto:${SITE.email}`} data-track="email">
          {SITE.email}
        </a>
      </li>
      <li>
        <span>Phone</span>{' '}
        <a href={`tel:${SITE.tel}`} data-track="call">
          {SITE.phone}
        </a>
      </li>
      <li>
        <span>Hours</span> By appointment. Evenings and Saturdays available.
      </li>
    </ul>
  )
}

const emailLink = <a href={`mailto:${SITE.email}`}>{SITE.email}</a>

function statusMessage(result: ContactResult | undefined, invalid: boolean): [ReactNode, string] {
  if (invalid) return ['Please fill in your name, a valid email, and a short message.', 'err']
  switch (result?.status) {
    case 'sent':
      return ["Thanks. Your message is in, and I'll reply within one business day.", 'ok']
    case 'rate_limited':
      return [<>Too many messages from this connection. Please wait a few minutes, or email {emailLink} directly.</>, 'err']
    case 'unconfigured':
      return [<>The form can't send messages yet. Please email {emailLink} directly.</>, 'err']
    case 'failed':
      return [<>That didn't send. Please email {emailLink} directly.</>, 'err']
    default:
      return ['', '']
  }
}

// Posts as a plain HTML form without JavaScript (the server re-renders the page
// with the result); with JavaScript it submits in the background via a fetcher.
export function ContactForm() {
  const fetcher = useFetcher<ContactResult>()
  const actionData = useActionData<ContactResult>()
  const result = fetcher.data ?? actionData
  const formRef = useRef<HTMLFormElement>(null)
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null)

  // Without JavaScript the browser's own required/type checks run first. Once
  // hydrated, this component validates and shows the messages itself.
  useEffect(() => {
    if (formRef.current) formRef.current.noValidate = true
  }, [])

  useEffect(() => {
    if (fetcher.data?.status === 'sent') {
      formRef.current?.reset()
      track('generate_lead', { form: 'contact' })
    }
  }, [fetcher.data])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const errors = validateContact(readContactForm(new FormData(event.currentTarget)).values)
    if (hasErrors(errors)) {
      event.preventDefault()
      setClientErrors(errors)
      const first = Object.keys(errors)[0]
      event.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
    } else {
      setClientErrors(null)
    }
  }

  const sending = fetcher.state !== 'idle'
  const serverInvalid = !clientErrors && result?.status === 'invalid' ? result : undefined
  const errors: FieldErrors = clientErrors ?? serverInvalid?.errors ?? {}
  const values = serverInvalid?.values
  const [message, kind] = sending ? ['Sending…', ''] : statusMessage(result, hasErrors(errors))

  const field = (name: ContactField) => ({
    name,
    id: `f-${name === 'message' ? 'msg' : name}`,
    maxLength: FIELD_LIMITS[name],
    defaultValue: values?.[name],
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `f-${name}-err` : undefined,
  })
  const error = (name: ContactField) =>
    errors[name] ? (
      <p className="field-error" id={`f-${name}-err`}>
        {errors[name]}
      </p>
    ) : null

  return (
    <fetcher.Form
      ref={formRef}
      className="form"
      id="contactForm"
      action="/?index#contact"
      method="post"
      onSubmit={onSubmit}
    >
      <div className="field">
        <label htmlFor="f-name">Name</label>
        <input {...field('name')} type="text" autoComplete="name" required />
        {error('name')}
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="f-email">Email</label>
          <input {...field('email')} type="email" autoComplete="email" required />
          {error('email')}
        </div>
        <div className="field">
          <label htmlFor="f-phone">
            Phone <small>(optional)</small>
          </label>
          <input {...field('phone')} type="tel" autoComplete="tel" />
          {error('phone')}
        </div>
      </div>
      <div className="field">
        <label htmlFor="f-town">Town</label>
        <input {...field('town')} type="text" autoComplete="address-level2" placeholder="e.g. Bedford" />
        {error('town')}
      </div>
      <div className="field">
        <label htmlFor="f-msg">What's going on?</label>
        <textarea {...field('message')} rows={5} required />
        {error('message')}
      </div>
      {/* honeypot: humans never see or fill this */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-co">Company website</label>
        <input id="f-co" name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <button className="btn btn-light" type="submit" disabled={sending}>
        Send message
      </button>
      <p className={kind ? `form-status ${kind}` : 'form-status'} role="status" aria-live="polite">
        {message}
      </p>
      <p className="form-note">
        I use what you send to reply. <a href="/privacy">How I handle it</a>.
      </p>
    </fetcher.Form>
  )
}
