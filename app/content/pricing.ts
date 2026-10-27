// Typical labor ranges. `plain` is the same row as one plain-text line for llms.txt;
// a test checks that every dollar price also appears in its `plain` line, and
// that `range` (the numbers the service pages' JSON-LD offers use) matches `price`.

export type PriceId =
  | 'troubleshooting'
  | 'wifi'
  | 'cabling'
  | 'software'
  | 'mockup'
  | 'website'
  | 'bid'
  | 'website-starter'
  | 'website-standard'
  | 'website-page'
export type PriceRow = {
  id: PriceId
  job: string
  detail: string
  price: string
  plain: string
  range?: [number, number]
}

export const PRICES: PriceRow[] = [
  {
    id: 'troubleshooting',
    job: 'Troubleshooting visit',
    detail: '1–4 hours on site',
    price: '$150–500',
    plain: 'Troubleshooting visit (1–4 hours on site): $150–500',
    range: [150, 500],
  },
  {
    id: 'wifi',
    job: 'Wi-Fi / UniFi design & install',
    detail: 'home or small office',
    price: '$600–2,500',
    plain: 'Wi-Fi / UniFi design and install, home or small office: $600–2,500',
    range: [600, 2500],
  },
  {
    id: 'cabling',
    job: 'Network cabling',
    detail: 'small office, 4–12 drops',
    price: '$1,000–3,000',
    plain: 'Network cabling, small office (4–12 drops): $1,000–3,000',
    range: [1000, 3000],
  },
  {
    id: 'software',
    job: 'Custom software & integrations',
    detail: 'scoped per project',
    price: 'Fixed quote',
    plain: 'Custom software and integrations: fixed quote per project',
  },
  {
    id: 'mockup',
    job: 'Mockup to production',
    detail: 'free review, then a fixed quote to finish',
    price: 'Review free',
    plain: 'AI prototype to production: free review, then a fixed quote to finish',
  },
  {
    id: 'website',
    job: 'Small-business website',
    detail: 'up to 4 or 6 pages; extra pages $250',
    price: '$1,500–2,200',
    plain:
      'Small-business website, fixed package price ($1,500 for up to 4 pages, $2,200 for up to 6, and $250 per extra page): $1,500–2,200',
    range: [1500, 2200],
  },
]

// General contractor work is bid per job from the plans. Shown on the contractors
// page only, not in the home page's table of typical ranges.
export const CONTRACTOR_BID: PriceRow = {
  id: 'bid',
  job: 'Low-voltage network sub',
  detail: 'from your plans',
  price: 'Itemized bid',
  plain: 'Low-voltage network subcontracting for general contractors: itemized bid from the plans',
}

// The website packages behind the 'website' row, shown on the websites page only.
// A test checks that they agree with that row.
export const WEBSITE_PACKAGES: PriceRow[] = [
  {
    id: 'website-starter',
    job: 'Starter',
    detail: 'up to 4 pages: Home, Services, Areas, and Contact',
    price: '$1,500',
    plain: 'Starter website, up to 4 pages (Home, Services, Areas, and Contact): $1,500',
  },
  {
    id: 'website-standard',
    job: 'Standard',
    detail: 'up to 6 pages: Starter plus 2 more',
    price: '$2,200',
    plain: 'Standard website, up to 6 pages (Starter plus 2 more): $2,200',
  },
  {
    id: 'website-page',
    job: 'Extra page',
    detail: 'quoted before work starts',
    price: '$250 each',
    plain: 'Extra website page, quoted before work starts: $250 each',
  },
]

export function priceRow(id: PriceId): PriceRow {
  const row = PRICES.find((r) => r.id === id)
  if (!row) throw new Error(`No price row ${id}`)
  return row
}
