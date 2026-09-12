import { ref } from 'vue'

/**
 * ─── World cues: what the battlefield shows instead of saying ───────────────
 *
 * The 2026-09-11 blind playtest lost players at the same three moments, and at
 * each one the game had the answer and kept it to itself:
 *
 *   · a block died between two glances and left nothing behind, so "my whole
 *     tower vanished except the door" read as something done TO the player;
 *   · the Gate took hits with nothing on screen saying so — the desktop bar is
 *     easily read as wave progress and the phone has no HUD bar at all;
 *   · an enemy nothing could shoot stood at the wall for forty seconds, and a
 *     fight that cannot end read as a frozen game.
 *
 * Every answer here is a picture on the battlefield, never a sentence: a red
 * ghost where the block stood, a red pulse on the Gate and the screen edge the
 * blow came from, a crossed-out crosshair over the enemy no gun reaches. This
 * module is only the bookkeeping — timestamps, a small ring, a set of uids — so
 * the timing rules are testable without a canvas; `useTowerArt` draws.
 *
 * TIME is the page clock (`performance.now()`), passed in by the caller. The
 * simulation clock restarts at zero every run and stands still while a tutorial
 * card holds it, and a cue has to fade on screen time either way. `ageOf` also
 * treats a clock that has gone backwards as "long expired", so no cue can ever
 * be stranded at full strength by a reset.
 */

const ageOf = (at: number, now: number): number => (now >= at ? now - at : Infinity)

// ─── Reduced motion ─────────────────────────────────────────────────────────
//
// Read once and kept current. Every cue keeps its SIGNAL under reduced motion —
// the tint, the outline, the mark — and drops only the movement.

let reduceMotion = false
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const q = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduceMotion = q.matches
  q.addEventListener?.('change', (e) => { reduceMotion = e.matches })
}
export const prefersReducedMotion = (): boolean => reduceMotion
/** Tests only. */
export const __setReducedMotion = (on: boolean): void => { reduceMotion = on }

// ─── Lost blocks ────────────────────────────────────────────────────────────
//
// A fixed ring of records, reused: a collapse that drops twelve blocks in one
// frame writes twelve slots and allocates nothing. Past the cap the OLDEST mark
// is overwritten — the newest loss is the one the player is looking for.

export const LOST_MARK_MS = 1200
export const MAX_LOST_MARKS = 16

export interface LostMark {
  /** Footprint centre and size, in world cells (the renderer's convention:
   *  `x` is `centreX`, `y` is `centreY`). */
  x: number
  y: number
  w: number
  h: number
  at: number
  live: boolean
}

const lostMarks: LostMark[] = Array.from({ length: MAX_LOST_MARKS }, () => ({
  x: 0, y: 0, w: 1, h: 1, at: 0, live: false
}))
let lostCursor = 0

export const noteLostBlock = (x: number, y: number, w: number, h: number, now: number): void => {
  const m = lostMarks[lostCursor]!
  lostCursor = (lostCursor + 1) % MAX_LOST_MARKS
  m.x = x
  m.y = y
  m.w = Math.max(1, w)
  m.h = Math.max(1, h)
  m.at = now
  m.live = true
}

/** The ring itself, for the renderer to walk. Expired slots are skipped by
 *  `lostMarkFade` returning 0; nothing is ever spliced. */
export const lostMarkSlots = (): readonly LostMark[] => lostMarks

/** 1 → 0 across the mark's life, held near full for its first third so the
 *  outline is at strength during the glance that finds it. */
export const lostMarkFade = (m: LostMark, now: number): number => {
  if (!m.live) return 0
  const age = ageOf(m.at, now)
  if (age >= LOST_MARK_MS) {
    m.live = false
    return 0
  }
  return Math.min(1, (1 - age / LOST_MARK_MS) * 1.5)
}

// ─── The Gate under attack ──────────────────────────────────────────────────
//
// Two signals with two rhythms. The OUTLINE is on for as long as blows keep
// landing (it is the "this is where you lose" marker, and it should not blink
// off between two hits of a sustained siege). The screen-edge VIGNETTE is a
// flash, throttled per side: a ram hitting once a second must not strobe the
// whole screen, so a side can flash at most once per `VIGNETTE_GAP_MS`.

export const GATE_ALARM_MS = 1500
export const VIGNETTE_MS = 650
export const VIGNETTE_GAP_MS = 1200

/** -1 = from the left, 1 = from the right, 0 = from above / no side (a bomb,
 *  a fire, a blast). */
export type HitSide = -1 | 0 | 1

let gateHitAt = -Infinity
/** Indexed by side + 1. When each side's current flash started. */
const vignetteAt = [-Infinity, -Infinity, -Infinity]

export const noteGateHit = (side: HitSide, now: number): void => {
  gateHitAt = now
  const i = side + 1
  if (ageOf(vignetteAt[i]!, now) >= VIGNETTE_GAP_MS) vignetteAt[i] = now
  // A new hop may start once the last one is mostly through; restarting it on
  // every blow of a siege would pin the Gate at the start of the curve.
  if (ageOf(gatePopAt, now) >= GATE_POP_MS * GATE_POP_REARM) gatePopAt = now
}

// ─── The Gate's own reaction: blink and hop ─────────────────────────────────
//
// The outline and the edge wash say "the Gate is under attack"; they did not
// make a hit FEEL like a hit. The Gate itself now takes the blow the way a
// cartoon character does: it flashes white-red-white-red, sharp, and hops —
// up about 12 % off its base, down past rest, and a smaller bounce back — then
// settles. At most about three hops a second under a sustained siege.

