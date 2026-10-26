// Local helper for the contact form's Gmail API credentials. Run with Bun on
// the Mac, never on Hostinger. It never prints a secret: values go to a
// mode-600 file and, on request, to the clipboard for pasting into hPanel.
//
//   bun scripts/gmail-oauth.ts authorize   # browser consent, saves the refresh token
//   bun scripts/gmail-oauth.ts test-send   # sends one labeled test message with it
//   bun scripts/gmail-oauth.ts copy client-id|client-secret|refresh-token
//
// Files live in ~/.config/mickeymullin-gmail/ (override with GMAIL_OAUTH_DIR):
//   client_secret.json  the Desktop OAuth client downloaded from Google Cloud
//   token.json          written by `authorize`

import { spawn, spawnSync } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { chmodSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { GMAIL_TOKEN_URL, createGmailApiMailer } from '../app/lib/mailer.server'

const SCOPE = 'https://www.googleapis.com/auth/gmail.send'
const ACCOUNT = process.env.GMAIL_ACCOUNT ?? 'mickey@mickeymullin.com'
const ADDRESS = process.env.CONTACT_FROM ?? 'info@mickeymullin.com'
const DIR = process.env.GMAIL_OAUTH_DIR ?? join(homedir(), '.config', 'mickeymullin-gmail')
const CLIENT_FILE = join(DIR, 'client_secret.json')
const TOKEN_FILE = join(DIR, 'token.json')

function fail(message: string): never {
  console.error(`gmail-oauth: ${message}`)
  process.exit(1)
}

function readClient(): { clientId: string; clientSecret: string } {
  if (!existsSync(CLIENT_FILE)) fail(`missing ${CLIENT_FILE} (move the downloaded client JSON there)`)
  const json = JSON.parse(readFileSync(CLIENT_FILE, 'utf8'))
  const c = json.installed
  if (!c) fail('the client JSON is not a Desktop app client ("installed"); create a Desktop app client')
  if (!c.client_id || !c.client_secret) fail('the client JSON has no client_id or client_secret')
  return { clientId: c.client_id, clientSecret: c.client_secret }
}

function readToken(): string {
  if (!existsSync(TOKEN_FILE)) fail(`missing ${TOKEN_FILE}; run: bun scripts/gmail-oauth.ts authorize`)
  const token = JSON.parse(readFileSync(TOKEN_FILE, 'utf8')).refresh_token
  if (!token) fail(`${TOKEN_FILE} has no refresh_token`)
  return token
}

async function authorize() {
  const { clientId, clientSecret } = readClient()
  const verifier = randomBytes(32).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  const state = randomBytes(16).toString('base64url')

  const code = await new Promise<{ code: string; redirectUri: string }>((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? '/', 'http://127.0.0.1')
      if (url.pathname !== '/callback') {
        res.writeHead(404).end()
        return
      }
      const finish = (status: number, text: string) => {
        res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' }).end(text)
        server.close()
      }
      if (url.searchParams.get('state') !== state) {
        finish(400, 'State mismatch. Close this tab and run authorize again.')
        reject(new Error('state mismatch'))
      } else if (url.searchParams.get('error')) {
        finish(400, `Google returned: ${url.searchParams.get('error')}. Close this tab.`)
        reject(new Error(`consent refused: ${url.searchParams.get('error')}`))
      } else if (!url.searchParams.get('code')) {
        finish(400, 'Google sent no authorization code. Close this tab and run authorize again.')
        reject(new Error('no authorization code in the callback'))
      } else {
        finish(200, 'Done. You can close this tab and go back to the chat.')
        resolve({ code: url.searchParams.get('code') ?? '', redirectUri })
      }
    })
    let redirectUri = ''
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') return reject(new Error('no port'))
      redirectUri = `http://127.0.0.1:${address.port}/callback`
      const auth = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      auth.search = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: SCOPE,
        access_type: 'offline',
        prompt: 'consent',
        login_hint: ACCOUNT,
        state,
        code_challenge: challenge,
        code_challenge_method: 'S256',
      }).toString()
      console.log(`Opening Google sign-in for ${ACCOUNT}. If no browser opens, visit:\n${auth}\n`)
      spawn('open', [auth.toString()], { stdio: 'ignore' }).on('error', () => {})
    })
    setTimeout(() => {
      server.close()
      reject(new Error('timed out after 10 minutes waiting for the Google sign-in'))
    }, 10 * 60 * 1000).unref()
  }).catch((e: Error) => fail(e.message))

  const res = await fetch(GMAIL_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code.code,
      code_verifier: verifier,
      redirect_uri: code.redirectUri,
      grant_type: 'authorization_code',
    }),
    signal: AbortSignal.timeout(15_000),
  }).catch((e: Error) => fail(`token exchange failed: ${e.message}`))
  const body = (await res.json().catch(() => fail(`token exchange failed: HTTP ${res.status}, not JSON`))) as Record<string, unknown>
  if (!res.ok) fail(`token exchange failed: HTTP ${res.status} ${body.error ?? ''} ${body.error_description ?? ''}`)
  if (typeof body.refresh_token !== 'string') fail('Google returned no refresh token; remove the app at myaccount.google.com/connections and run authorize again')
  const scopes = String(body.scope ?? '').split(' ').filter(Boolean)
  if (scopes.length !== 1 || scopes[0] !== SCOPE) fail(`unexpected scopes granted: ${scopes.join(', ') || '(none)'}; expected only ${SCOPE}`)

  writeFileSync(TOKEN_FILE, JSON.stringify({ refresh_token: body.refresh_token, scope: body.scope, created: new Date().toISOString() }, null, 2), { mode: 0o600 })
  chmodSync(TOKEN_FILE, 0o600)
  chmodSync(CLIENT_FILE, 0o600)
  console.log(`Saved the refresh token to ${TOKEN_FILE} (scope: gmail.send only).`)
  console.log('Run test-send next: the message it sends is the check that the right account signed in.')
}

