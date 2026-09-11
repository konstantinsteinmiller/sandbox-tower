#!/usr/bin/env node
/**
 * Which painted drop-ins are actually on disk, and which are still drawings.
 *
 *   pnpm art:status              # a summary per folder, plus what is missing
 *   pnpm art:status -- --all     # list every target, present or not
 *
 * The question this answers is "I sliced the art and only half the game
 * changed". A miss is SILENT by design — `spriteFor` treats a 404 as "keep
 * drawing this one" so a portal never sees a broken build — which is right in
 * play and useless at the bench, where the whole point is to know what is
 * still missing. Nothing here touches a browser.
 *
 * The catalogue is every `target` in the art manifest: exactly the files the
 * slicer can write and `spriteFor(kind, id)` probes as `ART_FOLDERS[kind]/<id>`.
 * A folder the renderer does NOT probe (the logo, the result-screen ribbon) is
 * a UI bitmap a component loads directly — listed, but labelled as such.
 *
 * Run through the `--import` hook (the pnpm script does):
 *   node --import ./tools/ts-resolve.mjs tools/art-status.mjs
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(ROOT, 'public')
const ALL = process.argv.includes('--all')

const src = (f) => pathToFileURL(join(ROOT, 'src', 'game', f)).href
const { SHEETS, WALKS, SCENERY } = await import(src('artSheet.ts'))
const { ART_FOLDERS } = await import(src('art.ts'))

const kindOf = new Map(Object.entries(ART_FOLDERS).map(([kind, folder]) => [folder, kind]))

/** folder → Set of targets, in manifest order. */
const catalogue = new Map()
const add = (target) => {
  if (!target) return
  const folder = target.slice(0, target.lastIndexOf('/'))
  if (!catalogue.has(folder)) catalogue.set(folder, new Set())
  catalogue.get(folder).add(target)
}
for (const s of SHEETS) for (const c of s.cells) add(c.target)
for (const w of WALKS) add(w.target)
for (const a of SCENERY) add(a.target)

let present = 0
let absent = 0
const rows = []

for (const [folder, targets] of catalogue) {
  const missing = []
  let here = 0
  let bytes = 0
  for (const target of targets) {
    const file = join(PUBLIC, target)
    const id = target.slice(folder.length + 1).replace(/\.webp$/, '')
    if (existsSync(file)) {
      here++
      bytes += statSync(file).size
      if (ALL) rows.push(`  ✓ ${target}`)
    } else {
      missing.push(id)
      if (ALL) rows.push(`  · ${target}`)
    }
  }
  present += here
  absent += missing.length
  const label = kindOf.get(folder) ?? `${folder.replace(/^images\//, '')} (ui)`
  const kb = bytes > 0 ? ` — ${(bytes / 1024).toFixed(0)} kB` : ''
  console.log(`${here === targets.size ? '✓' : here === 0 ? '·' : '½'} ${label.padEnd(10)} ${String(here).padStart(3)}/${targets.size}${kb}`)
  if (missing.length && !ALL) {
    // The whole point: name them. A kind that is half painted is the case that
    // looks like "the art layer is broken" and is really "these ten are not cut yet".
    const shown = missing.slice(0, 12).join(', ')
    console.log(`    missing: ${shown}${missing.length > 12 ? `, …and ${missing.length - 12} more` : ''}`)
  }
  // The other direction: files that ship in every portal zip while no target
  // points at them — a sprite cut before the shared block bases, say. Named,
  // not deleted: a component may load one directly, so check before removing.
  const dir = join(PUBLIC, folder)
  const extra = existsSync(dir)
    ? readdirSync(dir).filter((f) => /\.(webp|png|jpe?g)$/i.test(f) && !targets.has(`${folder}/${f}`))
    : []
  if (extra.length) {
    const kb = extra.reduce((s, f) => s + statSync(join(dir, f)).size, 0) / 1024
    console.log(`    not in the manifest (${kb.toFixed(0)} kB): ${extra.join(', ')}`)
  }
}

if (ALL) console.log(rows.join('\n'))
console.log(`\n${present} painted, ${absent} still drawn, ${present + absent} in the catalogue.`)
if (absent) {
  console.log('A missing file is not an error: the renderer draws that one. It is only'
    + '\na surprise when you expected a painting — slice the sheet it belongs to,'
    + '\nthen reload the game (a 404 is remembered for the life of the page).')
}
