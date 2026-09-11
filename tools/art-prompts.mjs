#!/usr/bin/env node
/**
 * Regenerate `art-sheets/PROMPTS-*.md` from the manifest, with no browser.
 *
 *   pnpm art:prompts            # writes the four prompt documents + PAINT-STATUS.md
 *   pnpm art:prompts --check    # exits 1 if a prompt document is out of date (CI)
 *
 * The bench (`/#/art-sheets`) writes the same files on export: both routes call
 * `promptDocs()` in `src/game/artSheet.ts`, so a manifest change (a new monster,
 * a reworded blurb) has its prompt the moment this runs, before anyone opens a
 * browser. The manifest chain is plain TypeScript with no Vue in it;
 * `tools/ts-resolve.mjs` is what lets Node load it.
 *
 * Run through the `--import` hook (the pnpm script does):
 *   node --import ./tools/ts-resolve.mjs tools/art-prompts.mjs
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parsePromptDoc } from './art-desk/jobs.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'art-sheets')
const PAINTED = join(OUT, 'painted')
const CHECK = process.argv.includes('--check')

const manifest = await import(pathToFileURL(join(ROOT, 'src', 'game', 'artSheet.ts')).href)

const docs = manifest.promptDocs()
mkdirSync(OUT, { recursive: true })

let stale = 0
for (const [name, text] of Object.entries(docs)) {
  const file = join(OUT, name)
  const current = existsSync(file) ? readFileSync(file, 'utf-8') : null
  if (current === text) {
    console.log(`  = ${name}  unchanged`)
    continue
  }
  stale++
  if (CHECK) {
    console.error(`  ! ${name} is out of date — run pnpm art:prompts`)
    continue
  }
  writeFileSync(file, text, 'utf-8')
  console.log(`  ✓ ${name}  ${(text.length / 1024).toFixed(0)} kB`)
}

// A document the bench used to write under another name is a second, frozen
// copy of prompts nobody regenerates — and the desk would offer it as jobs.
for (const f of existsSync(OUT) ? readdirSync(OUT) : []) {
  if (/^PROMPTS.*\.md$/i.test(f) && !(f in docs)) {
    console.warn(`  ! ${f} is not written by the manifest any more — delete it`)
  }
}

// ─── What is painted, what is not, and what has gone out of date ────────────
//
// The prompts say how to paint every sheet; they never said which ones still
// NEED painting, so that was worked out by hand each time — and the one state
// nobody thinks to look for, a painting whose drawing has since been re-cut,
// is invisible until it is sliced back over the corrected art.
//
// This is that answer as a file. It is written here and not by the bench,
// because it is a fact about the filesystem (what is in `painted/`, what the
// slicer's receipt says) and the bench runs in a browser. It is a REPORT, so
// `--check` does not police it: it goes out of date the moment a painting
// lands, and running `pnpm art:prompts` again is the whole fix.
//
// The revision of a sheet is the first 12 hex of a sha1 over the CLEAN
// reference the bench exported — the same number `tools/slice-sheets.mjs`
// records, so "the reference changed since this was painted" is one string
// comparison in both tools (and in the Art Desk).

const revOf = (file) => (existsSync(file) ? createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 12) : null)

const receipt = (() => {
  const f = join(PAINTED, '.sliced.json')
  if (!existsSync(f)) return {}
  try { return JSON.parse(readFileSync(f, 'utf-8')).files ?? {} } catch { return {} }
})()

const IMAGE = /\.(png|jpe?g|webp)$/i
const listImages = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => IMAGE.test(f)) : [])
const paintings = listImages(PAINTED)
const quarantined = listImages(join(PAINTED, 'stale'))
const stemOf = (f) => f.replace(/\.[^.]+$/, '').toLowerCase()

// Walks and scenery bands also answer to their bare id in the slicer
// (`sun.jpg`, `grumpling.png`), so a painting filed that way is still theirs.
const aliasesOf = new Map([
  ...manifest.WALKS.map((w) => [w.file, [w.id]]),
  ...manifest.SCENERY.map((a) => [a.file, [a.id]])
])
// Scenery goes out as a prompt alone — there is no reference to hash.
const promptOnly = new Set(manifest.SCENERY.map((a) => a.file))
// Strips with no drop-in target (the assembled/glyph rows, the merged sheet)
// are style tests: the slicer has nowhere to put them, so they are never
// "outstanding" — the Art Desk marks them the same way and never queues them.
const referenceOnly = new Set(manifest.ALL_STRIPS.filter((s) => !s.cells.some((c) => c.target)).map((s) => s.file))

const stateOf = (stem) => {
  const rev = revOf(join(OUT, `${stem}.png`))
  if (referenceOnly.has(stem)) return { mark: '–', state: 'reference only — no drop-in target', painting: null, rev }
  const names = [stem, ...(aliasesOf.get(stem) ?? [])].map((s) => s.toLowerCase())
  const painting = paintings.find((f) => names.includes(stemOf(f)))
  if (!painting) {
    const parked = quarantined.find((f) => names.includes(stemOf(f)))
    return parked
      ? { mark: '!', state: 'REPAINT — the old one is parked in `painted/stale/`', painting: parked, rev }
      : { mark: '·', state: 'not painted yet', painting: null, rev }
  }
  let seen = receipt[painting]
  // The receipt line belongs to the painting it was written for: the same name
  // with different bytes is a re-roll nobody has sliced yet.
  if (seen?.painting && seen.painting !== revOf(join(PAINTED, painting))) seen = undefined
  if (seen?.rev && rev && seen.rev !== rev) {
    return { mark: '!', state: `REPAINT — the reference changed (${seen.rev} → ${rev})`, painting, rev }
  }
  // No receipt only means nobody has sliced it SINCE receipts existed — the
  // sprites may well be on disk from before. It is not evidence either way,
  // which is exactly why it gets its own mark instead of a guess.
  if (!seen) return { mark: '?', state: `\`${painting}\` painted; no receipt yet — \`pnpm slice-sheets --dry\` to check it`, painting, rev }
  return { mark: '✓', state: `sliced ${String(seen.at).slice(0, 10)} from \`${painting}\``, painting, rev }
}

// The rows ARE the prompt blocks, read back with the Art Desk's own parser: the
// titles and references here are exactly what the operator sees there, and a
// block the desk cannot parse shows up as a count mismatch below.
const builders = {
  'PROMPTS-CELLS.md': manifest.SINGLES.length,
  'PROMPTS-STRIPS.md': manifest.ALL_STRIPS.length,
  'PROMPTS-SCENERY.md': manifest.SCENERY.length,
  'PROMPTS-WALKS.md': manifest.WALKS.length
}
let unparsed = 0
const rows = []
for (const [name, text] of Object.entries(docs)) {
  const jobs = parsePromptDoc(text, name)
  if (jobs.length !== builders[name]) {
    unparsed += Math.abs((builders[name] ?? 0) - jobs.length)
    console.error(`  ! ${name}: the desk parses ${jobs.length} block(s), the manifest built ${builders[name]}`)
  }
  for (const j of jobs) {
    const stem = j.refName.replace(/\.png$/i, '')
    rows.push({ title: j.title, doc: name, stem, ...stateOf(stem) })
  }
}

const tally = { '✓': 0, '!': 0, '?': 0, '·': 0, '–': 0 }
for (const r of rows) tally[r.mark]++

const reference = (r) => promptOnly.has(r.stem)
  ? `\`${r.stem}.png\` — *prompt only, no reference*`
  : `\`${r.stem}.png\`${r.rev ? ` (rev \`${r.rev}\`)` : ' — *missing, re-export from `/art-sheets`*'}`

const status = [
  '# Paint status — generated by `pnpm art:prompts`',
  '',
  'A report, not a contract: it is a picture of `art-sheets/painted/` and the',
  'slicer\'s receipt at the moment it was written. Re-run `pnpm art:prompts`',
  'after painting or slicing anything.',
  '',
  `**${tally['✓']} sliced · ${tally['!']} need a repaint · ${tally['?']} painted, unreceipted · ${tally['·']} outstanding**`
    + (tally['–'] ? ` (+ ${tally['–']} reference-only strips)` : ''),
  '',
  '| | Sheet | Prompt block in | Reference | State |',
  '| --- | --- | --- | --- | --- |',
  ...rows.map((r) => `| ${r.mark} | **${r.title}** | \`${r.doc}\` | ${reference(r)} | ${r.state} |`),
  '',
  '## What the marks mean',
  '',
  '* **✓** sliced, and the drawing has not moved since.',
  '* **!** a painting of a drawing that has since been RE-CUT. `pnpm slice-sheets`',
  '  refuses it and says so; repaint from the reference, or `--stale-ok` if you',
  '  know the change was cosmetic.',
  '* **?** a painting is sitting in `painted/` with no receipt against it. That',
  '  is not evidence it was never cut — receipts are newer than the folder — so',
  '  run `pnpm slice-sheets --dry` and read what it says it would write.',
  '* **·** nothing painted for this one yet — attach the reference and paste its',
  '  block from the prompt file named above (or find it in `pnpm art:desk`).',
  '* **–** a reference-only strip: a style test with no drop-in target, so',
  '  there is nothing to slice it into.',
  ''
].join('\n')

const statusFile = join(OUT, 'PAINT-STATUS.md')
if (!CHECK) {
  writeFileSync(statusFile, status, 'utf-8')
  console.log(`  ✓ PAINT-STATUS.md  ${tally['✓']} sliced, ${tally['!']} stale, ${tally['?']} uncut, ${tally['·']} outstanding`)
}

const targets = new Set([
  ...manifest.SHEETS.flatMap((s) => s.cells.map((c) => c.target).filter(Boolean)),
  ...manifest.WALKS.map((w) => w.target),
  ...manifest.SCENERY.map((a) => a.target)
])
console.log(`\n${manifest.SHEETS.length} sheets, ${manifest.ALL_STRIPS.length} strips, ${manifest.SINGLES.length} singles, `
  + `${manifest.WALKS.length} walks, ${manifest.SCENERY.length} bands — ${targets.size} drawables with a target`)
if (unparsed) console.error(`${unparsed} prompt block(s) the Art Desk cannot see — the heading must end in (<reference>.png[ → <target>])`)
if (CHECK && (stale || unparsed)) process.exit(1)
