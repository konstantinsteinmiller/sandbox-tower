import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { defineComponent, h, nextTick } from 'vue'

vi.mock('@/use/useSound', () => ({
  default: () => ({ playSound: () => null })
}))

/**
 * ─── The missions button's collect signals ──────────────────────────────────
 *
 * Badge = how many goals can be claimed. Gold glow = every goal still standing
 * is ready. And the phone's corner copy (`onlyWhenClaimable`) exists only while
 * there is something to collect — but must not vanish from under the player
 * while its own panel is open, or claiming the last reward would yank the sheet
 * away mid-tap.
 */

/** A day whose rotation is exactly coins, waves and kills (see missionProgress). */
const PINNED_DAY = '2026-01-05T12:00:00.000Z'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    en: {
      missions: {
        title: 'Daily Missions',
        subtitle: 'Complete goals each day for coins.',
        claim: 'Claim',
        done: 'Claimed',
        types: { coins: 'Earn {n}', waves: 'Wave {n}', kills: 'Defeat {n}', blocks: 'Place {n}' }
      }
    }
  }
})

/** FModal teleports to <body>; the stub renders in place and can be closed. */
const FModalStub = defineComponent({
  name: 'FModal',
  props: { modelValue: { type: Boolean, default: false }, title: { type: String, default: '' } },
  emits: ['update:modelValue'],
  setup (props, { slots, emit }) {
    return () => props.modelValue
      ? h('div', { class: 'modal-stub' }, [
        slots.default?.(),
        h('button', { class: 'modal-close', onClick: () => emit('update:modelValue', false) }, 'x')
      ])
      : null
  }
})

const setup = async (onlyWhenClaimable: boolean) => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(PINNED_DAY))
  vi.resetModules()
  localStorage.clear()
  const missions = await import('@/use/useMissions')
  missions.beginMissionRun()
  const { default: MissionsModal } = await import('@/components/organisms/MissionsModal.vue')
  const w = mount(MissionsModal, {
    props: { onlyWhenClaimable },
    global: { plugins: [i18n], stubs: { FModal: FModalStub } }
  })
  const api = missions.default()
  const target = (type: string): number => api.missions.value.find((m) => m.type === type)!.target
  /** Feed a run that finishes the given goals (cumulative, like the scenes do). */
  const finish = async (...types: Array<'coins' | 'waves' | 'kills'>): Promise<void> => {
    api.recordRun({
      waves: types.includes('waves') ? target('waves') : 0,
      kills: types.includes('kills') ? target('kills') : 0,
      coins: types.includes('coins') ? target('coins') : 0,
      blocks: 0,
      height: 0
    })
    await nextTick()
  }
  return { w, api, finish }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('missions button', () => {
  it('the drawer copy is always there; badge and glow follow the rules', async () => {
    const { w, finish } = await setup(false)
    const button = () => w.find('button.f-hud-button')

    expect(button().exists()).toBe(true)
    expect(w.find('.f-hud-badge').exists()).toBe(false)
    expect(button().classes()).not.toContain('is-attention')

    await finish('kills')
    expect(w.find('.f-hud-badge').text()).toBe('1')
    // One of three ready: counted, but not worth a glow yet.
    expect(button().classes()).not.toContain('is-attention')

    await finish('kills', 'coins', 'waves')
    expect(w.find('.f-hud-badge').text()).toBe('3')
    expect(button().classes()).toContain('is-attention')
  })

  it('the corner copy exists only while something is collectable', async () => {
    const { w, finish } = await setup(true)
    expect(w.find('button.f-hud-button').exists()).toBe(false)

    await finish('kills')
    expect(w.find('button.f-hud-button').exists()).toBe(true)
    expect(w.find('.f-hud-badge').text()).toBe('1')
  })

  it('claiming the last reward keeps the corner sheet until it is closed', async () => {
    const { w, finish } = await setup(true)
    await finish('kills', 'coins', 'waves')

    await w.find('button.f-hud-button').trigger('click')
    expect(w.find('.modal-stub').exists()).toBe(true)
    expect(w.emitted('opened')).toHaveLength(1)

    // Claim everything from inside the corner copy's own panel.
    for (let i = 0; i < 3; i++) {
      const claim = w.find('.modal-stub button.f-button')
      expect(claim.exists()).toBe(true)
      await claim.trigger('click')
    }
    expect(w.findAll('.modal-stub button.f-button')).toHaveLength(0)
    expect(w.emitted('coins-awarded')).toHaveLength(3)

    // Nothing left to collect, but the sheet is still up: the button stays.
    expect(w.find('button.f-hud-button').exists()).toBe(true)
    expect(w.find('.f-hud-badge').exists()).toBe(false)

    await w.find('.modal-close').trigger('click')
    expect(w.find('.modal-stub').exists()).toBe(false)
    expect(w.find('button.f-hud-button').exists()).toBe(false)
  })
})
