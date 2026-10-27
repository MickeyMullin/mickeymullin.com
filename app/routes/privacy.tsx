import type { Route } from './+types/privacy'
import { getPage } from '../content/pages'
import { PRIVACY_UPDATED, analyticsDisclosures } from '../content/privacy'
import { LEGAL_NAME, SITE } from '../content/site'
import { pageMeta } from '../lib/seo'

const page = getPage('/privacy')

export const meta: Route.MetaFunction = () => pageMeta(page)

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export default function Privacy() {
  const email = <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
  const tools = analyticsDisclosures()

  return (
    <main id="main" className="band legal">
      <article className="wrap prose">
        <p className="eyebrow">Privacy</p>
        <h1>What this site collects, and what I do with it</h1>
        <p className="legal-date">
          Last updated <time dateTime={PRIVACY_UPDATED}>{formatDate(PRIVACY_UPDATED)}</time>
        </p>

        <p className="lead">
          Short version: the site collects what you type into the contact form, and I use it to reply to you. I don't
          sell it, rent it, or share it for advertising.
        </p>

        <h2>Who runs this site</h2>
        <p>
          I'm {SITE.name}, an independent network installer and software developer in {SITE.locality}.
          {LEGAL_NAME ? ` I do business as ${SITE.name} through ${LEGAL_NAME}, a New Hampshire company I own.` : ''}{' '}
          Questions about this page, or about anything you've sent me, go to {email}.
        </p>

        <h2>The contact form</h2>
        <p>
          The form asks for your name, email address, and a message; your phone number and town are optional. When you
          send it, the site emails it to me through Google Workspace, which hosts my email. The email also includes the
          IP address it was sent from, which helps me spot spam and abuse.
        </p>
        <p>
          The site itself keeps no copy: there is no database behind the form. I use what you send to reply and, if we
          work together, to do the job and bill for it. I will optionally add you to an email list; if you opt in,
          you're on; if you opt out or ignore the opt-in, you're not. Simple as that.
        </p>
        <p>
          I keep inquiry emails while they're useful for following up, and records of paid work for as long as tax and
          business rules require. If you'd like your messages deleted, email me and I will, apart from anything I'm
          required by law to keep.
        </p>

        <h2>Spam protection</h2>
        <p>
          To stop automated spam, the server counts form submissions from each IP address over a 15-minute window. That
          count is held in memory only, and it's gone when the window ends or the server restarts.
        </p>

        <h2>Hosting and server logs</h2>
        <p>
          The site is hosted by Hostinger. Like most web hosts, its servers record standard details of each request,
          such as your IP address, browser, the page requested, and the time, to run and secure the service. I look at
          these only to fix problems or stop abuse.
        </p>

        <h2>Analytics and cookies</h2>
        <p>
          The site itself sets no cookies. It uses analytics to see which pages are useful and how visitors find them
          {tools.length ? ':' : '.'}
        </p>
        {tools.length ? (
          <ul>
            {tools.map((t) => (
              <li key={t.key} data-analytics={t.key}>
                <b>{t.name}</b> {t.what} {t.cookies}
                {t.optOut ? (
                  <>
                    {' '}
                    See the <a href={t.optOut.href}>{t.optOut.label}</a>.
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        <p>
          Analytics can be blocked with a browser setting or content blocker, and the site, including the contact form,
          keeps working.
        </p>
        <p>
          There's no agreed standard for the browser "Do Not Track" signal, so the site doesn't behave differently when
          it's sent.
        </p>

        <h2>Who else sees your information</h2>
        <p>
          Only the services that run the site and my email (Hostinger, Google Workspace, and the analytics tools above),
          and anyone the law requires me to give it to. I don't sell or rent personal information, and I don't share it
          for advertising.
        </p>

        <h2>Children</h2>
        <p>
          This site is for businesses and homeowners. It isn't aimed at children, and I don't knowingly collect
          information from anyone under 13.
        </p>

        <h2>Your choices</h2>
        <p>
          Email {email} to ask what I have from you, to correct it, or to have it deleted. I'll answer within a few
          business days.
        </p>

        <h2>Changes</h2>
        <p>If this page changes, I'll update it here and change the date at the top.</p>
      </article>
    </main>
  )
}
