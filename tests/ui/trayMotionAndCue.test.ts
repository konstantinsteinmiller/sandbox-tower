import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import BuildTray from '@/components/game/BuildTray.vue'
import { shapeCost } from '@/game/shapes'

/**
 * ─── One thing moving at a time ─────────────────────────────────────────────
 *
 * The hand used to pulse EVERY affordable offer when the player went quiet, on
 * top of the gold arrow hopping one tile, the gift breathing in slot 0 and the
 * reinforced cards sweeping. With four affordable pieces that is four boxes
 * swelling in the same rhythm with a ring breathing out of each — reported
 * from play, with a screenshot, as the tray looking broken rather than
 * inviting.
 *
 * The rule now: the arrow outranks everything, and the idle nudge picks ONE
 * tile. These tests pin the count, because "how many things are moving" is
 * exactly the property that rots back the moment somebody adds a cue.
 */

const i18n = createI18n({
  legacy: false, locale: 'en', missingWarn: false, fallbackWarn: false, messages: { en: {} }
})

const tray = (props: Record<string, unknown>) => mount(BuildTray, {
  props: {
    selected: null,
    wood: 9_999,
    stone: 9_999,
    coins: 9_999,
    ...props
  },
  global: { plugins: [i18n], stubs: { ShapeTile: true } }
})

describe('the idle nudge', () => {
  it('pulses exactly ONE tile, however many the player can afford', async () => {
    const w = tray({ offers: ['w1', 'w2h', 's1', 'sL'], nudge: true })
    await nextTick()
    // Every one of them is affordable at 9,999 of each…
    expect(w.findAll('.build-tray__tile.is-poor')).toHaveLength(0)
    // …and exactly one is pulsing.
    expect(w.findAll('.build-tray__tile.is-nudge')).toHaveLength(1)
    w.unmount()
  })

  it('picks the cheapest affordable offer', async () => {
    // Derived from the real cost function rather than hardcoded, so a balance
    // change moves the expectation with it instead of breaking the test.
    const offers = ['sL', 'w1', 's1']
    const cheapest = offers
      .map((id, slot) => ({ slot, c: shapeCost(id) }))
      .filter((x) => x.c.coins === 0)
      .sort((a, b) => (a.c.wood + a.c.stone) - (b.c.wood + b.c.stone))[0]!
    const w = tray({ offers, nudge: true })
    await nextTick()
    const nudged = w.findAll('.build-tray__tile').findIndex((t) => t.classes().includes('is-nudge'))
    expect(nudged).toBe(cheapest.slot)
    w.unmount()
  })

  it('never nudges a piece the player cannot pay for', async () => {
    const w = tray({ offers: ['w1', 'w2h'], nudge: true, wood: 0, stone: 0, coins: 0 })
    await nextTick()
    expect(w.findAll('.build-tray__tile.is-nudge')).toHaveLength(0)
    w.unmount()
  })

  it('skips slot 0 while the gift is standing in it', async () => {
    // Slot 0 is `v-show`n away when a gift borrows the lane. Nudging a hidden
    // tile would pulse nothing at all, so the idle cue would silently stop
    // existing for as long as a prize was waiting.
    const w = tray({ offers: ['w1', 'w2h'], nudge: true, giftFirst: true })
    await nextTick()
    const nudged = w.findAll('.build-tray__tile').findIndex((t) => t.classes().includes('is-nudge'))
    expect(nudged).toBe(1)
    w.unmount()
  })

  it('never pulses the tile the player is holding', async () => {
    // A desktop drag keeps the carried piece SELECTED for the whole gesture, so
    // a nudge on that tile would beat away under the cursor until it is dropped.
    const w = tray({ offers: ['w1', 'w2h'], nudge: true, selected: 0 })
    await nextTick()
    const nudged = w.findAll('.build-tray__tile').findIndex((t) => t.classes().includes('is-nudge'))
    expect(nudged).toBe(1)
    w.unmount()
  })

  it('goes quiet when the only affordable tile is the one being held', async () => {
    const w = tray({ offers: ['w1'], nudge: true, selected: 0 })
    await nextTick()
    expect(w.findAll('.build-tray__tile.is-nudge')).toHaveLength(0)
    w.unmount()
  })

  it('stands down entirely while the arrow is pointing', async () => {
    const w = tray({ offers: ['w1', 'w2h', 's1'], nudge: true, pointSlot: 2 })
    await nextTick()
    expect(w.findAll('.build-tray__tile.is-nudge')).toHaveLength(0)
    expect(w.findAll('.build-tray__tile.is-point')).toHaveLength(1)
    w.unmount()
  })
})

describe('the drag-start contract', () => {
  it('reports every press with its slot and the raw event', async () => {
    const w = tray({ offers: ['w1', 'w2h'] })
    await nextTick()
    await w.findAll('.build-tray__tile')[1]!.trigger('pointerdown')
    const fired = w.emitted('drag-start')
    expect(fired).toHaveLength(1)
    expect(fired![0]![0]).toBe(1)
    expect(fired![0]![1]).toBeInstanceOf(Event)
    w.unmount()
  })

  it('leaves the tap that arms a slot exactly as it was', async () => {
    // The scene decides whether a press becomes a carry; the tray must not
    // pre-empt that by swallowing the click that arms the piece.
    const w = tray({ offers: ['w1', 'w2h'] })
    await nextTick()
    const tile = w.findAll('.build-tray__tile')[1]!
    await tile.trigger('pointerdown')
    await tile.trigger('click')
    expect(w.emitted('select')).toEqual([[1]])
    w.unmount()
  })

  it('carries the slot index on the tile itself, for measurement', async () => {
    const w = tray({ offers: ['w1', 'w2h'] })
    await nextTick()
    expect(w.findAll('.build-tray__tile')[1]!.attributes('data-slot')).toBe('1')
    w.unmount()
  })
})
