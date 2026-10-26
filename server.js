// Entry file for Hostinger (application type react-router) and `npm start`.
// Run `npm run build` first; this serves build/client and build/server.
//
// Hostinger runs this file from a copy that holds only server.js, build/,
// package.json and node_modules, so everything loaded here comes from build/.
// The Express app is server/app.js in the repo; the build copies it to
// build/runtime/ (scripts/copy-runtime.mjs).

// Node built-ins only above this line: React and Express pick their production
// code paths from NODE_ENV when first loaded, so default it before importing them.
import path from 'node:path'
import { fileURLToPath } from 'node:url'

process.env.NODE_ENV ??= 'production'

const here = path.dirname(fileURLToPath(import.meta.url))
const { createApp } = await import('./build/runtime/app.js')
const build = await import('./build/server/index.js')
const app = createApp({ build, clientDir: path.join(here, 'build/client') })

const port = process.env.PORT || 3000
// LISTEN_HOST is optional. Hostinger doesn't set it, so production listens on every
// interface; the local preview sets LISTEN_HOST=127.0.0.1 to stay off the LAN. Deliberately not
// HOST, which some shells and platforms set to a hostname on their own.
const host = process.env.LISTEN_HOST || undefined
const server = app.listen(port, host, () => {
  console.log(`mickeymullin.com listening on ${host ?? 'all interfaces'}, port ${port}`)
})

process.on('SIGTERM', () => server.close(() => process.exit(0)))
