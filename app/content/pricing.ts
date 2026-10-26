// Typical labor ranges. `plain` is the same row as one plain-text line for llms.txt;
// a test checks that every dollar price also appears in its `plain` line.

export type PriceRow = { job: string; detail: string; price: string; plain: string }

export const PRICES: PriceRow[] = [
  {
    job: 'Troubleshooting visit',
    detail: '1–4 hours on site',
    price: '$150–500',
    plain: 'Troubleshooting visit (1–4 hours on site): $150–500',
  },
  {
    job: 'Wi-Fi / UniFi design & install',
    detail: 'home or small office',
    price: '$600–2,500',
    plain: 'Wi-Fi / UniFi design and install, home or small office: $600–2,500',
  },
  {
    job: 'Network cabling',
    detail: 'small office, 4–12 drops',
    price: '$1,000–3,000',
    plain: 'Network cabling, small office (4–12 drops): $1,000–3,000',
  },
  {
    job: 'Custom software & integrations',
    detail: 'scoped per project',
    price: 'Fixed quote',
    plain: 'Custom software and integrations: fixed quote per project',
  },
  {
    job: 'Mockup to production',
    detail: 'free review, then a fixed quote to finish',
    price: 'Review free',
    plain: 'AI prototype to production: free review, then a fixed quote to finish',
  },
]
