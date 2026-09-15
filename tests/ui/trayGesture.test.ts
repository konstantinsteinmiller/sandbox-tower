import { describe, expect, it } from 'vitest'
import { trayGestureFor, type TrayTravel } from '@/utils/trayGesture'

/**
 * ─── Tap, drag or scroll ────────────────────────────────────────────────────
 *
 * The build tray now answers to all three, and two of them start identically:
 * a press on a tile that then moves. Reading a scroll as a drag costs a phone
 * player the ability to see the offers that do not fit their screen, which is
 * worse than losing a drag they can simply try again — so the tie-breaks here
 * all fall towards `scroll`, and the tests say so explicitly.
 */

const SLOP = 10

const travel = (over: Partial<TrayTravel>): TrayTravel => ({
  dx: 0,
  dy: 0,
  pointerType: 'touch',
  insideTray: true,
  scrollable: true,
  ...over
})

describe('trayGestureFor', () => {
  it('is idle until the press has travelled past the slop', () => {
    expect(trayGestureFor(travel({ dx: 9, dy: 0 }), SLOP)).toBe('idle')
    expect(trayGestureFor(travel({ dx: 0, dy: -9 }), SLOP)).toBe('idle')
    // Exactly at the threshold is still a tap: the board's own gesture uses
    // `> TAP_SLOP_PX` and the two must agree on what "moved" means.
    expect(trayGestureFor(travel({ dx: 10, dy: 0 }), SLOP)).toBe('idle')
    expect(trayGestureFor(travel({ dx: 0, dy: -11 }), SLOP)).toBe('drag')
  })

  it('always drags for a mouse — the tray takes the wheel, not a swipe', () => {
    // Sideways, inside the tray, with plenty to scroll: on touch this is the
    // clearest scroll there is, and on a mouse it is the whole feature.
    const sideways = travel({ dx: 60, dy: 0, pointerType: 'mouse' })
    expect(trayGestureFor(sideways, SLOP)).toBe('drag')
    expect(trayGestureFor(travel({ dx: 60, dy: 0 }), SLOP)).toBe('scroll')
  })

  it('reads a sideways touch swipe inside a scrollable tray as a scroll', () => {
    expect(trayGestureFor(travel({ dx: 40, dy: 5 }), SLOP)).toBe('scroll')
    expect(trayGestureFor(travel({ dx: -40, dy: -5 }), SLOP)).toBe('scroll')
    // A perfect diagonal is as likely to be a clumsy swipe as a lift, so it
    // goes to the gesture whose loss costs more.
    expect(trayGestureFor(travel({ dx: 30, dy: -30 }), SLOP)).toBe('scroll')
  })

  it('reads an upward touch drag as a carry — the board is above the tray', () => {
    expect(trayGestureFor(travel({ dx: 5, dy: -40 }), SLOP)).toBe('drag')
    expect(trayGestureFor(travel({ dx: -18, dy: -40 }), SLOP)).toBe('drag')
  })

  it('drags once the finger has left the tray, whichever way it went', () => {
    // A scroll keeps the finger on the thing it is pushing. This one did not.
    expect(trayGestureFor(travel({ dx: 80, dy: 0, insideTray: false }), SLOP)).toBe('drag')
  })

  it('drags freely when the hand fits its track — there is no scroll to lose', () => {
    expect(trayGestureFor(travel({ dx: 40, dy: 0, scrollable: false }), SLOP)).toBe('drag')
  })

  it('treats a pen like a finger, not like a mouse', () => {
    // A pen on a touchscreen scrolls the tray the same way a finger does.
    expect(trayGestureFor(travel({ dx: 40, dy: 2, pointerType: 'pen' }), SLOP)).toBe('scroll')
    expect(trayGestureFor(travel({ dx: 2, dy: -40, pointerType: 'pen' }), SLOP)).toBe('drag')
  })
})
