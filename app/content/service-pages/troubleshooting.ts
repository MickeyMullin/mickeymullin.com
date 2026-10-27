// /networking/troubleshooting: network troubleshooting (#705)

import { getPage } from '../pages'
import { priceRow } from '../pricing'
import { findService, type ServicePageContent } from './types'

const visit = priceRow('troubleshooting')

export const TROUBLESHOOTING: ServicePageContent = {
  id: 'troubleshooting',
  page: getPage('/networking/troubleshooting'),
  service: findService('Network troubleshooting'),
  onSite: true,
  eyebrow: 'Network troubleshooting · Manchester, NH',
  h1: "Wi-Fi dropping? Internet slow? I'll find out why.",
  intro: `I come to you, measure what the network is actually doing, find the cause, and fix what can be fixed on the spot. Fixed or not, you get written findings: what I found, what I fixed, and what's left. A visit runs ${visit.detail} and costs ${visit.price}.`,
  sections: [
    {
      id: 'causes',
      heading: "What's usually wrong?",
      body: ['Slow or flaky networks tend to come down to the same short list. These are what I check:'],
      points: [
        {
          lead: 'Interference.',
          text: "Your Wi-Fi shares its channels with every network nearby, and in apartment buildings and shared office floors that's a lot of them.",
        },
        { lead: 'One router for too much space.', text: "A single box in a corner can't cover a whole floor, let alone two." },
        {
          lead: 'Double NAT.',
          text: "The internet provider's combo box and a second router both act as the router, which can break VPNs, game consoles, port forwarding, and remote access in odd ways.",
        },
        {
          lead: 'Bad cable or a bad termination.',
          text: 'A crushed run, a loose jack, or a badly crimped connector can cut a link to a fraction of its speed, or drop it entirely.',
        },
        { lead: 'A dying switch or power supply.', text: 'Hardware that fails a little at a time, so the problem comes and goes.' },
        {
          lead: 'Address conflicts.',
          text: 'Two devices with the same IP address, or a second DHCP server handing out the wrong ones, so things fall off the network at random.',
        },
        {
          lead: 'The line coming in.',
          text: "Sometimes everything inside the building is fine and the problem is on the provider's side.",
        },
      ],
    },
    {
      id: 'isp-or-inside',
      heading: 'Is it my internet provider, or my network?',
      body: [
        "That's the first thing I sort out, because it decides who fixes it. I test the connection at the modem, with nothing else in the way, and compare it with what you get at the desk or on the couch.",
        "If the problem is the line, I'll tell you, and give you the measurements to show your provider, so the call starts past “have you tried restarting it?”",
      ],
    },
    {
      id: 'visit',
      heading: 'How does a visit go?',
      body: [],
      ordered: true,
      points: [
        {
          lead: 'Measure.',
          text: 'Wi-Fi signal and channels room by room, speeds at the modem and at the problem spots, and a look at the equipment and the cabling.',
        },
        { lead: 'Find.', text: 'Narrow it down to the actual cause, or causes, instead of guessing.' },
        {
          lead: 'Fix.',
          text: 'Whatever can be sorted on the spot, such as settings, channels, firmware, or a bad patch cable, gets fixed during the visit.',
        },
        {
          lead: 'Write it down.',
          text: "Written findings: what I found, what I fixed, and what's left, for your records, your landlord, or your internet provider.",
        },
      ],
    },
    // TODO(#705): photo of a real install beside this section (a meter reading, a rack before and after)
    {
      id: 'new-equipment',
      heading: 'What if it needs new equipment?',
      body: [
        "Sometimes the honest answer is that the router is too small for the space, a switch is on its way out, or the building needs a wired access point or two. When that's the case, I say so, and you get a written quote. Nothing new goes in without your go-ahead.",
        "And when the answer is “call your internet provider,” I'll say that too, rather than sell you hardware that won't help.",
      ],
      more: { href: '/networking/wifi', text: 'How a Wi-Fi install works' },
    },
  ],
  price: {
    heading: 'What does it cost?',
    rows: [visit],
    notes: [
      `A visit runs ${visit.detail}, and the price follows the time: ${visit.price}, written findings included.`,
      'If the fix needs new equipment or cable, you get a written quote first. Hardware is billed at cost plus a small markup, or you can buy it yourself from a parts list.',
    ],
  },
  faq: [
    {
      question: 'Why does my Wi-Fi keep dropping?',
      answer:
        "The usual causes are interference from nearby networks, one router trying to cover too much space, an IP address conflict, or failing equipment. It's hard to tell which from a description, so I measure on site instead of guessing over the phone.",
    },
    {
      question: 'Can you tell whether the problem is my internet provider?',
      answer:
        "Yes. I test the line at the modem with nothing else in the way. If the problem is on the provider's side, you get the measurements to show them. If it's inside the building, that's what the rest of the visit is for.",
    },
    {
      question: 'How long does a visit take, and what does it cost?',
      answer: `A visit takes ${visit.detail} and costs ${visit.price}, depending on how long it runs. Evening and Saturday appointments are available.`,
    },
    {
      question: "What if you can't fix it on the spot?",
      answer:
        "You get written findings: what I found, what I fixed, and what's still needed. If that's new equipment or cable, you get a written quote, and the decision is yours.",
    },
    {
      question: 'Will you work on a network someone else installed?',
      answer:
        'Yes. Whoever set it up and whatever brand it is, the approach is the same: measure, find the cause, and fix what can be fixed.',
    },
  ],
  cta: {
    heading: "Tell me what's going wrong.",
    body: "What drops, when, and where. I'll get back to you within one business day.",
    button: 'Set up a visit',
  },
}
