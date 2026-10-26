export function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Manchester &amp; southern New Hampshire</p>
          <h1>Networks that hold&nbsp;up. Software that&nbsp;fits.</h1>
          <p className="lede">
            <strong>Hi, I'm Mickey.</strong> I set up Wi-Fi, UniFi networks, and cabling for small offices and homes,
            and I build the custom software and integrations that run on top of them. You deal with me from the first
            call to the hand-off.
          </p>
          <div className="hero-actions">
            <a className="btn" href="#contact" data-cta="hero">
              Tell me what's going on
            </a>
            <a className="link-arrow" href="#pricing">
              See typical prices
            </a>
          </div>
        </div>

        <figure className="hero-photo">
          <picture>
            <source
              type="image/webp"
              srcSet="/images/mickey-mullin-400.webp 400w, /images/mickey-mullin-800.webp 800w, /images/mickey-mullin-1200.webp 1200w"
              sizes="(max-width: 900px) 200px, 360px"
            />
            <img
              src="/images/mickey-mullin-800.jpg"
              width="800"
              height="1000"
              alt="Mickey Mullin, chin on hand, in a blue chambray shirt"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <figcaption>
            <b>Mickey Mullin</b>
            <span>30 years in software &amp; networks</span>
            <span>Formerly Microsoft and Yahoo</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
