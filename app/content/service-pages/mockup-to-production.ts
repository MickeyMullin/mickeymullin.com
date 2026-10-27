// /software/mockup-to-production: taking an AI-built app to production (#724).
// The sections that match the home page's "last mile" callout open with the
// same question and answer from LAST_MILE, so the two can't drift.

import { AI_APP_FAQ, AI_FAQ, OUTSIDE_NH_FAQ } from '../faq'
import { getPage } from '../pages'
import { priceRow } from '../pricing'
import { LAST_MILE, type LastMileId } from '../services'
import { OWNERSHIP } from './shared'
import { findService, type Section, type ServicePageContent } from './types'

const review = priceRow('mockup')
const service = findService('Mockup to production')

function lastMile(id: LastMileId, eyebrow: string, more: Omit<Section, 'id' | 'eyebrow' | 'heading'>): Section {
  const item = LAST_MILE.find((m) => m.id === id)
  if (!item) throw new Error(`No LAST_MILE item ${id}`)
  return { id, eyebrow, heading: item.question, ...more, body: [item.answer, ...more.body] }
}

export const MOCKUP_TO_PRODUCTION: ServicePageContent = {
  id: 'mockup',
  page: getPage('/software/mockup-to-production'),
  service,
  onSite: false,
  eyebrow: 'Software · Mockup to production',
  h1: 'Mockup to production: finish the app you built with AI',
  intro: `${service.blurb} It starts with a ${review.detail}.`,
  sections: [
    lastMile('dns', 'DNS and domain', {
      body: [
        "Builder tools publish your app at an address on their domain, not yours. I point your own domain at the real host and set up HTTPS. Before changing any DNS, I write down the records you already have, especially the MX records that deliver your email, so moving the website doesn't quietly break your inbox.",
      ],
    }),
    lastMile('email', 'Email', {
      body: [
        'Those three records tell other mail servers that your app is allowed to send as your domain. Without them, password resets and order confirmations land in spam or get rejected. If the app sends a lot of mail, such as receipts, notifications, or newsletters, I set up a transactional email service built for that volume, under your domain and your account.',
      ],
    }),
    lastMile('crm', 'CRM', {
      body: [
        "That includes Pipedrive and other CRMs with an API. I connect the app through the CRM's API or its webhooks, so a new lead or order shows up where your team already works, and nobody types the same contact into two places.",
      ],
    }),
    lastMile('hosting', 'Hosting', {
      body: [
        "A small internal tool doesn't need what a busy storefront does, and the bill should reflect that. The account is yours from day one, so keeping the app online never depends on me or on a builder tool's plan.",
      ],
    }),
    lastMile('logins', 'Logins', {
      body: [
        "Staff, customers, and admins each see what they should and nothing more. Where it fits, people sign in with the Google or Microsoft account they already have, so there's one less password, and switching off someone's work account switches off their access too.",
      ],
    }),
    lastMile('security', 'Security', {
      body: ['Prototypes built quickly tend to skip the same things. I check for them:'],
      points: [
        {
          lead: 'Secrets.',
          text: 'API keys and passwords out of the repository, and out of the code that ships to the browser, where anyone can read them.',
        },
        {
          lead: 'Database access rules,',
          text: "such as Supabase row-level security, so one customer can't read another customer's records.",
        },
        { lead: 'Input validation.', text: 'Everything a user sends is checked on the server, not just in the form.' },
        { lead: 'Dependencies.', text: 'The packages the app is built on, checked for known vulnerabilities.' },
      ],
    }),
    lastMile('reliability', 'Reliability', {
      body: [],
      points: [
        { lead: 'Backups', text: 'of the database, with a test restore to prove they work.' },
        { lead: 'Uptime monitoring,', text: 'so you hear the site is down before a customer tells you.' },
        { lead: 'Error reporting,', text: 'so a crash arrives with enough detail to fix it.' },
        { lead: 'A written runbook:', text: 'how to deploy, how to restore from a backup, and where every account lives.' },
      ],
    }),
    OWNERSHIP,
    {
      id: 'how-it-goes',
      eyebrow: 'How it goes',
      heading: 'How does it start?',
      body: [
        "With a free review of what you have. I look at the app, the code, and the accounts behind it, and tell you what works, what's risky, and what's missing.",
        "Then you get a fixed quote to finish it, so the price is settled before the work starts. Sometimes rebuilding a piece costs less than patching it; when that's the case, I'll tell you.",
        'I use AI coding tools every day too. The difference is 30 years of writing, reviewing, and running production software, including engineering and management at Microsoft and Yahoo, so every line that ships has been read and tested.',
        "I'm based in Manchester, NH. Software work doesn't need me on site, so I work with clients anywhere.",
      ],
    },
  ],
  price: {
    heading: 'What does it cost?',
    rows: [review],
    notes: [
      "The review is free and doesn't commit you to anything. After it, you get a fixed quote to finish the app, so the price doesn't grow with the hours.",
      'Hosting, email, and the other services the app runs on bill you directly, in your name. Ongoing support afterward is there if you want it.',
    ],
  },
  faq: [
    AI_APP_FAQ,
    {
      question: 'Can you put my Lovable or Bolt app on my own domain?',
      answer:
        'Yes. I point your domain at the app with HTTPS, and check your existing DNS records first so your email keeps working after the move.',
    },
    {
      question: 'Can my app send email from my Gmail or Microsoft 365 address?',
      answer:
        'Yes. I connect it to Google Workspace or Microsoft 365 and set up SPF, DKIM, and DMARC so the mail lands in inboxes. If it sends a lot of mail, I add a transactional email service under your domain.',
    },
    {
      question: 'Can it connect to HubSpot or another CRM?',
      answer:
        'Yes: HubSpot, Salesforce, Zoho, Pipedrive, or another CRM with an API. New leads and orders flow in on their own, so nobody enters them twice.',
    },
    OUTSIDE_NH_FAQ,
    AI_FAQ,
  ],
  cta: {
    heading: "Send me what you've built.",
    body: "A link to the app, or just a description of where it's stuck. I'll get back to you within one business day to set up the free review.",
    button: 'Ask for a free review',
  },
  related: ['/networking/troubleshooting', '/networking/wifi'],
}
