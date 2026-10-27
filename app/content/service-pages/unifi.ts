// /networking/unifi: Ubiquiti UniFi installs (#707)

import { HARDWARE_FAQ, LOCK_IN_FAQ } from '../faq'
import { getPage } from '../pages'
import { priceRow } from '../pricing'
import { findService, type ServicePageContent } from './types'

const wifi = priceRow('wifi')

export const UNIFI: ServicePageContent = {
  id: 'unifi',
  page: getPage('/networking/unifi'),
  service: findService('UniFi installs'),
  onSite: true,
  eyebrow: 'UniFi installs · Manchester, NH',
  h1: 'UniFi network setup for small businesses and homes',
  intro:
    "I install and set up a Ubiquiti UniFi network: a gateway, a PoE switch, and wired access points, all managed from one console that runs on the gateway. Staff, guests, and devices each get their own network, and you get the UniFi account and every login in your name. I'm an independent installer, not affiliated with Ubiquiti.",
  sections: [
    {
      id: 'what-you-get',
      heading: 'What do I actually get with UniFi?',
      body: ['Three kinds of equipment, all from the same UniFi line:'],
      points: [
        {
          lead: 'A gateway.',
          text: "The router and firewall. It sits between your internet provider's modem and everything else, and it runs the console that manages the rest of the network.",
        },
        {
          lead: 'A PoE switch.',
          text: 'Wired ports for desks, printers, and the access points. PoE (Power over Ethernet) powers each access point through its network cable, so no outlet is needed on the ceiling.',
        },
        {
          lead: 'Access points.',
          text: 'They provide the Wi-Fi. Each one mounts where the coverage plan puts it and is wired back to the switch.',
        },
      ],
      after: [
        'One console shows every device on the network and holds the settings for all of it, so a change is made once instead of on three boxes with three logins.',
      ],
    },
    {
      id: 'why-unifi',
      heading: "Why UniFi instead of my internet provider's router or a mesh kit?",
      body: [],
      points: [
        {
          lead: 'Central management.',
          text: 'The gateway, switches, and access points are all set up and updated from the same console.',
        },
        {
          lead: 'VLANs.',
          text: 'Separate network segments for staff, guests, and devices. A provider router or a consumer mesh kit usually stops at a single guest network.',
        },
        {
          lead: 'No license fees.',
          text: "You buy the hardware once. There's no subscription to keep the network running.",
        },
        {
          lead: 'Wired access points.',
          text: 'Each one has its own cable back to the switch, so none of them loses speed relaying traffic for the others.',
        },
      ],
      more: { href: '/networking/wifi', text: 'More on mesh vs. wired access points' },
    },
    {
      id: 'fit',
      heading: 'Will UniFi work for my office or my house?',
      body: [
        "It fits an office of 1 to 20 people, or a house that one router can't cover. How many access points it takes depends on the size of the space and what the walls are made of, which is what the site walk is for.",
        "When UniFi is more than you need, I'll say so. A small home where the provider's router already reaches every room doesn't need a gateway and a switch. Sometimes the right answer is moving the router you have, or a simple mesh kit.",
      ],
    },
    // TODO(#707): photo of a real install beside this section (a gateway and switch in a tidy cabinet)
    {
      id: 'setup',
      heading: 'How do you set it up?',
      body: ['The hardware is the easy part. Most of the work is the setup:'],
      points: [
        {
          lead: 'Separate networks.',
          text: 'A VLAN each for staff, guests, and devices like cameras or smart TVs, so each group reaches only what it should.',
        },
        {
          lead: 'Sensible firewall rules.',
          text: 'Guests reach the internet and nothing else. Devices reach what they need. Staff computers reach the printers.',
        },
        { lead: 'Current firmware.', text: 'Every piece of equipment updated before hand-off.' },
        { lead: 'Tested.', text: 'Wi-Fi checked in the rooms you use, and every wired connection tested.' },
      ],
    },
    {
      id: 'ownership',
      heading: 'Whose account is it?',
      body: [
        "Yours. The UniFi account that manages the network is set up in your name, with your email address, and every admin login is yours. When it's done, you get:",
      ],
      points: [
        'The admin logins for every piece of equipment.',
        'A labeled port map, so anyone can tell which cable goes where.',
        'A one-page written summary of how the network is set up.',
      ],
      after: ['No lock-in: anyone competent can pick it up later.'],
    },
    {
      id: 'hardware',
      heading: 'Can I buy the hardware myself?',
      body: [
        'Yes. I give you a parts list with the exact models, and you order them wherever you like. Or I supply the hardware at cost plus a small markup, with a 50% deposit on the equipment and the rest due on completion.',
        'Either way, hardware is priced separately from labor, and the quote itemizes both.',
      ],
    },
  ],
  price: {
    heading: 'What does it cost?',
    rows: [wifi],
    notes: [
      `Labor for a UniFi install in a ${wifi.detail} typically runs ${wifi.price}, depending on the size of the space and how much equipment it needs. Hardware is separate from labor.`,
      'Hardware is billed at cost plus a small markup, or you can buy it yourself from a parts list. Jobs with hardware take a 50% deposit on the equipment; the rest is due on completion.',
      'New cable runs, if the access points need them, are priced as network cabling. Every job gets a written quote, with labor and hardware itemized, before any work starts.',
    ],
  },
  faq: [
    {
      question: 'Are you a Ubiquiti partner or reseller?',
      answer:
        "No. I'm an independent installer, not affiliated with Ubiquiti. I recommend UniFi when it fits the job, and say so when something else fits better.",
    },
    {
      question: 'Do I need a subscription or license for UniFi?',
      answer:
        'No. You buy the hardware once, and the console runs on the gateway, so there are no license fees to keep the network running.',
    },
    {
      question: 'Is UniFi overkill for a home?',
      answer:
        "Sometimes. If one router already reaches every room, it is, and I'll tell you. It earns its keep in a larger house, a home office, or anywhere that needs guests and devices kept off the main network.",
    },
    {
      question: 'Can you take over a UniFi network someone else installed?',
      answer:
        "Yes. With the existing admin login, I can review the setup, fix what needs fixing, and move it to an account in your name. If nobody has the login, the equipment can be reset and set up again, which takes longer.",
    },
    HARDWARE_FAQ,
    LOCK_IN_FAQ,
  ],
  cta: {
    heading: "Tell me what you're working with.",
    body: "The size of the space, how many people use it, and what's there now. I'll get back to you within one business day.",
    button: 'Get a quote',
  },
  related: ['/networking/wifi', '/networking/troubleshooting'],
}
