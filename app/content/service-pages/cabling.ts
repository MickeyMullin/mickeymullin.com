// /networking/cabling: network cabling (#709)

import { ELECTRICAL_FAQ, HOURS_FAQ } from '../faq'
import { getPage } from '../pages'
import { priceRow } from '../pricing'
import { findService, type ServicePageContent } from './types'

const cabling = priceRow('cabling')

const CERTIFICATION =
  'Formal certification reports need a certification tester. If your project or your landlord requires them, tell me when you ask for a quote, and certification testing is arranged and priced separately.'

export const CABLING: ServicePageContent = {
  id: 'cabling',
  page: getPage('/networking/cabling'),
  service: findService('Network cabling'),
  onSite: true,
  eyebrow: 'Network cabling · Manchester, NH',
  h1: 'Network cabling and Cat6 installation, tested and labeled',
  intro:
    'I run Cat6 from each drop back to a patch panel, terminate it on jacks and wall plates, and test every run. Each cable is labeled at both ends and listed on a port map, so you always know which jack goes where.',
  sections: [
    {
      id: 'included',
      heading: "What's included?",
      body: ['A cabling job covers the whole path, from the wall plate to the closet:'],
      points: [
        { lead: 'Cat6 runs', text: 'from each drop back to a patch panel. A drop is one cable, from one jack to the panel.' },
        { lead: 'Keystone jacks and wall plates', text: 'at every drop.' },
        { lead: 'A wall-mount rack or cabinet,', text: "when there isn't already a place for the patch panel and the switch." },
        { lead: 'Patch cords', text: 'from the panel to the switch, and from the jacks to the computers and printers.' },
      ],
    },
    {
      id: 'done-right',
      heading: 'Will it be done right?',
      body: ['Most of a cabling job ends up hidden in the ceiling or the walls, so it has to be right the first time:'],
      points: [
        {
          lead: 'The right cable for the space.',
          text: 'Plenum-rated cable where code requires it, such as a ceiling space used for air return, and riser-rated cable everywhere else.',
        },
        {
          lead: 'Firestopping.',
          text: "Any fire-rated wall or floor I pass through gets firestopped, so the new hole doesn't become a path for fire or smoke.",
        },
        {
          lead: 'Supported, not squeezed.',
          text: 'J-hooks and Velcro straps, never tight staples, which can crush Cat6 and cut its speed.',
        },
      ],
    },
    {
      id: 'testing',
      heading: 'How do I know it works?',
      body: [
        "Every run is tested for wire map and length before I call it done. The wire map shows all eight wires land on the right pins at both ends; the length shows the run is within Ethernet's 100-meter limit.",
        'Then each run is labeled at both ends, with the same label on the port map, along with the room and the jack it goes to.',
      ],
    },
    // TODO(#709): photo of a real install beside this section (a labeled patch panel, a tester on a run)
    {
      id: 'certification',
      heading: 'Do you certify the cable?',
      body: ['Not as standard. A cable tester verifies the wiring and the length of each run.', CERTIFICATION],
    },
    {
      id: 'power',
      heading: 'What about power?',
      body: [
        "I don't do electrical work. New outlets for a rack, a UPS, or PoE equipment are licensed electrical work, so they go to a licensed electrician.",
        "I'll mark where the outlets are needed, so the electrician can do them before or alongside the cabling.",
      ],
    },
    {
      id: 'older-buildings',
      heading: 'Can you run cable in an older building?',
      body: [
        "Yes, with more planning. The brick, plaster, and finished walls of older buildings around downtown Manchester and the Millyard don't have the open ceilings and hollow walls of new construction. I plan the routes before quoting: basements, attics, closets, and any existing chases.",
        'In a finished wall, an old-work low-voltage bracket holds the new jack in a small cutout, without opening up the wall.',
      ],
    },
  ],
  price: {
    heading: 'What does it cost?',
    rows: [cabling],
    notes: [
      `Labor for a ${cabling.detail} typically runs ${cabling.price}, depending on how many drops there are and how hard the routes are.`,
      'Cable, jacks, and the patch panel are itemized in the quote with the labor. Hardware is billed at cost plus a small markup, or you can buy it yourself from a parts list. Jobs with hardware take a 50% deposit on the equipment; the rest is due on completion.',
      'Certification testing, if your project needs it, is priced separately.',
    ],
  },
  faq: [
    {
      question: 'Is your cabling certified?',
      answer: `Every run is tested for wire map and length, and labeled at both ends. ${CERTIFICATION}`,
    },
    {
      question: 'Can you run cable inside a finished wall?',
      answer:
        'Usually, yes. Routes through basements, attics, and closets come first, and an old-work low-voltage bracket lets a new jack go into a finished wall through a small cutout.',
    },
    {
      question: 'Do you wire alarms or access control?',
      answer:
        'No. I run network cabling for computers, phones, printers, and Wi-Fi. Fire alarm, security alarm, and access control wiring go to the companies that specialize in them.',
    },
    ELECTRICAL_FAQ,
    HOURS_FAQ,
  ],
  cta: {
    heading: 'Tell me how many drops.',
    body: "Roughly how many, where they go, and what the building is like. I'll get back to you within one business day.",
    button: 'Get a quote',
  },
  related: ['/networking/small-office', '/networking/unifi'],
}
