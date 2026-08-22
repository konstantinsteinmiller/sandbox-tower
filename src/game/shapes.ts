import { blockDef } from './blocks'

// ─── Build shapes ───────────────────────────────────────────────────────────
//
// The player does not place single blocks — they place POLYOMINOES, the way the
// reference towers are built: dominoes, L-bends, 2×2 squares, a cannon already
// mounted on its plinth. Four shapes are offered at a time; placing one rerolls
// that slot.
//
// Why this is better than a flat block palette:
//   • Every placement is a small spatial puzzle instead of a single tap.
//   • The offer deck creates scarcity — you build with what you're dealt, so no
//     two towers look alike and "what do I do with THIS piece" is a real
//     question every few seconds.
//   • Shapes that arrive pre-assembled (cannon-on-plinth) teach good structure
//     by example: the player learns that turrets want a base under them.
//
// ROOFS. Some shapes are capped with a gable. A roofed cell cannot be built on
// top of, which makes roofed pieces a genuine trade: they are cheap and sturdy,
// but they permanently close that column to further growth. Sealing your tower
// too early is a real way to lose.

export interface ShapeDef {
  id: string
  /** Cells as `[dx, dy, blockTypeId]`, normalised so min dx = min dy = 0.
   *  `dy` grows UPWARD, matching world space. */
  cells: Array<[number, number, string]>
  /** Indices into `cells` that carry a roof. Nothing may be placed directly
   *  above a roofed cell. */
  roofs?: number[]
  /** Which offer lane this shape can be drawn into. */
  lane: 'structure' | 'weapon' | 'support' | 'naval'
  /** Relative draw weight within its lane. */
  weight: number
  /** Earliest wave the shape enters the deck (keeps wave 1 simple). */
  minWave?: number
}

/** Shorthand for a rectangular run of one block type. */
const row = (n: number, type: string, y = 0): Array<[number, number, string]> =>
  Array.from({ length: n }, (_, i) => [i, y, type] as [number, number, string])

