// Services shown on the page. Items with an `offer` also appear, in this order,
// in the ProfessionalService OfferCatalog JSON-LD. Items with an `href` link to
// their own page, and are listed under "Related services" on the other service pages.

import { listOf } from '../lib/text'

export type Offer = { name: string; description?: string };
export type Service = { name: string; blurb: string; offer?: Offer; href?: string }

// The AI app builders named on the site
export const AI_BUILDERS = ['ChatGPT', 'Claude', 'Lovable', 'Bolt', 'Replit', 'v0']

export const NETWORKING_SERVICES: Service[] = [
  {
    name: "Network troubleshooting",
    href: '/networking/troubleshooting',
    blurb:
      "Slow, dropping, or flaky networks found and fixed on site, not guessed at over the phone.",
    offer: {
      name: "Network troubleshooting",
      description:
        "On-site diagnosis of slow, dropping, or unreliable Wi-Fi and wired networks.",
    },
  },
  {
    name: "Business & home Wi-Fi",
    href: '/networking/wifi',
    blurb:
      "Coverage that reaches every room, the warehouse floor, and the back deck. Guest networks done right.",
    offer: {
      name: "Business and home Wi-Fi design and installation",
      description:
        'Wi-Fi coverage planning and installation for homes and small offices: a site walk, wired access points or mesh, and a guest network kept apart from the business network.',
    },
  },
  {
    name: "UniFi installs",
    href: '/networking/unifi',
    blurb:
      "Ubiquiti UniFi gateways, PoE switches, and access points, set up with sensible VLANs and handed over with your own logins.",
    offer: {
      name: "UniFi network installation",
      description:
        "Ubiquiti UniFi installation for small offices and homes: a gateway, PoE switches, and wired access points managed from one console, with separate VLANs for staff, guests, and devices, and every account in the client's name.",
    },
  },
  {
    name: "Small-office networks",
    href: '/networking/small-office',
    blurb:
      "Internet, firewall, switching, and Wi-Fi for a new or reorganized office, plus a rack that someone else can make sense of.",
    offer: {
      name: "Small-office network setup",
      description:
        'Network setup for offices of 1 to 20 people: the internet hand-off, a gateway with a firewall, switching, Wi-Fi, a guest network kept apart, and a labeled, documented equipment cabinet.',
    },
  },
  {
    name: "Network cabling",
    href: '/networking/cabling',
    blurb:
      "Cat6 drops, jacks, and patch panels, tested and labeled. Power work goes to a licensed electrician.",
    offer: {
      name: "Network cabling",
      description:
        'Cat6 network cabling for small offices and homes, with every run terminated at a patch panel, tested for wire map and length, and labeled at both ends.',
    },
  },
  {
    name: 'Wireless bridges',
    href: '/networking/wireless-bridges',
    blurb: 'Reach the barn or second building without trenching.',
    offer: {
      name: 'Point-to-point wireless bridge installation',
      description:
        'Point-to-point wireless bridges that carry a home or small-office network to a barn, detached garage, shop, or second building without trenching, where there is a clear line of sight. At the far end, a switch can provide wired ports, and an access point can provide Wi-Fi.',
    },
  },
  {
    name: 'Internet failover',
    href: '/networking/internet-failover',
    blurb: 'Automatic backup internet for when the main line goes down.',
    offer: {
      name: 'Internet failover setup',
      description:
        'Dual WAN internet failover for small businesses and home offices: a backup connection from a second wired provider, a cellular (LTE or 5G) plan, or satellite, with the gateway set to switch to it when the main line stops answering.',
    },
  },
  {
    name: "For general contractors",
    href: '/networking/contractors',
    blurb:
      "Low-voltage network sub: itemized bid, rough-in and trim-out on your schedule, port map at closeout.",
    offer: {
      name: "Low-voltage network subcontracting for general contractors",
      description:
        "Network cabling and Wi-Fi subcontracting for general contractors and remodelers: an itemized bid from the plans, Cat6 cabling roughed in and trimmed out on the contractor's schedule, and a tested, labeled closeout with a port map.",
    },
  },
];

