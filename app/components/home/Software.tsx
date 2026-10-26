import { LAST_MILE, SOFTWARE_SERVICES } from '../../content/services'
import { ServiceList } from './ServiceList'

export function Software() {
  return (
    <section id="software" className="band band-alt">
      <div className="wrap split">
        <header className="split-head">
          <p className="eyebrow">Software</p>
          <h2>Built around how you actually work.</h2>
          <p>
            Software is my day trade: 30 years of it, from Microsoft and Yahoo to the enterprise platforms I build
            today. AI-assisted development gets you a working version quickly. Decades of experience make sure it is
            clean, tested, and yours to keep.
          </p>
        </header>
        <div className="svc-col">
          <ServiceList services={SOFTWARE_SERVICES} />
          <div className="lastmile">
            <h3>The last mile</h3>
            <p>The questions that stall an AI-built app, and how I answer them:</p>
            <ul>
              {LAST_MILE.map((item) => (
                <li key={item.question}>
                  <b>{item.question}</b> {item.answer}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
