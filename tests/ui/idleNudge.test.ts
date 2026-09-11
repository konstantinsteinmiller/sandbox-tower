import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import {
  idleNudge, noteBuildAction, stepIdleNudge, IDLE_NUDGE_MS
} from '@/use/useIdleNudge'
import DropTray from '@/mobile-fit/components/DropTray.vue'
import BuildTray from '@/components/game/BuildTray.vue'

/**
 * ─── The idle nudge ─────────────────────────────────────────────────────────
 *
 * Fifteen seconds without building, while something is affordable and the
 * game is actually live, and the tiles the player CAN pay for pulse until they
 * build. The clock measures the player's presence: an ad or a modal pauses it,
 * and nothing affordable means no nudge at all.
 */

const step = (ms: number, eligible = true, affordable = true): void => {
  for (let t = 0; t < ms; t += 250) {
    stepIdleNudge(250, { eligible: () => eligible, anyAffordable: () => affordable })
  }
}

beforeEach(() => { noteBuildAction() })

describe('idle clock', () => {
  it('nudges after fifteen idle seconds, not before', () => {
    expect(IDLE_NUDGE_MS).toBe(15_000)
    step(14_750)
    expect(idleNudge.value).toBe(false)
    step(250)
    expect(idleNudge.value).toBe(true)
  })

  it('stands still — and hides — while the game is not live', () => {
    step(10_000)
    // An ad, a modal, the tutorial: thirty seconds that are not the player's.
    step(30_000, false)
    expect(idleNudge.value).toBe(false)
    step(4_750)
    expect(idleNudge.value).toBe(false)
    // Ten plus five of their OWN time.
    step(250)
    expect(idleNudge.value).toBe(true)
    step(250, false)
    expect(idleNudge.value).toBe(false)
  })

  it('never nudges a player who cannot afford anything', () => {
    step(60_000, true, false)
    expect(idleNudge.value).toBe(false)
    step(14_750)
    expect(idleNudge.value).toBe(false)
    step(250)
    expect(idleNudge.value).toBe(true)
    // Broke again: the pulse goes, the refusal blink has the floor.
    step(250, true, false)
    expect(idleNudge.value).toBe(false)
  })

  it('starts over on every placement', () => {
    step(15_000)
    expect(idleNudge.value).toBe(true)
    noteBuildAction()
    expect(idleNudge.value).toBe(false)
    step(14_750)
    expect(idleNudge.value).toBe(false)
    step(250)
    expect(idleNudge.value).toBe(true)
  })
})

describe('the trays pulse only what the player can buy', () => {
  const i18n = createI18n({ legacy: false, locale: 'en', missingWarn: false, fallbackWarn: false, messages: { en: {} } })

  it('DropTray', async () => {
    const { DROPMERGE_RULES } = await import('@/mobile-fit/rules')
    const game = await import('@/use/useTowerGame')
    game.applyRules(DROPMERGE_RULES)
    const props = {
      // A 10-material crate and a 51-material, 26-gold bombard.
      offers: ['b_wood', 'b_bombard', 'b_wood'],
      enhanced: [false, false, false],
      selected: null,
      materials: 30,
      gold: 0,
      rerollSeconds: [0, 0, 0],
      volleyReady: false,
      inBattle: true,
      volleyCharge: 0,
      volleyWavesLeft: 1,
      nudge: true
    }
    const w = mount(DropTray, {
      props,
      global: { plugins: [i18n], stubs: { ShapeTile: true, FHudBadge: true } }
    })
    const tiles = w.findAll('.tray__tile')
    expect(tiles.map((t) => t.classes().includes('is-nudge'))).toEqual([true, false, true])
    await w.setProps({ nudge: false })
    expect(w.findAll('.tray__tile.is-nudge')).toHaveLength(0)
    w.unmount()
  })

  it('BuildTray', async () => {
    const game = await import('@/use/useTowerGame')
    const { DESKTOP_RULES } = await import('@/game/rules')
    game.applyRules(DESKTOP_RULES)
    const w = mount(BuildTray, {
      props: {
        selected: null,
        // 10 wood, 20 wood + 22 stone + 26 gold.
        offers: ['w1', 'bombard1'],
        wood: 50,
        stone: 50,
        coins: 0,
        nudge: true
      },
      global: { plugins: [i18n], stubs: { ShapeTile: true } }
    })
    const tiles = w.findAll('.build-tray__tile')
    expect(tiles.map((t) => t.classes().includes('is-nudge'))).toEqual([true, false])
    w.unmount()
  })
})
