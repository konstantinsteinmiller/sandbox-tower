// Keep one playtester's window alive: relaunch pt-daemon on the SAME save when
// Chrome was killed or crashed (daemon exit 75); stop when it exited cleanly
// (window closed by a person, or /quit).
//   node pt-supervise.mjs --id 10 --mode mobile --url http://127.0.0.1:4391/ --x 880 --y 20
import { spawn } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2).filter((a) => a !== '--keep')
const id = args[args.indexOf('--id') + 1]
const logFile = join(HERE, 'logs', `pt-${id}.log`)
const log = (m) => appendFileSync(logFile, `[${new Date().toISOString()}] supervisor: ${m}\n`)

let relaunches = 0
const start = () => new Promise((resolve) => {
  const child = spawn(process.execPath, [join(HERE, 'pt-daemon.mjs'), ...args, '--keep'], { stdio: 'ignore' })
  child.on('exit', (code) => resolve(code))
})

for (;;) {
  const code = await start()
  if (code !== 75) { log(`daemon exited ${code}; not reopening`); break }
  if (++relaunches > 6) { log('too many relaunches; giving up'); break }
  log(`chrome was killed or crashed; reopening on the same save (#${relaunches})`)
  await new Promise((r) => setTimeout(r, 2000))
}
