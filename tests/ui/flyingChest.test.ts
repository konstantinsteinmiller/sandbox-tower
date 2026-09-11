import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'

vi.mock('@/use/useSound', () => ({
  default: () => ({ playSound: () => null })
}))

/**
 * ─── The flying chest ───────────────────────────────────────────────────────
 *
 * The contract, in the order a player meets it: nothing flies before the
 * tutorial is done; the first chest follows its end within a couple of
 * seconds; after that there is one per wave; a held game holds the chest in
 * the air; an ignored chest flies off with nothing paid; a tapped one pays
 * exactly one gift.
 */

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: { gift: { chest: 'Flying chest' } } }
})

const FRAME = 16

const setup = async (props: { tutorialDone?: boolean; ready: boolean; wave: number; phase: 'build' | 'battle' | 'defeat'; paused?: boolean }) => {
  vi.resetModules()
  localStorage.clear()
  const game = await import('@/use/useTowerGame')
  game.startRun()
  const gifts = await import('@/use/useGifts')
  const { default: FlyingChest } = await import('@/components/game/FlyingChest.vue')
  const w = mount(FlyingChest, { props: { tutorialDone: props.ready, ...props }, global: { plugins: [i18n] }, attachTo: document.body })
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

  it('stays grounded until the tutorial is done, then flies within two seconds', async () => {
    const { w } = await setup({ ready: false, wave: 1, phase: 'battle' })
    play(20_000)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(false)

    await w.setProps({ tutorialDone: true, ready: true })
    play(1_500)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(true)
    w.unmount()
  })

  it('pays exactly one gift when tapped, then is gone', async () => {
    const { w, gifts } = await setup({ ready: false, wave: 1, phase: 'battle' })
    await w.setProps({ tutorialDone: true, ready: true })
    play(1_500)
    await w.vm.$nextTick()
    await chest(w).trigger('pointerdown')
    await chest(w).trigger('pointerdown')
    expect(gifts.gifts.value).toHaveLength(1)
    expect(gifts.gifts.value[0]!.source).toBe('chest')
    expect(w.emitted('opened')).toHaveLength(1)
    play(600)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(false)
    w.unmount()
  })

  it('flies off unopened after its crossing, paying nothing', async () => {
    const { w, gifts } = await setup({ ready: false, wave: 1, phase: 'battle' })
    await w.setProps({ tutorialDone: true, ready: true })
    play(1_500)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(true)
    play(9_500)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(false)
    expect(gifts.gifts.value).toHaveLength(0)
    w.unmount()
  })

  it('hangs in the air while the game is held', async () => {
    const { w } = await setup({ ready: false, wave: 1, phase: 'battle' })
    await w.setProps({ tutorialDone: true, ready: true })
    play(1_500)
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

  it('flies once per wave — not twice in one, and again in the next', async () => {
    const { w } = await setup({ ready: false, wave: 1, phase: 'battle' })
    await w.setProps({ tutorialDone: true, ready: true })
    play(1_500)
    play(9_500)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(false)

    // The rest of wave 1 and its build phase: no second chest.
    play(10_000)
    await w.setProps({ phase: 'build' })
    play(10_000)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(false)

    await w.setProps({ wave: 2, phase: 'battle' })
    play(7_500)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(true)
    w.unmount()
  })

  it('does not fly again when a result screen closes onto the same wave', async () => {
    const { w } = await setup({ tutorialDone: true, ready: true, wave: 2, phase: 'battle' })
    play(7_500)
    play(9_500)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(false)
    // A defeat screen, then a continue back into the same wave.
    await w.setProps({ ready: false })
    play(2_000)
    await w.setProps({ ready: true })
    play(10_000)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(false)
    w.unmount()
  })

  it('owes a new run its chests from wave 1 again', async () => {
    const { w } = await setup({ tutorialDone: true, ready: true, wave: 6, phase: 'battle' })
    play(7_500)
    play(9_500)
    await w.setProps({ wave: 0, phase: 'build' })
    await w.setProps({ wave: 1, phase: 'battle' })
    play(7_500)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(true)
    w.unmount()
  })

  it('does not take off while the gift tray is full', async () => {
    const { w, gifts } = await setup({ ready: true, wave: 1, phase: 'build' })
    for (let i = 0; i < gifts.MAX_GIFTS; i++) gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest' })
    await w.setProps({ phase: 'battle' })
    play(8_000)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(false)
    w.unmount()
  })

  it('answers the QA cue at once', async () => {
    const { w, game } = await setup({ ready: false, wave: 0, phase: 'build' })
    game.requestFlyingChest()
    await w.vm.$nextTick()
    play(50)
    await w.vm.$nextTick()
    expect(chest(w).exists()).toBe(true)
    w.unmount()
  })
})
