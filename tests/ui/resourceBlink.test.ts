import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'

const { playSound } = vi.hoisted(() => ({ playSound: vi.fn() }))
vi.mock('@/use/useSound', () => ({ default: () => ({ playSound }) }))

import {
  denyPurchase, blinkResources, isBlinking, resourceBlink, resetResourceBlink, BLINK_MS
} from '@/use/useResourceBlink'
import ResourceBar from '@/components/game/ResourceBar.vue'
import TopStrip from '@/mobile-fit/components/TopStrip.vue'

/**
 * ─── "You cannot pay for that" ──────────────────────────────────────────────
 *
 * A phone player out of materials hammered a column and heard and saw nothing.
 * A refused purchase now blinks the SHORT piles red and white for 1.5 s and
 * knocks — and a second refusal restarts the blink rather than stacking.
 */

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['performance', 'Date', 'setTimeout', 'clearTimeout'] })
  resetResourceBlink()
  playSound.mockClear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('denyPurchase', () => {
  it('does nothing at all when nothing is missing', () => {
    expect(denyPurchase([])).toBe(false)
    expect(playSound).not.toHaveBeenCalled()
    expect(resourceBlink.value.wood.n).toBe(0)
    expect(resourceBlink.value.coins.n).toBe(0)
  })

  it('blinks only the short piles, and knocks', () => {
    expect(denyPurchase(['wood', 'coins'])).toBe(true)
    expect(resourceBlink.value.wood.n).toBe(1)
    expect(resourceBlink.value.coins.n).toBe(1)
    expect(resourceBlink.value.stone.n).toBe(0)
    expect(isBlinking('wood')).toBe(true)
    expect(isBlinking('stone')).toBe(false)
    expect(playSound).toHaveBeenCalledTimes(1)
    expect(playSound).toHaveBeenCalledWith('obstacle-hit', 0.05, 0.72)
  })

  it('blinks for 1.5 s, then stops', () => {
    denyPurchase(['stone'])
    vi.advanceTimersByTime(BLINK_MS - 10)
    expect(isBlinking('stone')).toBe(true)
    vi.advanceTimersByTime(20)
    expect(isBlinking('stone')).toBe(false)
    expect(BLINK_MS).toBe(1500)
  })

  it('restarts the blink on every refusal but throttles the knock', () => {
    // A thumb hammering a column: five refusals inside 200 ms.
    for (let i = 0; i < 5; i++) {
      denyPurchase(['wood'])
      vi.advanceTimersByTime(40)
    }
    // Every one restarts the blink (the counter the bars key on)...
    expect(resourceBlink.value.wood.n).toBe(5)
    // ...but only the first is heard.
    expect(playSound).toHaveBeenCalledTimes(1)
    // A refusal 1.4 s after the LAST one is still inside that one's 1.5 s.
    vi.advanceTimersByTime(1400)
    expect(isBlinking('wood')).toBe(true)
    // Past the gap, the knock comes back.
    denyPurchase(['wood'])
    expect(playSound).toHaveBeenCalledTimes(2)
  })
})

describe('the bars', () => {
  const i18n = createI18n({ legacy: false, locale: 'en', missingWarn: false, fallbackWarn: false, messages: { en: { hud: { wave: 'Wave' } } } })

  it('ResourceBar blinks the missing pile and leaves the others alone', async () => {
    const w = mount(ResourceBar, { props: { wood: 3, stone: 1, coins: 0 } })
    expect(w.findAll('.res-deny.is-denied')).toHaveLength(0)

    blinkResources(['stone'])
    await nextTick()
    expect(w.find('[data-res="stone"]').classes()).toContain('is-denied')
    expect(w.find('[data-res="wood"]').classes()).not.toContain('is-denied')
    expect(w.find('[data-res="coins"]').classes()).not.toContain('is-denied')
    w.unmount()
  })

  it('remounts the icon on a second refusal, so the blink starts over', async () => {
    const w = mount(ResourceBar, { props: { wood: 3, stone: 1, coins: 0 } })
    blinkResources(['coins'])
    await nextTick()
    const first = w.find('[data-res="coins"]').element
    vi.advanceTimersByTime(300)
    blinkResources(['coins'])
    await nextTick()
    const second = w.find('[data-res="coins"]').element
    expect(second).not.toBe(first)
    expect(w.find('[data-res="coins"]').classes()).toContain('is-denied')
    w.unmount()
  })

  it('TopStrip blinks materials and gold — the only two piles the phone shows', async () => {
    const w = mount(TopStrip, {
      props: { wave: 3, bestWave: 5, materials: 4, gold: 0, phase: 'battle', enemiesLeft: 2 },
      global: { plugins: [i18n], stubs: { CoinBadge: true } }
    })
    blinkResources(['wood', 'coins'])
    await nextTick()
    expect(w.find('[data-res="wood"]').classes()).toContain('is-denied')
    expect(w.find('[data-res="coins"]').classes()).toContain('is-denied')
    expect(w.find('[data-res="stone"]').exists()).toBe(false)
    w.unmount()
  })

  it('does not replay an old refusal on a bar that mounts after it', async () => {
    blinkResources(['wood'])
    vi.advanceTimersByTime(BLINK_MS + 500)
    const w = mount(ResourceBar, { props: { wood: 3, stone: 1, coins: 0 } })
    await nextTick()
    expect(w.find('[data-res="wood"]').classes()).not.toContain('is-denied')
    w.unmount()
  })
})
