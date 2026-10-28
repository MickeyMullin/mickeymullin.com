// robots.txt, sitemap.xml and llms.txt, generated from the route list and the content modules.

import { PAGES } from './pages'
import { PRICES } from './pricing'
import { SITE, absoluteUrl } from './site'
import { TOWNS } from './towns'

export function robotsTxt() {
  return `# mickeymullin.com: public pages are open to all crawlers, including
# search and AI crawlers (Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, ClaudeBot).
User-agent: *
Allow: /

Sitemap: ${absoluteUrl('/sitemap.xml')}
`
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function sitemapXml() {
  const urls = PAGES.map(
    (p) => `  <url>
    <loc>${escapeXml(absoluteUrl(p.path))}</loc>
    <lastmod>${p.lastmod}</lastmod>
  </url>`,
  ).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

export function llmsTxt() {
  const pricing = PRICES.map((row) => `- ${row.plain}`).join('\n')
  // One section per group, in the order each group first appears in PAGES
  const groups = [...new Set(PAGES.map((p) => p.group ?? 'Pages'))]
  const pages = groups
    .map((group) => {
      const links = PAGES.filter((p) => (p.group ?? 'Pages') === group)
        .map((p) => `- [${p.label}](${absoluteUrl(p.path)}): ${p.summary}`)
        .join('\n')
      return `## ${group}\n${links}`
    })
    .join('\n\n')
  return `# ${SITE.name}: ${SITE.tagline}

> Local networking, Wi-Fi, and custom software business in Manchester, New Hampshire, serving southern NH. On-site work: network troubleshooting, business and home Wi-Fi, Ubiquiti UniFi installation, small-office networks (1–20 people), Cat6 network cabling, wireless bridges and internet failover, and low-voltage network subcontracting for general contractors. Software: custom internal tools, taking AI-built prototypes to production ("last mile": custom domain and DNS, hosting, logins, Gmail / Google Workspace or Microsoft 365 email, CRM integration, security review, backups), integrations and automation, small-business websites, and MVPs. One person scopes, installs, and supports every job.

## About
- Owner: Mickey Mullin, software developer with 30 years of experience (network administrator, IT certification instructor, software company co-founder; engineer and engineering manager at Microsoft and Yahoo, 2013–2023), now a consultant building custom enterprise software
- Builds software with AI-assisted development, reviewed and tested to production standards; clients own their code
- Based in: ${SITE.locality} (service area: ${TOWNS.join(', ')}, and nearby towns)
- Email: ${SITE.email}
- Phone: ${SITE.phone}
- Website: ${SITE.url}
- Hours: by appointment; evenings and Saturdays available
- Model: written quotes; hardware at cost plus a small markup with a 50% hardware deposit; clients receive admin logins, a labeled port map, and a written setup summary (no lock-in)
- Does not do electrical/power work (subcontracted to a licensed electrician). Independent installer, not affiliated with Ubiquiti.

## Typical pricing
${pricing}

${pages}
`
}
