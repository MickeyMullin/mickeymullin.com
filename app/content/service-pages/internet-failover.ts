// /networking/internet-failover: dual WAN internet failover (#712). No price
// row: the job depends on the gateway and the lines already there, so it is
// quoted after a look at the current setup. The backup line is the client's
// own account with the provider.

import { HARDWARE_FAQ, HOURS_FAQ } from '../faq'
import { getPage } from '../pages'
import { findService, type ServicePageContent } from './types'

export const INTERNET_FAILOVER: ServicePageContent = {
  id: 'internet-failover',
  page: getPage('/networking/internet-failover'),
  service: findService('Internet failover'),
  onSite: true,
  eyebrow: 'Internet failover · Manchester, NH',
  h1: 'Dual WAN failover and backup internet for small businesses',
  intro:
    'You add a second internet connection, in your name, and I set up the gateway to switch to it on its own when the main line stops answering, and back again when the main line returns. I test the switch-over before hand-off, and you get the admin logins, a labeled port map, and a one-page summary listing both providers.',
  sections: [
    {
      id: 'what',
      heading: 'What is internet failover?',
      body: [
        'Your network gets a second internet connection, plugged into a gateway that can use two. That is what dual WAN means: two internet connections on one gateway: a main line and a backup.',
        'The gateway keeps checking the main line. When it stops answering, the gateway moves your traffic to the backup. When the main line comes back, it moves the traffic back. Nobody has to be there to swap a cable.',
        "The switch usually takes somewhere from a few seconds to a minute or so, depending on the equipment and how the checks are set. What it catches depends on those checks, too. A line that's down is easy to spot. A line that's up but crawling may not trigger a switch.",
        "If the gateway you have can't handle two connections, I'll tell you, and quote one that can.",
      ],
      more: { href: '/networking/unifi', text: 'More about the UniFi equipment I usually use' },
    },
    {
      id: 'backup-options',
      heading: 'What can the backup connection be?',
      body: ['Usually one of these, each with its trade-offs:'],
      points: [
        {
          lead: 'A second wired provider.',
          text: "Better if it's a different technology from the main line, such as cable plus fiber or DSL where they're available. Two lines of the same type can share the same run down the street, so one cut can take out both.",
        },
        {
          lead: 'Cellular (LTE or 5G).',
          text: 'A cellular router or modem with its own data plan. It needs a decent signal where it sits. Many plans have data caps, or slow down when the cell network is busy.',
        },
        {
          lead: 'Satellite.',
          text: 'A service such as Starlink. The dish needs a clear view of the sky. Trees and the roofline can get in the way.',
        },
      ],
      after: [
        "What's available depends on the address. I check what you can actually get at yours and help you choose, and you sign up in your name. The backup line is your own account with the provider, billed to you.",
      ],
    },
    {
      id: 'during-an-outage',
      heading: 'What keeps working when the main line goes down?',
      body: [
        'Browsing, email, cloud apps, and most VoIP phones usually carry on once the gateway has switched. Whatever is open at that moment may drop and reconnect. A video call can freeze for a moment and rejoin.',
        "Some things depend on the main line's own address. They may not work on the backup unless they're set up for it:",
      ],
      points: [
        'A static IP address from your provider.',
        'Remote access into the office from outside.',
        "A VPN tied to the main line's address.",
        'A camera or a server that people reach from outside the building.',
      ],
      after: [
        "If any of those matter, tell me, and I'll work out what can be set up to use the backup. On a capped cellular plan, I can also limit data-heavy traffic, such as cloud backups and large updates, to save the plan for the work that needs it.",
      ],
    },
    {
      id: 'who',
      heading: 'Do I actually need failover?',
      body: ['It earns its keep where no internet means no work:'],
      points: [
        'Card terminals or a point-of-sale system that runs in the cloud.',
        'VoIP phones.',
        'Practice-management or job software that lives in the cloud.',
        "People working from home who can't miss a call.",
      ],
      after: [
        "If an outage now and then is an annoyance rather than a cost, a phone hotspot may be all you need, and I'll say so.",
      ],
    },
    // TODO(#712): photo of a real install beside this section (a gateway with both internet lines labeled)
    {
      id: 'testing',
      heading: 'How do I know the backup is working?',
      body: [
        'Before hand-off, I test it the plain way: unplug the main line and watch the gateway move to the backup, then plug it back in and watch it move back.',
        'Where the gateway supports it, I also set up a notification for when it switches over, so the switch is not silent.',
        "After that, check every so often that the backup's plan is still active and paid. Cellular plans in particular can lapse, and a lapsed plan often goes unnoticed until the day it's needed.",
      ],
    },
    {
      id: 'power',
      heading: 'What about a power outage?',
      body: [
        'Failover does not help when the power goes out. The modem, the gateway, and the switch go dark with everything else.',
        'A UPS, a battery backup that plugs into an outlet, keeps them running for a while. I can include a plug-in UPS for the network equipment. A new outlet or circuit for it is electrical work, so it goes to a licensed electrician.',
      ],
    },
    {
      id: 'hand-off',
      heading: "What do I get when it's done?",
      body: ['Failover that has been tested, and what you need to run it without me:'],
      points: [
        'The admin logins for every piece of equipment.',
        'A labeled port map, so anyone can tell which cable goes where.',
        'A one-page written summary of the setup, listing both internet providers and the account details for each.',
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
      "Failover doesn't have a price range of its own. It depends on the gateway and the lines you already have, so it's quoted after a look at your current setup.",
      'Hardware is separate from labor. It is billed at cost plus a small markup, or you can buy it yourself from a parts list. Jobs with hardware take a 50% deposit on the equipment; the rest is due on completion.',
      'The backup line is your own account with the provider, and they bill you directly. Every job gets a written quote, with labor and hardware itemized, before any work starts.',
    ],
  },
  faq: [
    {
      question: 'Will failover keep us online through every outage?',
      answer:
        "No. It covers the main line going down, and the switch usually takes from a few seconds to a minute or so. It doesn't help in a power outage without a UPS, and a slow line that's still up may not trigger it.",
    },
    {
      question: 'What is dual WAN?',
      answer:
        'A gateway with two internet connections: a main line and a backup. When the main line stops answering, the gateway switches to the backup, and back again when the main line returns.',
    },
    {
      question: 'Is cellular backup internet good enough?',
      answer:
        'For keeping card terminals, email, and VoIP going through an outage, usually, if the signal is decent where the modem sits. Many cellular plans have data caps, so I can limit data-heavy traffic on the backup.',
    },
    {
      question: 'Do you sign us up with the backup provider?',
      answer:
        'No. I check what is available at your address and help you choose, and you sign up in your name. The account and the bill are yours.',
    },
    HARDWARE_FAQ,
    HOURS_FAQ,
  ],
  cta: {
    heading: 'Tell me what stops when the internet does.',
    body: "What the office runs on, who your provider is now, and what an outage costs you. I'll get back to you within one business day.",
    button: 'Get a quote',
  },
  related: ['/networking/small-office', '/networking/unifi', '/networking/troubleshooting'],
}
