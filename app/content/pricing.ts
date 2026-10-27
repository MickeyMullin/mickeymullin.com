// Typical labor ranges. `plain` is the same row as one plain-text line for llms.txt;
// a test checks that every dollar price also appears in its `plain` line, and
// that `range` (the numbers the service pages' JSON-LD offers use) matches `price`.

export type PriceId = 'troubleshooting' | 'wifi' | 'cabling' | 'software' | 'mockup'
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
]

export function priceRow(id: PriceId): PriceRow {
  const row = PRICES.find((r) => r.id === id)
  if (!row) throw new Error(`No price row ${id}`)
  return row
}
