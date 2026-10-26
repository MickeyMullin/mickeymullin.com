import { FIRST_CALLS } from '../../content/services'

export function FirstCalls() {
  return (
    <section className="band band-alt" aria-labelledby="calls-h">
      <div className="wrap">
        <div className="sec-head">
          <p className="eyebrow">Common first calls</p>
          <h2 id="calls-h">Sound familiar?</h2>
        </div>
        <dl className="calls">
          {FIRST_CALLS.map((call) => (
            <div key={call.quote}>
              <dt>“{call.quote}”</dt>
              <dd>{call.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
