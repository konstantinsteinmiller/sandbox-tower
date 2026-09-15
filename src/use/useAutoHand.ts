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
 *
 * ─── Drags ──────────────────────────────────────────────────────────────────
 *
 * `press` is a TAP: down, then up in the same place. That models every button
 * in the game and nothing at all about the one gesture a player has to be
 * taught rather than guess — picking a piece up in one place and setting it
 * down in another.
 *
 * So a press that HOLDS (`grab`) and a release (`drop`) are separate steps, and
 * `move` deliberately leaves `pressing` alone: a glide between the two is a
 * carry, with no third step needed to say so. `grab` also raises `carrying`,
 * which is what the component draws a piece under the fingertip for — a hand
 * gliding across the board with nothing in it reads as a second tap, not as a
 * drag, and the whole point of the lesson is the difference.
 *
 * Both are additions. Scripts written before them (the Gate's rank demo) are
 * untouched: they only use `move`/`press`/`wait`, which behave exactly as they
 * did.
 */

export interface HandPoint { x: number; y: number }

export type HandStep =
  /** Glide to a point over `ms`. Never changes whether the finger is down, so
   *  a move between a `grab` and a `drop` is a carry. */
  | { kind: 'move'; to: () => HandPoint | null; ms: number }
  /** Press for `ms`, then run `then` as the finger lifts. */
  | { kind: 'press'; ms: number; then?: () => void }
  /**
   * Press and HOLD for `ms` — the start of a drag. The finger stays down (and
   * `carrying` stays up) until a `drop`, or until the run ends for any reason.
   */
  | { kind: 'grab'; ms: number }
  /** Release after `ms` of hovering over the target, running `then` as the
   *  finger lifts — the same contract a `press` has, at the other end of a
   *  drag. */
  | { kind: 'drop'; ms: number; then?: () => void }
  | { kind: 'wait'; ms: number }

export type HandOutcome = 'done' | 'cancelled' | 'lost'

export interface HandState {
  visible: boolean
  x: number
  y: number
  pressing: boolean
  /** Holding something: the component draws a piece under the fingertip. Only
   *  a `grab` raises it, and only a `drop` (or the run ending) lowers it. */
  carrying: boolean
  /** How long the current glide takes — the component eases over this. */
  moveMs: number
}

export const useAutoHand = () => {
  const hand = reactive<HandState>({
    visible: false, x: 0, y: 0, pressing: false, carrying: false, moveMs: 0
  })

  /** Bumped by every run and every cancel: a run is alive while it holds the
   *  current value. */
  let token = 0

  const wait = (ms: number): Promise<void> =>
    new Promise((resolve) => { setTimeout(resolve, ms) })

  const hide = (): void => {
    hand.visible = false
    hand.pressing = false
    // A run that is cut off mid-carry must not leave a piece stuck to a hand
    // that is no longer on screen — the next script would start holding it.
    hand.carrying = false
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
    hand.carrying = false
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
      } else if (step.kind === 'grab') {
        hand.pressing = true
        hand.carrying = true
        await wait(step.ms)
      } else if (step.kind === 'drop') {
        await wait(step.ms)
        if (!alive()) return 'cancelled'
        hand.pressing = false
        hand.carrying = false
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

/** The scene mounts ONE of these and passes it around; a coach that wants the
 *  hand borrows the scene's rather than making a second one nobody renders. */
export type AutoHand = ReturnType<typeof useAutoHand>