export const SHAPE_DEFS: ReadonlyArray<ShapeDef> = [
  // ── Structure: wood ───────────────────────────────────────────────────────
  { id: 'w1', lane: 'structure', weight: 10, cells: [[0, 0, 'wood']] },
  { id: 'w2h', lane: 'structure', weight: 14, cells: row(2, 'wood') },
  { id: 'w2v', lane: 'structure', weight: 10, cells: [[0, 0, 'wood'], [0, 1, 'wood']] },
  { id: 'w3h', lane: 'structure', weight: 9, cells: row(3, 'wood') },
  // L / J bends — the pieces that let you build outward overhangs.
  { id: 'wL', lane: 'structure', weight: 9, cells: [[0, 0, 'wood'], [0, 1, 'wood'], [1, 1, 'wood']] },
  { id: 'wJ', lane: 'structure', weight: 9, cells: [[1, 0, 'wood'], [0, 1, 'wood'], [1, 1, 'wood']] },
  { id: 'wO', lane: 'structure', weight: 8, cells: [[0, 0, 'wood'], [1, 0, 'wood'], [0, 1, 'wood'], [1, 1, 'wood']] },
  { id: 'wT', lane: 'structure', weight: 7, cells: [[0, 0, 'wood'], [1, 0, 'wood'], [2, 0, 'wood'], [1, 1, 'wood']] },
  { id: 'wS', lane: 'structure', weight: 6, cells: [[0, 0, 'wood'], [1, 0, 'wood'], [1, 1, 'wood'], [2, 1, 'wood']] },
  { id: 'wZ', lane: 'structure', weight: 6, cells: [[1, 0, 'wood'], [2, 0, 'wood'], [0, 1, 'wood'], [1, 1, 'wood']] },
  // Roofed gable — cheap and solid, but caps the column for good.
  { id: 'wRoof2', lane: 'structure', weight: 7, cells: row(2, 'wood'), roofs: [0, 1] },
  { id: 'wRoof3', lane: 'structure', weight: 5, cells: row(3, 'wood'), roofs: [0, 1, 2], minWave: 2 },

  // ── Structure: braced (tech-gated by the blocks it contains) ─────────────
  // NOTE: there are no hand-authored braced or spiked crate shapes. There used
  // to be exactly three — a domino, an L and a 2x2 — and they were the only
  // braced geometry in the game, which meant unlocking the Braced Crate turned
  // ten wood shapes into thirteen shapes rather than into ten better ones.
  //
  // The crate LADDER replaces them (see `upgradeCrateShape`): every wood shape
  // in this list is dealt in the best crate the player has unlocked and can
  // pay for, so the L-bends, the T, the S and Z and the gables all arrive in
  // braced and spiked too. Keeping the three authored ones alongside that would
  // have double-weighted precisely those three silhouettes.

  // ── Structure: stone ─────────────────────────────────────────────────────
  { id: 's1', lane: 'structure', weight: 9, cells: [[0, 0, 'stone']] },
  { id: 's2h', lane: 'structure', weight: 10, cells: row(2, 'stone') },
  { id: 's2v', lane: 'structure', weight: 7, cells: [[0, 0, 'stone'], [0, 1, 'stone']] },
  { id: 'sL', lane: 'structure', weight: 6, cells: [[0, 0, 'stone'], [0, 1, 'stone'], [1, 1, 'stone']] },
  { id: 'sO', lane: 'structure', weight: 5, cells: [[0, 0, 'stone'], [1, 0, 'stone'], [0, 1, 'stone'], [1, 1, 'stone']] },
  { id: 'sRoof2', lane: 'structure', weight: 5, cells: row(2, 'stone'), roofs: [0, 1], minWave: 2 },

  // ── Weapons ──────────────────────────────────────────────────────────────
  { id: 'archer1', lane: 'weapon', weight: 12, cells: [[0, 0, 'archer']] },
  // Pre-mounted turrets: the shape itself teaches "put a base under the gun".
  { id: 'archerPerch', lane: 'weapon', weight: 9, cells: [[0, 0, 'wood'], [0, 1, 'archer']] },
  { id: 'cannon1', lane: 'weapon', weight: 11, cells: [[0, 0, 'cannon']] },
  { id: 'cannonMount', lane: 'weapon', weight: 8, cells: [[0, 0, 'wood'], [1, 0, 'wood'], [0, 1, 'cannon']] },
  { id: 'mortar1', lane: 'weapon', weight: 9, cells: [[0, 0, 'mortar']] },
  { id: 'bombard1', lane: 'weapon', weight: 10, cells: [[0, 0, 'bombard']] },
  { id: 'bombardPit', lane: 'weapon', weight: 6, cells: [[0, 0, 'stone'], [0, 1, 'bombard']] },
  { id: 'mortarPit', lane: 'weapon', weight: 6, cells: [[0, 0, 'stone'], [1, 0, 'stone'], [0, 1, 'mortar']] },
  { id: 'tesla1', lane: 'weapon', weight: 9, cells: [[0, 0, 'tesla']] },
  { id: 'teslaSpire', lane: 'weapon', weight: 5, cells: [[0, 0, 'stone'], [0, 1, 'tesla']] },
  { id: 'frost1', lane: 'weapon', weight: 8, cells: [[0, 0, 'frost']] },
  { id: 'archerPair', lane: 'weapon', weight: 5, cells: [[0, 0, 'archer'], [1, 0, 'archer']], minWave: 4 },

  // ── Support: utility + economy ───────────────────────────────────────────
  { id: 'spikes1', lane: 'support', weight: 11, cells: [[0, 0, 'spikes']] },
  { id: 'spikes2v', lane: 'support', weight: 8, cells: [[0, 0, 'spikes'], [0, 1, 'spikes']], minWave: 3 },
  { id: 'spikeWall', lane: 'support', weight: 6, cells: row(2, 'spikes'), minWave: 5 },
  { id: 'sawmill1', lane: 'support', weight: 10, cells: [[0, 0, 'sawmill']] },
  { id: 'quarry1', lane: 'support', weight: 10, cells: [[0, 0, 'quarry']] },
  { id: 'mint1', lane: 'support', weight: 8, cells: [[0, 0, 'mint']] },
  { id: 'repair1', lane: 'support', weight: 8, cells: [[0, 0, 'repair']] },
  { id: 'sawmillPair', lane: 'support', weight: 4, cells: row(2, 'sawmill'), minWave: 5 },

  // ── Support: buffs + early economy ───────────────────────────────────────
  //
  // These carry the support slot for a player with no tech at all. `banner` and
  // `lumberHut` are un-gated for exactly that reason: a fifth slot that deals
  // nothing until a purchase is made is a fifth slot that does not exist.
  //
  // The buff shapes lean SINGLE and VERTICAL, because a banner is worth what it
  // touches: one cell wedged into a wall touches four blocks, while a 2x2 of
  // them mostly touches itself.
  // Every one of these is PURE — producers and buffs only, no wall cell mixed
  // in. The works slot picks by block kind (see `isWorksShape`), so a piece
  // with a single crate in it would simply never be dealt there; authoring
  // them clean keeps the multi-cell pieces available to that slot instead of
  // stranding them in the two free lanes.
  { id: 'banner1', lane: 'support', weight: 14, cells: [[0, 0, 'banner']] },
  { id: 'bannerV', lane: 'support', weight: 6, cells: [[0, 0, 'banner'], [0, 1, 'banner']], minWave: 4 },
  { id: 'bannerPair', lane: 'support', weight: 6, cells: row(2, 'banner'), minWave: 4 },
  { id: 'obelisk1', lane: 'support', weight: 9, cells: [[0, 0, 'obelisk']] },
  { id: 'obeliskCrown', lane: 'support', weight: 5, cells: [[0, 0, 'obelisk'], [0, 1, 'banner']], minWave: 6 },
  { id: 'lumberHut1', lane: 'support', weight: 12, cells: [[0, 0, 'lumberHut']] },
  { id: 'lumberHutPair', lane: 'support', weight: 5, cells: row(2, 'lumberHut'), minWave: 6 },
  { id: 'stonepit1', lane: 'support', weight: 11, cells: [[0, 0, 'stonepit']] },
  { id: 'worksYard', lane: 'support', weight: 6, cells: [[0, 0, 'lumberHut'], [1, 0, 'stonepit']], minWave: 5 },
  { id: 'coffer1', lane: 'support', weight: 10, cells: [[0, 0, 'coffer']] },
  { id: 'cofferBanner', lane: 'support', weight: 5, cells: [[0, 0, 'coffer'], [0, 1, 'banner']], minWave: 8 },

  // ── Naval ────────────────────────────────────────────────────────────────
  //
  // Hulls are always 1x1 and always alone: a ship is moored in a berth, not
  // assembled out of polyominoes, and a two-cell "shape" made of boats would
  // be nonsense the moment the player tried to read it.
  //
  // `naval` is its own lane, and NO slot is locked to it — so ships only ever
  // turn up in the two free slots. A harbour is a second front, not a
  // replacement for the hand, and the structure and weapon lanes must keep
  // doing their jobs whatever the player has unlocked.
  { id: 'skiff1', lane: 'naval', weight: 10, cells: [[0, 0, 'skiff']] },
  { id: 'longship1', lane: 'naval', weight: 8, cells: [[0, 0, 'longship']] },
  { id: 'galley1', lane: 'naval', weight: 6, cells: [[0, 0, 'galley']] }
]

