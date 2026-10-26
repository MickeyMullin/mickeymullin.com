import { PRICES } from '../../content/pricing'

export function Pricing() {
  return (
    <section id="pricing" className="band band-alt">
      <div className="wrap split">
        <header className="split-head">
          <p className="eyebrow">Pricing</p>
          <h2>Typical ranges, stated up front.</h2>
          <p>
            Every job gets a written quote. These ranges cover labor. Hardware is billed at cost plus a small markup, or
            you can buy it from a parts list.
          </p>
        </header>
        <div className="price-wrap">
          <table className="prices">
            <caption className="sr-only">Typical labor price ranges</caption>
            <thead>
              <tr>
                <th scope="col">Job</th>
                <th scope="col">Typical labor</th>
              </tr>
            </thead>
            <tbody>
              {PRICES.map((row) => (
                <tr key={row.job}>
                  <th scope="row">
                    {row.job} <small>{row.detail}</small>
                  </th>
                  <td>{row.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
