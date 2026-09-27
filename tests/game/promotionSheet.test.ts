import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { promptDocs } from '@/game/artSheet'
import {
  COVER_ASPECTS, COVER_SCENES, LOGO_EXTRAS, LOGO_ON_COVER, WORDMARK, coverDeliverables, promotionPromptDoc, promptForCover
} from '@/game/promotionSheet'

const PUBLIC = resolve(__dirname, '../../public')

/**
 * `pnpm art:promotion` cuts every portal cover from the master of its OWN
 * aspect family. These pin the three things that make that safe.
 */
describe('promotion manifest', () => {
  it('cuts every deliverable from a plate of its own shape, never a larger size than the plate', () => {
    for (const { aspect, size } of coverDeliverables()) {
      const plate = aspect.plate.w / aspect.plate.h
      expect(Math.abs(size.w / size.h / plate - 1), `${size.w}x${size.h} from ${aspect.id}`).toBeLessThan(0.005)
      expect(aspect.plate.w).toBeGreaterThanOrEqual(size.w)
      expect(aspect.plate.h).toBeGreaterThanOrEqual(size.h)
    }
  })

  it('covers the four formats the portals were promised', () => {
    const sizes = coverDeliverables().map(({ size }) => `${size.w}x${size.h}`)
    for (const want of ['800x800', '1920x1080', '1080x1920', '800x1200']) expect(sizes).toContain(want)
  })

  it('never lets a cover prompt drop the no-text, no-logo, no-UI rules', () => {
    for (const a of COVER_ASPECTS) {
      const p = promptForCover(a)
      expect(p).toContain('NO TEXT ANYWHERE')
      expect(p).toContain('NO LOGO')
      expect(p).toContain('NO USER INTERFACE')
      expect(p).toContain(`${a.plate.w} x ${a.plate.h}`)
    }
  })

  it('keeps the promotion document out of the Art Desk scan', () => {
    // The desk turns every PROMPTS-*.md in art-sheets/ into a slicer job; a
    // cover handed to the slicer is refused and left sitting in painted/.
    expect(Object.keys(promptDocs())).not.toContain('PROMPTS-PROMOTION.md')
    expect(promotionPromptDoc()).toContain('# Promotion prompts')
  })

  it('builds every plate from sprites the game actually ships', () => {
    for (const [shape, scene] of Object.entries(COVER_SCENES)) {
      for (const layer of scene.layers) {
        if (layer.src) expect(existsSync(resolve(PUBLIC, layer.src)), `${shape}: ${layer.src}`).toBe(true)
      }
      for (const row of scene.castle.rows) {
        for (const b of row) {
          expect(existsSync(resolve(PUBLIC, `images/blocks/${b.block}.webp`)), `${shape}: block ${b.block}`).toBe(true)
          if (b.fixture) expect(existsSync(resolve(PUBLIC, `images/fixtures/${b.fixture}.webp`)), `${shape}: toy ${b.fixture}`).toBe(true)
        }
      }
    }
  })

  it('has the prompt document on disk matching the manifest', () => {
    const doc = resolve(__dirname, '../../art-sheets/promotion/PROMPTS-PROMOTION.md')
    expect(readFileSync(doc, 'utf8')).toBe(promotionPromptDoc())
  })

  it('places the wordmark on every family, inside the frame', () => {
    for (const a of COVER_ASPECTS) {
      const p = LOGO_ON_COVER[a.id]
      expect(p, a.id).toBeDefined()
      expect(p!.cx - p!.w / 2, a.id).toBeGreaterThanOrEqual(0)
      expect(p!.cx + p!.w / 2, a.id).toBeLessThanOrEqual(1)
    }
    for (const x of LOGO_EXTRAS) expect(COVER_ASPECTS.some((a) => a.id === x.from), x.file).toBe(true)
  })

  it('asks for the title spelled out, letter by letter', () => {
    expect(WORDMARK.lines).toEqual(['SANDBOX', 'TOWER'])
    expect(promotionPromptDoc()).toContain('S A N D B O X')
  })
})

