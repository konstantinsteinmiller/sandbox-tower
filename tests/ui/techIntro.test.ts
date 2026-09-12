import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'

vi.mock('@/use/useSound', () => ({
  default: () => ({ playSound: () => null })
}))
vi.mock('@/use/useTowerAudio', () => ({ playFx: () => {} }))

/**
 * ─── The upgrade screen's intro ─────────────────────────────────────────────
 *
 * Its first card ("everything bought here is permanent") used to wait for the
 * first DEFEAT, so a player who opened the tree mid-run met a wall of prices
 * with nothing saying what they buy. Now: the first card on the first open from
 * anywhere; the rest of the intro still after a defeat, picking up at card two
 * when card one has been seen. Pinned on the phone's Blueprints list; the
 * desktop tree runs the same `startIntro` / `advanceIntro`.
 */

// No messages: `t()` hands back the key, which is what these assert on.
const i18n = createI18n({ legacy: false, locale: 'en', missingWarn: false, fallbackWarn: false, messages: { en: {} } })

const setup = async (intro: boolean) => {
  vi.resetModules()
  localStorage.clear()
  const keys = await import('@/keys')
  const state = await import('@/use/useTowerState')
  const { default: BlueprintsModal } = await import('@/mobile-fit/components/BlueprintsModal.vue')
  const w = mount(BlueprintsModal, {
    props: { modelValue: false, intro },
    global: {
      plugins: [i18n],
      stubs: { FModal: { template: '<div class="fmodal"><slot /></div>' } }
    }
  })
  return { w, keys, state }
}

type Wrapper = Awaited<ReturnType<typeof setup>>['w']

const open = async (w: Wrapper, intro: boolean): Promise<void> => {
  await w.setProps({ modelValue: false, intro })
  await w.setProps({ modelValue: true })
}
const card = (w: Wrapper) => w.find('.bp__intro')
const cardText = (w: Wrapper) => w.find('.bp__intro-text').text()
const next = async (w: Wrapper): Promise<void> => {
  await w.find('.bp__intro button').trigger('click')
}

describe('the upgrade screen intro', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows its first card, alone, on a first open mid-run', async () => {
    const { w, keys, state } = await setup(false)
    await open(w, false)
    expect(card(w).exists()).toBe(true)
    expect(cardText(w)).toBe('tech.intro1')
    // One card, so the button closes rather than promising more.
    expect(w.find('.bp__intro button').text()).toBe('tech.introDone')
    await next(w)
    expect(card(w).exists()).toBe(false)
    expect(state.getState(keys.M2_TECH_INTRO_P1_KEY, false)).toBe(true)
    expect(state.getState(keys.M2_TECH_INTRO_KEY, false)).toBe(false)
    w.unmount()
  })

  it('does not show it again on the next mid-run open', async () => {
    const { w } = await setup(false)
    await open(w, false)
    await next(w)
    await open(w, false)
    expect(card(w).exists()).toBe(false)
    w.unmount()
  })

  it('after a defeat, picks up at the second card and finishes the intro', async () => {
    const { w, keys, state } = await setup(false)
    await open(w, false)
    await next(w)

    await open(w, true)
    expect(cardText(w)).toBe('tech.intro2')
    await next(w)
    expect(cardText(w)).toBe('tech.intro3')
    await next(w)
    expect(card(w).exists()).toBe(false)
    expect(state.getState(keys.M2_TECH_INTRO_KEY, false)).toBe(true)

    // Done for good, from anywhere.
    await open(w, true)
    expect(card(w).exists()).toBe(false)
    w.unmount()
  })

  it('opened from a defeat first, runs all three cards from the start', async () => {
    const { w } = await setup(true)
    await open(w, true)
    expect(cardText(w)).toBe('tech.intro1')
    expect(w.find('.bp__intro button').text()).toBe('tech.introNext')
    await next(w)
    expect(cardText(w)).toBe('tech.intro2')
    w.unmount()
  })
})
