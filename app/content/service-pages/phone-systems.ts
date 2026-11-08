// /networking/phone-systems: business phone service (#883). Sold and supported
// under Mickey's own name on a white-label carrier platform, which the page
// never names. The price is a monthly price per line with no contract, so the
// JSON-LD offer is a per-unit minimum rather than a labor range.

import { HOURS_FAQ } from '../faq'
import { getPage } from '../pages'
import { priceRow } from '../pricing'
import { findService, type ServicePageContent } from './types'

const phone = priceRow('phone-systems')

export const PHONE_SYSTEMS: ServicePageContent = {
  id: 'phone-systems',
  page: getPage('/networking/phone-systems'),
  service: findService('Business phone systems'),
  onSite: true,
  eyebrow: 'Business phone systems · Manchester, NH',
  h1: 'Business phone systems for small offices',
  intro:
    "I set up phone service for your business: a new number or your current one if it can move, a line for each person, desk phones if you want them, and a call flow set up the way your business answers the phone. I set it up and test it before hand-off, and after that I'm the one you call.",
  sections: [
    {
      id: 'what',
      heading: 'What do I get?',
      body: ['Phone service for the office, set up by one person, me:'],
      points: [
        { lead: 'A phone number.', text: 'A new business number, or the one you have now, moved over if it can be.' },
        { lead: 'A line for each person.', text: 'Everyone who takes calls gets their own.' },
        { lead: 'Desk phones, if you want them.', text: 'I sell them and set them up, quoted separately.' },
        { lead: 'A call flow.', text: 'Which phones ring, the menu callers hear, and where calls go after hours.' },
      ],
      after: [
        "I register each office's address for 911 calls as part of setup.",
        "When something needs changing or isn't working, you call me. My own business line, the number at the bottom of this page, runs on the same service.",
      ],
    },
    {
      id: 'keep-number',
      heading: 'Can I keep my phone number?',
      body: [
        "Usually. Most US numbers can move. I check whether yours can before I quote, and if it can, I do the porting paperwork. There's no charge to move it.",
        'Moving a number is called porting. Your current carrier releases it, and the date depends on the carriers, not on me. Until the switch date, calls keep going to your current service.',
        "So don't cancel your current service before the move is done. Canceling first can mean losing the number.",
        'The port request usually needs the name and service address on your current account, the account number, and a PIN if the carrier uses one. A recent bill usually has most of it.',
      ],
    },
    {
      id: 'answering',
      heading: 'How do calls get answered?',
      body: ['The way your business answers the phone now, or the way you wish it did. You tell me how it should go, and I set it up:'],
      points: [
        { lead: 'An auto-attendant.', text: 'A greeting with a menu: “Press 1 for scheduling, press 2 for billing.”' },
        { lead: 'Ring groups.', text: 'Several phones ring at once, so whoever is free can pick up.' },
        { lead: 'After-hours rules.', text: 'Outside business hours, calls take a different path, such as straight to voicemail.' },
        { lead: 'Voicemail.', text: 'For the calls nobody picks up.' },
      ],
      after: [
        "If your callers almost always want the same person, a menu only gets in their way, and I'll say so. A ring group and voicemail may be all you need.",
      ],
    },
    // TODO(#883): photo of a real install beside this section (a desk phone on a desk, or the PoE switch it plugs into)
    {
      id: 'phones',
      heading: 'Do I need new phones?',
      body: [
        "If you already have desk phones, tell me the make and model, and I'll check whether they can be used. If they can't, or you have none, I sell desk phones and set them up, quoted separately.",
        "Each new phone is set up to fetch its settings from the service when it's plugged in, which is called provisioning. I still set up each one and test it before hand-off.",
        'Each desk phone plugs into the network with a cable, and gets its power one of two ways: from a PoE switch, which powers it through that same cable, or from its own power adapter at the desk. A new outlet for an adapter is electrical work, so it goes to a licensed electrician.',
        'If a desk has no network jack, it needs a cable run, which is priced as network cabling.',
      ],
      after: [
        'You can buy the phones yourself from a parts list I provide, or I supply them at cost plus a small markup, with a 50% deposit on the equipment and the rest due on completion.',
      ],
      more: { href: '/networking/cabling', text: 'More about network cabling' },
    },
    {
      id: 'network',
      heading: 'What does it need from my network?',
      body: [
        'Calls run over your internet connection and through your office network, so both matter. The connection has to be working, and the network has to be set up for voice.',
        'Before setup, I check your network: the internet connection, the router, and the switches the phones will plug into. Some routers, including some that internet providers supply, have settings that can get in the way of calls. I look for those, too.',
        "If the network needs work first, I tell you what, and quote it before doing it. In an office whose network grew a piece at a time, that can mean a small-office network job.",
      ],
      more: { href: '/networking/small-office', text: 'More about small-office networks' },
    },
    {
      id: 'outage',
      heading: 'What happens if the internet goes down?',
      body: [
        "The desk phones stop working until it's back. They make and take calls over the internet, so without it they can't.",
        'That is one reason some businesses add a backup internet line. With failover set up, it can keep the phones working when the main line goes down. A call in progress may drop when the gateway switches over.',
        'A power outage can take the phones and the network equipment offline, too. A UPS sized for them can keep them running for a while, if the internet connection stays up.',
      ],
      more: { href: '/networking/internet-failover', text: 'How internet failover works' },
    },
  ],
  price: {
    heading: 'What does it cost?',
    rows: [phone],
    column: 'Monthly price',
    // TODO(#883): what the per-line price includes (minutes, numbers)
    notes: [
      "The price is per line, per month, with no contract. There's no charge to move your existing number.",
      'Desk phones are quoted separately. They are billed at cost plus a small markup, or you can buy them yourself from a parts list. Jobs with hardware take a 50% deposit on the equipment; the rest is due on completion.',
      'Network and cabling work, if the office needs it, is quoted separately, too. The written quote lists every line, number, and phone before anything is ordered.',
    ],
  },
  faq: [
    {
      question: 'Is there a contract?',
      answer: `No. Phone service is ${phone.plain.split(': ')[1]}.`,
    },
    {
      question: 'Can I keep my phone number?',
      answer:
        "Usually. Most US numbers can move. I check whether yours can before I quote, and I do the porting paperwork. There's no charge to move it, and the date depends on the carriers.",
    },
    {
      question: 'Do I have to buy new phones?',
      answer:
        "Not always. If you already have desk phones, tell me the make and model, and I'll check whether they can be used. If they can't, or you have none, I sell desk phones and set them up, quoted separately, or you can buy them yourself from a parts list.",
    },
    {
      question: 'What happens if my internet goes down?',
      answer: "The desk phones stop working until it's back. A backup internet line can keep them working when the main line goes down.",
    },
    HOURS_FAQ,
  ],
  cta: {
    heading: 'Tell me how the phones work now.',
    body: "How many people take calls, who your phone carrier is, and whether you want to keep the number. I'll get back to you within one business day.",
    button: 'Get a quote',
  },
  related: ['/networking/small-office', '/networking/cabling', '/networking/internet-failover'],
}
