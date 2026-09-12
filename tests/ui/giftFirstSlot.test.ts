import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { defineComponent, h } from 'vue'

// The tile thumbnails paint on a real canvas; nothing here is about the art.
vi.mock('@/components/game/ShapeTile.vue', () => ({
  default: defineComponent({ props: ['shapeId', 'size'], setup: (p) => () => h('i', { class: 'shape', 'data-shape': p.shapeId }) })
}))

/**
 * ─── A won piece stands in the hand's first slot ────────────────────────────
 *
 * The gift used to float in a row of its own above the hand, where the eye had
 * to learn to look. It now borrows slot 0 — the structure lane, walls only —
 * until it is placed, and the wall comes back after. What must hold, on both
 * trays: while a gift is first, the gift slot renders and slot 0's own tile is
 * not reachable; the other slots are untouched; and without a gift the tray is
 * exactly the hand it always was.
 */

const i18n = createI18n({ legacy: false, locale: 'en', missingWarn: false, fallbackWarn: false, messages: { en: {} } })

const Gift = defineComponent({ props: ['size'], setup: (p) => () => h('b', { class: 'gift-stub', 'data-size': p.size }) })

const visible = (el: Element): boolean => (el as HTMLElement).style.display !== 'none'

describe('the phone hand', () => {
  const mountTray = async (giftFirst: boolean) => {
    const { default: DropTray } = await import('@/mobile-fit/components/DropTray.vue')
    return mount(DropTray, {
      props: {
        offers: ['b_wood', 'b_cannon', 'b_archer'], enhanced: [false, false, false], selected: null,
        materials: 999, gold: 999, rerollSeconds: [0, 0, 0], volleyReady: false, inBattle: false,
        volleyCharge: 0, volleyWavesLeft: 1, giftFirst
      },
      slots: { gift: () => h(Gift) },
      global: { plugins: [i18n] }
    })
  }

  it('puts the gift in the first slot and hides the wall that was there', async () => {
    const w = await mountTray(true)
    const slots = w.findAll('.tray__slot')
    // The gift's slot comes first, then the three offers — slot 0's hidden.
    expect(slots[0]!.find('.gift-stub').exists()).toBe(true)
    const offerTiles = slots.slice(1)
    expect(offerTiles.map((s) => visible(s.element))).toEqual([false, true, true])
    expect(offerTiles[1]!.find('[data-shape="b_cannon"]').exists()).toBe(true)
  })

  it('is the hand it always was when there is no gift', async () => {
    const w = await mountTray(false)
    expect(w.find('.gift-stub').exists()).toBe(false)
    const slots = w.findAll('.tray__slot')
    expect(slots).toHaveLength(3)
    expect(slots.map((s) => visible(s.element))).toEqual([true, true, true])
  })
})

describe('the tower hand', () => {
  const mountTray = async (giftFirst: boolean) => {
    const { default: BuildTray } = await import('@/components/game/BuildTray.vue')
    return mount(BuildTray, {
      props: {
        selected: null, offers: ['w1', 'cannon1', 'w2', 'archer1', 'sawmill1'],
        wood: 999, stone: 999, coins: 999, giftFirst
      },
      slots: { gift: (p: { size: number }) => h(Gift, { size: p.size }) },
      global: { plugins: [i18n] }
    })
  }

  it('puts the gift in the first slot at the tray\'s own tile size', async () => {
    const w = await mountTray(true)
    const gift = w.find('.build-tray__slot[data-slot="gift"] .gift-stub')
    expect(gift.exists()).toBe(true)
    expect(Number(gift.attributes('data-size'))).toBeGreaterThanOrEqual(44)
    expect(visible(w.find('.build-tray__slot[data-slot="0"]').element)).toBe(false)
    // The tutorial's handle on the weapon slot is untouched.
    expect(visible(w.find('.build-tray__slot[data-slot="1"]').element)).toBe(true)
  })

  it('is the hand it always was when there is no gift', async () => {
    const w = await mountTray(false)
    expect(w.find('[data-slot="gift"]').exists()).toBe(false)
    expect(visible(w.find('.build-tray__slot[data-slot="0"]').element)).toBe(true)
  })
})

describe('rank insignia', () => {
  it('wears chevrons to rank 3, a lieutenant\'s star at 4 and a major\'s wreath at 5', async () => {
    const { rankInsignia } = await import('@/use/useTowerArt')
    expect(rankInsignia(0)).toBeNull()
    expect(rankInsignia(1)).toEqual({ kind: 'chevrons', n: 1 })
    expect(rankInsignia(2)).toEqual({ kind: 'chevrons', n: 2 })
    expect(rankInsignia(3)).toEqual({ kind: 'chevrons', n: 3 })
    expect(rankInsignia(4)).toEqual({ kind: 'star' })
    expect(rankInsignia(5)).toEqual({ kind: 'wreath' })
  })

  it('has a picture for every rank a block can reach', async () => {
    const { rankInsignia } = await import('@/use/useTowerArt')
    const { MAX_BLOCK_LEVEL } = await import('@/game/blocks')
    for (let r = 1; r <= MAX_BLOCK_LEVEL; r++) expect(rankInsignia(r), `rank ${r}`).not.toBeNull()
  })
})
