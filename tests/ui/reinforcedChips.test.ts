import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import DropTray from '@/mobile-fit/components/DropTray.vue'
import { ENHANCED_HP_MUL, ENHANCED_DAMAGE_MUL } from '@/game/blocks'
import { registerShapeDefs } from '@/game/shapes'
import { PIECE_DEFS } from '@/mobile-fit/pieces'

// The phone's pieces live in its own package and only join the shape index
// when the mode is applied (`applyRules` → `registerShapeDefs`). Without this
// the tray is handed ids it cannot look up, and every card silently reports
// itself as a plain wall — which is also the shape of the bug this file pins.
registerShapeDefs(PIECE_DEFS)

/**
 * ─── What the reinforced hand BUYS, on the cards ────────────────────────────
 *
 * The rewarded hand deals reinforced pieces: +75 % HP, and +50 % damage on
 * anything with a gun. The 2026-09-11 rerun found that unreadable from every
 * side — D1 never tapped the button, so it read as a label; P10 saw the tick
 * and the gold borders and never learned the effect; P6 paid and reported the
 * hand "looked identical", because the preview had already turned the cards
 * gold on the first tap.
 *
 * The phone tray was the worst of it: it carried no numbers at all, so a
 * reinforced hand there was three gold borders and nothing else. These pin the
 * fix on that tray — the numbers are ON the card, they come from the
 * simulation's own constants rather than from prose, and an ordinary hand
 * still shows none.
 */

vi.mock('@/use/useSound', () => ({ default: () => ({ playSound: () => null }) }))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    en: {
      blocks: {
        names: { wood: 'Wood', stone: 'Stone', archer: 'Archer', cannon: 'Cannon' },
        enhancedNote: 'Reinforced — +{hp}% HP, +{dmg}% damage.'
      },
      hud: { arrowRain: 'Arrow rain' },
      mobile: { volley: 'Volley' }
    }
  }
})

/** A wall, a gun, a wall — so both chip shapes appear in one hand. */
const OFFERS = ['b_wood', 'b_cannon', 'b_stone']

const mountTray = (enhanced: boolean[], paidAt = 0) => mount(DropTray, {
  global: { plugins: [i18n] },
  props: {
    offers: OFFERS,
    enhanced,
    selected: null,
    materials: 999,
    gold: 999,
    rerollSeconds: [0, 0, 0],
    volleyReady: true,
    inBattle: false,
    volleyCharge: 1,
    volleyWavesLeft: 0,
    paidAt
  }
})

const hpPct = Math.round((ENHANCED_HP_MUL - 1) * 100)
const dmgPct = Math.round((ENHANCED_DAMAGE_MUL - 1) * 100)

describe('the phone tray states the reinforced bonus', () => {
  it('shows nothing on an ordinary hand', () => {
    const w = mountTray([false, false, false])
    expect(w.findAll('.tray__boost')).toHaveLength(0)
  })

  it('puts the numbers on every reinforced card, damage only where there is a gun', () => {
    const w = mountTray([true, true, true])
    const chips = w.findAll('.tray__boost').map((c) => c.text())
    expect(chips).toHaveLength(3)
    // The wall and the stone get HP alone; the cannon gets both.
    expect(chips[0]).toBe(`+${hpPct}%`)
    expect(chips[1]).toBe(`+${hpPct}% / +${dmgPct}%`)
    expect(chips[2]).toBe(`+${hpPct}%`)
  })

  it('reads the numbers off the simulation, not off a written-down copy', () => {
    // The point of the assertion: if someone retunes `ENHANCED_HP_MUL`, the
    // card follows. A hard-coded "+75%" in the template would pass the test
    // above and lie to the player the day the constant moves.
    const w = mountTray([true, false, false])
    expect(w.find('.tray__boost').text()).toBe(`+${Math.round((ENHANCED_HP_MUL - 1) * 100)}%`)
  })

  it('marks the cards for one beat when the hand is actually paid for', async () => {
    const w = mountTray([true, true, true])
    expect(w.findAll('.tray__tile.is-paid')).toHaveLength(0)
    // The preview turns cards gold on the FIRST tap, so the spend needs a
    // signal of its own — a counter, so paying twice plays twice.
    await w.setProps({ paidAt: Date.now() })
    expect(w.findAll('.tray__tile.is-paid')).toHaveLength(3)
  })
})
