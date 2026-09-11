import { describe, expect, it, vi } from 'vitest'

// ─── Which piles is the player short of? ────────────────────────────────────
//
// The refusal blink lights exactly the icons `missingFor` names, so the answer
// has to be right per pile, in the bar's order, and — on the phone board, which
// folds stone into wood — never name a pile that board has no readout for.

const load = async () => {
  vi.resetModules()
  localStorage.clear()
  const game = await import('@/use/useTowerGame')
  return game
}

describe('missingFor — the tower', () => {
  // bombard1: 20 wood + 22 stone + 26 gold, the one desktop piece that asks
  // for all three piles at once.
  it('names exactly the short piles, in wood, stone, gold order', async () => {
    const g = await load()
    g.startRun()
    g.wood.value = 19
    g.stone.value = 22
    g.runCoins.value = 26
    expect(g.missingFor('bombard1')).toEqual(['wood'])

    g.wood.value = 20
    g.stone.value = 0
    g.runCoins.value = 0
    expect(g.missingFor('bombard1')).toEqual(['stone', 'coins'])

    g.wood.value = 0
    expect(g.missingFor('bombard1')).toEqual(['wood', 'stone', 'coins'])
  })

  it('names nothing when the purse covers it — and agrees with canAffordShape', async () => {
    const g = await load()
    g.startRun()
    g.wood.value = 20
    g.stone.value = 22
    g.runCoins.value = 26
    expect(g.missingFor('bombard1')).toEqual([])
    expect(g.canAffordShape('bombard1')).toBe(true)
    // One short of the gold: the two answers flip together.
    g.runCoins.value = 25
    expect(g.missingFor('bombard1')).toEqual(['coins'])
    expect(g.canAffordShape('bombard1')).toBe(false)
  })
})

describe('missingFor — the phone board', () => {
  const loadDrop = async () => {
    const g = await load()
    const { DROPMERGE_RULES } = await import('@/mobile-fit/rules')
    g.applyRules(DROPMERGE_RULES)
    g.startRun()
    return g
  }

  // b_bombard folds its 22 stone into 31 wood at the 1.4 rate: 51 materials
  // and 26 gold.
  it('charges stone as materials, so a short piece is short of wood — never of stone', async () => {
    const g = await loadDrop()
    g.stone.value = 0
    g.wood.value = 50
    g.runCoins.value = 26
    expect(g.missingFor('b_bombard')).toEqual(['wood'])

    g.wood.value = 51
    expect(g.missingFor('b_bombard')).toEqual([])

    g.wood.value = 0
    g.runCoins.value = 0
    const missing = g.missingFor('b_bombard')
    expect(missing).toEqual(['wood', 'coins'])
    expect(missing).not.toContain('stone')
  })
})