// ─── The crate ladder ───────────────────────────────────────────────────────
//
// A wall is a wall is a wall: the crate the player builds out of should be the
// best one they own, not a lucky draw between three tiers of the same idea.
//
// Before this, unlocking the Braced Crate ADDED braced pieces to a deck that
// still dealt plain wood, and unlocking the Spiked Wall added a third. Two
// thirds of the structure lane was then pieces the player had already outgrown
// — and the game's own rule about that is written into the tech tree: nobody
// should ever be offered a strictly worse version of something they own.
//
// So the tiers are a LADDER, applied when a piece is dealt. The geometry is
// rolled first (an L is an L), then it is built out of the best crate the
// player has unlocked AND can currently pay for.
//
// The affordability step is not a nicety. A spiked crate costs stone, which no
// wood shape ever did, so a blanket upgrade would hand a stone-poor player a
// hand of walls they cannot place — the exact dead hand `ensureAffordableWeapon`
// exists to prevent on the weapon slot. Falling back down the ladder means the
// deck always offers the best wall the player can actually build.
//
// Stone crates are deliberately NOT on the ladder. They are not a deeper rank
// of a wooden crate — they are the other material, bought in the other
// currency, and they have their own shapes.

/** Cheapest to best. The index IS the tier. */
export const CRATE_LADDER = ['wood', 'brace', 'spikes'] as const

