import type { MailSetup } from './lib/mailer.server'

// Values server/app.js passes to loaders and actions. All optional: pages
// pre-rendered at build time and `react-router dev` run without them.
declare module 'react-router' {
  interface AppLoadContext {
    cspNonce?: string
    clientIp?: string
    rateLimited?: boolean
    // Overrides the SMTP setup from env vars (tests pass a fake mailer)
    mail?: MailSetup | null
  }
}

declare global {
  // Set by vite.config.ts at build time
  const __BUILD_YEAR__: number
}

export {}
