import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'

vi.mock('@/use/useSound', () => ({
  default: () => ({ playSound: () => null })
}))

/**
 * ─── The flying chest ───────────────────────────────────────────────────────
 *
 * The contract, in the order a player meets it: nothing flies before the chest
 * is possible at all; the FIRST one follows within about five seconds, because
 * its job is to show a newcomer there are guns here they have not met; after
 * that one every forty-five seconds of unpaused play, counted from the moment
 * the last one left the sky. A held game holds the chest in the air; an ignored
 * chest flies off with nothing paid; a tapped one pays exactly one gift — free
 * the first time ever, a half-price buy after that.
 */

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: { gift: { chest: 'Flying chest' } } }
})

const FRAME = 16

const setup = async (props: { ready: boolean; wave: number; paused?: boolean }) => {
  vi.resetModules()
  localStorage.clear()
  const game = await import('@/use/useTowerGame')
  game.startRun()
  const gifts = await import('@/use/useGifts')
  const { default: FlyingChest } = await import('@/components/game/FlyingChest.vue')
  const w = mount(FlyingChest, { props, global: { plugins: [i18n] }, attachTo: document.body })
  return { w, gifts, game }
}

const play = (ms: number): void => {
  for (let t = 0; t < ms; t += FRAME) vi.advanceTimersByTime(FRAME)
}

const chest = (w: Awaited<ReturnType<typeof setup>>['w']) => w.find('.fchest')

describe('flying chest', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date']
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('stays grounded until the run is ready, then flies about five seconds in', async () => {
    const { w } = await setup({ ready: false, wave: 1 })
    play(20_000)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(false)

    await w.setProps({ ready: true })
    // Four seconds in it is still waiting…
    play(4_000)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(false)
    // …and by six it is in the sky.
    play(2_000)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(true)
    w.unmount()
  })

  it('pays exactly one gift when tapped, free the first time, then is gone', async () => {
    const { w, gifts } = await setup({ ready: true, wave: 1 })
    play(5_500)
    await w.vm.$nextTick()
    await chest(w).trigger('pointerdown')
    await chest(w).trigger('pointerdown')
    expect(gifts.gifts.value).toHaveLength(1)
    expect(gifts.gifts.value[0]!.source).toBe('chest')
    // The first chest a player ever opens gives its piece away; the next one
    // is a half-price buy (`grantChestGift`).
    expect(gifts.gifts.value[0]!.free).toBe(true)
    expect(w.emitted('opened')).toHaveLength(1)
    play(600)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(false)

    // The second chest of the run, forty-five seconds later, is paid for.
    play(45_500)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(true)
    await chest(w).trigger('pointerdown')
    expect(gifts.gifts.value).toHaveLength(2)
    expect(gifts.gifts.value[1]!.free).toBe(false)
    w.unmount()
  })

  it('flies off unopened after its crossing, paying nothing', async () => {
    const { w, gifts } = await setup({ ready: true, wave: 1 })
    play(5_500)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(true)
    play(9_500)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(false)
    expect(gifts.gifts.value).toHaveLength(0)
    w.unmount()
  })

  it('hangs in the air while the game is held', async () => {
    const { w } = await setup({ ready: true, wave: 1 })
    play(5_500)
    await w.setProps({ paused: true })
    play(30_000)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(true)
    await w.setProps({ paused: false })
    play(9_500)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(false)
    w.unmount()
  })

  it('waits forty-five seconds between chests, whatever the waves do', async () => {
    const { w } = await setup({ ready: true, wave: 1 })
    play(5_500)
    play(9_500)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(false)

    // A whole wave turning over in that gap buys no extra chest.
    await w.setProps({ wave: 2 })
    play(20_000)
    await w.setProps({ wave: 3 })
    play(20_000)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(false)

    play(6_000)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(true)
    w.unmount()
  })

  it('does not restart the early timer when a result screen closes onto the run', async () => {
    const { w } = await setup({ ready: true, wave: 2 })
    play(5_500)
    play(9_500)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(false)
    // A defeat screen, then a continue back into the same run: the next chest
    // is the long gap away, not five seconds.
    await w.setProps({ ready: false })
    play(2_000)
    await w.setProps({ ready: true })
    play(10_000)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(false)
    play(36_000)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(true)
    w.unmount()
  })

  it('owes a new run an early chest again', async () => {
    const { w } = await setup({ ready: true, wave: 6 })
    play(5_500)
    play(9_500)
    await w.setProps({ wave: 0 })
    await w.setProps({ wave: 1 })
    play(5_500)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(true)
    w.unmount()
  })

  it('does not take off while the gift tray is full, and tries again later', async () => {
    const { w, gifts } = await setup({ ready: true, wave: 1 })
    for (let i = 0; i < gifts.MAX_GIFTS; i++) gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest' })
    play(8_000)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(false)

    // Room made: the grounded chest comes back round without waiting out a
    // whole forty-five second gap.
    gifts.clearGifts()
    play(10_500)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(true)
    w.unmount()
  })

  it('answers the QA cue at once', async () => {
    const { w, game } = await setup({ ready: false, wave: 0 })
    game.requestFlyingChest()
    await w.vm.$nextTick()
    play(50)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(true)
    w.unmount()
  })
})
