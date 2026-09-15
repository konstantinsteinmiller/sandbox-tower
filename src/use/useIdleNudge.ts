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
 *   · AND IT SAYS IT ONCE. The pulse used to loop until the next placement, so
 *     a player who was deliberately saving — or who simply wanted to watch the
 *     wave — had a tile breathing at them for as long as they held out. That is
 *     not a nudge, it is a tile with an opinion about how they should be
 *     playing. It now runs for `NUDGE_LOOPS` swells and stands down, and the
 *     idle clock starts again: if they are STILL idle fifteen seconds later it
 *     speaks a second time, which is a reminder rather than a nag.
 *
 * Module state rather than per-instance: only one scene is ever mounted, and a
 * placement made anywhere (a scene, a gift tile) has to be able to reset it
 * through `noteBuildAction` without being handed a reference.
 */

/** Affordable-and-idle time before the tray starts pulsing, ms. */
export const IDLE_NUDGE_MS = 15_000
const TICK_MS = 250

/**
 * How many swells the nudge gets before it stands down.
 *
 * Three. One is missable on a screen with a siege on it; a loop that never ends
 * is the tray nagging. Both trays pin their animation to the same count — the
 * CSS says `3` beside a comment pointing here — so the flag and the motion end
 * together rather than the class outliving the animation or the reverse.
 */
export const NUDGE_LOOPS = 3
/** One swell, ms. Must match `build-tray-nudge` / `tray-nudge` in the trays. */
export const NUDGE_LOOP_MS = 1_100
/** Total time the pulse is up once it starts, ms. */
export const NUDGE_SHOW_MS = NUDGE_LOOPS * NUDGE_LOOP_MS

/** True while the affordable tiles should pulse. The trays read this. */
export const idleNudge = ref(false)

let idleMs = 0
/** How long the current pulse has been up. Only meaningful while it is. */
let showMs = 0

/** A placement: the player is building, so the clock starts over. */
export const noteBuildAction = (): void => {
  idleMs = 0
  showMs = 0
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
  if (!live) {
    // Hidden, not cancelled: an ad in the middle of twelve idle seconds has not
    // made those seconds any less idle. A pulse interrupted this way plays its
    // full count when the game comes back, since the player saw none of it.
    if (idleNudge.value) { idleNudge.value = false; showMs = 0 }
    return
  }

  if (idleNudge.value) {
    showMs += dtMs
    if (showMs < NUDGE_SHOW_MS) return
    // Said, and heard or not. Either way the tray goes quiet, and the idle
    // clock starts from zero — so a player who is still idle gets a second
    // reminder a full stretch later rather than a continuous one.
    idleNudge.value = false
    showMs = 0
    idleMs = 0
    return
  }

  idleMs += dtMs
  if (idleMs < IDLE_NUDGE_MS) return
  idleNudge.value = true
  showMs = 0
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
