// Reads the pre-rendered HTML in build/client once at startup: which paths have
// a static page, and the sha256 hashes of every inline script in them for the CSP.

import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi

/** @param {string} clientDir */
export function findPrerenderedPages(clientDir) {
  /** @type {{ urlPath: string, file: string }[]} */
  const pages = []
  /** @param {string} dir */
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'assets') continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name === 'index.html') {
        const rel = path.relative(clientDir, dir).split(path.sep).join('/')
        pages.push({ urlPath: rel ? `/${rel}` : '/', file: full })
      }
    }
  }
  walk(clientDir)
  return pages
}

/**
 * CSP source expressions ('sha256-…') for the inline scripts in an HTML document.
 * Skips external scripts and JSON-LD data blocks, which CSP does not govern.
 * @param {string} html
 */
export function inlineScriptHashes(html) {
  const hashes = new Set()
  for (const [, attrs, body] of html.matchAll(SCRIPT_RE)) {
    if (/\bsrc\s*=/i.test(attrs) || /type\s*=\s*["']?application\/ld\+json/i.test(attrs)) continue
    if (!body) continue
    hashes.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`)
  }
  return hashes
}

/** @param {string} clientDir */
export function loadPrerendered(clientDir) {
  const pages = findPrerenderedPages(clientDir)
  const hashes = new Set()
  for (const page of pages) {
    for (const h of inlineScriptHashes(fs.readFileSync(page.file, 'utf8'))) hashes.add(h)
  }
  return { paths: new Set(pages.map((p) => p.urlPath)), scriptHashes: [...hashes].sort() }
}
