// /networking/wifi: business and home Wi-Fi (#706)

import { HARDWARE_FAQ, HOURS_FAQ } from '../faq'
import { getPage } from '../pages'
import { priceRow } from '../pricing'
import { findService, type ServicePageContent } from './types'

const wifi = priceRow('wifi')
const cabling = priceRow('cabling')

export const WIFI: ServicePageContent = {
  id: 'wifi',
  page: getPage('/networking/wifi'),
  service: findService('Business & home Wi-Fi'),
  onSite: true,
  eyebrow: 'Business & home Wi-Fi · Manchester, NH',
  h1: 'Business and home Wi-Fi that reaches every room',
  intro:
    "I walk the space, plan where the access points go, install them, and set up the network so the signal reaches the rooms you use, plus the warehouse floor or the back deck if you need it there. You get a guest network kept apart from your own devices, the admin logins, a labeled port map, and a one-page summary of how it's set up.",
  sections: [
    {
      id: 'isp-router',
      heading: "Why isn't my internet provider's router enough?",
      body: [
        "The box your internet provider hands you is a modem, router, and Wi-Fi radio in one case, built to a price and installed wherever the cable comes into the building. That's usually a closet, a basement corner, or the far end of the office.",
        "One radio in one corner can't cover a two-story house or a long office, and every wall and floor in between takes a cut. Older buildings are harder still: brick and plaster walls, common in the Millyard and in older buildings around Manchester, block far more signal than drywall does.",
        "The usual fix keeps the provider's box as the modem and lets proper equipment do the routing and the Wi-Fi. Where the provider allows it, I put their box in bridge mode, so the two aren't both trying to be the router.",
      ],
    },
    {
      id: 'site-walk',
      heading: 'How do you work out where the Wi-Fi needs to go?',
      body: [
        'I start with a site walk. I measure the signal you have now, room by room, note what the walls and floors are made of, and ask where people actually work, stream, and take calls.',
        'From that I draw up a coverage plan: how many access points, where each one mounts, and how the cable gets to it. You see the plan and a written quote before anything is installed.',
      ],
    },
    {
      id: 'mesh-or-wired',
      heading: 'Should I get mesh, or wired access points?',
      body: ['Both put several Wi-Fi units around the building. The difference is how each one connects back:'],
      points: [
        {
          lead: 'Mesh',
          text: "units relay your traffic to each other over the air. For a smaller home where running cable isn't practical, that's fine, and if that's your situation I'll say so.",
        },
        {
          lead: 'Wired access points',
          text: "each get their own Ethernet cable, which also powers them (PoE), so there's no outlet needed on the ceiling. Every one runs at full speed, and none depends on the one before it.",
        },
      ],
      after: [
        'For an office, a larger home, or anywhere people rely on video calls, wired access points are what I recommend. If the plan needs new cable runs, I run them, test them, and label them.',
      ],
    },
    {
      id: 'guest',
      heading: 'Can guests use the Wi-Fi without getting onto our network?',
      body: [
        "Yes, and they should. The guest network gets its own name and password and runs on its own VLAN, a separate segment of the network, so a visitor's phone reaches the internet but not your computers, printers, cameras, or point-of-sale system.",
        'At home, the same setup keeps smart TVs, doorbells, and other gadgets on their own network, away from the laptops.',
      ],
    },
    {
      id: 'outdoors',
      heading: 'Can it reach the back deck, the warehouse, or the barn?',
      body: [
        'Yes. Outdoor-rated access points cover a deck, patio, or yard. A warehouse or shop floor gets access points mounted and aimed for open space and high ceilings.',
        'Detached garages, barns, and second buildings are common out in Goffstown and Bedford. A point-to-point wireless bridge can carry the network across the yard without trenching a cable.',
      ],
    },
    // TODO(#706): photo of a real install beside this section (an access point on the ceiling, a tidy switch)
    {
      id: 'equipment',
      heading: 'What equipment do you use?',
      body: [
        "Usually Ubiquiti UniFi: a gateway, PoE switches, and access points, all managed from one app. It's business-grade gear priced for a small office or a home, and there are no license fees to keep it running.",
        "If some of what you already have is still good, I'll say so and keep it. I'm an independent installer, not affiliated with Ubiquiti.",
      ],
      more: { href: '/#networking', text: 'More about UniFi installs' },
    },
    {
      id: 'hand-off',
      heading: "What do I get when it's done?",
      body: ["A network that's been tested, and what you need to run it without me:"],
      points: [
        'The admin logins for every piece of equipment.',
        'A labeled port map, so anyone can tell which cable goes where.',
        'A one-page written summary of how the network is set up.',
      ],
      after: [
        'No lock-in: anyone competent can pick it up later. Anything that needs power, such as a new outlet, goes to a licensed electrician.',
      ],
    },
  ],
  price: {
    heading: 'What does it cost?',
    rows: [wifi, cabling],
    notes: [
      `Labor for a ${wifi.detail} typically runs ${wifi.price}, depending on the size of the space and how many access points it needs. New cable runs, if the plan calls for them, are priced as cabling.`,
      'Hardware is billed at cost plus a small markup, or you can buy it yourself from a parts list. Jobs with hardware take a 50% deposit on the equipment; the rest is due on completion.',
      'Every job gets a written quote, with labor and hardware itemized, before any work starts.',
    ],
  },
  faq: [
    {
      question: "Do I have to replace my internet provider's router?",
      answer:
        "Not entirely. It stays on as the modem that talks to your provider, and the new equipment takes over the routing and the Wi-Fi. Where the provider allows it, I put their box in bridge mode so the two don't trip over each other.",
    },
    {
      question: 'How many access points will I need?',
      answer:
        "It depends on the size of the space, the number of floors, and what the walls are made of. That's what the site walk is for: you get a number and a plan, not a guess over the phone.",
    },
    {
      question: 'Is mesh Wi-Fi good enough?',
      answer:
        "For a smaller home where running cable isn't practical, often yes. For an office, a larger home, or anywhere video calls matter, wired access points are faster and steadier, because none of them has to relay traffic for the others.",
    },
    {
      question: 'Can you set up guest Wi-Fi for my business?',
      answer:
        'Yes. Guests get their own network name and password on a separate VLAN, so they can reach the internet but not your computers, printers, or point-of-sale system.',
    },
    HARDWARE_FAQ,
    HOURS_FAQ,
  ],
  cta: {
    heading: 'Tell me about the space.',
    body: "How big it is, how many floors, and where the Wi-Fi gives out. I'll get back to you within one business day.",
    button: 'Get a quote',
  },
}
