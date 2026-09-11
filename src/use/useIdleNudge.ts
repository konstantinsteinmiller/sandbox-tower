import { onMounted, onUnmounted, ref } from 'vue'

/**
 * ─── The idle nudge ─────────────────────────────────────────────────────────
 *
 * A player who stops building is usually a player who has stopped seeing the
 * hand, not one who has decided to save. The tray sits at the bottom of the
 * screen, the fight is in the middle of it, and after the tutorial nothing ever
 * points back down there. So after a stretch with no placement — while there is
 * something they could actually afford — the pieces they can pay for pulse,
 * until the next thing they build.
 *
 * Two rules keep it honest:
 *
 *   · the clock measures the player's PRESENCE, not the wall. It runs only
 *     while the game is live and something is affordable, and stands still
 *     through an ad, a modal, a tutorial card, a rotate prompt or a hidden tab.
 *     A nudge that fired the moment an ad closed would be pointing at a player
 *     who had not been idle at all.
 *   · it never fires when nothing is affordable. "Build something" at a player
 *     who cannot pay for anything is an instruction they cannot follow — that
 *     moment belongs to the refusal blink (`useResourceBlink`).
 *
 * Module state rather than per-instance: only one scene is ever mounted, and a
 * placement made anywhere (a scene, a gift tile) has to be able to reset it
 * through `noteBuildAction` without being handed a reference.
 */

/** Affordable-and-idle time before the tray starts pulsing, ms. */
export const IDLE_NUDGE_MS = 15_000
const TICK_MS = 250

/** True while the affordable tiles should pulse. The trays read this. */
export const idleNudge = ref(false)

let idleMs = 0

/** A placement: the player is building, so the clock starts over. */
export const noteBuildAction = (): void => {
  idleMs = 0
  idleNudge.value = false
}

export interface IdleNudgeInputs {
  /** Gameplay is live and the tutorial is behind the player. */
  eligible: () => boolean
  /** At least one offered piece can be paid for. */
  anyAffordable: () => boolean
}

/**
 * Advance the idle clock by `dtMs`. Exported for tests; the composable calls it
 * on a timer.
 *
 * Time accrues only while BOTH inputs hold. Losing either one pauses the clock
 * and hides the pulse — it does not reset it, because an ad break in the middle
 * of twelve idle seconds has not made those twelve seconds any less idle.
 */
export const stepIdleNudge = (dtMs: number, inputs: IdleNudgeInputs): void => {
  const live = inputs.eligible() && inputs.anyAffordable()
  if (live) idleMs += dtMs
  const on = live && idleMs >= IDLE_NUDGE_MS
  if (idleNudge.value !== on) idleNudge.value = on
}

/** Run the idle clock for as long as the calling scene is mounted. */
export const useIdleNudge = (inputs: IdleNudgeInputs): void => {
  let timer: ReturnType<typeof setInterval> | null = null
  onMounted(() => {
    noteBuildAction()
    timer = setInterval(() => stepIdleNudge(TICK_MS, inputs), TICK_MS)
  })
  onUnmounted(() => {
    if (timer) clearInterval(timer)
    timer = null
    noteBuildAction()
  })
}