async function testSend() {
  const { clientId, clientSecret } = readClient()
  const mailer = createGmailApiMailer({ clientId, clientSecret, refreshToken: readToken() })
  await mailer.send({
    to: ADDRESS,
    from: { name: 'Mickey Mullin website', address: ADDRESS },
    replyTo: { name: 'Luci (OAuth test)', address: ADDRESS },
    subject: 'Website inquiry: Luci (OAuth test from the Mac)',
    text: `Test of the contact form's Gmail API credentials, sent from the Mac at ${new Date().toISOString()}.\nNo action needed.\n`,
  })
  console.log(`Sent a test message from ${ADDRESS} to ${ADDRESS}.`)
}

function copy(field: string) {
  const values: Record<string, () => string> = {
    'client-id': () => readClient().clientId,
    'client-secret': () => readClient().clientSecret,
    'refresh-token': readToken,
  }
  const get = values[field] ?? fail(`copy what? one of: ${Object.keys(values).join(', ')}`)
  const result = spawnSync('pbcopy', { input: get() })
  if (result.status !== 0) fail('pbcopy failed')
  console.log(`Copied ${field} to the clipboard. Paste it into hPanel, then copy something else over it.`)
}

// The folder holds secrets: refuse one that others can read.
if (existsSync(DIR) && (statSync(DIR).mode & 0o077) !== 0) fail(`${DIR} is readable by other users; run: chmod 700 ${DIR}`)
if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true, mode: 0o700 })

const [command, arg] = process.argv.slice(2)
if (command === 'authorize') await authorize()
else if (command === 'test-send') await testSend().catch((e: Error) => fail(e.message))
else if (command === 'copy') copy(arg ?? '')
else fail('usage: bun scripts/gmail-oauth.ts authorize | test-send | copy client-id|client-secret|refresh-token')
