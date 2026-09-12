import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import WaveBar from '@/mobile-fit/components/WaveBar.vue'
import PointerArrow from '@/components/game/PointerArrow.vue'

/**
 * ─── Blueprints on the phone's bottom bar ───────────────────────────────────
 *
 * The phone's tech tree used to be one of the buttons inside the `…` drawer,
 * and three of five blind testers found it only after their second defeat. It
 * now sits beside the drawer's button for good, carries the affordable badge,
 * and from stage 2 wears the gold aura plus the yellow arrow until opened.
 */

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: { en: { tech: { blueprints: { title: 'Blueprints' } }, mobile: { menu: 'Menu' } } }
})

const bar = (props: Record<string, unknown> = {}) => mount(WaveBar, {
  props: {
    phase: 'build',
    timeLeft: 5000,
    bonusPct: 0,
    speed: 1,
    bossIncoming: false,
    speedBuffLeft: 0,
    speeds: [1, 1.5],
    repairCost: 0,
    canRepair: false,
    warnings: [],
    menuOpen: false,
    ...props
  },
  global: { plugins: [i18n], stubs: { CallWaveButton: true, TechTreeGlyph: true } }
})

const blueprints = (w: ReturnType<typeof bar>) => w.find('button[aria-label="Blueprints"]')

describe('the Blueprints button', () => {
  it('is always on the bar, drawer shut', () => {
    const w = bar()
    expect(blueprints(w).exists()).toBe(true)
    w.unmount()
  })

  it('opens the tree in one tap', async () => {
    const w = bar()
    await blueprints(w).trigger('click')
    expect(w.emitted('blueprints')).toHaveLength(1)
    expect(w.emitted('menu')).toBeUndefined()
    w.unmount()
  })

  it('shows how many cards are affordable, and nothing when none are', () => {
    const none = bar({ blueprintsAffordable: 0 })
    expect(none.find('.bar__badge').exists()).toBe(false)
    none.unmount()
    const two = bar({ blueprintsAffordable: 2 })
    expect(two.find('.bar__badge').text()).toBe('2')
    two.unmount()
  })

  it('points at itself with the arrow and the gold aura only while the nudge is up', () => {
    const quiet = bar({ blueprintsAttention: false })
    expect(quiet.findComponent(PointerArrow).exists()).toBe(false)
    expect(blueprints(quiet).classes()).not.toContain('is-attention')
    quiet.unmount()

    const nudged = bar({ blueprintsAttention: true })
    expect(nudged.findComponent(PointerArrow).exists()).toBe(true)
    expect(blueprints(nudged).classes()).toContain('is-attention')
    expect(blueprints(nudged).classes()).toContain('is-bounce')
    nudged.unmount()
  })

  it('no longer asks the drawer button to glow', () => {
    // The nudge used to start on `…`; it now belongs to the button it means.
    const w = bar({ blueprintsAttention: true })
    const menu = w.find('button[aria-label="Menu"]')
    expect(menu.classes()).not.toContain('is-attention')
    w.unmount()
  })
})

describe('the pointer arrow', () => {
  it('carries no words and takes no taps', () => {
    const w = mount(PointerArrow, { props: { side: 'left' } })
    expect(w.text().trim()).toBe('')
    expect(w.attributes('aria-hidden')).toBe('true')
    expect(w.classes()).toContain('is-left')
    w.unmount()
  })

  it('gives every arrow its own gradient id', () => {
    const a = mount(PointerArrow)
    const b = mount(PointerArrow)
    const idA = a.find('linearGradient').attributes('id')
    const idB = b.find('linearGradient').attributes('id')
    expect(idA).toBeTruthy()
    expect(idA).not.toBe(idB)
    expect(a.find('path').attributes('fill')).toBe(`url(#${idA})`)
    a.unmount()
    b.unmount()
  })
})
