// Player-side controller. Talks to this player's pt-daemon.
//
//   node pt.mjs <id> <command> [numbers...] [, <command> [numbers...]]... [--post <ms>]
//
// Several commands separated by a lone comma run back to back and return ONE
// screenshot at the end. Coordinates are screenshot pixels.
const [idArg, ...rest] = process.argv.slice(2)
const id = Number(idArg)
if (!Number.isInteger(id) || rest.length === 0) {
  console.log('usage: node pt.mjs <id> <command> [args] [, <command> [args]]... [--post ms]')
  process.exit(1)
}
if (rest[0] === 'note') {
  try {
    const res = await fetch(`http://127.0.0.1:${9400 + id}/note`, { method: 'POST', body: JSON.stringify({ text: rest.slice(1).join(' ') }) })
    const out = await res.json()
    console.log(out.ok ? 'noted' : 'ERROR: ' + out.error)
  } catch (err) {
    console.log('ERROR: controller not reachable (' + err.message + ')')
  }
  process.exit(0)
}
let post
const words = []
for (let i = 0; i < rest.length; i++) {
  if (rest[i] === '--post') { post = Number(rest[++i]); continue }
  words.push(rest[i])
}
const steps = []
let cur = []
for (const w of words.flatMap((w) => w.split(/(,)/)).filter((w) => w.trim() !== '')) {
  if (w === ',') { if (cur.length) steps.push(cur); cur = []; continue }
  cur.push(w)
}
if (cur.length) steps.push(cur)

try {
  const res = await fetch(`http://127.0.0.1:${9400 + id}/cmd`, {
    method: 'POST',
    body: JSON.stringify({ steps, post })
  })
  const out = await res.json()
  if (!out.ok) {
    console.log('ERROR: ' + out.error)
    process.exit(2)
  }
  console.log('done: ' + out.done.join(' | '))
  console.log('game time so far: ' + out.gameTimeSeconds + ' s' + (out.limitSeconds ? ` of your ${out.limitSeconds} s limit` : ''))
  console.log('screenshot: ' + out.screenshot)
  if (out.notice) console.log(out.notice)
} catch (err) {
  console.log('ERROR: controller not reachable (' + err.message + ') - wait 5 s and retry once')
  process.exit(3)
}
