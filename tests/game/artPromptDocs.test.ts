import { describe, expect, it } from 'vitest'
import {
  ALL_STRIPS, SCENERY, SINGLES, WALKS,
  promptDocs, promptFor, promptForCell, promptForScenery, promptForWalk
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
