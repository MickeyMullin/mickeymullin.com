// Entry file for Hostinger (application type react-router) and `npm start`.
// Run `npm run build` first; this serves build/client and build/server.

// React and Express pick their production code paths from NODE_ENV when first
// loaded, so default it before importing them.
process.env.NODE_ENV ??= 'production'

const { createApp } = await import('./server/app.js')
const build = await import('./build/server/index.js')
const app = createApp({ build })

const port = process.env.PORT || 3000
// HOST is optional. Hostinger doesn't set it, so production listens on every
// interface as before; the local preview sets HOST=127.0.0.1 to stay off the LAN.
const host = process.env.HOST || undefined
const server = app.listen(port, host, () => {
  console.log(`mickeymullin.com listening on ${host ?? 'all interfaces'}, port ${port}`)
})

process.on('SIGTERM', () => server.close(() => process.exit(0)))
