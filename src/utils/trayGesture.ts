/**
 * What a press that started on a build-tray tile turns into.
 *
 * Three things can be meant by the same finger, and the tray has to tell them
 * apart before it commits to any of them:
 *
 *   tap    — pick the piece up into the hand, then tap the board. How this game
 *            has always worked, and still the only gesture on a phone that a
 *            player discovers by accident.
 *   drag   — carry the piece onto the board and let go. What a desktop player
 *            expects from a tray of things, and what was missing.
 *   scroll — the hand is wider than its track and the player is pushing it
 *            sideways to see the offers that do not fit.
 *
 * The last two are the pair that actually conflict, because both are "press a
 * tile and move". Getting that wrong in the scroll's favour costs a drag the
 * player can retry; getting it wrong in the drag's favour costs a tray that
 * cannot be scrolled at all on a phone, which is the worse bug of the two — so
 * everything ambiguous resolves to `scroll`.
 *
 * Pure, and separated from the scene, because this is the whole of the
 * decision and none of it can be seen in a headless mount: the scene needs a
 * canvas, a camera and a running simulation before a pointer means anything.
 */

export type TrayGesture = 'idle' | 'drag' | 'scroll'

export interface TrayTravel {
  /** Pointer travel since the press began, in CSS px. */
  dx: number
  dy: number
  /** `PointerEvent.pointerType` — 'mouse', 'touch' or 'pen'. */
  pointerType: string
  /** The pointer is still within the tray's own scrolling box. */
  insideTray: boolean
  /** The hand actually overflows its track. A hand that fits has nothing to
   *  scroll, so there is no gesture to lose by reading a swipe as a drag. */
  scrollable: boolean
}

/**
 * Resolve one frame of travel. `idle` means "not yet past the slop" — keep
 * asking; the other two are final and the caller latches them.
 *
 * The board is ABOVE the tray in every layout this game ships, so a drag onto
 * it is an upward gesture and a scroll is a sideways one. That is the whole
 * heuristic, plus two shortcuts that make it unnecessary:
 *
 *   · A mouse never scrolls the tray by dragging — the tray takes the wheel —
 *     so for a mouse every press that travels is a drag. This is the gesture
 *     the desktop player was missing and it must not be second-guessed.
 *   · A pointer that has LEFT the tray is unambiguous whichever way it went:
 *     a scroll keeps the finger on the thing it is pushing.
 */
export const trayGestureFor = (t: TrayTravel, slopPx: number): TrayGesture => {
  if (Math.hypot(t.dx, t.dy) <= slopPx) return 'idle'
  if (t.pointerType === 'mouse') return 'drag'
  if (!t.scrollable) return 'drag'
  if (!t.insideTray) return 'drag'
  // Inside a scrollable tray, on a touch pointer: only a gesture that is more
  // up-or-down than sideways is a drag. `>` and not `>=` so a perfect diagonal
  // — which is as likely to be a clumsy swipe as a deliberate lift — scrolls.
  return Math.abs(t.dy) > Math.abs(t.dx) ? 'drag' : 'scroll'
}
