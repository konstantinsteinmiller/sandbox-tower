import { ref } from 'vue'
import type { BuildResource } from '@/use/useTowerGame'
import useSounds from '@/use/useSound'

/**
 * ─── "You cannot pay for that" ──────────────────────────────────────────────
 *
 * A player on the phone board ran out of materials and kept hammering the same
 * column. Every tap did nothing, and nothing on screen said why: the tray tile
 * had gone grey, but that tile is at the bottom of the screen and the player's
 * eyes were on the column they were tapping. A price the player cannot meet has
 * to be answered at the moment they try to pay it, and in the place the answer
 * lives — the resource bar — not with a silent no.
 *
 * So a refused purchase does two things:
 *
 *   · the icon of every pile the player is SHORT of blinks red and white for
 *     `BLINK_MS`. Only the short ones — "you are out of stone" is a different
 *     problem from "you are out of gold", and the fix is different too;
 *   · a heavy, pitched-down knock plays, throttled so a player hammering a
 *     column hears a rhythm rather than a wall of noise.
 *
 * The blink state is a counter per pile rather than a flag. The bars key the
 * icon on it, so every refusal REMOUNTS the icon and the animation starts over
 * from its first frame — re-triggering restarts the 1.5 s rather than stacking
 * a second blink on top of the first. The timestamp beside it keeps a bar that
 * mounts later (a scene coming back from a menu) from replaying a refusal the
 * player saw a minute ago.
 */

/** How long one refusal blinks the icons, ms. Mirrored by the bars' CSS. */
export const BLINK_MS = 1500

export interface BlinkState {
  /** Bumped on every refusal; 0 means this pile has never been flagged. */
  n: number
  /** `performance.now()` after which the blink is over. */
  until: number
}

const fresh = (): Record<BuildResource, BlinkState> => ({
  wood: { n: 0, until: 0 },
  stone: { n: 0, until: 0 },
  coins: { n: 0, until: 0 }
})

/** Per pile, the latest refusal. Read by `ResourceBar` and `TopStrip`. */
export const resourceBlink = ref<Record<BuildResource, BlinkState>>(fresh())

const now = (): number =>
  typeof performance !== 'undefined' ? performance.now() : Date.now()

/** Is `id` mid-blink right now? Checked when a bar renders the icon. */
export const isBlinking = (id: BuildResource): boolean => {
  const s = resourceBlink.value[id]
  return s.n > 0 && s.until > now()
}

/** Blink these piles. A pile already blinking starts over. */
export const blinkResources = (missing: readonly BuildResource[]): void => {
  if (missing.length === 0) return
  const until = now() + BLINK_MS
  const next = { ...resourceBlink.value }
  for (const id of missing) next[id] = { n: next[id].n + 1, until }
  resourceBlink.value = next
}

/**
 * The refusal knock.
 *
 * `obstacle-hit` already means "that cell is not legal", so it is played a
 * good deal lower and louder here: the same material, a different word. A
 * dedicated cue is on the sound manifest (`sound-todo.md`, "denied").
 *
 * One every `DENY_GAP_MS` at most — a thumb hammering a column lands five or
 * six taps a second, and a knock on every one of them is a buzz, not a sound.
 */
const DENY_GAP_MS = 260
let lastDenyAt = -Infinity
const { playSound } = useSounds()

export const playDenied = (): void => {
  const t = now()
  if (t - lastDenyAt < DENY_GAP_MS) return
  lastDenyAt = t
  playSound('obstacle-hit', 0.05, 0.72)
}

/**
 * ─── …and on the control the player actually pressed ────────────────────────
 *
 * The blink above answers in the place the ANSWER lives. This answers in the
 * place the QUESTION was asked, and the two are not the same place.
 *
 * Measured 2026-09-15: three blind testers, both boards, independently reported
 * that a refusal is invisible. One re-placed the same piece three times — "no
 * error message, no sound, no shake… no way to tell success from failure except
 * checking the gold counter"; one tapped every structure on the board with a
 * card that had nowhere to go; one, on the phone, could not tell "this is
 * disabled" from "you can't afford this" from "the game is frozen", because the
 * pressed card looked identical in all three cases.
 *
 * The piles blinking at the top of the screen is the right answer to "why", and
 * it is the wrong answer to "did my press even register" — which is what a
 * player hammering a card is actually asking. So the refused control strobes
 * too. The two cues are complementary and both fire: the bar says which pile is
 * short, the card says "yes, I heard you, and the answer is no".
 *
 * Keyed by control rather than flagged, for the same reason the piles are
 * counted: the consumer mounts a fresh overlay on every refusal, so a second
 * refusal restarts the strobe from its first frame instead of landing on an
 * element whose animation has already run.
 */
export interface DenyPulse {
  /** Bumped on every refusal; 0 means nothing has ever been refused. */
  n: number
  /** Which control was refused — see `traySlotKey` — or '' for none. */
  key: string
}

export const denyPulse = ref<DenyPulse>({ n: 0, key: '' })

/** The key for a build-tray slot. Both boards' trays use it. */
export const traySlotKey = (slot: number): string => `tray:${slot}`

/** Strobe the control under `key`. A control already strobing starts over. */
export const pulseDenied = (key: string): void => {
  denyPulse.value = { n: denyPulse.value.n + 1, key }
}

/**
 * The refusal counter for `key`, or 0 when this control is not the refused one.
 *
 * Non-zero is "render the strobe", and the VALUE is what the consumer keys the
 * overlay on — that is what restarts the animation on a repeat refusal.
 */
export const deniedSeq = (key: string): number => {
  const s = denyPulse.value
  return s.n > 0 && s.key === key ? s.n : 0
}

/**
 * Refuse a purchase the player is `missing` these piles for.
 *
 * Returns true when it refused — the caller stops there — and false, doing
 * nothing at all, when nothing is missing. So a call site reads as one line:
 * `if (denyPurchase(missingFor(id))) return`.
 *
 * `key` names the control that was pressed, when the caller knows it. Optional
 * because not every refusal comes from a control with a place on screen.
 */
export const denyPurchase = (missing: readonly BuildResource[], key?: string): boolean => {
  if (missing.length === 0) return false
  blinkResources(missing)
  if (key) pulseDenied(key)
  playDenied()
  return true
}

/** Forget every refusal and the knock's throttle (tests). */
export const resetResourceBlink = (): void => {
  resourceBlink.value = fresh()
  denyPulse.value = { n: 0, key: '' }
  lastDenyAt = -Infinity
}
