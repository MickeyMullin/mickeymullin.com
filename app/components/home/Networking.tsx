import { NETWORKING_SERVICES } from '../../content/services'
import { ServiceList } from './ServiceList'

export function Networking() {
  return (
    <section id="networking" className="band">
      <div className="wrap split">
        <header className="split-head">
          <p className="eyebrow">Networking &amp; Wi-Fi</p>
          <h2>On site, done properly, documented.</h2>
          <p>
            Sized for offices of 1–20 people, homes, and contractors who need a network sub. The work the big
            managed-IT shops tend to skip.
          </p>
        </header>
        <ServiceList services={NETWORKING_SERVICES} />
      </div>
    </section>
  )
}
