import { FAQ } from '../../content/faq'

export function Faq() {
  return (
    <section className="band">
      <div className="wrap split">
        <header className="split-head">
          <p className="eyebrow">Questions</p>
          <h2>The short answers.</h2>
        </header>
        <div className="faq">
          {FAQ.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
