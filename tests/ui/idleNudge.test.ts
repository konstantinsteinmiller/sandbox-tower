import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import {
  idleNudge, noteBuildAction, stepIdleNudge, IDLE_NUDGE_MS, NUDGE_SHOW_MS
} from '@/use/useIdleNudge'
import DropTray from '@/mobile-fit/components/DropTray.vue'
import BuildTray from '@/components/game/BuildTray.vue'

/**
 * ─── The idle nudge ─────────────────────────────────────────────────────────
 *
 * Fifteen seconds without building, while something is affordable and the game
 * is actually live, and the tile the player can pay for pulses — for three
 * swells, and then it stops. The clock measures the player's presence: an ad or
 * a modal pauses it, and nothing affordable means no nudge at all.
 *
 * The standing-down is the 2026-09-15 change. It used to loop until the next
 * placement, which meant a player who was deliberately saving had a tile
 * breathing at them for as long as they held out — reported from play as a
 * distraction, and it is not even teaching anything.
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

  it('stands down after a few swells instead of looping for ever', () => {
    step(IDLE_NUDGE_MS)
    expect(idleNudge.value).toBe(true)
    step(NUDGE_SHOW_MS - 250)
    expect(idleNudge.value).toBe(true)
    step(250)
    expect(idleNudge.value).toBe(false)
  })

  it('speaks again a full idle stretch later, not continuously', () => {
    step(IDLE_NUDGE_MS + NUDGE_SHOW_MS)
    expect(idleNudge.value).toBe(false)
    // The clock restarted from zero, so the player gets the whole quiet window
    // back before they are reminded a second time.
    step(IDLE_NUDGE_MS - 250)
    expect(idleNudge.value).toBe(false)
    step(250)
    expect(idleNudge.value).toBe(true)
  })

  it('plays its full count after an interruption, since none of it was seen', () => {
    step(IDLE_NUDGE_MS)
    expect(idleNudge.value).toBe(true)
    step(500)
    // An ad opens two swells in.
    step(30_000, false)
    expect(idleNudge.value).toBe(false)
    step(250)
    expect(idleNudge.value).toBe(true)
    step(NUDGE_SHOW_MS - 500)
    expect(idleNudge.value).toBe(true)
    step(500)
    expect(idleNudge.value).toBe(false)
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

  it("shows the pulse for three swells of the trays' own animation", () => {
    // The flag and the CSS have to end together, or the class outlives the
    // motion (a tile that stops mid-swell) or the motion outlives the class.
    const buildTray = readFileSync('src/components/game/BuildTray.vue', 'utf8')
    const dropTray = readFileSync('src/mobile-fit/components/DropTray.vue', 'utf8')
    expect(NUDGE_SHOW_MS).toBe(3 * 1_100)
    expect(buildTray).toContain('animation: build-tray-nudge 1.1s ease-in-out 3')
    expect(buildTray).toContain('animation: build-tray-nudge-ring 1.1s ease-out 3')
    expect(dropTray).toContain('animation: tray-nudge 1.1s ease-in-out 3')
    expect(dropTray).toContain('animation: tray-nudge-ring 1.1s ease-out 3')
    // Nothing in either tray may go back to looping for ever.
    expect(buildTray).not.toContain('build-tray-nudge 1.1s ease-in-out infinite')
    expect(dropTray).not.toContain('tray-nudge 1.1s ease-in-out infinite')
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
