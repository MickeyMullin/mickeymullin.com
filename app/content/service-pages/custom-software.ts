// /software/custom-software: custom business software (#713). It also covers
// MVPs and prototypes, which have no page of their own. Priced by fixed quote,
// so there is no range and no JSON-LD offer.

import { listOf } from '../../lib/text'
import { AI_FAQ, OUTSIDE_NH_FAQ } from '../faq'
import { getPage } from '../pages'
import { priceRow } from '../pricing'
import { AI_BUILDERS } from '../services'
import { OWNERSHIP } from './shared'
import { findService, type ServicePageContent } from './types'

const service = findService('Custom software')
const mvp = findService('MVPs & prototypes')

export const CUSTOM_SOFTWARE: ServicePageContent = {
  id: 'custom-software',
  page: getPage('/software/custom-software'),
  service,
  onSite: false,
  eyebrow: 'Software · Custom software',
  h1: 'Custom business software: internal tools that replace the spreadsheet',
  intro: `${service.blurb} You get a web app built around how your business already works, with a fixed quote before the work starts. The code and every account are in your name.`,
  sections: [
    {
      id: 'what',
      eyebrow: 'What I build',
      heading: 'What kind of software do you build?',
      body: ["Software for the work that lives in a spreadsheet, on a whiteboard, or in someone's head:"],
      points: [
        { lead: 'Internal tools,', text: 'such as job trackers and scheduling boards, for the work your staff do every day.' },
        { lead: 'Portals', text: 'where staff or customers sign in and see what applies to them, instead of asking by email.' },
        { lead: 'Dashboards', text: 'that put the numbers you check every week in one place.' },
      ],
      after: [
        "They're web apps: they run in a browser on phones, tablets, and computers, with nothing to install. I don't build native apps for the App Store or Google Play.",
        'They can usually work with the tools you already use, if those tools have an API.',
      ],
    },
    // TODO(#717): real project example once one can be shown
    {
      id: 'off-the-shelf',
      eyebrow: 'Buy or build',
      heading: "Shouldn't I just buy something off the shelf?",
      body: [
        "Often, yes. If an existing product fits your work at a fair price, I'll tell you, and I'll help you pick one. Someone else keeps it up to date, and you can start using it without waiting for a build.",
        'Custom makes sense when:',
      ],
      points: [
        "You're bending the way you work around a tool that wasn't built for it.",
        'Staff copy the same information between several tools by hand.',
        "You're paying per seat for features nobody uses.",
      ],
    },
    {
      id: 'first-version',
      eyebrow: 'MVPs & prototypes',
      heading: 'Can you build a first version to test the idea?',
      body: [
        `Yes. ${mvp.blurb} I scope it to the few things the idea can't do without, so real use can show what's worth building next.`,
        'It gets a fixed quote like any other project. The code and accounts are yours from the start.',
      ],
    },
    {
      id: 'how-it-goes',
      eyebrow: 'How it goes',
      heading: 'How does a project go?',
      body: [],
      ordered: true,
      points: [
        { lead: 'A conversation', text: 'about how the work happens today: who does what, where the information lives, and where it gets stuck.' },
        { lead: 'A written scope', text: "of what the software does, and what it doesn't." },
        { lead: 'A fixed quote,', text: 'so the price is settled before work starts.' },
        { lead: 'Working pieces as they are built,', text: "so you can try them and tell me what's wrong while it's still easy to change." },
        { lead: 'Launch,', text: 'on hosting in your name.' },
        { lead: 'Hand-off:', text: 'a written runbook, admin access, and every account in your name.' },
      ],
      after: ['If you want something that is outside the scope, I quote the change before I do it.'],
      // TODO(#741): E&O insurance line once a policy is bound
    },
    {
      id: 'who',
      eyebrow: 'Who builds it',
      heading: "Who's building it?",
      body: [
        'I am, start to finish. Today I build custom enterprise software as a consultant. Behind that are 30 years of software, including engineering and management at Microsoft and Yahoo.',
        'I use AI-assisted development, and every line that ships has been read and tested. The FAQ below says how.',
      ],
      more: { href: '/#about', text: 'More about my background' },
    },
    OWNERSHIP,
    {
      id: 'after-launch',
      eyebrow: 'After launch',
      heading: 'What happens after launch?',
      body: [
        'You get a written runbook: how to deploy, how to restore from a backup, and where every account lives. You also get admin access to all of it, so another developer could pick it up later.',
        'Ongoing support afterward is there if you want it.',
      ],
    },
    {
      id: 'built-with-ai',
      eyebrow: 'Already started?',
      heading: 'I already built something with an AI tool. Can you use it?',
      body: [
        `If you or your team built a first version with ${listOf(AI_BUILDERS, 'or')}, it may not need starting over. I start with a free review of what you have, then a fixed quote to finish it.`,
      ],
      more: { href: '/software/mockup-to-production', text: 'Mockup to production' },
    },
  ],
  price: {
    heading: 'What does it cost?',
    rows: [priceRow('software')],
    notes: [
      "The quote follows a conversation about how the work happens today and a written scope, so the price is settled before work starts. Changes outside the scope are quoted before I do them.",
      'Hosting and the other services the software runs on bill you directly, in your name.',
    ],
  },
  faq: [
    {
      question: 'How long does a custom project take?',
      answer: 'It depends on the scope. I give you an estimate with the quote, once we both know what is being built.',
    },
    {
      question: 'Can it work with the tools we already use?',
      answer:
        "Usually, if the tool has an API or a way to export its data. I check each one while we scope the project, and if one can't be connected, I'll tell you before you get a quote.",
    },
    {
      question: 'Do you build phone apps?',
      answer:
        "I build web apps that run in the browser on phones, tablets, and computers, with nothing to install. I don't build native apps for the App Store or Google Play.",
    },
    AI_FAQ,
    OUTSIDE_NH_FAQ,
  ],
  cta: {
    heading: 'Tell me how the work happens today.',
    body: "What the spreadsheet, the whiteboard, or the inbox is doing now, and where it gets stuck. I'll get back to you within one business day.",
    button: 'Ask for a quote',
  },
  related: ['/software/mockup-to-production', '/networking/small-office'],
}
