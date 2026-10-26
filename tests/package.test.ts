import { expect, test } from 'bun:test'
import pkg from '../package.json'

test('the build tools are in dependencies, not devDependencies (so an --omit=dev install can still build)', () => {
  for (const name of ['react-router', '@react-router/express', '@react-router/node', '@react-router/dev', 'vite']) {
    expect(pkg.dependencies).toHaveProperty(name)
  }
  expect(pkg.devDependencies).not.toHaveProperty('@react-router/dev')
  expect(pkg.devDependencies).not.toHaveProperty('vite')
})

test('engines matches the Node version Vite 7 needs (Hostinger runs Node 22)', () => {
  expect(pkg.engines.node).toBe('>=22.12')
})

test('npm run build also copies the Express app into build/ (Hostinger keeps only server.js and build/)', () => {
  expect(pkg.scripts.build).toBe('react-router build && node scripts/copy-runtime.mjs')
})

test('server.js loads nothing from outside build/ except node built-ins', async () => {
  const src = await Bun.file(new URL('../server.js', import.meta.url)).text()
  const specifiers = [...src.matchAll(/(?:from\s+|import\(\s*)'([^']+)'/g)].map((m) => m[1])
  expect(specifiers.length).toBeGreaterThan(0)
  for (const s of specifiers) {
    expect(s.startsWith('node:') || s.startsWith('./build/')).toBe(true)
  }
})

test('npm run smoke runs the plain-Node smoke test', () => {
  expect(pkg.scripts.smoke).toBe('node scripts/smoke.mjs')
})