export const GATE_POP_MS = 480
/** Fraction of a hop that must have played before the next hit restarts it. */
const GATE_POP_REARM = 0.7
/** Length of one white or red blink, ms. Four of them, then the red fades. */
const GATE_BLINK_MS = 60
const GATE_BLINKS = 4

let gatePopAt = -Infinity

/**
 * The Gate's scale, 1 at rest: a damped spring — peak ≈ 1.117 at 9 % of the
 * hop, a dip to ≈ 0.955, a last ≈ 1.017, then rest. 1 under reduced motion.
 */
export const gatePopScale = (now: number): number => {
  if (reduceMotion) return 1
  const age = ageOf(gatePopAt, now)
  if (age >= GATE_POP_MS) return 1
  const p = age / GATE_POP_MS
  return 1 + 0.18 * Math.exp(-4.2 * p) * Math.sin(2 * Math.PI * 2.2 * p)
}

/** Alpha of the WHITE blink over the Gate (the even blinks). */
export const gateBlinkWhite = (now: number): number => {
  if (reduceMotion) return 0
  const age = ageOf(gatePopAt, now)
  if (age >= GATE_BLINK_MS * GATE_BLINKS) return 0
  return Math.floor(age / GATE_BLINK_MS) % 2 === 0 ? 0.82 : 0
}

/**
 * Alpha of the RED over the Gate: the odd blinks, then a fade to the end of
 * the hop. Under reduced motion there is no strobe — a single red wash that
 * drains, the same "you were hit" without the flicker.
 */
export const gateBlinkRed = (now: number): number => {
  const age = ageOf(gatePopAt, now)
  if (age >= GATE_POP_MS) return 0
  const strobe = GATE_BLINK_MS * GATE_BLINKS
  if (reduceMotion || age >= strobe) {
    const from = reduceMotion ? 0 : strobe
    return 0.62 * (1 - (age - from) / (GATE_POP_MS - from))
  }
  return Math.floor(age / GATE_BLINK_MS) % 2 === 1 ? 0.7 : 0
}

/** 0..1 — how strongly the Gate should still read as under attack. */
export const gateAlarm = (now: number): number => {
  const age = ageOf(gateHitAt, now)
  return age >= GATE_ALARM_MS ? 0 : 1 - age / GATE_ALARM_MS
}

/**
 * 0..1 — the red wash at one screen edge (`side` -1 left, 1 right, 0 both
 * sides at once, which is what a blow from above gets).
 *
 * Reduced motion swaps the flash for a steady tint held while the Gate is
 * under attack: the same information, nothing pulsing.
 */
export const vignette = (side: HitSide, now: number): number => {
  if (reduceMotion) {
    const recent = ageOf(vignetteAt[side + 1]!, now) < GATE_ALARM_MS
    return recent && gateAlarm(now) > 0 ? 0.55 : 0
  }
  const age = ageOf(vignetteAt[side + 1]!, now)
  if (age >= VIGNETTE_MS) return 0
  // Fast in, slow out: the hit lands, then the colour drains.
  const p = age / VIGNETTE_MS
  return p < 0.12 ? p / 0.12 : 1 - (p - 0.12) / 0.88
}

// ─── Refused placement (desktop) ────────────────────────────────────────────
//
// The scene knows the moment a click was refused; the renderer knows the time.
// So the scene only RAISES a flag and the renderer stamps it on its next frame
// — nothing in the input handler needs a clock.

export const REJECT_MS = 900

let rejectRequested = false
let rejectAt = -Infinity

export const requestRejectFlash = (): void => { rejectRequested = true }

/** 0..1 — the shake on the red ghost and the green flash on the legal anchors. */
export const rejectFlash = (now: number): number => {
  if (rejectRequested) {
    rejectRequested = false
    rejectAt = now
  }
  const age = ageOf(rejectAt, now)
  return age >= REJECT_MS ? 0 : 1 - age / REJECT_MS
}

/** Horizontal shake for the refused ghost, in cells. Zero under reduced
 *  motion — the green anchors carry the answer on their own. */
export const rejectShake = (now: number): number => {
  if (reduceMotion) return 0
  const k = rejectFlash(now)
  if (k <= 0) return 0
  // Only the first half of the window shakes; the anchors keep glowing after.
  const s = (k - 0.5) * 2
  if (s <= 0) return 0
  return Math.sin(now / 22) * 0.09 * s
}

// ─── Enemies nothing can reach ──────────────────────────────────────────────
//
// Written by the simulation's reach scan (throttled there to 4 Hz), read by
// the renderer every frame and by the HUD through the reactive count. A plain
// Set refilled in place — the scan allocates nothing.

const stranded = new Set<number>()

/** How many enemies are attacking (or parked at standoff) where no gun on the
 *  tower can shoot them. Reactive: the Volley button pulses off it. */
export const strandedCount = ref(0)

export const beginStrandedScan = (): void => { stranded.clear() }
export const markStranded = (uid: number): void => { stranded.add(uid) }
export const endStrandedScan = (): void => {
  if (strandedCount.value !== stranded.size) strandedCount.value = stranded.size
}
export const isStranded = (uid: number): boolean => stranded.has(uid)

// ─── Reset ──────────────────────────────────────────────────────────────────

export const resetWorldCues = (): void => {
  for (const m of lostMarks) m.live = false
  lostCursor = 0
  gateHitAt = -Infinity
  gatePopAt = -Infinity
  vignetteAt[0] = vignetteAt[1] = vignetteAt[2] = -Infinity
  rejectRequested = false
  rejectAt = -Infinity
  stranded.clear()
  strandedCount.value = 0
}
