// ─── Merge tiers, colour-coded ──────────────────────────────────────────────
//
// Every merged block says how deep its weld goes, and it used to say it in one
// colour: a steel plate reading II, III, 4, 5 … in the same grey-on-black at
// every depth. Players read that as "merged" and nothing more — the plate on a
// tier-3 gun looked exactly as special as the one on a tier 2, so the reason to
// keep welding past the first fusion was invisible. The measured result was
// towers full of tier 2s.
//
// So each tier gets its own colour, on the ladder every loot game has already
// taught the audience: green, blue, purple, orange, red. The badge, the
// weapon's rim light, the merge burst, the shot's halo and the inspector tag
// all read from here, so "the blue one" means the same thing everywhere it
// appears.
//
// Gold is deliberately NOT a rung. Gold on this battlefield means one thing —
// reinforced, bought with a rewarded video — and a merged block wearing it
// would be mistaken for one. Tier 5's orange sits well clear of that rim.

export interface TierStyle {
  /** The tier's colour, as `#rrggbb` — rims, text, glows. */
  hex: string
  /** The same colour as an `r, g, b` triplet, for `rgba()` strings. */
  rgb: readonly [number, number, number]
  /** Plate gradient, lit top to shaded bottom. */
  plateTop: string
  plateBottom: string
  /** The numeral on the plate. Dark on the light rungs, white on the rest. */
  ink: string
}

const style = (hex: string, plateTop: string, plateBottom: string, ink = '#ffffff'): TierStyle => {
  const n = Number.parseInt(hex.slice(1), 16)
  return { hex, rgb: [(n >> 16) & 255, (n >> 8) & 255, n & 255], plateTop, plateBottom, ink }
}

/** Tier 1 has no plate; it is listed so the table can be indexed by tier. */
const LADDER: readonly TierStyle[] = [
  style('#c3d0de', '#dfe7f0', '#8d9aab', '#1b2230'),
  style('#46d86a', '#8cf5a2', '#1f9a3e'),
  style('#3fa2ff', '#9ad0ff', '#1b62d6'),
  style('#b467ff', '#dcb2ff', '#7426d0'),
  style('#ff8a24', '#ffc178', '#d45406'),
  style('#ff4040', '#ff9c8c', '#b81818'),
  style('#ff5cc8', '#ffb3e6', '#c41f8f'),
  style('#22d8d0', '#9cf6ef', '#0c948e')
]

/**
 * The style for a tier.
 *
 * Past the end of the ladder the last rung repeats rather than cycling back to
 * green: a tier-12 weld that wore tier 2's colour would read as the weakest gun
 * on the board, which is the opposite of the truth.
 */
export const tierStyle = (tier: number): TierStyle => {
  const i = Math.max(0, Math.min(LADDER.length - 1, Math.floor(tier) - 1))
  return LADDER[i]!
}

/** The highest tier with a colour of its own — tiers past it share it. */
export const TIER_RUNGS = LADDER.length
