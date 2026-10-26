import { describe, expect, test } from 'bun:test'
import { chmod, copyFile, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// None of these tests may reach the real launchd job, the real ~/dev/mickeymullin.com, or the
// network. Every run gets a throwaway HOME, and launchctl, curl, lsof, npm and node are replaced
// by stubs that only record that they were called. Only the read-only paths (usage, render, check)
// are executed; `deploy` is covered statically.
const deployDir = import.meta.dir
const SCRIPT = join(deployDir, 'deploy.sh')
const TEMPLATE = join(deployDir, 'com.mickey.mickeymullin-preview.plist')
const STUBBED = ['launchctl', 'curl', 'lsof', 'npm']
const SYSTEM_PATH = '/usr/bin:/bin:/usr/sbin:/sbin'
const MUTATING = /launchctl (bootstrap|bootout|kickstart|enable|disable)|npm |curl /

const sh = (cmd: string[], cwd?: string) => {
  const result = Bun.spawnSync(cmd, { cwd, stdout: 'pipe', stderr: 'pipe' })
  if (result.exitCode !== 0) throw new Error(`${cmd.join(' ')}: ${result.stderr.toString()}`)
  return result.stdout.toString().trim()
}

type SandboxOptions = { checkout?: boolean; nodeVersion?: string; portHolder?: string; stamp?: boolean }

const makeSandbox = async ({ checkout = true, nodeVersion = '22.12.0', portHolder, stamp = false }: SandboxOptions = {}) => {
  const home = await mkdtemp(join(tmpdir(), 'mm-preview-test-'))
  const stubs = join(home, 'stubs')
  const calls = join(home, 'calls.log')
  await mkdir(stubs)
  for (const name of STUBBED) {
    const stub = join(stubs, name)
    // launchctl print exits non-zero: the job is not loaded. lsof prints the port holder, if any.
    const body =
      name === 'lsof' && portHolder ? `echo ${portHolder}\nexit 0` : name === 'launchctl' ? 'exit 113' : 'exit 97'
    await writeFile(stub, `#!/bin/sh\necho "${name} $*" >> '${calls}'\n${body}\n`)
    await chmod(stub, 0o755)
  }
  const node = join(stubs, 'node')
  await writeFile(node, `#!/bin/sh\necho "node $*" >> '${calls}'\necho ${nodeVersion}\n`)
  await chmod(node, 0o755)

  const app = join(home, 'dev/mickeymullin.com')
  if (checkout) {
    await mkdir(join(app, 'deploy'), { recursive: true })
    await copyFile(TEMPLATE, join(app, 'deploy/com.mickey.mickeymullin-preview.plist'))
    await copyFile(SCRIPT, join(app, 'deploy/deploy.sh'))
    await chmod(join(app, 'deploy/deploy.sh'), 0o755)
    await writeFile(join(app, 'package-lock.json'), '{"lockfileVersion":3}\n')
    await writeFile(join(app, 'server.js'), '// stub\n')
    sh(['git', 'init', '-q', '-b', 'master'], app)
    sh(['git', 'add', '.'], app)
    sh(['git', '-c', 'user.name=t', '-c', 'user.email=t@example.com', 'commit', '-qm', 'init'], app)
    if (stamp) {
      await mkdir(join(app, 'node_modules'))
      const hash = sh(['shasum', '-a', '256', join(app, 'package-lock.json')]).split(' ')[0]
      await writeFile(join(app, 'node_modules/.preview-deploy-lock.sha256'), `${hash}\n`)
    }
  }
  return { home, app, stubs, calls, node }
}

type Sandbox = Awaited<ReturnType<typeof makeSandbox>>

const run = (box: Sandbox, args: string[]) => {
  const script = existsSync(join(box.app, 'deploy/deploy.sh')) ? join(box.app, 'deploy/deploy.sh') : SCRIPT
  const result = Bun.spawnSync(['/bin/zsh', script, ...args], {
    env: { HOME: box.home, PATH: `${box.stubs}:${SYSTEM_PATH}` },
    stdout: 'pipe',
    stderr: 'pipe'
  })
  return { code: result.exitCode, out: result.stdout.toString(), err: result.stderr.toString() }
}

const recordedCalls = async (box: Sandbox) => (existsSync(box.calls) ? (await readFile(box.calls, 'utf8')).trim() : '')

const plistAsJson = async (xml: string) => {
  const dir = await mkdtemp(join(tmpdir(), 'mm-preview-plist-'))
  const file = join(dir, 'rendered.plist')
  await writeFile(file, xml)
  sh(['plutil', '-lint', file])
  return JSON.parse(sh(['plutil', '-convert', 'json', '-o', '-', file]))
}

const codeOnly = async () =>
  (await readFile(SCRIPT, 'utf8'))
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n')

describe('deploy/deploy.sh static validation', () => {
  test('parses under zsh -n', () => {
    const result = Bun.spawnSync(['/bin/zsh', '-n', SCRIPT], { stderr: 'pipe' })
    expect(result.stderr.toString()).toBe('')
    expect(result.exitCode).toBe(0)
  })

  test('is executable and runs under strict mode', async () => {
    const source = await readFile(SCRIPT, 'utf8')
    expect(source.startsWith('#!/bin/zsh\n')).toBe(true)
    expect(source).toContain('set -euo pipefail')
    expect(Bun.spawnSync(['test', '-x', SCRIPT]).exitCode).toBe(0)
  })

  test('never pushes, changes a remote, discards local edits, deletes trees, or touches Caddy', async () => {
    const code = await codeOnly()
    for (const forbidden of [
      /git\s+(push|reset|clean|stash|pull|fetch)\b/,
      /git\s+remote\s+(add|set-url|rename|remove|rm)\b/,
      // a command, not the "not a git checkout" error message
      /git\s+(-C\s+\S+\s+)?checkout\s/,
      /rm\s+-[a-z]*r/,
      /caddy\s/i,
      /Caddyfile/
    ]) {
      expect(code).not.toMatch(forbidden)
    }
  })

  test('deploys with a locked install, the smoke test, a restart, and a local check of the new server', async () => {
    const code = await codeOnly()
    expect(code).toContain('"$npm" ci --no-audit --no-fund')
    expect(code).toContain('"$npm" run build')
    expect(code).toContain('"$npm" run smoke')
    expect(code).toContain('launchctl kickstart -k')
    expect(code).toMatch(/launchctl bootout/)
    expect(code).toMatch(/launchctl bootstrap/)
    expect(code).toContain('BASE_URL="http://127.0.0.1:$PORT"')
    expect(code).toContain('-X PUT "$BASE_URL/?index"')
    expect(code.indexOf('run smoke')).toBeLessThan(code.indexOf('kickstart -k'))
  })

  test('does not use zsh read-only specials as variable names', async () => {
    expect(await codeOnly()).not.toMatch(/\blocal\b[^\n]*\b(status|path|pipestatus)\b/)
  })

  test('is never wired to run automatically', async () => {
    const { scripts = {} } = JSON.parse(await readFile(join(deployDir, '../package.json'), 'utf8'))
    for (const command of Object.values(scripts) as string[]) {
      expect(command).not.toContain('deploy.sh')
    }
  })
})

describe('deploy/deploy.sh usage', () => {
  for (const args of [[], ['--yolo'], ['check', 'extra'], ['render', 'x'], ['deploy', '--force'], ['deploy', '--reinstall', 'x']]) {
    test(`exits 2 and does nothing for: ${JSON.stringify(args)}`, async () => {
      const box = await makeSandbox()
      const result = run(box, args)
      expect(result.code).toBe(2)
      expect(result.err).toContain('usage')
      expect(await recordedCalls(box)).toBe('')
    })
  }
})

describe('deploy/deploy.sh render', () => {
  test('renders a valid plist for the local-only preview', async () => {
    const box = await makeSandbox()
    const result = run(box, ['render'])
    expect(result.code).toBe(0)
    expect(result.out).not.toMatch(/__[A-Z]+__/)
    expect(await plistAsJson(result.out)).toEqual({
      Label: 'com.mickey.mickeymullin-preview',
      ProgramArguments: [box.node, 'server.js'],
      WorkingDirectory: `${box.home}/dev/mickeymullin.com`,
      EnvironmentVariables: { NODE_ENV: 'production', LISTEN_HOST: '127.0.0.1', PORT: '4310', CONTACT_TRANSPORT: 'log' },
      RunAtLoad: true,
      KeepAlive: true,
      ThrottleInterval: 10,
      StandardOutPath: `${box.home}/Library/Logs/mickeymullin-preview.log`,
      StandardErrorPath: `${box.home}/Library/Logs/mickeymullin-preview.err.log`
    })
    expect(await recordedCalls(box)).toBe('')
  })

  test('never renders SMTP settings or anything that would send mail', async () => {
    const template = await readFile(TEMPLATE, 'utf8')
    expect(template).not.toMatch(/SMTP_|CONTACT_TO|CONTACT_FROM/)
  })
})

describe('deploy/deploy.sh check (dry run)', () => {
  test('plans the deploy without installing, building, copying, or restarting anything', async () => {
    const box = await makeSandbox()
    const result = run(box, ['check'])
    expect(result.err).toBe('')
    expect(result.code).toBe(0)
    expect(result.out).toContain('dry run')
    expect(result.out).toContain('on master at')
    expect(result.out).toContain('npm ci would run')
    expect(result.out).toContain('not running')
    expect(result.out).toContain('none installed')
    const calls = await recordedCalls(box)
    expect(calls).not.toMatch(MUTATING)
    expect(existsSync(join(box.home, 'Library/LaunchAgents/com.mickey.mickeymullin-preview.plist'))).toBe(false)
    expect(existsSync(join(box.app, 'node_modules'))).toBe(false)
  })

  test('lists uncommitted edits as part of the preview build, without touching them', async () => {
    const box = await makeSandbox()
    await writeFile(join(box.app, 'server.js'), '// edited\n')
    const result = run(box, ['check'])
    expect(result.code).toBe(0)
    expect(result.out).toContain('uncommitted changes (included in the preview build)')
    expect(result.out).toContain('M server.js')
    expect(await readFile(join(box.app, 'server.js'), 'utf8')).toBe('// edited\n')
  })

  test('skips npm ci when package-lock.json matches the last deploy', async () => {
    const box = await makeSandbox({ stamp: true })
    const result = run(box, ['check'])
    expect(result.code).toBe(0)
    expect(result.out).toContain('npm ci would be skipped')
  })

  test('refuses a Node older than package.json allows', async () => {
    const box = await makeSandbox({ nodeVersion: '22.11.0' })
    const result = run(box, ['check'])
    expect(result.code).toBe(1)
    expect(result.err).toContain('needs >=22.12')
  })

  test('refuses when something other than the preview job holds port 4310', async () => {
    const box = await makeSandbox({ portHolder: '4242' })
    const result = run(box, ['check'])
    expect(result.code).toBe(1)
    expect(result.err).toContain('port 4310 is held by pid 4242')
    expect(await recordedCalls(box)).not.toMatch(MUTATING)
  })

  test('refuses when there is no checkout', async () => {
    const box = await makeSandbox({ checkout: false })
    const result = run(box, ['check'])
    expect(result.code).toBe(1)
    expect(result.err).toContain('no checkout at')
  })
})
