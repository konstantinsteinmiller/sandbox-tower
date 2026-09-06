import type { PreviewTable } from '@/game/waves'

// ─── Who comes, and when ────────────────────────────────────────────────────
//
// Nine enemies out of the desktop's twenty-one. Everything that needs width is
// gone: the slinger parks four cells out, which on a portrait phone is off the
// screen; every siege engine stands off further still; the sea lane needs a
// water row the board does not have. What stays is the ground rush from both
// flanks, the sky (divers, then bombers) and the boss.

export const DROPMERGE_ROSTER: ReadonlySet<string> = new Set([
  'grunt', 'runner', 'brute', 'bulwark', 'bomber',
  'bat', 'wyvern', 'bombardier',
  'golem'
])

/** A shorter run wants its ideas sooner. */
export const DROPMERGE_MIN_WAVE: Readonly<Record<string, number>> = {
  bulwark: 8,
  bombardier: 10,
  wyvern: 12
}

/** One of each new thing, a few waves before it arrives in numbers. */
export const DROPMERGE_PREVIEWS: PreviewTable = {
  3: [['bat', 1]],
  5: [['bomber', 1]],
  7: [['bulwark', 1]],
  9: [['bombardier', 1]]
}

/** Every block the mode can ever deal or restore. */
export const DROPMERGE_BLOCKS: ReadonlySet<string> = new Set([
  'wood', 'brace', 'stone', 'spikes',
  'archer', 'cannon', 'bombard', 'tesla',
  'lumberHut'
])
