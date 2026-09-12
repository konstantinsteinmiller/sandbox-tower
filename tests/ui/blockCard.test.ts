import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'

vi.mock('@/use/useSound', () => ({
  default: () => ({ playSound: () => null })
}))

/**
 * ─── The drop board's block card ────────────────────────────────────────────
 *
 * Tapping a block on the phone board opens this: what the block is, what rank
 * it is on, what the next rank would buy, and the two buttons — rank it up
 * with run gold, or sell it. The drop board had neither before (its only
 * gesture was a long-press sell that a piece in hand blocked), so run gold had
 * no sink at all on that board.
 *
 * What must hold: the price and the stat gains come from the simulation's own
 * arithmetic, the numbers move the moment a rank is bought, an unaffordable
 * rank still shows its price rather than going dead, and the Gate — the one
 * block that cannot be sold — offers no Sell button.
 */

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    en: {
      close: 'Close',
      blocks: {
        sell: 'Sell',
        upgrade: 'Upgrade',
        upgradeMax: 'Max',
        stats: { hp: 'HP', dmg: 'Damage' },
        names: { gate: 'Gate', cannon: 'Cannon', wood: 'Crate' }
      }
    }
  }
})

const load = async () => {
  vi.resetModules()
  localStorage.clear()
  const game = await import('@/use/useTowerGame')
  const { DROPMERGE_RULES } = await import('@/mobile-fit/rules')
  game.applyRules(DROPMERGE_RULES)
  game.startRun()
  game.buildClockHeld.value = true
  const { default: BlockCard } = await import('@/mobile-fit/components/BlockCard.vue')
  return { game, BlockCard }
}

const open = async (game: Awaited<ReturnType<typeof load>>['game'], BlockCard: unknown, key: string) => {
  const block = game.getBlocks().get(key)!
  const w = mount(BlockCard as never, {
    props: { block },
    global: { plugins: [i18n] },
    attachTo: document.body
  })
  return { w, block }
}

/** A cannon standing beside the Gate, at a cell the tests can name. */
const gunKey = (game: Awaited<ReturnType<typeof load>>['game']): string => {
  game.wood.value = 9_999
  game.stone.value = 9_999
  game.runCoins.value = 9_999
  if (!game.getBlocks().has('1,0')) expect(game.placeBlock('cannon', 1, 0)).toBeTruthy()
  return '1,0'
}

describe('block card', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('quotes the simulation\'s own rank price, and buys a rank with it', async () => {
    const { game, BlockCard } = await load()
    const key = gunKey(game)
    const { w, block } = await open(game, BlockCard, key)
    const price = game.upgradeCostAt(block.c, block.r)
    expect(w.find('.card__upgrade').text()).toContain(String(price))

    game.runCoins.value = price
    await w.vm.$nextTick()
    expect(w.find('.card__upgrade').classes()).not.toContain('is-poor')
    await w.find('.card__upgrade').trigger('click')
    // The card only ASKS; the scene spends. Nothing has changed yet.
    expect(w.emitted('upgrade')).toHaveLength(1)
    expect(block.level ?? 0).toBe(0)

    expect(game.upgradeBlock(block.c, block.r)).toBe(true)
    await w.vm.$nextTick()
    // The block is a plain object the simulation mutates in place: the card
    // follows it through `towerVersion`, not through the prop.
    expect(w.findAll('.card__pip.is-on')).toHaveLength(1)
    expect(w.find('.card__upgrade').text()).toContain(String(game.upgradeCostAt(block.c, block.r)))
  })

  it('shows what the next rank buys — more HP, and more damage on a gun', async () => {
    const { game, BlockCard } = await load()
    const key = gunKey(game)
    const { w, block } = await open(game, BlockCard, key)
    const rows = w.findAll('.card__stats dd')
    expect(rows.length).toBeGreaterThanOrEqual(2)
    // Every row quotes a bigger number after the arrow than before it.
    for (const row of rows) {
      const now = Number(row.text().split('▸')[0]!.trim())
      const next = Number(row.find('.card__next').text())
      expect(Number.isFinite(now)).toBe(true)
      expect(next).toBeGreaterThan(now)
    }
    // And the HP row's "after" is exactly what the simulation would grant.
    const hp = rows[0]!.find('.card__next').text()
    expect(Number(hp)).toBe(game.maxHpFor(block.typeId, block.enhanced, block.roof, 1, block.tier))
    w.unmount()
  })

  it('keeps the price legible when the purse is short, instead of going dead', async () => {
    const { game, BlockCard } = await load()
    const { w, block } = await open(game, BlockCard, gunKey(game))
    game.runCoins.value = 0
    await w.vm.$nextTick()
    const btn = w.find('.card__upgrade')
    expect(btn.classes()).toContain('is-poor')
    expect(btn.attributes('disabled')).toBeUndefined()
    expect(btn.text()).toContain(String(game.upgradeCostAt(block.c, block.r)))
    // The press still reaches the scene, which refuses it out loud.
    await btn.trigger('click')
    expect(w.emitted('upgrade')).toHaveLength(1)
    w.unmount()
  })

  it('offers Sell on a block, and never on the Gate', async () => {
    const { game, BlockCard } = await load()
    const gun = await open(game, BlockCard, gunKey(game))
    expect(gun.w.find('.card__sell').exists()).toBe(true)
    await gun.w.find('.card__sell').trigger('click')
    expect(gun.w.emitted('sell')).toHaveLength(1)
    gun.w.unmount()

    const gateKey = [...game.getBlocks()].find(([, b]) => b.typeId === 'gate')![0]
    const gate = await open(game, BlockCard, gateKey)
    expect(gate.w.find('.card__sell').exists()).toBe(false)
    // The Gate can still be ranked: it is the one block a player cannot
    // replace, so gold spent on it is never wasted.
    expect(gate.w.find('.card__upgrade').exists()).toBe(true)
    gate.w.unmount()
  })

  it('says so when a block is fully upgraded, and stops asking for gold', async () => {
    const { game, BlockCard } = await load()
    const key = gunKey(game)
    const block = game.getBlocks().get(key)!
    game.runCoins.value = 99_999
    for (let i = 0; i < 5; i++) expect(game.upgradeBlock(block.c, block.r)).toBe(true)
    const { w } = await open(game, BlockCard, key)
    const btn = w.find('.card__upgrade')
    expect(btn.text()).toBe('Max')
    expect(btn.attributes('disabled')).toBeDefined()
    expect(w.findAll('.card__pip.is-on')).toHaveLength(5)
    w.unmount()
  })
})