const crateTier = (typeId: string): number =>
  (CRATE_LADDER as ReadonlyArray<string>).indexOf(typeId)

/** A shape built entirely out of one crate on the ladder. */
const isCrateShape = (s: ShapeDef): boolean =>
  s.cells.length > 0 && s.cells.every(([, , t]) => crateTier(t) >= 0)

/** `wL` in spiked crates is `wL~spikes`. The base tier keeps the bare id. */
const crateVariantId = (baseId: string, tier: number): string =>
  `${baseId}~${CRATE_LADDER[tier]}`

/**
 * Every crate shape re-cut in every tier above its own.
 *
 * Registered in `SHAPE_BY_ID` but deliberately NOT added to `SHAPE_DEFS`: they
 * must never be ROLLED, only projected onto by `upgradeCrateShape`. A variant
 * in the draw pool would put the same silhouette in the hat three times.
 */
const CRATE_VARIANTS: ShapeDef[] = SHAPE_DEFS.flatMap((s) => {
  if (!isCrateShape(s)) return []
  const base = crateTier(s.cells[0]![2])
  const out: ShapeDef[] = []
  for (let tier = base + 1; tier < CRATE_LADDER.length; tier++) {
    out.push({
      ...s,
      id: crateVariantId(s.id, tier),
      cells: s.cells.map(([dx, dy]) => [dx, dy, CRATE_LADDER[tier]!] as [number, number, string]),
      roofs: s.roofs ? [...s.roofs] : undefined
    })
  }
  return out
})

export const SHAPE_BY_ID: Record<string, ShapeDef> = Object.fromEntries(
  [...SHAPE_DEFS, ...CRATE_VARIANTS].map((s) => [s.id, s])
)

/**
 * The tier of `id` this player should actually be handed.
 *
 * Walks the ladder DOWN from the best crate they have unlocked and returns the
 * first one they can pay for. If they can afford none of it — including the
 * plain wood they started with — they get the cheapest anyway, because a hand
 * has to show them what the cheapest thing costs.
 *
 * Anything that is not a pure crate shape (a cannon on its stone plinth, a
 * banner, a hull) is returned untouched.
 */
export const upgradeCrateShape = (
  id: string,
  unlockedBlocks: Set<string>,
  canAfford: (shapeId: string) => boolean
): string => {
  const base = SHAPE_BY_ID[id]
  if (!base || !isCrateShape(base)) return id
  const baseTier = crateTier(base.cells[0]![2])

  for (let tier = CRATE_LADDER.length - 1; tier > baseTier; tier--) {
    const mat = CRATE_LADDER[tier]!
    if (!unlockedBlocks.has(mat)) continue
    const vid = crateVariantId(id, tier)
    if (SHAPE_BY_ID[vid] && canAfford(vid)) return vid
  }
  return id
}

/** The base shape an upgraded crate piece was cut from — `wL~spikes` → `wL`. */
export const crateBaseId = (id: string): string => {
  const cut = id.indexOf('~')
  return cut === -1 ? id : id.slice(0, cut)
}

export const shapeDef = (id: string): ShapeDef => SHAPE_BY_ID[id] ?? SHAPE_DEFS[0]!

/** Total build cost — the sum of every constituent block. */
export const shapeCost = (id: string): { wood: number; stone: number; coins: number } => {
  const def = SHAPE_BY_ID[id]
  if (!def) return { wood: 0, stone: 0, coins: 0 }
  let wood = 0
  let stone = 0
  let coins = 0
  for (const [, , typeId] of def.cells) {
    const b = blockDef(typeId)
    wood += b.cost.wood ?? 0
    stone += b.cost.stone ?? 0
    coins += b.cost.coins ?? 0
  }
  return { wood, stone, coins }
}

