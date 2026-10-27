// /software/websites: small-business websites (#715). Fixed package prices: the
// table shows the packages, and the 'website' row's range is the JSON-LD offer.

import { OUTSIDE_NH_FAQ } from '../faq'
import { getPage } from '../pages'
import { WEBSITE_PACKAGES, priceRow } from '../pricing'
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
        { lead: 'Your domain,', text: 'with your email records checked before any change and your email tested afterward.' },
        { lead: 'Hosting in your name,', text: 'on your billing.' },
        { lead: 'A privacy page', text: 'that says what the site collects.' },
        { lead: 'Analytics in your own account,', text: 'so the visitor numbers are yours.' },
      ],
      after: [
        'How many pages depends on your business: up to 4 for Starter, up to 6 for Standard, and more at $250 a page. The written scope lists the pages and what they include before the price is final.',
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
        "For local search, your Google Business Profile counts too, not just the site. If you don't have one yet, I'll point you through setting it up.",
        "Rankings depend on many things I don't control, including relevance, your reviews, and your competition. Nobody can honestly promise page one, and I won't.",
      ],
    },
    // TODO(#743): name the editing platform once decided
    {
      id: 'editing',
      eyebrow: 'Updates',
      heading: 'Can I update it myself?',
      body: [
        "Yes, for the things you change often: hours, services, prices, and photos. We agree up front which parts you'll edit yourself, and I show you how before hand-off.",
        "If you plan to post news, articles, or specials regularly, I'll suggest building the site on WordPress with a simple theme, because posting there is straightforward.",
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
        { lead: 'DNS and email records', text: 'are checked and written down before the switch, and I test your email afterward.' },
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
    rows: WEBSITE_PACKAGES,
    offer: priceRow('website'),
    column: 'Fixed price',
    notes: [
      'Each package is a fixed price. Starter covers Home, Services, Areas, and Contact, plus everything under “What do I get?” above. Standard adds 2 more pages, such as About, a single service, or a second location.',
      "Before I quote, the written scope lists the pages and what's included, so the price is settled before work starts.",
      "Domain registration and hosting aren't part of the fixed price. They bill to you directly, in your name.",
      'Also outside the fixed price: copywriting beyond light editing of the text you provide, photography, stock images beyond free sources, and ongoing updates after launch.',
    ],
    // TODO(#741): E&O insurance line once a policy is bound
  },
  faq: [
    {
      question: 'Can you move my site off Wix or Squarespace?',
      answer:
        "Yes. I move the content worth keeping and redirect the old addresses to the new pages. Before the switch, I write down your DNS and email records, and afterward I test your email. If the domain was registered through the old platform or by someone else, moving it may need that account's login or that person's help.",
    },
    {
      question: 'Will I be able to edit it myself?',
      answer:
        "Yes, for the things you change often, such as hours, services, prices, and photos. We agree up front which parts you'll edit, and I show you how before hand-off. If you plan to post news, articles, or specials regularly, I'll suggest building the site on WordPress with a simple theme, because posting there is straightforward.",
    },
    {
      question: "Do you guarantee I'll rank on Google?",
      answer:
        "No, and nobody honestly can. Rankings depend on many things I don't control, including relevance, your reviews, and your competition. I build in what search engines read, and for local search I point you through setting up a Google Business Profile, which counts alongside the site.",
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
