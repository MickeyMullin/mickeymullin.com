// Smoke test for a built app, in plain Node: starts `node server.js` on a free
// port (CONTACT_TRANSPORT=log, so nothing is sent), checks a few requests, then
// stops the server. Exits non-zero on any failure. Run `npm run build` first.
//
// The server runs from a throwaway directory laid out like Hostinger's running
// copy: server.js, package.json, build/ and node_modules, and nothing else from
// the repo. An import of anything outside build/ fails here, not on Hostinger.

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'mm-smoke-'))
for (const name of ['server.js', 'package.json']) fs.copyFileSync(path.join(REPO, name), path.join(ROOT, name))
fs.cpSync(path.join(REPO, 'build'), path.join(ROOT, 'build'), { recursive: true })
fs.symlinkSync(path.join(REPO, 'node_modules'), path.join(ROOT, 'node_modules'), 'dir')
process.on('exit', () => fs.rmSync(ROOT, { recursive: true, force: true }))

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer()
    srv.unref()
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolve(port))
    })
  })
}

const port = await freePort()
const base = `http://127.0.0.1:${port}`
const server = spawn(process.execPath, ['server.js'], {
  cwd: ROOT,
  env: { ...process.env, PORT: String(port), CONTACT_TRANSPORT: 'log' },
  stdio: ['ignore', 'pipe', 'pipe'],
})
let serverLog = ''
server.stdout.on('data', (d) => (serverLog += d))
server.stderr.on('data', (d) => (serverLog += d))
const exited = new Promise((resolve) => server.on('exit', resolve))

async function waitForServer() {
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw new Error('server exited during startup')
    try {
      await fetch(`${base}/robots.txt`)
      return
    } catch {
      await new Promise((r) => setTimeout(r, 100))
    }
  }
  throw new Error('server did not start within 10 seconds')
}

const form = new URLSearchParams({
  name: 'Smoke Test',
  email: 'smoke@example.com',
  message: 'npm run smoke',
}).toString()
const formHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' }

const checks = [
  ['GET / → 200 with the H1', async () => {
    const res = await fetch(`${base}/`)
    const html = await res.text()
    return res.status === 200 && /<h1>[^<]+<\/h1>/.test(html) ? '' : `status ${res.status}`
  }],
  ['GET /no-such-page → 404', async () => {
    const res = await fetch(`${base}/no-such-page`)
    return res.status === 404 ? '' : `status ${res.status}`
  }],
  ['POST /?index → 200 (form sent)', async () => {
    const res = await fetch(`${base}/?index`, { method: 'POST', headers: formHeaders, body: form })
    const html = await res.text()
    return res.status === 200 && html.includes('form-status ok') ? '' : `status ${res.status}`
  }],
  ['PUT /?index → 405', async () => {
    const res = await fetch(`${base}/?index`, { method: 'PUT', headers: formHeaders, body: form })
    return res.status === 405 ? '' : `status ${res.status}`
  }],
]

let failed = 0
try {
  await waitForServer()
  for (const [name, check] of checks) {
    let problem
    try {
      problem = await check()
    } catch (error) {
      problem = String(error)
    }
    console.log(`${problem ? 'FAIL' : 'ok  '} ${name}${problem ? ` (${problem})` : ''}`)
    if (problem) failed++
  }
} catch (error) {
  console.log(`FAIL ${error.message}`)
  failed++
} finally {
  server.kill('SIGTERM')
  await exited
}

if (failed) {
  console.log(`\n${failed} check(s) failed. Server output:\n${serverLog}`)
  process.exit(1)
}
console.log(`\nsmoke: all ${checks.length} checks passed (port ${port})`)
