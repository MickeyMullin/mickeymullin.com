// /networking/wireless-bridges: point-to-point wireless bridges (#711). No price
// row: the job depends on the buildings and the path between them, so it is
// quoted after a site visit to check the line of sight.

import { HARDWARE_FAQ, HOURS_FAQ } from '../faq'
import { getPage } from '../pages'
import { findService, type ServicePageContent } from './types'

export const WIRELESS_BRIDGES: ServicePageContent = {
  id: 'wireless-bridges',
  page: getPage('/networking/wireless-bridges'),
  service: findService('Wireless bridges'),
  onSite: true,
  eyebrow: 'Wireless bridges · Manchester, NH',
  h1: 'Point-to-point wireless bridges to the barn, the shop, or the second building',
  intro:
    "Where there's a clear line of sight between the buildings, I mount a pair of outdoor radios, one on each, and aim them at each other, so your network reaches the barn, detached garage, shop, or second house without trenching a cable. At the far end, a switch, an access point, or both give that building wired ports and Wi-Fi. You get the admin logins, a labeled port map, and a one-page summary of how it's set up.",
  sections: [
    {
      id: 'what',
      heading: 'What is a point-to-point wireless bridge?',
      body: [
        'Two outdoor radios, one on each building, aimed at each other. They carry your network across the gap the way a cable would, only through the air.',
        'At the far end, the radio connects to a switch, an access point, or both. The barn, garage, shop, or second house gets wired ports for a computer or a printer, and Wi-Fi for phones and laptops.',
        "It extends the internet you already have. It isn't a second internet line: when the service at the main building goes down, the far building loses it too.",
      ],
    },
    {
      id: 'line-of-sight',
      heading: 'Will a wireless bridge work for my buildings?',
      body: [
        "It depends mostly on line of sight: whether the two radios can see each other from where they'd mount. Trees, a rise in the ground, or another building in between can weaken the link or block it.",
        'Leaves count. A path that looks clear in March can look very different in July, so I plan for the trees with their leaves on.',
        "For the short distances between buildings on one property, the view usually matters more than the distance. On a clear path, a bridge usually carries a typical home or small-office internet connection with room to spare. I don't promise a speed before I've seen the path.",
        "I check the line of sight on site before quoting. If there's no clear path, I'll say so, and we'll talk about the alternative: cable or fiber in buried conduit between the buildings. That's more work, but a buried line doesn't care about trees. I don't dig trenches; the cable side is network cabling.",
      ],
      more: { href: '/networking/cabling', text: 'More about network cabling' },
    },
    {
      id: 'mesh-or-bridge',
      heading: "Can't I just use a mesh unit or an extender?",
      body: [
        'You can try. An indoor mesh unit or extender has to get its signal through the walls of both buildings and across the yard, and it usually struggles. The signal at the far end tends to be weak. It comes and goes.',
        "A bridge is built for the gap. The radios mount outside and aim straight at each other, with no walls in the way, so the link is usually much steadier.",
        "If the other building is close and an outdoor access point at the main building already reaches it, that may be all you need, and I'll say so.",
      ],
      more: { href: '/networking/wifi', text: 'More on outdoor Wi-Fi and mesh' },
    },
    // TODO(#711): photo of a real install beside this section (a radio on an eave, aimed across the yard)
    {
      id: 'mounting',
      heading: 'How is it mounted and powered?',
      body: ['Each end is set up the same way:'],
      points: [
        {
          lead: 'On the building.',
          text: 'The radio mounts on an eave, a wall, or a short mast, wherever it gets the clearest view of the other one. Where it goes and how high are settled at the site visit.',
        },
        {
          lead: 'Powered through its cable.',
          text: 'Each radio gets its power over its network cable (PoE), from the switch or a small injector inside, so no outlet is needed at the radio.',
        },
        {
          lead: 'Built for the weather.',
          text: 'Outdoor-rated cable where it runs outside, a drip loop so rain drips off instead of following the cable in, and sealed entry points.',
        },
        {
          lead: 'Grounding and surge protection.',
          text: "Planned as part of the job, because outdoor equipment is exposed. Any bonding to the building's electrical grounding system is electrical work, so a licensed electrician does it.",
        },
      ],
      after: [
        'The far building needs power for its switch or access point. If it needs a new outlet for that, it goes to a licensed electrician too.',
      ],
    },
    {
      id: 'security',
      heading: 'Is a wireless bridge secure?',
      body: [
        "The two radios are set up to talk only to each other, over an encrypted link, and they're part of your own network, not a public hotspot.",
        "Like any network equipment, the radios have admin logins. They're set up in your name, the firmware is updated before hand-off, and the logins are handed over with everything else.",
      ],
    },
    {
      id: 'equipment',
      heading: 'What equipment do you use?',
      body: [
        "Usually Ubiquiti radios, from the same maker as the UniFi equipment I usually use for the rest of the network. I pick the radios once I've seen the distance and the path. I'm an independent installer, not affiliated with Ubiquiti.",
      ],
      more: { href: '/networking/unifi', text: 'More about UniFi installs' },
    },
    {
      id: 'hand-off',
      heading: "Whose is it when it's done?",
      body: ["Yours. The link is tested, and you get what you need to run it without me:"],
      points: [
        'The admin logins for both radios and any other equipment.',
        'A labeled port map, so anyone can tell which cable goes where.',
        'A one-page written summary of how the bridge and the network are set up.',
      ],
      after: [
        'No lock-in: anyone competent can pick it up later.',
        'You can buy the hardware yourself from a parts list I provide, or I supply it at cost plus a small markup, with a 50% deposit on the equipment and the rest due on completion.',
      ],
    },
  ],
  price: {
    heading: 'What does it cost?',
    rows: [],
    notes: [
      "A wireless bridge doesn't have a price range of its own. It depends on the buildings and the path between them, so it's quoted after a site visit to check the line of sight.",
      'Hardware is separate from labor. It is billed at cost plus a small markup, or you can buy it yourself from a parts list. Jobs with hardware take a 50% deposit on the equipment; the rest is due on completion.',
      'Every job gets a written quote, with labor and hardware itemized, before any work starts.',
    ],
  },
  faq: [
    {
      question: 'How far can a wireless bridge reach?',
      answer:
        'For the short distances between buildings on one property, distance is rarely the problem. What usually decides it is the view between the two radios: trees, terrain, and other buildings in the way. I check the path on site before quoting.',
    },
    {
      question: 'Will trees block a wireless bridge?',
      answer:
        "They can. Leaves weaken the signal, so a path that's clear in winter can struggle in summer. I plan for the trees with their leaves on, and if there's no clear path, I'll say so.",
    },
    {
      question: 'Is a wireless bridge a second internet connection?',
      answer:
        "No. It carries the internet you already have to the other building. A backup line for when the main one goes down is internet failover, which is a different job.",
    },
    {
      question: 'Do I need an outlet at the radio?',
      answer:
        'No. Each radio gets its power over its network cable (PoE) from inside the building. If the far building needs a new outlet for its switch or access point, that goes to a licensed electrician.',
    },
    HARDWARE_FAQ,
    HOURS_FAQ,
  ],
  cta: {
    heading: 'Tell me about the buildings.',
    body: "How far apart they are, what's in between, and what you need out there. I'll get back to you within one business day.",
    button: 'Set up a site visit',
  },
  related: ['/networking/wifi', '/networking/unifi', '/networking/cabling'],
}
