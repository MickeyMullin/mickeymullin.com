// One service page: hero with breadcrumb, a band per question, price, FAQ,
// related services, and a contact band. Uses the home page's section classes.

import type { Point, ServicePageContent } from '../content/service-pages/types'
import { relatedServices } from '../content/service-pages/types'
import { ContactDirect } from './home/Contact'
import { Faq } from './home/Faq'
import { PriceTable } from './home/Pricing'
import { ServiceList } from './home/ServiceList'

function PointItem({ point }: { point: Point }) {
  return typeof point === 'string' ? (
    <li>{point}</li>
  ) : (
    <li>
      <b>{point.lead}</b> {point.text}
    </li>
  )
}

// Keeps "Wi-Fi" on one line in a heading instead of breaking at its hyphen
function keepWiFiWhole(text: string) {
  return text.split(/(Wi-Fi)/).map((part, i) =>
    part === 'Wi-Fi' ? (
      <span key={i} className="nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  )
}

export function ServicePage({ content }: { content: ServicePageContent }) {
  const { page, cta } = content
  const related = relatedServices(content.related)

  return (
    <main id="main">
      <section className="hero page-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <a href="/">Home</a>
              </li>
              <li aria-current="page">{page.label}</li>
            </ol>
          </nav>
          <p className="eyebrow">{content.eyebrow}</p>
          <h1>{keepWiFiWhole(content.h1)}</h1>
          <p className="lede">{content.intro}</p>
          <div className="hero-actions">
            <a className="btn" href="/#contact" data-cta={`${content.id}-hero`}>
              {cta.button}
            </a>
            <a className="link-arrow" href="#price">
              See what it costs
            </a>
          </div>
        </div>
      </section>

      {content.sections.map((section) => {
        const List = section.ordered ? 'ol' : 'ul'
        return (
          <section key={section.id} id={section.id} className="band band-tight" aria-labelledby={`${section.id}-h`}>
            <div className="wrap split">
              <header className="split-head">
                {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
                <h2 id={`${section.id}-h`}>{section.heading}</h2>
              </header>
              <div className="prose">
                {section.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {section.points ? (
                  <List>
                    {section.points.map((point) => (
                      <PointItem key={typeof point === 'string' ? point : point.lead} point={point} />
                    ))}
                  </List>
                ) : null}
                {section.after?.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {section.more ? (
                  <p>
                    <a className="link-arrow" href={section.more.href}>
                      {section.more.text}
                    </a>
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        )
      })}

      <section id="price" className="band band-alt" aria-labelledby="price-h">
        <div className="wrap split">
          <header className="split-head">
            <p className="eyebrow">Pricing</p>
            <h2 id="price-h">{content.price.heading}</h2>
          </header>
          <div className="price-wrap">
            <PriceTable rows={content.price.rows} column={content.price.column} />
            <div className="prose price-notes">
              {content.price.notes.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Faq items={content.faq} />

      {related.length ? (
        <section className="band band-alt" aria-labelledby="related-h">
          <div className="wrap split">
            <header className="split-head">
              <p className="eyebrow">Related services</p>
              <h2 id="related-h">Also worth a look.</h2>
            </header>
            <ServiceList services={related} />
          </div>
        </section>
      ) : null}

      <section className="contact" aria-labelledby="cta-h">
        <div className="wrap contact-grid">
          <div className="contact-copy">
            <p className="eyebrow eyebrow-light">Get started</p>
            <h2 id="cta-h">{cta.heading}</h2>
            <p>{cta.body}</p>
            <a className="btn" href="/#contact" data-cta={`${content.id}-contact`}>
              {cta.button}
            </a>
          </div>
          <ContactDirect />
        </div>
      </section>
    </main>
  )
}
