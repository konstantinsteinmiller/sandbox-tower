import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import BuildTray from '@/components/game/BuildTray.vue'
import CallWaveButton from '@/components/game/CallWaveButton.vue'

/**
 * ─── "Now do it again" ──────────────────────────────────────────────────────
 *
 * The coach marks end on the press that starts wave 1. Then the field clears
 * and the game goes quiet with nothing on screen saying it is waiting — which
 * is where the desktop funnel loses its second batch of players.
 *
 * So the build phase between wave 1 and wave 2 keeps pointing, in the gold the
 * coach marks just trained: an arrow and a hop over the weapon in the hand,
 * and another over Call Wave. Two properties matter and both are the kind that
 * rot silently — the cue has to APPEAR where it is meant to, and it has to be
 * GONE everywhere else, because a HUD that keeps jumping after the lesson has
 * landed is worse than one that never jumped.
 */

const i18n = createI18n({
  legacy: false, locale: 'en', missingWarn: false, fallbackWarn: false, messages: { en: {} }
})

const tray = (pointSlot: number | null, wood = 500) => mount(BuildTray, {
  props: {
    selected: null,
    // A wall in slot 0 and a cannon in the weapon slot.
    offers: ['w1', 'cannon1'],
    wood,
    stone: 500,
    coins: 0,
    pointSlot
  },
  global: { plugins: [i18n], stubs: { ShapeTile: true } }
})

/** Two ticks: the arrow is placed from a measured rect taken on the first, and
 *  the `v-if` it drives renders on the second. */
const settle = async (): Promise<void> => { await nextTick(); await nextTick() }

const callWave = (props: Record<string, unknown>) => mount(CallWaveButton, {
  props: {
    phase: 'build',
    timeLeft: 12_000,
    bonusPct: 30,
    speed: 1,
    bossIncoming: false,
    ...props
  },
  global: { plugins: [i18n], stubs: { IconCoin: true } }
})

describe('the pointed tray tile', () => {
  it('arrows and hops exactly the slot it is given', async () => {
    const w = tray(1)
    await settle()
    const tiles = w.findAll('.build-tray__tile')
    expect(tiles.map((t) => t.classes().includes('is-point'))).toEqual([false, true])
    expect(w.findAll('.pointer-arrow')).toHaveLength(1)
    w.unmount()
  })

  it('points at nothing by default', async () => {
    const w = tray(null)
    await settle()
    expect(w.findAll('.build-tray__tile.is-point')).toHaveLength(0)
    expect(w.findAll('.pointer-arrow')).toHaveLength(0)
    w.unmount()
  })

  it('anchors the arrow OUTSIDE the scroller, which would clip it', async () => {
    const w = tray(1)
    await settle()
    // `.build-tray__scroll` is `overflow-y: hidden` — it scrolls sideways on a
    // narrow hand — so an arrow drawn above a tile from inside it is cut off.
    // It lives in the tray root and is placed by measurement instead.
    const anchor = w.find('.build-tray__pointer')
    expect(anchor.exists()).toBe(true)
    expect(w.find('.build-tray__scroll').find('.pointer-arrow').exists()).toBe(false)
    expect(anchor.attributes('style')).toContain('left:')
    w.unmount()
  })

  it('stops pointing when the slot is taken away', async () => {
    const w = tray(1)
    await settle()
    expect(w.findAll('.pointer-arrow')).toHaveLength(1)
    await w.setProps({ pointSlot: null })
    await settle()
    expect(w.findAll('.pointer-arrow')).toHaveLength(0)
    expect(w.findAll('.build-tray__tile.is-point')).toHaveLength(0)
    w.unmount()
  })

  it('outranks the idle pulse — the arrow is the only thing moving', async () => {
    // These used to be allowed to stack, on the argument that a hop and a pulse
    // read as two different cues. They do; there were just too many of them.
    // With four affordable offers the row had the arrow hopping on one tile and
    // a blue ring breathing out of all of them, and it read as the hand
    // malfunctioning rather than as an instruction (reported from play, with a
    // screenshot). The arrow names ONE tile, so while it is up nothing else in
    // the row moves.
    const w = mount(BuildTray, {
      props: {
        selected: null,
        offers: ['w1', 'cannon1'],
        wood: 500,
        stone: 500,
        coins: 0,
        nudge: true,
        pointSlot: 1
      },
      global: { plugins: [i18n], stubs: { ShapeTile: true } }
    })
    const weapon = w.findAll('.build-tray__tile')[1]!
    expect(weapon.classes()).toContain('is-point')
    expect(w.findAll('.build-tray__tile.is-nudge')).toHaveLength(0)
    w.unmount()
  })
})

describe('the pointed Call Wave button', () => {
  it('arrows and hops when nudged', () => {
    const w = callWave({ nudge: true })
    expect(w.find('.call-wave__btn').classes()).toContain('is-nudge')
    expect(w.findAll('.pointer-arrow')).toHaveLength(1)
    w.unmount()
  })

  it('does neither by default', () => {
    const w = callWave({})
    expect(w.find('.call-wave__btn').classes()).not.toContain('is-nudge')
    expect(w.findAll('.pointer-arrow')).toHaveLength(0)
    w.unmount()
  })

  it('never doubles up with the coach mark, which brings its own arrow', () => {
    // The tutorial's last beat dims the screen and points at this button. A
    // second gold arrow outside the hole reads as a rendering fault.
    const w = callWave({ nudge: true, attention: true })
    expect(w.findAll('.pointer-arrow')).toHaveLength(0)
    expect(w.find('.call-wave__btn').classes()).toContain('is-attention')
    expect(w.find('.call-wave__btn').classes()).not.toContain('is-nudge')
    w.unmount()
  })

  it('is gone the moment the wave starts — the button is a speed switch then', () => {
    const w = callWave({ nudge: true, phase: 'battle' })
    expect(w.findAll('.pointer-arrow')).toHaveLength(0)
    expect(w.findAll('.call-wave__btn')).toHaveLength(0)
    w.unmount()
  })

  it('still calls the wave when pressed', async () => {
    const w = callWave({ nudge: true })
    await w.find('.call-wave__btn').trigger('click')
    expect(w.emitted('call')).toHaveLength(1)
    w.unmount()
  })
})
