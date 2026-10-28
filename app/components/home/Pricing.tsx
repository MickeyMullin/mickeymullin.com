import { PRICES, type PriceRow } from '../../content/pricing'

export function Pricing() {
  return (
    <section id="pricing" className="band band-alt">
      <div className="wrap split">
        <header className="split-head">
          <p className="eyebrow">Pricing</p>
          <h2>Typical ranges, stated up front.</h2>
          <p>
            Every job gets a written quote. The ranges cover labor, and the website row is a fixed package price. Hardware is billed at cost plus a small markup, or
            you can buy it from a parts list.
          </p>
        </header>
        <div className="price-wrap">
          <PriceTable rows={PRICES} />
        </div>
      </div>
    </section>
  )
}

export function PriceTable({ rows, column }: { rows: PriceRow[]; column?: string }) {
  return (
    <table className="prices">
      <caption className="sr-only">{column ? `${column}s` : 'Typical quotes'}</caption>
      <thead>
        <tr>
          <th scope="col">Job</th>
          <th scope="col">{column ?? 'Typical quote'}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.job}>
            <th scope="row">
              {row.job} <small>{row.detail}</small>
            </th>
            <td>{row.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
