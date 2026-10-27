// /software/websites: small-business websites (#715). Quoted per site, so the
// price row is WEBSITE_QUOTE, not a range, and there is no JSON-LD offer.

import { OUTSIDE_NH_FAQ } from '../faq'
import { getPage } from '../pages'
import { WEBSITE_QUOTE } from '../pricing'
import { findService, type ServicePageContent } from './types'

const service = findService('Small-business websites')

export const WEBSITES: ServicePageContent = {
  id: 'websites',
  page: getPage('/software/websites'),
  service,
  onSite: false,
  eyebrow: 'Software · Small-business websites',
  h1: 'Small business website design: fast, clean, and yours',
  intro: `${service.blurb} You get pages for what you do and where you do it, and a contact form that reaches your inbox. The domain, the hosting, and the code are in your name.`,
  sections: [
    {
      id: 'included',
      eyebrow: "What's included",
      heading: 'What do I get?',
      body: [],
      points: [
        { lead: 'Pages for what you do and where you do it,', text: 'built to read well on a phone.' },
        { lead: 'A contact form', text: 'that reaches your inbox.' },
        { lead: 'Your domain,', text: 'with your existing email still working afterward.' },
        { lead: 'Hosting in your name,', text: 'on your billing.' },
        { lead: 'A privacy page', text: 'that says what the site collects.' },
        { lead: 'Analytics in your own account,', text: 'so the visitor numbers are yours.' },
      ],
      after: [
        'How many pages depends on your business. We settle that in the scope, before the quote.',
        'Before launch, I check every page on a phone, with only a keyboard, and with a screen reader.',
      ],
    },
    // TODO(#717): real project example once one can be shown
    {
      id: 'search',
      eyebrow: 'Search',
      heading: 'Will people find it?',
      body: ['I build in what search engines and AI search tools read:'],
      points: [
        'A title and description for every page.',
        'Structured data (schema.org LocalBusiness and Service) that says what the business is, what it offers, and where.',
        'A sitemap that lists every page.',
        'Pages that load fast, on a phone as well as a computer.',
      ],
      after: [
        "For local search, your Google Business Profile matters as much as the site. If you don't have one yet, I'll point you through setting it up.",
        'Rankings depend on your reviews, your competition, and time. Nobody can honestly promise page one, and I won\'t.',
      ],
    },
    // TODO(decision): how clients edit their sites
    {
      id: 'editing',
      eyebrow: 'Updates',
      heading: 'Can I update it myself?',
      body: [
        "Yes, for the things you change often: hours, services, prices, photos, and posts. We agree up front which parts you'll edit yourself, and I show you how before hand-off.",
      ],
    },
    {
      id: 'redesign',
      eyebrow: 'Redesigns',
      heading: 'I already have a site on Wix, Squarespace, or WordPress. Can you redo it?',
      body: ['Yes. Most of the work is not losing what already works:'],
      points: [
        { lead: 'The content worth keeping', text: 'moves to the new site.' },
        { lead: 'Old addresses redirect', text: 'to the new pages, so links that people and search engines already use still land somewhere.' },
        { lead: 'DNS and email records', text: 'are checked and written down before the switch, so your inbox keeps working.' },
      ],
      after: [
        "If the domain was registered through the old platform, or by whoever built the old site, moving it may need that account's login or that person's help. I check that first.",
        "If your current platform is fine and the site just needs better pages, I'll say so.",
        "You're looking at one I built: this site replaced my old WordPress site.",
      ],
    },
    {
      id: 'bring',
      eyebrow: 'Getting started',
      heading: 'What do I need to bring?',
      body: [
        "What you do, where you do it, who it's for, and photos of real work if you have them. I organize it into pages and tighten the wording.",
      ],
    },
    {
      id: 'ownership',
      eyebrow: 'Ownership',
      heading: 'Who owns it?',
      body: [
        'You do. The domain, the hosting, and the code are all in your name. The domain and hosting bill to you directly.',
        'If we stop working together, nothing has to be handed back, because none of it was ever mine.',
      ],
    },
    {
      id: 'timing',
      eyebrow: 'Timing',
      heading: 'How long does it take?',
      body: ['It depends on how many pages there are and how ready the content is. I give you an estimate with the quote.'],
    },
  ],
  price: {
    heading: 'What does it cost?',
    rows: [WEBSITE_QUOTE],
    notes: [
      "Every site gets a fixed quote once we've agreed on the pages, so the price is settled before work starts.",
      'The domain and hosting bill you directly, in your name.',
    ],
    // TODO(#741): E&O insurance line once a policy is bound
  },
  faq: [
    {
      question: 'Can you move my site off Wix or Squarespace?',
      answer:
        "Yes. I move the content worth keeping, redirect the old addresses to the new pages, and check your DNS and email records before the switch so your inbox keeps working. If the domain was registered through the old platform or by someone else, moving it may need that account's login or that person's help.",
    },
    {
      question: 'Will I be able to edit it myself?',
      answer:
        "Yes, for the things you change often, such as hours, services, prices, photos, and posts. We agree up front which parts you'll edit, and I show you how before hand-off.",
    },
    {
      question: "Do you guarantee I'll rank on Google?",
      answer:
        'No, and nobody honestly can. Rankings depend on your reviews, your competition, and time. I build in what search engines read, and for local search I point you through setting up a Google Business Profile, which matters as much as the site.',
    },
    OUTSIDE_NH_FAQ,
  ],
  cta: {
    heading: 'Tell me about your business.',
    body: "What you do, where, and the site you have now, if there is one. I'll get back to you within one business day.",
    button: 'Ask for a quote',
  },
  related: ['/software/custom-software', '/software/integrations-automation', '/software/mockup-to-production'],
}
