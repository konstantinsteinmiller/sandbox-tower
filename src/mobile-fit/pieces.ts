import { registerShapeDefs, type ShapeDef } from '@/game/shapes'

// ─── Drop pieces ────────────────────────────────────────────────────────────
//
// The mobile-fit board is built by dropping single blocks into columns, so its
// "shapes" are one cell tall and one cell wide — plus a single two-tall piece,
// a crate with a gun already on it, which is the only stack the deck ever
// deals pre-assembled. Anything wider would need aiming, and aiming is the
// thing this board exists to remove.
//
// These are registered in the shared shape index (so the crate ladder cuts a
// braced and a spiked variant of `b_wood` exactly as it does for the desktop's
// crates) but never enter `SHAPE_DEFS`: the desktop deck cannot roll them.
// This module's pool is handed to the dealer through the rule set.

export const PIECE_DEFS: ReadonlyArray<ShapeDef> = [
  // ── Structure ────────────────────────────────────────────────────────────
  { id: 'b_wood', lane: 'structure', weight: 14, cells: [[0, 0, 'wood']] },
  { id: 'b_stone', lane: 'structure', weight: 9, cells: [[0, 0, 'stone']] },

  // ── Weapons ──────────────────────────────────────────────────────────────
  { id: 'b_archer', lane: 'weapon', weight: 12, cells: [[0, 0, 'archer']] },
  { id: 'b_cannon', lane: 'weapon', weight: 10, cells: [[0, 0, 'cannon']] },
  { id: 'b_bombard', lane: 'weapon', weight: 8, cells: [[0, 0, 'bombard']] },
  { id: 'b_tesla', lane: 'weapon', weight: 7, cells: [[0, 0, 'tesla']] },
  // A crate with the gun already on it: the one piece that teaches "guns want
  // a base under them" by arriving that way.
  { id: 'perchArcher', lane: 'weapon', weight: 6, cells: [[0, 0, 'wood'], [0, 1, 'archer']], minWave: 3 },
  { id: 'perchCannon', lane: 'weapon', weight: 5, cells: [[0, 0, 'wood'], [0, 1, 'cannon']], minWave: 5 },

  // ── Support (dealt through the free lane — there is no works slot) ───────
  { id: 'b_lumberHut', lane: 'support', weight: 10, cells: [[0, 0, 'lumberHut']] }
]

registerShapeDefs(PIECE_DEFS)

/** Every block type a drop piece can be made of, for the art probe. */
export const PIECE_BLOCK_IDS: ReadonlyArray<string> = [
  ...new Set(PIECE_DEFS.flatMap((p) => p.cells.map(([, , t]) => t)))
]
