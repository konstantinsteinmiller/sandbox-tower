import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'

// The strips bake on a real canvas; nothing here is about the art.
vi.mock('@/game/monsterSprites', () => ({
  monsterAnchor: () => 'feet',
  monsterFaces: () => 'right',
  monsterFrame: () => null,
  pickMonster: () => 'snaggletusk',
  primeMonsterSprites: () => {},
  SPRITE_FOOT_R: 0.9,
  SPRITE_HEIGHT_R: 0.8
}))

/**
 * ─── The merge power demo holds the tutorial, so it must always let go ──────
 *
 * It plays inside a tutorial beat — and on the phone board with the wave held
 * behind it — so the two properties that matter are about ENDING:
 *
 *   1. it ends itself at six seconds, once, whatever the player does;
 *   2. a tap cannot skip the first half (the lesson is the second shot, and the
 *      click that closed the card before it lands in that window), and can end
 *      it any time after.
 *
 * jsdom has no 2D context, which is the point of running it here: the clock
 * must not depend on the canvas being drawable, or a browser that refused a
 * context would leave the player behind a scrim with taps disabled.
 */

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: { tapToContinue: 'Tap to continue', clickToContinue: 'Click to continue' } }
})

const FRAME = 16

const open = async () => {
  const { default: MergePowerDemo } = await import('@/components/game/MergePowerDemo.vue')
  return mount(MergePowerDemo, {
    props: { modelValue: true, variant: 'cell' },
    global: { plugins: [i18n] },
    attachTo: document.body
  })
}

/** Run the fake clock forward in whole frames, so every rAF gets its turn. */
const play = (ms: number): void => {
  for (let t = 0; t < ms; t += FRAME) vi.advanceTimersByTime(FRAME)
}

describe('merge power demo', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout', 'Date']
    })
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('ends itself six seconds in, exactly once — even with no canvas to draw on', async () => {
    const w = await open()
    play(5_800)
    expect(w.emitted('continue')).toBeUndefined()
    play(400)
    expect(w.emitted('continue')).toHaveLength(1)
    expect(w.emitted('update:modelValue')?.[0]).toEqual([false])
    // Nothing more, however long it is left mounted.
    play(3_000)
    expect(w.emitted('continue')).toHaveLength(1)
    w.unmount()
  })

  it('ignores taps until the tier-3 shot has landed, then ends on the next one', async () => {
    const w = await open()
    play(1_200)
    await w.trigger('click')
    await w.find('.merge-power').trigger('click')
    expect(w.emitted('continue')).toBeUndefined()

    play(2_300)
    await w.find('.merge-power').trigger('click')
    expect(w.emitted('continue')).toHaveLength(1)
    w.unmount()
  })

  it('offers the tap hint only once a tap would do something', async () => {
    const w = await open()
    play(1_500)
    await w.vm.$nextTick()
    expect(w.find('.merge-power__hint').exists()).toBe(false)
    play(2_100)
    await w.vm.$nextTick()
    expect(w.find('.merge-power__hint').exists()).toBe(true)
    w.unmount()
  })
})