/** Bounding box in cells — the tray uses it to scale the thumbnail. */
export const shapeBounds = (id: string): { w: number; h: number } => {
  const def = SHAPE_BY_ID[id]
  if (!def) return { w: 1, h: 1 }
  let w = 1
  let h = 1
  for (const [dx, dy] of def.cells) {
    if (dx + 1 > w) w = dx + 1
    if (dy + 1 > h) h = dy + 1
  }
  return { w, h }
}

/** Distinct block types in a shape, in first-appearance order. Drives the
 *  tooltip's "what am I actually placing" line. */
export const shapeBlockTypes = (id: string): string[] => {
  const def = SHAPE_BY_ID[id]
  if (!def) return []
  const seen: string[] = []
  for (const [, , typeId] of def.cells) if (!seen.includes(typeId)) seen.push(typeId)
  return seen
}

// ─── Rotation ───────────────────────────────────────────────────────────────
//
// Placement is a spatial puzzle, and a puzzle you cannot turn the piece in is
// not a puzzle — it is a draw. Being handed an L that only ever opens one way
// makes the deck feel like the thing playing, so every piece with more than one
// cell can be turned in ninety-degree steps.
//
// A single cell is excluded because rotating it is a no-op that still costs the
// player a keypress and a moment wondering whether the game heard them.

/** How many distinct orientations a shape has: 1 (never rotates) or 4. */
export const shapeRotations = (id: string): number =>
  (SHAPE_BY_ID[id]?.cells.length ?? 0) > 1 ? 4 : 1

/** Can this shape be turned at all? */
export const canRotateShape = (id: string): boolean => shapeRotations(id) > 1

/** Normalise a rotation index into 0..3. */
export const normRot = (rot: number): number => ((rot % 4) + 4) % 4

/**
 * The cells of `id` turned `rot` quarter-turns clockwise on screen, re-anchored
 * so the lowest-left cell is again at (0, 0).
 *
 * `dy` grows UPWARD (world space, not screen space), so a clockwise turn as the
 * player sees it is `(x, y) → (y, -x)`.
 *
 * ROOFS are re-derived rather than carried. A gable is not a decoration bolted
 * to a particular cell — it is the statement "this column ends here", so after
 * a turn it belongs on whichever cells have open sky within the piece. Carrying
 * the authored indices instead would rotate a horizontal roofed run into a
 * vertical one whose BOTTOM cell is sealed, making the piece illegal against
 * its own second cell — a shape that can never be placed in any orientation.
 */
export const rotatedShape = (
  id: string, rot: number
): { cells: Array<[number, number, string]>; roofs: number[] } => {
  const def = SHAPE_BY_ID[id]
  if (!def) return { cells: [], roofs: [] }
  const r = canRotateShape(id) ? normRot(rot) : 0
  if (r === 0) return { cells: def.cells.map((c) => [...c] as [number, number, string]), roofs: [...(def.roofs ?? [])] }

  // Turn first, then re-anchor. Cell ORDER is preserved throughout so anything
  // holding an index into `cells` still means the same physical cell.
  const turned = def.cells.map(([dx, dy, typeId]) => {
    let x = dx
    let y = dy
    for (let i = 0; i < r; i++) {
      const nx = y
      const ny = -x
      x = nx
      y = ny
    }
    return [x, y, typeId] as [number, number, string]
  })
  let minX = Infinity
  let minY = Infinity
  for (const [x, y] of turned) {
    if (x < minX) minX = x
    if (y < minY) minY = y
  }
  const cells = turned.map(([x, y, typeId]) => [x - minX, y - minY, typeId] as [number, number, string])

  // Only a shape that was authored with gables keeps any: rotation must not
  // invent a roof on a piece that never had one.
  const roofs: number[] = []
  if ((def.roofs?.length ?? 0) > 0) {
    const occupied = new Set(cells.map(([x, y]) => `${x},${y}`))
    cells.forEach(([x, y], i) => {
      if (!occupied.has(`${x},${y + 1}`)) roofs.push(i)
    })
  }
  return { cells, roofs }
}

