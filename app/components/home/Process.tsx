import { STEPS } from '../../content/services'

export function Process() {
  return (
    <section className="band">
      <div className="wrap">
        <header className="sec-head">
          <p className="eyebrow">How a job goes</p>
          <h2>No surprises, no lock-in.</h2>
        </header>
        <ol className="steps">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <span className="step-n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
