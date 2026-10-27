import { FAQ, type FaqItem } from '../../content/faq'

// Pass the same items to faqPageJsonLd() so the page and its JSON-LD match.
export function Faq({ items = FAQ, heading = 'The short answers.' }: { items?: FaqItem[]; heading?: string }) {
  return (
    <section className="band">
      <div className="wrap split">
        <header className="split-head">
          <p className="eyebrow">Questions</p>
          <h2>{heading}</h2>
        </header>
        <div className="faq">
          {items.map((item) => (
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