export const shapeHasRoof = (id: string): boolean => (SHAPE_BY_ID[id]?.roofs?.length ?? 0) > 0

// ─── The offer deck ─────────────────────────────────────────────────────────
//
// Four slots, each with a FIXED LANE. Pure random draws would regularly hand
// the player four structure pieces during a wave where their tower has no guns,
// which reads as the game being unfair rather than as a puzzle. Locking lane 1
// to weapons guarantees a defensive option is always on the table; the two free
// lanes supply the variety.

export const OFFER_SLOTS = 5

const SLOT_LANES: ReadonlyArray<ShapeDef['lane'] | 'any'> = [
  'structure', // always something to build WITH
  'weapon',    // always something to shoot WITH
  'any',
  'any',
  'support'    // always a producer or a buff — see `SUPPORT_SLOT`
]

/** The slot whose lane is locked to weapons — the one the affordability net
 *  below is allowed to overwrite. */
export const WEAPON_SLOT = 1

/**
 * The WORKS slot: producers and buffs, and nothing else.
 *
 * Its pool is defined by block KIND rather than by lane — see `isWorksShape`.
 * The `support` lane is broader than this slot wants: it also carries the
 * spiked wall and the repair bay, which are utility blocks that fight, and a
 * lane check would have dealt them here alongside the economy pieces.
 *
 * It is STRICT, unlike the others. Every other lane falls through to the whole
 * catalogue when its own pool is empty, which is right for them — an empty
 * weapon lane should still deal something. But a works slot that falls through
 * is just a third "any" slot, and the entire point of it is to keep a producer
 * and a buff permanently on the table, because both are cells that do not
 * shoot and a player deciding between four guns will never choose one.
 *
 * `banner` and `lumberHut` carry no `unlockNode` so the pool is never empty.
 */
export const SUPPORT_SLOT = 4

/**
 * Is every cell of this shape a producer or a buff?
 *
 * Checked per BLOCK, so it cannot drift: a shape that mixes in a single crate
 * is not a works piece however it is laned, and a new economy block becomes
 * eligible the moment it is authored.
 */
export const isWorksShape = (s: ShapeDef): boolean =>
  s.cells.every(([, , typeId]) => {
    const kind = blockDef(typeId).kind
    return kind === 'economy' || kind === 'buff'
  })

/** Total build cost collapsed to one comparable number. Gold is the scarcest
 *  of the three within a run and stone the next, so they weigh more. */
const costWeight = (id: string): number => {
  const c = shapeCost(id)
  return c.wood + c.stone * 1.3 + c.coins * 2.5
}

/**
 * A gun the player can actually pay for right now.
 *
 * Locking slot 1 to the weapon lane guarantees a gun is on the table, but not
 * that the player can BUY it — and an unaffordable gun is the same as no gun.
 * A tesla (40 stone + 32 gold) rolled into the weapon lane on a wave where the
 * player has spent down to nothing leaves them watching a wave arrive with a
 * hand of four pieces they cannot place, which is a loss they were given no way
 * to prevent.
 *
 * Among affordable guns the pick is RANDOM, not cheapest: always falling back
 * to the archer would turn the safety net into a rut. Only when nothing is
 * affordable does it hand over the cheapest one, so the player is at least
 * looking at the gun they will be able to afford first.
 */
export const pickAffordableWeapon = (
  wave: number,
  unlockedBlocks: Set<string>,
  canAfford: (shapeId: string) => boolean,
  rand: () => number = Math.random
): string | null => {
  const guns = eligibleShapes(wave, unlockedBlocks).filter((s) => s.lane === 'weapon')
  if (guns.length === 0) return null
  const payable = guns.filter((s) => canAfford(s.id))
  if (payable.length === 0) {
    return guns.reduce((best, s) => (costWeight(s.id) < costWeight(best.id) ? s : best)).id
  }
  return payable[Math.min(payable.length - 1, Math.floor(rand() * payable.length))]!.id
}

/** Shapes whose every block type the player has unlocked, and whose `minWave`
 *  has been reached. */
