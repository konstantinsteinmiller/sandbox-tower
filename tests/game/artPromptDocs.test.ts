import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  ALL_STRIPS, SCENERY, SCENERY_STYLE_REFS, SINGLES, WALKS,
  notPaintedOnPurpose, promptDocs, promptFor, promptForCell, promptForScenery, promptForWalk
} from '@/game/artSheet'
import { parsePromptDoc } from '../../tools/art-desk/jobs.mjs'

/**
 * The Art Desk sends what it PARSES out of `PROMPTS-*.md`, never the builders'
 * own output. So the documents are only safe to automate if every block reads
 * back as exactly the text its builder wrote — a block the parser cannot see
 * silently drops out of the queue, and a half-parsed one paints from half a
 * prompt, which still generates something and so never looks broken.
 */

interface ParsedJob { title: string; refName: string; target: string | null; prompt: string; doc: string }

const withoutHeading = (text: string): string =>
  text.slice(text.indexOf('\n') + 1).replace(/^\n+/, '')

const docs = promptDocs()
const parse = (name: string): ParsedJob[] => parsePromptDoc(docs[name], name)

const CASES: [string, string[], { file: string; target: string }[]][] = [
  ['PROMPTS-CELLS.md', SINGLES.map((s) => promptForCell(s)),
    SINGLES.map((s) => ({ file: s.file, target: s.cell.target ?? '' }))],
  ['PROMPTS-WALKS.md', WALKS.map((w) => promptForWalk(w)),
    WALKS.map((w) => ({ file: w.file, target: w.target }))],
  ['PROMPTS-SCENERY.md', SCENERY.map((a) => promptForScenery(a)),
    SCENERY.map((a) => ({ file: a.file, target: a.target }))],
  ['PROMPTS-STRIPS.md', ALL_STRIPS.map((s) => promptFor(s)),
    ALL_STRIPS.map((s) => ({ file: s.file, target: '' }))]
]

describe('the prompt documents the Art Desk automates', () => {
  it('are exactly the four documents the bench and `pnpm art:prompts` write', () => {
    expect(Object.keys(docs).sort()).toEqual(CASES.map(([name]) => name).sort())
  })

  for (const [name, built, refs] of CASES) {
    it(`${name}: every block parses back byte-identical to its builder`, () => {
      const jobs = parse(name)
      expect(jobs).toHaveLength(built.length)
      jobs.forEach((job, i) => {
        expect(job.prompt, job.title).toBe(withoutHeading(built[i]!))
      })
    })

    it(`${name}: every heading names its reference, and its target when it has one`, () => {
      const jobs = parse(name)
      jobs.forEach((job, i) => {
        expect(job.refName).toBe(`${refs[i]!.file}.png`)
        expect(job.target ?? '').toBe(refs[i]!.target)
      })
    })
  }

  it('fences every prompt so a markdown preview offers one-click copy', () => {
    for (const text of Object.values(docs)) {
      const lines = text.split('\n')
      const headings = lines.filter((l) => l.startsWith('## ')).length
      const fences = lines.filter((l) => /^`{3,}(text)?$/.test(l))
      // One opening (```text) and one closing fence per block, nothing stray.
      expect(fences.filter((l) => l.endsWith('text'))).toHaveLength(headings)
      expect(fences).toHaveLength(headings * 2)
    }
  })
})

/**
 * Sandbox Tower's blocks are rounded squares wearing a rim in their own colour,
 * and the rim is how a block type reads at a glance. Tower Siege's inherited
 * rule demanded square corners and no borders; the first painted body obeyed
 * it over its own reference and came back rimless.
 */
describe('block body prompts', () => {
  const bodies = SINGLES.filter((s) => /^block\/.+\/body$/.test(s.id) && s.cell.target)
  // |r−255| + g + |b−255| — the slicer's soft key unmixes anything under 210.
  const fromMagenta = (hex: string): number => {
    const n = parseInt(hex.slice(1), 16)
    return 255 - (n >> 16) + ((n >> 8) & 255) + 255 - (n & 255)
  }

  it('covers every block body that ships', () => {
    expect(bodies.length).toBe(17)
  })

  for (const s of bodies) {
    it(`${s.id} keeps its rim, its rounded corners, and a colour the key leaves alone`, () => {
      const text = promptForCell(s)
      const rim = /The RIM round the whole block is (#[0-9a-f]{6})/.exec(text)
      expect(rim, 'names its rim colour').not.toBeNull()
      expect(fromMagenta(rim![1]!)).toBeGreaterThanOrEqual(230)
      expect(text).toContain('ROUNDED corners')
      // The inherited rule's wording — not "corner to corner" alone, which the
      // Packed Sand blurb rightly uses for the X across its face.
      expect(text).not.toMatch(/SQUARE corners|edge to edge, corner to corner|No frame, border/)
      for (const hex of text.match(/#[0-9a-f]{6}/gi) ?? []) {
        if (hex.toLowerCase() === '#ff00ff') continue
        expect(fromMagenta(hex), `${hex} is inside the key`).toBeGreaterThanOrEqual(210)
      }
    })
  }
})

/**
 * The scenery has no reference render, so the desk attaches finished block
 * paintings instead — named on an `Attach, in this order:` line OUTSIDE the
 * fence, which the model never sees and the desk parses into `styleRefs`.
 */
describe('finish references', () => {
  it('ride along on every scenery prompt, in order, and nowhere else', () => {
    for (const [name] of CASES) {
      const want = name === 'PROMPTS-SCENERY.md' ? [...SCENERY_STYLE_REFS] : []
      for (const job of parse(name) as (ParsedJob & { styleRefs: string[] })[]) {
        expect(job.styleRefs, `${name} → ${job.title}`).toEqual(want)
        expect(job.prompt).not.toContain('Attach, in this order')
      }
    }
  })

  it('are told they show HOW to paint, never WHAT', () => {
    for (const a of SCENERY) expect(promptForScenery(a)).toContain('They show HOW to paint, never WHAT')
  })
})

/**
 * The Art Desk and PAINT-STATUS.md skip what the manifest says is never
 * painted. The rule must never swallow art the game actually draws.
 */
describe('sheets not painted on purpose', () => {
  it('never lists a block, toy, bug walk, contraption, boat or scenery sheet', () => {
    const skipped = notPaintedOnPurpose()
    for (const s of SINGLES) {
      if (/^images\/(blocks|fixtures|props|rounds|icons)\//.test(s.cell.target ?? '')) expect(skipped[s.file], s.file).toBeUndefined()
    }
    for (const w of WALKS) expect(skipped[w.file], w.file).toBeUndefined()
    for (const a of SCENERY) expect(skipped[a.file], a.file).toBeUndefined()
  })

  it('is written out for the desk exactly as the manifest says', () => {
    const onDisk = JSON.parse(readFileSync(resolve(__dirname, '../../art-sheets/not-painted.json'), 'utf8'))
    expect(onDisk).toEqual(notPaintedOnPurpose())
  })
})
