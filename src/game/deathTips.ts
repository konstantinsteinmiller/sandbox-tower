// ─── What each death-screen tip is about ────────────────────────────────────
//
// The 2026-09-11 blind playtest: every desktop tester was told, on a defeat
// screen, about "lumber huts and stone pits" or "banners" — and most of them
// had never seen either. The stone pit is locked behind the tree, and the
// banner is the flag card that had sat in their hand all run under a name the
// card never shows. A tip naming a thing the player cannot find reads as "you
// lost because of something we never told you", which is the opposite of what a
// tip is for.
//
// So every tip that names a block now SHOWS it: the tile beside the line is the
// same tile the tray deals, and a locked one wears a padlock and the tech
// tree's glyph — "this is in the tree", said without a word. And a tip whose
// every block is still locked is only offered when it is the answer to what
// ended the run; otherwise another tip goes first.

export type TipId = 'siegeReach' | 'eco' | 'buff' | 'merge' | 'spend' | 'branches' | 'shape' | 'gold'

export interface TipPictogram {
  /** Block tiles, in the order the line names them. */
  blocks: readonly string[]
  /** How the blocks gate the tip. `any`: offered only while at least one of
   *  them can be placed. `none`: offered regardless — the tip is also about
   *  something the player can already do, or it is the answer to the death. */
  gate: 'any' | 'none'
  /** Draw the two-into-one merge sum instead of a row of tiles. */
  merge?: boolean
  /** Lead with the tech tree's glyph. */
  tech?: boolean
  /** Lead with the run-gold ingot. */
  gold?: boolean
}

const NONE: TipPictogram = { blocks: [], gate: 'none' }

export const TIP_PICTOGRAMS: Readonly<Record<TipId, TipPictogram>> = {
  // "Lumber huts and stone pits pay you every wave." The hut is dealt freely on
  // the desktop board; the pit is a tree unlock. Advice about producers is only
  // worth giving while one of them can actually be built.
  eco: { blocks: ['lumberHut', 'stonepit'], gate: 'any' },
  // "Banners boost every block they touch." The flag card.
  buff: { blocks: ['banner'], gate: 'any' },
  // "Gold buys block upgrades … Coffers mint more." The first half is always
  // actionable, so the locked coffer does not take the tip away.
  gold: { blocks: ['coffer'], gate: 'none', gold: true },
  // "Answer them with a Mortar — or a War Galley." Offered only to a player a
  // trebuchet has just out-ranged: even locked, this is the answer.
  siegeReach: { blocks: ['mortar', 'galley'], gate: 'none' },
  // "Walls in front, guns behind."
  shape: { blocks: ['stone', 'cannon'], gate: 'none' },
  // "Two identical weapons side by side fuse into one."
  merge: { blocks: ['cannon'], gate: 'none', merge: true },
  spend: { ...NONE, tech: true },
  branches: { ...NONE, tech: true }
}

/** The pictogram for a tip id; an unknown id draws nothing. */
export const tipPictogram = (id: string): TipPictogram =>
  (TIP_PICTOGRAMS as Record<string, TipPictogram>)[id] ?? NONE

/** Can the player act on this tip in their next run? */
export const isTipUsable = (id: string, available: ReadonlySet<string>): boolean => {
  const p = tipPictogram(id)
  if (p.gate === 'none' || p.blocks.length === 0) return true
  return p.blocks.some((b) => available.has(b))
}
