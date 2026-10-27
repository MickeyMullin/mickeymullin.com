// /networking/small-office: small-office networks (#708). No price row of its
// own: the Wi-Fi and cabling rows are the usual parts, and the job is quoted
// after a site walk.

import { HARDWARE_FAQ, HOURS_FAQ, LOCK_IN_FAQ } from '../faq'
import { getPage } from '../pages'
import { priceRow } from '../pricing'
import { findService, type ServicePageContent } from './types'

const wifi = priceRow('wifi')
const cabling = priceRow('cabling')

export const SMALL_OFFICE: ServicePageContent = {
  id: 'small-office',
  page: getPage('/networking/small-office'),
  service: findService('Small-office networks'),
  onSite: true,
  eyebrow: 'Small-office networks · Manchester, NH',
  h1: 'Small business network setup for offices of 1 to 20 people',
  intro:
    "I set up the whole network for a small office: the internet hand-off, a firewall, switching, Wi-Fi, and a rack or wall-mount cabinet to hold it all. Guests get their own network, staff can reach the printers, and you get the admin logins, a labeled port map, and a one-page summary of how it's set up.",
  sections: [
    {
      id: 'included',
      heading: 'What does a small-office network include?',
      body: ['Each piece does one job, and they are chosen to work together:'],
      points: [
        {
          lead: 'The internet hand-off.',
          text: "The provider's modem stays. Where the provider allows it, I put it in bridge mode, so it isn't also trying to be the router.",
        },
        { lead: 'A firewall and gateway.', text: 'The router for the office, with rules for what each network is allowed to reach.' },
        { lead: 'Switching.', text: 'Wired ports for desks, printers, and access points, with PoE to power the access points through their cables.' },
        { lead: 'Wi-Fi.', text: 'Wired access points, placed where the site walk shows they are needed.' },
        { lead: 'A rack or wall-mount cabinet.', text: 'The equipment in one place, mounted, with the cables labeled.' },
        { lead: 'A guest network, kept apart.', text: 'Visitors get to the internet, but not to your computers.' },
        { lead: 'Printers and shared devices.', text: 'Reachable from staff computers on Wi-Fi or a cable.' },
      ],
      more: { href: '/networking/unifi', text: 'More about UniFi, the equipment I usually use' },
    },
    {
      id: 'moving',
      heading: "We're moving into a new space. When should you be involved?",
      body: [
        'Before move-in, and ideally before the walls close. If the office needs new cable runs, running them through open walls and ceilings is quicker and cheaper than fishing them through finished ones later.',
        'I walk the space with you, or go over the floor plan, and work out where the desks, the printer, and the network equipment will go. You get a written quote, with labor and hardware itemized, before anything is ordered.',
        'Order the internet service early, too. A new line can take a while to schedule, and the network is not finished until it can be tested on the real connection.',
      ],
    },
    // TODO(#708): photo of a real install beside this section (a network closet before and after)
    {
      id: 'closet',
      heading: 'What about the mess in the closet?',
      body: [
        'An office that grew a few desks at a time often ends up with one: the provider box, a consumer router or two, a switch nobody remembers buying, and a tangle of cables with no labels.',
        "I sort it out. Equipment that's still good stays; anything that isn't gets replaced, with your go-ahead. Everything is mounted, the cables are labeled, and it all goes on the port map, so the next person who opens that door can make sense of it.",
      ],
    },
    {
      id: 'support',
      heading: 'Do you do ongoing IT support?',
      body: [
        "Not the monthly kind. I set the network up, document it, and come back when you call. I don't sell monthly managed IT.",
        "If your office has 30 or more people, or you want one company looking after every computer, account, and password reset on a monthly plan, a managed IT firm is the better fit. Larger firms in the area do exactly that.",
        "For a smaller office, the hand-off is built so you don't need anyone day to day. When something does go wrong, a troubleshooting visit finds the cause.",
      ],
      more: { href: '/networking/troubleshooting', text: 'How a troubleshooting visit works' },
    },
    {
      id: 'hand-off',
      heading: 'What happens at hand-off?',
      body: ['The network is tested, and you get what you need to run it without me:'],
      points: [
        'The admin logins for every piece of equipment.',
        'A labeled port map, so anyone can tell which cable goes where.',
        'A one-page written summary of how the network is set up.',
      ],
      after: [
        'No lock-in: anyone competent can pick it up later. Anything that needs power, such as a new outlet for the rack or a UPS, goes to a licensed electrician.',
      ],
    },
  ],
  price: {
    heading: 'What does it cost?',
    rows: [wifi, cabling],
    parts: true,
    notes: [
      "A small-office network doesn't have one price of its own. These are its usual parts: the Wi-Fi and network equipment setup, and new cable runs if the space needs them. The full job is quoted after a site walk.",
      'Hardware is billed at cost plus a small markup, or you can buy it yourself from a parts list. Jobs with hardware take a 50% deposit on the equipment; the rest is due on completion.',
      'Every job gets a written quote, with labor and hardware itemized, before any work starts.',
    ],
  },
  faq: [
    {
      question: 'How early should I call before we move into a new office?',
      answer:
        'As soon as you have the space. Before move-in is good; before the walls close is better, if the office needs new cable runs.',
    },
    {
      question: 'Do you offer managed IT or monthly support?',
      answer:
        "No. I set the network up, document it, and come back when you call. An office of 30 people or more that wants monthly managed IT is better served by a managed IT firm.",
    },
    {
      question: 'Can you clean up our existing network closet?',
      answer:
        "Yes. Equipment that's still good stays, anything that isn't gets replaced with your go-ahead, and everything ends up mounted, labeled, and on a port map.",
    },
    HARDWARE_FAQ,
    LOCK_IN_FAQ,
    HOURS_FAQ,
  ],
  cta: {
    heading: 'Tell me about the office.',
    body: "How many people, where it is, and whether you're moving in or sorting out what's there. I'll get back to you within one business day.",
    button: 'Set up a site walk',
  },
  related: ['/networking/unifi', '/networking/wifi'],
}
