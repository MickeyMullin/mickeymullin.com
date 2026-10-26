// Second half of `npm run build`: copies the Express app (server/*.js) into
// build/runtime/, so the build directory holds everything server.js loads.
//
// Hostinger runs the app from a copy that contains only the entry file
// (server.js), the output directory (build/), package.json and node_modules.
// The rest of the repo, including server/, is left behind, so server.js must
// not import anything outside build/. scripts/smoke.mjs checks this by starting
// the server from a directory laid out the same way.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'server')
const OUT = path.join(ROOT, 'build/runtime')

if (!fs.existsSync(path.join(ROOT, 'build/server/index.js'))) {
  console.error('copy-runtime: build/server/index.js is missing; run react-router build first')
  process.exit(1)
}

fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })

const files = fs
  .readdirSync(SRC)
  .filter((name) => name.endsWith('.js') && !name.includes('.test.'))
  .sort()
for (const name of files) fs.copyFileSync(path.join(SRC, name), path.join(OUT, name))

// The copied files are ES modules. Say so next to them, so they load as ESM
// even if the deploy copy has no package.json above them.
fs.writeFileSync(path.join(OUT, 'package.json'), '{ "type": "module" }\n')

console.log(`copy-runtime: ${files.join(', ')} -> build/runtime/`)
