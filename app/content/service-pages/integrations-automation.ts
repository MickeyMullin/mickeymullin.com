// /software/integrations-automation: integrations and automation (#714).
// Priced by fixed quote, so there is no range and no JSON-LD offer.

import { OUTSIDE_NH_FAQ } from '../faq'
import { getPage } from '../pages'
import { priceRow } from '../pricing'
import { findService, type ServicePageContent } from './types'

const service = findService('Integrations & automation')

export const INTEGRATIONS: ServicePageContent = {
  id: 'integrations',
  page: getPage('/software/integrations-automation'),
  service,
  onSite: false,
  eyebrow: 'Software · Integrations & automation',
  h1: 'CRM integration and workflow automation for small businesses',
  intro: `${service.blurb} I connect the tools you already pay for. Where Zapier or Make does the job, I use them; where they don't, I write custom code. Every account and subscription stays in your name.`,
  sections: [
    {
      id: 'connect',
      eyebrow: 'What connects',
      heading: 'What can you connect?',
      body: [
        "The condition first: if a tool has an API or webhooks, I can usually connect it. If it only has an export, sometimes. If it has neither, I'll tell you before you spend anything.",
        'Many business tools offer an API or webhooks, including these:',
      ],
      points: [
        { lead: 'CRM:', text: 'HubSpot, Salesforce, Zoho, Pipedrive, and others with an API.' },
        { lead: 'Scheduling:', text: 'booking tools, plus the calendars in Google Workspace or Microsoft 365.' },
        { lead: 'Invoicing and accounting:', text: 'QuickBooks Online and Xero.' },
        { lead: 'Email:', text: 'Gmail / Google Workspace and Microsoft 365.' },
        { lead: 'Web forms:', text: 'the contact and quote forms on your website.' },
        { lead: 'Spreadsheets:', text: 'Google Sheets, and Excel workbooks kept in OneDrive or SharePoint.' },
      ],
    },
    {
      id: 'examples',
      eyebrow: 'For example',
      heading: 'What does that look like?',
      body: ['A few examples of what is possible, depending on the tools you use:'],
      points: [
        'Someone fills in the form on your website. The lead lands in your CRM, and the right person gets an email about it.',
        'A customer signs a quote, and it becomes an invoice without anyone typing it in again.',
        'A weekly report assembles itself from the systems that hold the numbers, and arrives in your inbox.',
      ],
      // TODO(#717): real project example once one can be shown
    },
    {
      id: 'zapier-or-code',
      eyebrow: 'Zapier, Make, or code',
      heading: 'Do I need Zapier or Make, or custom code?',
      body: [
        "When a Zapier or Make workflow does the job, I set it up in your account, and it's usually the cheaper answer. I compare what each option would cost you while we scope the work.",
        'Custom code makes sense when the volume gets high enough that per-task pricing adds up, when the logic has more branches than a workflow builder handles cleanly, or when a failed step needs careful handling instead of a retry.',
        'Either way, the subscriptions are in your name and bill to you.',
      ],
    },
    {
      id: 'breaks',
      eyebrow: 'When something breaks',
      heading: 'What happens when something breaks?',
      body: [
        'Connections do break. A vendor changes its API, someone resets a password, or an authorization expires. So I plan for it:',
      ],
      points: [
        { lead: 'Failure alerts', text: 'sent to a person you choose when a run fails, so a problem is less likely to go unnoticed.' },
        { lead: 'A written list of every connection:', text: 'what it does, the account it runs under, and how to switch it off.' },
      ],
      after: [
        "I can't control whether another company's service stays up or keeps its API the same, so I don't promise uptime. Ongoing support afterward is there if you want it.",
      ],
    },
    {
      id: 'access',
      eyebrow: 'Access and keys',
      heading: 'Whose accounts and keys are they?',
      body: [
        'Yours. I work through access you give me: a login or an API key you create in your own account. I ask for the least access the job needs, and API keys stay out of the code.',
        "When we're done, you can switch my access off. The connections run under your accounts, not mine.",
      ],
    },
    {
      id: 'how-it-goes',
      eyebrow: 'How it goes',
      heading: 'How does it start?',
      body: [],
      ordered: true,
      points: [
        { lead: 'Tell me the busywork:', text: 'what gets typed twice, copied between tools, or chased by email.' },
        { lead: 'I map how the data moves today:', text: 'which tool holds what, and who touches it.' },
        { lead: 'You get a fixed quote,', text: 'with the choice between Zapier, Make, and custom code explained, so the price is settled before work starts.' },
      ],
    },
  ],
  price: {
    heading: 'What does it cost?',
    rows: [priceRow('software')],
    notes: [
      "The quote follows a look at how your data moves today, so the price is settled before work starts.",
      'Zapier, Make, and the apps themselves bill you directly, in your name.',
    ],
    // TODO(#741): E&O insurance line once a policy is bound
  },
  faq: [
    {
      question: 'Can you connect QuickBooks to my CRM?',
      answer:
        "Usually, if both have an API. QuickBooks Online does, and so do HubSpot, Salesforce, Zoho, and Pipedrive. QuickBooks Desktop is harder to connect; I'll tell you what's possible after looking at your setup.",
    },
    {
      question: 'Do I need Zapier?',
      answer:
        "Not always. If a Zapier or Make workflow does the job, I set it up in your account, and it's usually the cheaper answer. When the volume, the per-task pricing, or the logic outgrows it, I write custom code instead.",
    },
    {
      question: "What if my app doesn't have an API?",
      answer:
        "Sometimes there's still a way in, such as a scheduled export or an email the app already sends. If there isn't a dependable one, I'll tell you before you spend anything.",
    },
    OUTSIDE_NH_FAQ,
  ],
  cta: {
    heading: 'Tell me about the busywork.',
    body: "What gets typed twice, and which tools it moves between. I'll get back to you within one business day.",
    button: 'Ask for a quote',
  },
  related: ['/software/custom-software', '/software/mockup-to-production', '/software/websites'],
}
