import { HOME_TOWN, TOWNS } from '../../content/towns'

export function ServiceArea() {
  return (
    <section id="area" className="band band-alt">
      <div className="wrap split">
        <header className="split-head">
          <p className="eyebrow">Service area</p>
          <h2>Around Manchester and southern NH.</h2>
          <p>On-site work across the area below. Software work is done anywhere.</p>
        </header>
        <ul className="towns">
          {TOWNS.map((town) => (
            <li key={town} className={town === HOME_TOWN ? 'hq' : undefined}>
              {town}
            </li>
          ))}
          <li className="more">Nearby? Ask.</li>
        </ul>
      </div>
    </section>
  )
}