export const eligibleShapes = (wave: number, unlockedBlocks: Set<string>): ShapeDef[] =>
  SHAPE_DEFS.filter((s) =>
    (s.minWave ?? 0) <= wave &&
    s.cells.every(([, , typeId]) => unlockedBlocks.has(typeId))
  )

/**
 * What a shape is ABOUT, for the purposes of "give me a different one".
 *
 * A shape's id is too fine a grain: `archer1` and `archerPerch` are different
 * ids and the same decision, so a reroll that swapped one for the other read as
 * the button doing nothing. The signature is the WEAPON a piece carries if it
 * carries one — that is the choice the player is rerolling — and otherwise the
 * set of block types it is built from.
 */
export const shapeSignature = (id: string): string => {
  const def = SHAPE_BY_ID[id]
  if (!def) return ''
  const types = [...new Set(def.cells.map(([, , t]) => t))]
  const weapons = types.filter((t) => blockDef(t).weapon).sort()
  return (weapons.length > 0 ? weapons : types.sort()).join('+')
}

/**
 * Draw one shape for `slot`. `exclude` holds the ids currently on offer so the
 * tray never shows the same piece twice — four identical dominoes would be a
 * non-choice.
 *
 * `avoid` is the piece being REPLACED. A reroll that can return what it just
 * took away is not a reroll, and the shape id alone is not enough to prevent
 * that — see `shapeSignature`. Honoured only when the pool has something else
 * to offer: a player with one gun unlocked still gets that gun.
 */
export const rollOffer = (
  slot: number,
  wave: number,
  unlockedBlocks: Set<string>,
  exclude: ReadonlyArray<string> = [],
  rand: () => number = Math.random,
  avoid?: string
): string => {
  const lane = SLOT_LANES[slot % OFFER_SLOTS] ?? 'any'
  const all = eligibleShapes(wave, unlockedBlocks)

  const isWorks = slot % OFFER_SLOTS === SUPPORT_SLOT

  // Producers and buffs live in the works slot and NOWHERE else.
  //
  // The two free lanes used to draw from the whole catalogue, so an economy
  // block could turn up in any of the first four as well — which made the hand
  // harder to read, not richer: the player scanning for a gun or a wall had to
  // skip past a lumber hut that has a permanent home one slot to the right.
  // Utility pieces (spikes, the repair bay) are NOT works and stay in the free
  // lanes, because those genuinely are wall-and-weapon decisions.
  const catalogue = isWorks ? all.filter(isWorksShape) : all.filter((s) => !isWorksShape(s))

  const inLane = isWorks || lane === 'any'
    ? catalogue
    : catalogue.filter((s) => s.lane === lane)
  // Fall back through: lane → the rest of this slot's catalogue — EXCEPT the
  // works slot, which holds its pool even when every piece in it is already on
  // the table (see `SUPPORT_SLOT`). Everything else would rather repeat a wall
  // than deal nothing.
  const strict = isWorks && inLane.length > 0
  let pool = inLane.filter((s) => !exclude.includes(s.id))

  // Drop anything that is the same DECISION as the piece being replaced, but
  // only while something else remains — a reroll that empties the lane has
  // taught the player nothing and left them with fewer options than before.
  if (avoid) {
    const sig = shapeSignature(avoid)
    const different = pool.filter((s) => shapeSignature(s.id) !== sig)
    if (different.length > 0) pool = different
  }

  if (pool.length === 0 && strict) pool = inLane
  if (pool.length === 0) pool = catalogue.filter((s) => !exclude.includes(s.id))
  if (pool.length === 0) pool = catalogue
  if (pool.length === 0) pool = all
  if (pool.length === 0) return 'w1'

  let total = 0
  for (const s of pool) total += s.weight
  let pick = rand() * total
  for (const s of pool) {
    pick -= s.weight
    if (pick <= 0) return s.id
  }
  return pool[pool.length - 1]!.id
}

/** A full set of four offers — used at run start and after a tech unlock. */
export const rollOffers = (
  wave: number,
  unlockedBlocks: Set<string>,
  rand: () => number = Math.random
): string[] => {
  const out: string[] = []
  for (let i = 0; i < OFFER_SLOTS; i++) {
    out.push(rollOffer(i, wave, unlockedBlocks, out, rand))
  }
  return out
}
