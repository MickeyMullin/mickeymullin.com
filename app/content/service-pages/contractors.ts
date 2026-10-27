// /networking/contractors: low-voltage network sub for general contractors (#710).
// Bid per job from the plans, so the price row is CONTRACTOR_BID, not a range.

import { ELECTRICAL_FAQ } from '../faq'
import { getPage } from '../pages'
import { CONTRACTOR_BID } from '../pricing'
import { findService, type ServicePageContent } from './types'

export const CONTRACTORS: ServicePageContent = {
  id: 'contractors',
  page: getPage('/networking/contractors'),
  service: findService('For general contractors'),
  onSite: true,
  eyebrow: 'For general contractors · Manchester, NH',
  h1: 'Low-voltage network subcontractor for general contractors',
  intro:
    "I'm the data and Wi-Fi sub for small commercial fit-outs, remodels, and home builds. You get an itemized bid from your plans, rough-in and trim-out on your schedule, and a closeout with every run tested, labeled, and on a port map.",
  sections: [
    {
      id: 'bid',
      heading: 'What do you bid from?',
      body: [
        "Your plans, or a walkthrough of the site if the plans don't show enough. The bid is itemized, so you can compare it with other bids line by line and see what changes when the scope does:",
      ],
      points: [
        'Each drop, by location.',
        'The patch panel, the rack or cabinet, and the patch cords.',
        "Wi-Fi access points and network equipment, if they're part of the job.",
        'Labor for rough-in, trim-out, and testing, listed apart from the hardware.',
      ],
      // TODO(#741): add "Certificate of insurance on request" once a policy is bound
    },
    {
      id: 'schedule',
      heading: 'How do you fit my schedule?',
      body: [
        'Rough-in happens before insulation and drywall, while the walls are open: cable pulled to each drop and back to the closet, low-voltage brackets set, and every run labeled. Trim-out comes after paint: jacks, wall plates, the patch panel, and testing.',
        "Send the dates for each phase with the plans, and I'll tell you up front whether they work. Evening and Saturday appointments are available, which helps when the site is busy during the day or the owner has already moved in.",
      ],
    },
    // TODO(#710): photo of a real install beside this section (rough-in at open studs, a finished patch panel)
    {
      id: 'closeout',
      heading: "What's in the closeout?",
      body: ['What the owner gets, ready to go in with the rest of your closeout documents:'],
      points: [
        { lead: 'Every run tested', text: 'for wire map and length, and labeled at both ends.' },
        { lead: 'A port map', text: 'showing which jack goes to which port on the patch panel.' },
        { lead: 'Admin logins,', text: "if network equipment is part of the job, set up in the owner's name." },
        { lead: 'A one-page summary', text: 'of how the network is set up.' },
      ],
      after: [
        'Formal certification reports need a certification tester. If the spec calls for them, note it in the bid request, and certification testing is arranged and priced separately.',
      ],
    },
    {
      id: 'not-included',
      heading: "What don't you do?",
      body: ['So the scope in the bid is clear:'],
      points: [
        {
          lead: 'Electrical work.',
          text: "Outlets and circuits for the rack, a UPS, or PoE equipment go to the job's licensed electrician. I'll mark where they're needed.",
        },
        {
          lead: 'Fire alarm, security alarm, and access control.',
          text: 'Those go to the trades that specialize in them.',
        },
      ],
    },
    {
      id: 'hardware',
      heading: 'Can the owner buy the hardware?',
      body: [
        'Yes. I provide a parts list, and the owner, or you, buys the equipment directly. Or I supply it at cost plus a small markup, with a 50% deposit on the equipment and the rest due on completion.',
      ],
      more: { href: '/networking/unifi', text: 'More about the UniFi equipment I usually use' },
    },
  ],
  price: {
    heading: 'What does it cost?',
    rows: [CONTRACTOR_BID],
    notes: [
      'Every job is bid from your plans or a walkthrough before any work starts. The bid lists labor and hardware separately.',
      'Hardware is billed at cost plus a small markup, or the owner can buy it from a parts list. Jobs with hardware take a 50% deposit on the equipment; the rest is due on completion.',
    ],
  },
  faq: [
    {
      question: 'Can you bid from our plans?',
      answer:
        "Yes. Send the plans, or set up a walkthrough if they don't show the low-voltage scope. The bid is itemized, so you can compare it line by line.",
    },
    {
      question: 'Do you work to our rough-in and trim-out schedule?',
      answer:
        'Yes. Rough-in happens before insulation and drywall, and trim-out after paint. Evening and Saturday appointments are available when the site is busy during the day.',
    },
    {
      question: 'What does the owner get at closeout?',
      answer:
        "Every run tested and labeled at both ends, a port map, the admin logins for any network equipment, and a one-page summary of how it's set up.",
    },
    {
      question: 'Do you wire fire alarms, security systems, or access control?',
      answer:
        'No. I do network cabling, Wi-Fi, and the network equipment. Fire alarm, security alarm, and access control go to the trades that specialize in them.',
    },
    ELECTRICAL_FAQ,
  ],
  cta: {
    heading: 'Send me the plans.',
    body: "The drawings, the scope, and the dates. I'll get back to you within one business day.",
    button: 'Request a bid',
  },
  related: ['/networking/cabling', '/networking/small-office', '/networking/unifi'],
}
