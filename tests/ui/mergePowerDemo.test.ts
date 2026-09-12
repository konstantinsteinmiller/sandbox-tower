import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
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
 * ─── The merge power demo: one lesson, six seconds, and it always lets go ───
 *
 * A tier-1 cannon and a tier-3 cannon, side by side, each firing twice in step
 * at its own grumpling. Three properties carry it:
 *
 *   1. THE LESSON: when it ends, the grumpling the tier 3 shot at is dead and
 *      the one the tier 1 shot at is still standing — most of its bar left.
 *      Everything else on the card is staging for that one comparison.
 *   2. It ends itself at six seconds, once, whatever the player does. It plays
 *      inside a tutorial beat — on the phone board with the wave held behind
 *      it — so an end that could be missed is a player stranded.
 *   3. A tap cannot skip it before the kill has landed AND its bar has drained
 *      (the click that closed the card before it arrives in that window), and
 *      ends it any time after.
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

const open = async (variant: 'cell' | 'footprint' = 'cell') => {
  const { default: MergePowerDemo } = await import('@/components/game/MergePowerDemo.vue')
  return mount(MergePowerDemo, {
    props: { modelValue: true, variant },
    global: { plugins: [i18n] },
    attachTo: document.body
  })
}

/** Run the fake clock forward in whole frames, so every rAF gets its turn. */
const play = (ms: number): void => {
  for (let t = 0; t < ms; t += FRAME) vi.advanceTimersByTime(FRAME)
}

type Pair = { left: number; right: number }
type Demo = { healthOf: () => Pair; trailOf: () => Pair }

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

  it.each(['cell', 'footprint'] as const)(
    '%s: the tier 3 kills its grumpling in two shots; the tier 1 leaves its own standing',
    async (variant) => {
      const w = await open(variant)
      const demo = w.vm as unknown as Demo
      expect(demo.healthOf()).toEqual({ left: 1, right: 1 })

      // Both guns fire on the same frames: after the first volley both bars
      // have moved, by a tenth and by three quarters.
      play(1_000)
      const first = demo.healthOf()
      expect(first.left).toBeCloseTo(0.9, 6)
      expect(first.right).toBeCloseTo(0.25, 6)

      // After the second, the right one is gone and the left one is still at
      // most of its bar — the whole comparison, at one moment.
      play(1_200)
      const second = demo.healthOf()
      expect(second.right).toBe(0)
      expect(second.left).toBeCloseTo(0.8, 6)
      w.unmount()
    }
  )

  it('leaves the chunk each hit took on the bar, then drains it onto the new health', async () => {
    const w = await open()
    const demo = w.vm as unknown as Demo
    // A quarter of a second after the first volley: the tier 3 took three
    // quarters, and the trail still holds the bar where it was.
    play(1_000)
    expect(demo.healthOf().right).toBeCloseTo(0.25, 6)
    expect(demo.trailOf().right).toBe(1)
    expect(demo.trailOf().left).toBe(1)

    // Just after the kill shot: the bar is empty, the kill's chunk still up.
    play(1_000)
    expect(demo.healthOf().right).toBe(0)
    expect(demo.trailOf().right).toBeCloseTo(0.25, 6)

    // A second later both trails have drained onto what is left.
    play(1_100)
    expect(demo.trailOf().right).toBe(0)
    expect(demo.trailOf().left).toBeCloseTo(0.8, 6)
    w.unmount()
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

  it('ignores taps until the kill has landed and drained, then ends on the next one', async () => {
    const w = await open()
    play(1_200)
    await w.find('.merge-power').trigger('click')
    expect(w.emitted('continue')).toBeUndefined()

    // The kill has landed, but its bar is still draining: still held.
    play(1_200)
    await w.find('.merge-power').trigger('click')
    expect(w.emitted('continue')).toBeUndefined()

    play(700)
    await w.find('.merge-power').trigger('click')
    expect(w.emitted('continue')).toHaveLength(1)
    w.unmount()
  })

  it.each(['cell', 'footprint'] as const)(
    '%s: paints all six seconds — bars, trails, glow and guns — without a bad number',
    async (variant) => {
      // Every canvas, the demo's own and the art layer's sprite bakes, gets a
      // recording context that rejects NaN and Infinity anywhere it is handed
      // a number.
      const bad: string[] = []
      const check = (name: string, args: unknown[]): void => {
        for (const a of args) if (typeof a === 'number' && !Number.isFinite(a)) bad.push(`${name}(${args.join(', ')})`)
      }
      const gradient = {
        addColorStop: (o: number) => { if (!Number.isFinite(o) || o < 0 || o > 1) bad.push(`addColorStop(${o})`) }
      }
      const makeCtx = (canvas: HTMLCanvasElement) => {
        const ctx: Record<string, unknown> = { canvas }
        for (const name of [
          'beginPath', 'closePath', 'moveTo', 'lineTo', 'arc', 'arcTo', 'ellipse', 'quadraticCurveTo',
          'bezierCurveTo', 'rect', 'fill', 'stroke', 'clip', 'fillRect', 'strokeRect', 'clearRect',
          'fillText', 'strokeText', 'drawImage', 'translate', 'rotate', 'scale', 'transform',
          'setTransform', 'resetTransform', 'setLineDash', 'save', 'restore', 'putImageData'
        ]) ctx[name] = (...args: unknown[]) => { check(name, args) }
        ctx.measureText = () => ({ width: 10 })
        ctx.createLinearGradient = (...a: number[]) => { check('createLinearGradient', a); return gradient }
        ctx.createRadialGradient = (...a: number[]) => { check('createRadialGradient', a); return gradient }
        ctx.createPattern = () => ({})
        ctx.getImageData = (_x: number, _y: number, w: number, h: number) =>
          ({ data: new Uint8ClampedArray(Math.max(4, w * h * 4)), width: w, height: h })
        for (const prop of [
          'fillStyle', 'strokeStyle', 'shadowColor', 'font', 'textAlign', 'textBaseline', 'lineJoin',
          'lineCap', 'globalCompositeOperation', 'filter'
        ]) ctx[prop] = ''
        for (const prop of ['globalAlpha', 'lineWidth', 'shadowBlur']) ctx[prop] = 1
        return ctx
      }
      vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation(function (this: HTMLCanvasElement) {
        return makeCtx(this) as unknown as CanvasRenderingContext2D
      } as never)
      const size = (v: number) => ({ configurable: true, get: () => v })
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', size(390))
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', size(760))
      try {
        const w = await open(variant)
        play(6_200)
        expect(w.emitted('continue')).toHaveLength(1)
        expect(bad).toEqual([])
        w.unmount()
      } finally {
        delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientWidth
        delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight
      }
    }
  )

  it('offers the tap hint only once a tap would do something', async () => {
    const w = await open()
    play(2_500)
    await w.vm.$nextTick()
    expect(w.find('.merge-power__hint').exists()).toBe(false)
    play(600)
    await w.vm.$nextTick()
    expect(w.find('.merge-power__hint').exists()).toBe(true)
    w.unmount()
  })
})
