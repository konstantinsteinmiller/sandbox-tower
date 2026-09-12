import { describe, expect, it } from 'vitest'
import { TIP_PICTOGRAMS, isTipUsable, tipPictogram, type TipId } from '@/game/deathTips'
import { BLOCK_DEFS } from '@/game/blocks'
import en from '@/i18n/locales/en'

/**
 * ─── A death-screen tip names only what the player can find ─────────────────
 *
 * The 2026-09-11 blind playtest: desktop testers were told about "lumber huts
 * and stone pits" and "banners" on the defeat screen and could not find either.
 * Each tip now carries the tiles of the blocks it names, and a tip whose blocks
 * are ALL still locked waits — unless it is the answer to what ended the run.
 */

const TIP_IDS = Object.keys(TIP_PICTOGRAMS) as TipId[]
const set = (...ids: string[]): Set<string> => new Set(ids)

describe('death tips', () => {
  it.each(TIP_IDS)('%s has copy in the source locale', (id) => {
    const tips = (en as unknown as { tips: Record<string, string> }).tips
    expect(tips[id], `tips.${id} missing from en.ts`).toBeTruthy()
  })

  it.each(TIP_IDS)('%s only names real blocks', (id) => {
    for (const b of TIP_PICTOGRAMS[id].blocks) expect(BLOCK_DEFS[b], `${id} → ${b}`).toBeDefined()
  })

  it('offers the producer tip while a producer can be placed', () => {
    expect(isTipUsable('eco', set('lumberHut'))).toBe(true)
    expect(isTipUsable('eco', set('stonepit'))).toBe(true)
  })

  it('holds the producer tip back when every producer it names is locked', () => {
    expect(isTipUsable('eco', set('wood', 'stone', 'cannon'))).toBe(false)
  })

  it('holds the banner tip back when the banner is not placeable', () => {
    expect(isTipUsable('buff', set('banner'))).toBe(true)
    expect(isTipUsable('buff', set('wood'))).toBe(false)
  })

  it('keeps the trebuchet tip even when its answers are locked — it IS the answer', () => {
    expect(isTipUsable('siegeReach', set())).toBe(true)
  })

  it('keeps the gold tip: upgrading blocks with gold needs no unlock', () => {
    expect(isTipUsable('gold', set())).toBe(true)
  })

  it('never gates tips that name no block', () => {
    for (const id of ['merge', 'spend', 'branches', 'shape'] as const) {
      expect(isTipUsable(id, set())).toBe(true)
    }
    expect(isTipUsable('someFutureTip', set())).toBe(true)
  })

  it('draws the merge rule, and the tree for the tree tips', () => {
    expect(tipPictogram('merge').merge).toBe(true)
    expect(tipPictogram('spend').tech).toBe(true)
    expect(tipPictogram('branches').tech).toBe(true)
    expect(tipPictogram('nope').blocks).toHaveLength(0)
  })
})
