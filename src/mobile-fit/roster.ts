import type { PreviewTable } from '@/game/waves'

// ─── Who comes, and when ────────────────────────────────────────────────────
//
// Ten enemies out of the desktop's twenty-one. Everything that needs width is
// gone: the slinger parks four cells out, which on a portrait phone is off the
// screen; every siege engine stands off further still; the sea lane needs a
// water row the board does not have. What stays is the ground rush from both
// flanks, the sky (divers, then bombers, then the fire-throwers) and the boss.
//
// The sky is the part a portrait screen shows best — two rows of it over the
// board at the fit, far more zoomed out — so it carries a far larger share of
// each wave here than on the desktop (see `airShare` in the rules).

export const DROPMERGE_ROSTER: ReadonlySet<string> = new Set([
  'grunt', 'runner', 'brute', 'bulwark', 'bomber',
  'bat', 'wyvern', 'bombardier', 'firebug',
  'golem'
])

/** A shorter run wants its ideas sooner. */
export const DROPMERGE_MIN_WAVE: Readonly<Record<string, number>> = {
  // The desktop holds bats back to wave 9; here the sky is live from wave 2,
  // and an air share with nothing in its pool buys nothing at all.
  bat: 2,
  bulwark: 8,
  bombardier: 10,
  wyvern: 11,
  firebug: 15
}

/**
 * One of each new thing, a few waves before it arrives in numbers.
 *
 * A bat on each of the first three waves, because the early air budget is too
 * small to buy one by itself (a bat costs 20 and wave 2's slice is ~13) — and
 * something coming down out of the sky is the most eye-catching thing this
 * board can show a player in their first half-minute. A preview is billed at
 * half price, so these add a flyer without taking a whole bat's worth of the
 * wave away from the ground rush.
 */
export const DROPMERGE_PREVIEWS: PreviewTable = {
  1: [['bat', 1]],
  2: [['bat', 1]],
  3: [['bat', 1]],
  5: [['bomber', 1]],
  7: [['bulwark', 1]],
  9: [['bombardier', 1]],
  13: [['firebug', 1]]
}

/** Every block the mode can ever deal or restore. */
export const DROPMERGE_BLOCKS: ReadonlySet<string> = new Set([
  'wood', 'brace', 'stone', 'spikes',
  'archer', 'cannon', 'bombard', 'tesla',
  'lumberHut'
])
