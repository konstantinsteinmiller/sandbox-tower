import { reactive } from 'vue'

/**
 * ─── The automatic hand ─────────────────────────────────────────────────────
 *
 * Some things are quicker SHOWN than pointed at. A coach mark asks the player
 * to do one thing where the arrow is; a hand that takes over for a few seconds
 * can do a short sequence — tap this, then that — while the player watches it
 * happen in the real UI, on the real block, with the real numbers changing.
 *
 * A script is a list of steps: glide to a point, press, wait. Points are
 * FUNCTIONS, read when the step starts, because what the hand aims at (a block
 * projected off the camera, a button inside a panel that has only just opened)
 * is not laid out when the script is written. A press runs its action as the
 * finger lifts — the moment a real click lands.
 *
 * Every script can be cut short: anything that takes the screen away from the
 * lesson (a modal, the tutorial stepping aside) cancels it, and a run that was
 * cancelled never fires another action. A target that cannot be found ends the
 * run as `lost` instead, so the caller can move on rather than wait for a hand
 * that will never arrive.
 */

export interface HandPoint { x: number; y: number }

export type HandStep =
  /** Glide to a point over `ms`. */
  | { kind: 'move'; to: () => HandPoint | null; ms: number }
  /** Press for `ms`, then run `then` as the finger lifts. */
  | { kind: 'press'; ms: number; then?: () => void }
  | { kind: 'wait'; ms: number }

export type HandOutcome = 'done' | 'cancelled' | 'lost'

export interface HandState {
  visible: boolean
  x: number
  y: number
  pressing: boolean
  /** How long the current glide takes — the component eases over this. */
  moveMs: number
}

export const useAutoHand = () => {
  const hand = reactive<HandState>({ visible: false, x: 0, y: 0, pressing: false, moveMs: 0 })

  /** Bumped by every run and every cancel: a run is alive while it holds the
   *  current value. */
  let token = 0

  const wait = (ms: number): Promise<void> =>
    new Promise((resolve) => { setTimeout(resolve, ms) })

  const hide = (): void => {
    hand.visible = false
    hand.pressing = false
  }

  const cancel = (): void => {
    token++
    hide()
  }

  /** Play `steps`, appearing at `start`. Resolves with how it ended. */
  const run = async (steps: ReadonlyArray<HandStep>, start: HandPoint): Promise<HandOutcome> => {
    const mine = ++token
    const alive = (): boolean => token === mine
    hand.moveMs = 0
    hand.x = start.x
    hand.y = start.y
    hand.pressing = false
    hand.visible = true

    for (const step of steps) {
      if (!alive()) return 'cancelled'
      if (step.kind === 'move') {
        const to = step.to()
        if (!to) {
          hide()
          token++
          return 'lost'
        }
        hand.moveMs = step.ms
        hand.x = to.x
        hand.y = to.y
        await wait(step.ms)
      } else if (step.kind === 'press') {
        hand.pressing = true
        await wait(step.ms)
        if (!alive()) return 'cancelled'
        hand.pressing = false
        step.then?.()
      } else {
        await wait(step.ms)
      }
    }
    if (!alive()) return 'cancelled'
    hide()
    return 'done'
  }

  return { hand, run, cancel }
}
