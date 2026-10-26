import { expect, test } from 'bun:test'
import pkg from '../package.json'

test('the build tools are runtime dependencies, so `npm ci --omit=dev && npm run build` works', () => {
  for (const name of ['react-router', '@react-router/express', '@react-router/node', '@react-router/dev', 'vite']) {
    expect(pkg.dependencies).toHaveProperty(name)
  }
  expect(pkg.devDependencies).not.toHaveProperty('@react-router/dev')
  expect(pkg.devDependencies).not.toHaveProperty('vite')
})

test('engines matches the Node version Vite 7 needs (Hostinger runs Node 22)', () => {
  expect(pkg.engines.node).toBe('>=22.12')
})

test('npm run smoke runs the plain-Node smoke test', () => {
  expect(pkg.scripts.smoke).toBe('node scripts/smoke.mjs')
})
