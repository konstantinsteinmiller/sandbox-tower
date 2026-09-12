import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'

// The strips bake on a real canvas; nothing here is about the art.
vi.mock('@/game/monsterSprites', () => ({
  monsterAnchor: () => 'feet',
  monsterFaces: () => 'right',
  monsterFrame: () => null,
  pickMonster: () => 'grumpling',
  primeMonsterSprites: () => {},
  SPRITE_FOOT_R: 0.9,
  SPRITE_HEIGHT_R: 0.8
}))

/**
 * ─── The defeat screen and HUD say it with pictures ─────────────────────────
 *
 * The 2026-09-11 blind playtest's HUD / defeat-screen gaps, each closed with a
 * picture rather than a sentence. What is pinned here is the part a refactor
 * would quietly lose: that the tip SHOWS the blocks it names (locked ones
 * wearing a padlock), that the upgrade door wears the tech tree's glyph and not
 * a cart, that the Gate's bar carries a heart and answers a hit, and that the
 * first-run banner adds pictures but not one extra word.
 */

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    en: {
      tips: { eco: 'Producers pay.', buff: 'Banners boost.', merge: 'Twins fuse.', spend: 'Spend.' },
      result: { upgrade: 'Upgrade!' },
      hud: { wave: 'Wave', enemies: 'Enemies', monstersIncoming: 'Monsters incoming!' }
    }
  }
})

const g = { global: { plugins: [i18n] } }

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('result tip pictograms', () => {
  it('shows the blocks a tip names, padlocking the one still in the tree', async () => {
    const { default: ResultTip } = await import('@/components/game/ResultTip.vue')
    // A fresh save: the lumber hut is dealt freely, the stone pit is a tree unlock.
    const w = mount(ResultTip, { props: { tipId: 'eco' }, ...g })
    expect(w.findAll('.result-tip__tile')).toHaveLength(2)
    expect(w.findAll('.result-tip__tile.is-locked')).toHaveLength(1)
    expect(w.findAll('.result-tip__lock')).toHaveLength(1)
    expect(w.find('.result-tip__tree .tech-glyph').exists()).toBe(true)
    expect(w.text()).toContain('Producers pay.')
    w.unmount()
  })

  it('shows the banner as the flag card, unlocked', async () => {
    const { default: ResultTip } = await import('@/components/game/ResultTip.vue')
    const w = mount(ResultTip, { props: { tipId: 'buff' }, ...g })
    expect(w.findAll('.result-tip__tile')).toHaveLength(1)
    expect(w.findAll('.result-tip__lock')).toHaveLength(0)
    w.unmount()
  })

  it('draws the merge rule: two of a gun, and the tier-2 one they make', async () => {
    const { default: ResultTip } = await import('@/components/game/ResultTip.vue')
    const w = mount(ResultTip, { props: { tipId: 'merge' }, ...g })
    expect(w.findAll('.result-tip__tile')).toHaveLength(3)
    expect(w.findAll('.result-tip__tile.is-merged')).toHaveLength(1)
    expect(w.findAll('.result-tip__op').map((o) => o.text())).toEqual(['+', '='])
    w.unmount()
  })
})

describe('result upgrade door', () => {
  it('wears the tech-tree glyph, not a cart, and keeps its spoken name', async () => {
    const { default: ResultUpgradeButton } = await import('@/components/game/ResultUpgradeButton.vue')
    const w = mount(ResultUpgradeButton, { ...g })
    expect(w.find('.tech-glyph').exists()).toBe(true)
    expect(w.find('.game-icon').exists()).toBe(false)
    expect(w.attributes('aria-label')).toBe('Upgrade!')
    await w.trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
    w.unmount()
  })
})

describe('gate health bar', () => {
  it('carries a heart, and flashes when the Gate is struck in battle', async () => {
    const { default: WaveHud } = await import('@/components/game/WaveHud.vue')
    const w = mount(WaveHud, {
      props: { wave: 3, enemiesLeft: 5, enemiesTotal: 9, gateHpPct: 1, phase: 'battle', bestWave: 5 },
      ...g
    })
    expect(w.find('.wave-hud__heart .game-icon').exists()).toBe(true)
    expect(w.find('.wave-hud__gate.is-hit').exists()).toBe(false)
    await w.setProps({ gateHpPct: 0.9 })
    expect(w.find('.wave-hud__gate.is-hit').exists()).toBe(true)
    vi.advanceTimersByTime(500)
    await nextTick()
    expect(w.find('.wave-hud__gate.is-hit').exists()).toBe(false)
    w.unmount()
  })

  it('does not flash for health gained, or outside a battle', async () => {
    const { default: WaveHud } = await import('@/components/game/WaveHud.vue')
    const w = mount(WaveHud, {
      props: { wave: 3, enemiesLeft: 0, enemiesTotal: 0, gateHpPct: 0.5, phase: 'build', bestWave: 5 },
      ...g
    })
    await w.setProps({ gateHpPct: 0.4 })
    expect(w.find('.wave-hud__gate.is-hit').exists()).toBe(false)
    await w.setProps({ phase: 'battle', gateHpPct: 0.8 })
    expect(w.find('.wave-hud__gate.is-hit').exists()).toBe(false)
    w.unmount()
  })
})

describe('first-run banner', () => {
  it('adds the stakes as pictures, and not one extra word', async () => {
    const { default: IncomingBanner } = await import('@/components/game/IncomingBanner.vue')
    const w = mount(IncomingBanner, { ...g })
    expect(w.text().trim()).toBe('Monsters incoming!')
    expect(w.findAll('.incoming__monster canvas')).toHaveLength(2)
    expect(w.find('.incoming__gate canvas').exists()).toBe(true)
    expect(w.find('.incoming__heart .game-icon').exists()).toBe(true)
    w.unmount()
  })
})
