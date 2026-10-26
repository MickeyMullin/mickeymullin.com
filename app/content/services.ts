// Services shown on the page. Items with an `offer` also appear, in this order,
// in the ProfessionalService OfferCatalog JSON-LD.

export type Offer = { name: string; description?: string }
export type Service = { name: string; blurb: string; offer?: Offer }

export const NETWORKING_SERVICES: Service[] = [
  {
    name: 'Network troubleshooting',
    blurb: 'Slow, dropping or flaky networks found and fixed on site, not guessed at over the phone.',
    offer: {
      name: 'Network troubleshooting',
      description: 'On-site diagnosis of slow, dropping or unreliable Wi-Fi and wired networks.',
    },
  },
  {
    name: 'Business & home Wi-Fi',
    blurb: 'Coverage that reaches every room, the warehouse floor and the back deck. Guest networks done right.',
    offer: { name: 'Business and home Wi-Fi design and installation' },
  },
  {
    name: 'UniFi installs',
    blurb:
      'Ubiquiti UniFi gateways, PoE switches and access points, set up with sensible VLANs and handed over with your own logins.',
    offer: { name: 'UniFi network installation' },
  },
  {
    name: 'Small-office networks',
    blurb:
      'Internet, firewall, switching and Wi-Fi for a new or reorganized office, plus a rack that someone else can make sense of.',
    offer: { name: 'Small-office network setup' },
  },
  {
    name: 'Network cabling',
    blurb: 'Cat6 drops, jacks and patch panels, tested and labeled. Power work goes to a licensed electrician.',
    offer: { name: 'Network cabling' },
  },
  {
    name: 'Wireless bridges & failover',
    blurb:
      'Reach the barn or second building without trenching. Automatic backup internet for when the main line goes down.',
  },
  {
    name: 'For general contractors',
    blurb: 'Low-voltage network sub: itemized bid, rough-in and trim-out on your schedule, port map at closeout.',
    offer: { name: 'Low-voltage network subcontracting for general contractors' },
  },
]

export const SOFTWARE_SERVICES: Service[] = [
  {
    name: 'Custom software',
    blurb: 'Internal tools, portals and dashboards that replace the spreadsheet, the whiteboard and the sticky notes.',
    offer: { name: 'Custom software development' },
  },
  {
    name: 'Mockup to production',
    blurb:
      'You or your team built something with ChatGPT, Claude, Lovable, Bolt or Replit, and it almost works. I take it the last mile: your domain, real hosting, logins, your email and CRM, backups and a security check, so customers and staff can actually use it.',
    offer: {
      name: 'AI prototype to production',
      description:
        'Taking apps built with AI tools such as ChatGPT, Claude, Lovable, Bolt or Replit to production: custom domain and DNS, hosting, user accounts, Gmail / Google Workspace or Microsoft 365 email, CRM integration, security review, backups and monitoring.',
    },
  },
  {
    name: 'Integrations & automation',
    blurb: 'Connect your CRM, scheduling, invoicing and email so data is entered once and the busywork stops.',
    offer: { name: 'Integrations and automation' },
  },
  {
    name: 'Small-business websites',
    blurb: 'Fast, clean sites that load quickly, show up in local search, and can be edited without calling anyone.',
    offer: { name: 'Small-business websites' },
  },
  {
    name: 'MVPs & prototypes',
    blurb: 'A working first version of the idea, enough to test with real customers before spending big.',
  },
]

export const OFFERS: Offer[] = [...NETWORKING_SERVICES, ...SOFTWARE_SERVICES].flatMap((s) =>
  s.offer ? [s.offer] : [],
)

// "The last mile" callout in the software section.
export const LAST_MILE: { question: string; answer: string }[] = [
  {
    question: 'What about DNS?',
    answer: 'Your own domain pointed at the app, with HTTPS, and your existing email still working afterward.',
  },
  {
    question: 'How do I hook this to Gmail?',
    answer:
      'Send and receive through Google Workspace or Microsoft 365, with SPF, DKIM and DMARC set up so mail lands in inboxes, not spam.',
  },
  {
    question: 'How does it get into our CRM?',
    answer: 'Leads, contacts and orders flow into HubSpot, Salesforce, Zoho or whatever you already use.',
  },
  { question: 'Where does it live?', answer: 'Hosting sized to the job, in your name and on your billing.' },
  { question: 'Who can log in?', answer: 'Real accounts and roles instead of a shared link.' },
  {
    question: 'Is it safe?',
    answer: 'API keys out of the code, the database locked down, customer data handled properly.',
  },
  {
    question: 'What if it breaks?',
    answer: 'Backups, monitoring and a written runbook, plus ongoing support if you want it.',
  },
]

// "Common first calls" cards.
export const FIRST_CALLS: { quote: string; answer: string }[] = [
  {
    quote: 'The Wi-Fi drops in the back office.',
    answer: "On-site diagnosis, a coverage plan, and access points placed where they're actually needed.",
  },
  {
    quote: "We're moving into a new space.",
    answer: 'Network design, install, guest Wi-Fi kept apart from the business network, and a labeled port map.',
  },
  {
    quote: 'A spreadsheet is running the business.',
    answer: 'A small custom tool or integration that does the job properly and talks to what you already use.',
  },
  {
    quote: 'We built an app with AI. Now what?',
    answer: 'Your domain, hosting, logins, email and CRM connected, and a security check, so people can actually use it.',
  },
]

// "How a job goes" steps.
export const STEPS: { title: string; body: string }[] = [
  { title: 'Talk it through', body: "Send a note or call. If it needs eyes on site, I'll come look before quoting." },
  {
    title: 'Written quote',
    body: 'Labor and hardware itemized. A 50% deposit covers equipment; labor is due on completion.',
  },
  {
    title: 'Install & hand-off',
    body: 'Done, tested, then handed over: your admin logins, a port map and a one-page summary of the setup.',
  },
]