export const SOFTWARE_SERVICES: Service[] = [
  {
    name: "Custom software",
    href: '/software/custom-software',
    blurb:
      "Internal tools, portals, and dashboards that replace the spreadsheet, the whiteboard, and the sticky notes.",
    offer: {
      name: "Custom software development",
      description:
        "Custom web apps for small businesses, such as dashboards, internal tools, job trackers, and portals for staff or customers, built in place of spreadsheets, with a fixed quote per project and the code and every account in the client's name.",
    },
  },
  {
    name: "Mockup to production",
    href: '/software/mockup-to-production',
    blurb: `You or your team built something with ${listOf(AI_BUILDERS, 'or')}, and it almost works. I take it the last mile: your domain, real hosting, logins, your email and CRM, backups, and a security check, so customers and staff can actually use it.`,
    offer: {
      name: "AI prototype to production",
      description: `Taking apps built with AI tools such as ${listOf(AI_BUILDERS, 'or')} to production: custom domain and DNS, hosting, user accounts, Gmail / Google Workspace or Microsoft 365 email, CRM integration, security review, backups, and monitoring.`,
    },
  },
  {
    name: "Integrations & automation",
    href: '/software/integrations-automation',
    blurb:
      "Connect your CRM, scheduling, invoicing, and email so data is entered once and the busywork stops.",
    offer: {
      name: "Integrations and automation",
      description:
        'Connecting the CRM, scheduling, invoicing, and email a small business already uses, such as HubSpot, Salesforce, Zoho, Pipedrive, QuickBooks Online, Xero, Google Workspace, Microsoft 365, and other tools with an API. Built with Zapier or Make where they fit, or custom code where they do not, with failure alerts sent to a person the client chooses.',
    },
  },
  {
    name: "Small-business websites",
    href: '/software/websites',
    blurb:
      "Fast, clean sites that load quickly, show up in local search, and can be edited without calling anyone.",
    offer: {
      name: "Small-business websites",
      description:
        "Website design and redesign for small businesses: pages that load fast and read well on a phone, with a title, a description, and structured data on every page, and a sitemap for search engines. Includes moving existing sites off Wix, Squarespace, or WordPress with redirects. The domain, hosting, and code are in the client's name.",
    },
  },
  {
    name: "MVPs & prototypes",
    blurb:
      "A working first version of the idea, enough to test with real customers before spending big.",
  },
];

export const OFFERS: Offer[] = [
  ...NETWORKING_SERVICES,
  ...SOFTWARE_SERVICES,
].flatMap((s) => (s.offer ? [s.offer] : []));

// "The last mile" callout in the software section. The mockup-to-production
// page opens its matching sections with the same answers, by id.
export type LastMileId = 'dns' | 'email' | 'crm' | 'hosting' | 'logins' | 'security' | 'reliability'
export const LAST_MILE: { id: LastMileId; question: string; answer: string }[] = [
  {
    id: 'dns',
    question: "What about DNS?",
    answer:
      "Your own domain pointed at the app, with HTTPS, and your existing email still working afterward.",
  },
  {
    id: 'email',
    question: "How do I hook this to Gmail?",
    answer:
      "Send and receive through Google Workspace or Microsoft 365, with SPF, DKIM, and DMARC set up so mail lands in inboxes, not spam.",
  },
  {
    id: 'crm',
    question: "How does it get into our CRM?",
    answer:
      "Leads, contacts, and orders flow into HubSpot, Salesforce, Zoho, or whatever you already use.",
  },
  {
    id: 'hosting',
    question: "Where does it live?",
    answer: "Hosting sized to the job, in your name and on your billing.",
  },
  {
    id: 'logins',
    question: "Who can log in?",
    answer: "Real accounts and roles instead of a shared link.",
  },
  {
    id: 'security',
    question: "Is it safe?",
    answer:
      "API keys out of the code, the database locked down, customer data handled properly.",
  },
  {
    id: 'reliability',
    question: "What if it breaks?",
    answer:
      "Backups, monitoring, and a written runbook, plus ongoing support if you want it.",
  },
];

// "Common first calls" cards.
export const FIRST_CALLS: { quote: string; answer: string }[] = [
  {
    quote: "The Wi-Fi drops in the back office.",
    answer:
      "On-site diagnosis, a coverage plan, and access points placed where they're actually needed.",
  },
  {
    quote: "We're moving into a new space.",
    answer:
      "Network design, install, guest Wi-Fi kept apart from the business network, and a labeled port map.",
  },
  {
    quote: "A spreadsheet is running the business.",
    answer:
      "A small custom tool or integration that does the job properly and talks to what you already use.",
  },
  {
    quote: "We built an app with AI. Now what?",
    answer:
      "Your domain, hosting, logins, email, and CRM connected, and a security check, so people can actually use it.",
  },
];

// "How a job goes" steps.
export const STEPS: { title: string; body: string }[] = [
  {
    title: "Talk it through",
    body: "Send a note or call. If it needs eyes on site, I'll come look before quoting.",
  },
  {
    title: "Written quote",
    body: "Labor and hardware itemized. Jobs with hardware take a 50% deposit on the equipment; the rest is due on completion.",
  },
  {
    title: "Install & hand-off",
    body: "Done, tested, then handed over: your admin logins, a port map, and a one-page summary of the setup.",
  },
];
