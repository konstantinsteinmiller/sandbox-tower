import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import RepairAllButton from '@/components/game/RepairAllButton.vue'
import {
  denyPurchase, deniedSeq, pulseDenied, resetResourceBlink, traySlotKey, isBlinking
} from '@/use/useResourceBlink'

/**
 * ─── "I heard you, and the answer is no" ────────────────────────────────────
 *
 * The 2026-09-15 blind playtest found the same hole from three seats at once:
 * a refused press is indistinguishable from a press that never landed. One
 * tester re-placed the same piece three times ("no error message, no sound, no
 * shake"), one tapped every structure on the board with a card that had
 * nowhere to go, and one — on the phone — could not tell a disabled control
 * from an unaffordable one from a frozen app.
 *
 * The piles already blink at the top of the screen. That answers WHY, and the
 * tests below pin the other half: the control the player actually pressed has
 * to answer too, and it has to answer AGAIN on the next press.
 */

beforeEach(() => resetResourceBlink())

describe('the refused control answers', () => {
  it('marks the pressed control, and only that one', () => {
    denyPurchase(['wood'], traySlotKey(2))
    expect(deniedSeq(traySlotKey(2))).toBeGreaterThan(0)
    expect(deniedSeq(traySlotKey(0))).toBe(0)
    expect(deniedSeq(traySlotKey(3))).toBe(0)
  })

  it('still blinks the short piles — the two cues are complementary', () => {
    denyPurchase(['stone'], traySlotKey(1))
    expect(isBlinking('stone')).toBe(true)
    expect(isBlinking('wood')).toBe(false)
    expect(deniedSeq(traySlotKey(1))).toBeGreaterThan(0)
  })

  it('changes its counter on every refusal, so the strobe restarts', () => {
    // This is the whole point of counting rather than flagging: a player
    // hammering one card must see the answer each time, not once.
    denyPurchase(['wood'], traySlotKey(1))
    const first = deniedSeq(traySlotKey(1))
    denyPurchase(['wood'], traySlotKey(1))
    const second = deniedSeq(traySlotKey(1))
    expect(second).not.toBe(first)
  })

  it('moves to the new control when a different one is refused', () => {
    denyPurchase(['wood'], traySlotKey(1))
    denyPurchase(['wood'], traySlotKey(4))
    expect(deniedSeq(traySlotKey(1))).toBe(0)
    expect(deniedSeq(traySlotKey(4))).toBeGreaterThan(0)
  })

  it('refuses nothing when nothing is short, and marks no control', () => {
    expect(denyPurchase([], traySlotKey(1))).toBe(false)
    expect(deniedSeq(traySlotKey(1))).toBe(0)
  })

  it('answers an illegal placement too, not only an empty purse', () => {
    // `pulseDenied` is the door for refusals that are not about money — an
    // illegal cell, a free card with nowhere to go. Both testers who hit those
    // read them as a dead app.
    pulseDenied(traySlotKey(0))
    expect(deniedSeq(traySlotKey(0))).toBeGreaterThan(0)
    expect(isBlinking('wood')).toBe(false)
  })
})

/**
 * ─── The compact Repair All pill is a price, not a present ──────────────────
 *
 * Same playtest: a tester clicked this expecting to be GIVEN five gold and
 * watched their purse fall from 9 to 4. The `repair` glyph is a cross knocked
 * out of a plate, and a wordless green capsule reading "cross, coin, 5" scans
 * as "+5".
 *
 * The word cannot come back — in compact mode this pill sets `metaCol`, and
 * `metaCol` is width taken off the build hand — so the fix is composition: the
 * bill outgrows the glyph instead of the other way round, with a hairline
 * between them so the cross cannot bind to the number as a sign.
 */

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: { en: { mobile: { repairAll: 'Repair all' } } }
})

const pill = (props: Record<string, unknown> = {}) => mount(RepairAllButton, {
  props: {
    damaged: 4,
    totalCost: 5,
    spend: 5,
    repairs: 4,
    canRepair: true,
    ...props
  },
  global: { plugins: [i18n] }
})

describe('Repair All never reads as a reward', () => {
  it('separates the glyph from the bill when the word is gone', () => {
    expect(pill({ compact: true }).find('.repair-all__rule').exists()).toBe(true)
  })

  it('needs no separator while the word is there to do the work', () => {
    const w = pill({ compact: false })
    expect(w.find('.repair-all__rule').exists()).toBe(false)
    expect(w.find('.repair-all__label').text()).toBe('Repair all')
  })

  it('keeps the accessible name in both modes, word or no word', () => {
    for (const compact of [true, false]) {
      expect(pill({ compact }).attributes('aria-label'), String(compact)).toBe('Repair all')
    }
  })

  it('shows the full bill, never what the purse can afford', () => {
    // Guarding the reason the number is trusted at all: a headline that shrank
    // to the wallet would teach the player the tower is cheap to fix.
    expect(pill({ compact: true, totalCost: 48, spend: 12, repairs: 1 }).text()).toContain('48')
  })
})
