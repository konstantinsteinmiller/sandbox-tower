import { BLOCK_DEFS, blockDef, canMergeType, isShip } from '@/game/blocks'
import { PALETTES, blockArtBase } from '@/game/art'
import { ENEMY_DEFS } from '@/game/enemies'
import { MONSTERS } from '@/game/monsters'
import type { ProjectileKind } from '@/game/types'

/**
 * ─── Art sheet manifest ─────────────────────────────────────────────────────
 *
 * Tower Siege draws everything procedurally, which is wonderful for payload and
 * useless for one specific job: handing the art to somebody — or something —
 * that paints. There is no folder of PNGs to send. This module describes a set
 * of CONTACT SHEETS that bake the whole cast onto a strict pixel lattice, so
 * the game's art can leave the renderer, be repainted, and come back in.
 *
 * THE LATTICE IS THE CONTRACT.
 *
 * Every cell is exactly `CELL` px on a side and sits at an exact multiple of
 * `CELL` from the sheet's origin. No gutters, no padding, no centring fudge.
 * That is what makes the return trip mechanical: a repainted sheet is sliced
 * with integer arithmetic, and `sheet-index.json` says which slice belongs in
 * which file. A sheet with decorative spacing would have to be sliced by eye,
 * which is exactly the step that produces a folder of subtly misaligned art.
 *
 * Captions therefore live on a SEPARATE key sheet rendered from the same
 * manifest. Text inside a cell is text an image model will faithfully repaint
 * as art.
 *
 * Nothing here imports a canvas. The manifest says WHAT goes in each cell and
 * WHERE the result belongs; `ArtSheets.vue` knows how to paint it.
 */

/** Lattice unit, px. Every cell is a whole number of these on both axes. */
export const CELL = 128

/**
 * Extra scales each sheet is also exported at.
 *
 * 128 px is the size the game actually draws a block at on a phone, so it is
 * the honest reference — but "make this more realistic" is a request for detail
 * the reference does not contain, and an image model given a 128 px cell will
 * return 128 px of realism. The 2x export is the same layout with the same
 * index, so a richer pass can be run without redoing the mapping.
 */
export const EXPORT_SCALES = [1, 2] as const

/** What to paint in one cell. The view owns the how; this is the what. */
export type CellArt =
  /** Block body plus its live fixture — the block as the player sees it. */
  | { kind: 'blockAssembled'; typeId: string; tier?: number }
  /** Block body ALONE. This is the one that matches the override contract. */
  | { kind: 'blockBody'; typeId: string }
  /** The tray/inspector pictogram, light on a dark plate. */
  | { kind: 'blockGlyph'; typeId: string }
  /** One of the baked monster designs from `monsters.ts`. */
  | { kind: 'monster'; designId: string }
  /** A wheeled siege engine from `siegeArt.ts`. */
  | { kind: 'siege'; engineId: string }
  | { kind: 'cavalry' }
  | { kind: 'projectile'; round: ProjectileKind }
  | { kind: 'tree'; species: 'conifer' | 'broadleaf'; seed: number }
  | { kind: 'celestial'; night: boolean; tier: number }
  /** A bitmap that already ships, letterboxed into the cell. */
  | { kind: 'bitmap'; src: string }

// ─── What each thing IS ─────────────────────────────────────────────────────
//
// The first pass through an image model came back with a gold mine painted as a
// bow and arrow, a mortar as a scroll and a bombard as a bucket. That is not the
// model being careless — it was handed 69 unlabelled squares and asked to make
// them prettier, so it inferred each subject from the pixels, and a small dark
// cylinder on a grey plate genuinely does look like a lot of things.
//
// So every cell now carries a sentence saying what it is. `base` is the block
// itself; `fixture` is the moving part the renderer composites on top, named
// separately so the body row's prompt can say "and NOT this".

/**
 * This drawable's real colours, as a line a painter can follow.
 *
 * The second pass came back with the archery platform, the cannon carriage, the
 * mortar and the bombard ALL in the same grey stone and iron, because nothing
 * ever told it they were different materials. In game those four are timber with
 * green trim, timber with orange, slate with red and dark iron with amber — and
 * palette identity is the whole of how a player tells a cannon from a crate with
 * forty enemies on screen. `PALETTES` is the source of truth; this hands it over
 * rather than hoping.
 */
export const paletteLine = (key: string | undefined): string => {
  const p = key ? PALETTES[key] : undefined
  if (!p) return ''
  // The HUE identity, not the exact swatch.
  //
  // Handing over raw hex fought the style: the palette was tuned for a bright
  // procedural renderer, and "match #565c64 exactly" pulled the art back toward
  // the vivid look we are trying to leave. What has to survive is which block is
  // which — green means archery, orange means cannon — not the saturation.
  return `Colour identity (keep the HUE, but muted and paper-toned, never vivid):`
    + ` body around ${p.mid}, shadows ${p.dark}, highlights ${p.light},`
    + ` accent details ${p.accent}.`
}

/** Drop a leading article, so "NO ${fixture}" does not read "NO a bow". */
const bare = (s: string): string => s.replace(/^(a|an|the) /i, '')

interface BlockArt {
  name: string
  base: string
  /** The live-drawn part, if any. Named so a prompt can forbid it. */
  fixture?: string
}

const BLOCK_ART: Record<string, BlockArt> = {
  gate: { name: 'Gate', base: 'a square iron-banded block with a flat top, its face an arched fortress door with warm light glowing between the bars — the thing the whole game protects' },
  wood: { name: 'Wood Crate', base: 'a square plank crate with a flat top, iron corner brackets and nail heads' },
  brace: { name: 'Braced Crate', base: 'a square plank crate with a flat top and a bold X of squared timber bolted across its face' },
  stone: { name: 'Stone Block', base: 'a square block of running-bond masonry with a flat top, mortared and chipped, visibly heavier than wood' },
  archer: { name: 'Archery Post', base: 'a square timber block with a flat top: plank courses, iron corner straps, and a narrow green-painted band along the bottom edge', fixture: 'a bow' },
  cannon: { name: 'Cannon Block', base: 'a square timber block with a flat top, bound by vertical iron bands down the left and right edges with orange-painted trim', fixture: 'a cannon barrel' },
  bombard: { name: 'Bombard Block', base: 'a square stone block with a flat top, blast-scorched along its lower edge with amber-painted banding', fixture: 'a stubby barrel' },
  mortar: { name: 'Mortar Block', base: 'a square iron-plated block with a flat top, riveted along its edges with dull red trim', fixture: 'a mortar tube' },
  tesla: { name: 'Coil Block', base: 'a square ceramic-and-iron block with a flat top, copper banding around its outer edges', fixture: 'a coil and its glow' },
  frost: { name: 'Frost Block', base: 'a square rimed stone block with a flat top, frost creeping in from the edges', fixture: 'ice crystals' },
  spikes: { name: 'Spiked Wall', base: 'a square rough timber palisade block with a flat top', fixture: 'iron spikes on all four sides' },
  repair: { name: 'Repair Block', base: 'a square timber block with a flat top, green-painted edge banding and a few tools racked along the very bottom', fixture: 'a turning wrench' },
  sawmill: { name: 'Sawmill Block', base: 'a square timber mill block with a flat top, sawdust and offcuts along its bottom edge', fixture: 'a spinning blade' },
  quarry: { name: 'Quarry Block', base: 'a square cut-stone block with a flat top, chisel marks and rubble around its edges', fixture: 'a rocking pick' },
  mint: { name: 'Gold Mine Block', base: 'a square stone strongroom block with a flat top, iron strapping and gold-painted trim around its edges', fixture: 'a bobbing stack of gold coins' },
  banner: { name: 'Banner Block', base: 'a square block with a flat top, gilt edging over deep rose cloth around its border', fixture: 'a hanging banner' },
  obelisk: { name: 'Obelisk Block', base: 'a square dark arcane block with a flat top, pale blue glyphs inlaid around its border', fixture: 'a floating spire' },
  lumberHut: { name: 'Lumber Hut Block', base: 'a square timber block with a flat top, stacked logs along its bottom edge', fixture: 'a working axe' },
  stonepit: { name: 'Stone Pit Block', base: 'a square stone block with a flat top, heaped spoil along its bottom edge', fixture: 'a swinging hammer' },
  coffer: { name: 'Coffer Block', base: 'a square iron-banded strongbox block with a flat top, banding around its edges', fixture: 'a lid and spilling coins' },
  skiff: { name: 'Skiff', base: 'a small single-masted timber boat with a blue livery sail', fixture: 'a light deck gun' },
  longship: { name: 'Longship', base: 'a lean clinker-built hull with a red livery sail and shield rack', fixture: 'a deck gun' },
  galley: { name: 'War Galley', base: 'a broad oared warship with a yellow livery sail and raised castle', fixture: 'heavy deck guns' }
}

/**
 * The rule that makes a block a BLOCK.
 *
 * The third pass came back with the archery post as a crenellated stone turret
 * and the cannon as a wheeled cart — both lovely, both unusable, because this is
 * a stacking game. A player puts another block directly on top of that one. A
 * silhouette with battlements, wheels, a peaked roof or rounded shoulders leaves
 * the block above it floating on air, and a shape that does not reach the cell
 * edges leaves a visible seam in the middle of a wall.
 *
 * The weapon mount therefore belongs ON THE FACE of a cube, like a bracket
 * bolted to a wall — never as the block's outline.
 */
export const BLOCK_RULE = [
  'THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:',
  '· A square block that FILLS the frame edge to edge and corner to corner. The',
  '  material must TOUCH all four edges of the image — no margin, no gap, not',
  '  even a few pixels. A block that stops short shows a seam on every side once',
  '  it is stacked. Let the artwork BLEED off all four edges rather than leave a',
  '  border: the frame is a crop of a wall, not a portrait of an object.',
  '· SQUARE corners. Not rounded, not chamfered, not softened. Rounded corners',
  '  leave four visible holes wherever four blocks meet.',
  '· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these',
  '  directly on top of and beside each other to build a tower.',
  '· Nothing may stick out past the square: no battlements, no crenellations, no',
  '  wheels, no peaked roof, no rounded shoulders, no legs, no protruding parts.',
  '  Anything above the top edge leaves the next block floating in mid-air.',
  '· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a',
  '  wall. It is a face seen straight on, not an object standing in space.',
  '· No margin, no drop shadow, no ground beneath it, no background around it.'
].join('\n')

const SIEGE_ART: Record<string, string> = {
  ram: 'a roofed shed on solid wheels with a swinging log slung inside',
  ironRam: 'a plated iron casemate on wheels with a vision slit and spent arrows lodged uselessly in the plating — COLD IRON, never timber, because it is the only enemy arrows cannot hurt',
  ballista: 'a wheeled timber frame carrying a great horizontal bow with a bolt loaded',
  catapult: 'a single-armed throwing engine with a bucket at the arm tip',
  siegeTower: 'a tall rolling assault tower with a drop ramp and a banner',
  trebuchet: 'an A-frame with a long throwing arm and a heavy counterweight box'
}

const ROUND_ART: Record<string, string> = {
  bolt: 'an arrow in flight, fletched, pointing right',
  ball: 'a solid iron cannonball',
  shell: 'a finned iron mortar shell with a lit fuse, pointing along its arc',
  bomb: 'a finned iron aerial bomb falling nose-down',
  fire: 'a lit molotov bottle tumbling, rag burning',
  frost: 'a shard of magical ice'
}

export interface SheetCell {
  /** Stable identity for this cell. Never reused across sheets. */
  id: string
  /** One sentence saying what this object IS, for the painter. */
  blurb: string
  /** Key into `PALETTES`, so a prompt can hand over the real colours. */
  palette?: string
  /** Lattice coordinates, in cells, from the sheet's top-left. */
  col: number
  row: number
  /** Footprint in lattice cells. Everything is 1x1 today; the slicer reads it
   *  anyway so a future oversized frame does not need a new index format. */
  cw: number
  ch: number
  /** Caption for the key sheet. Kept to roughly twelve characters. */
  label: string
  /** Second caption line — the variant, the tier, the bound enemy. */
  sub: string
  /**
   * Where a repainted slice of this cell belongs on disk, relative to
   * `public/`. Absent means the cell is reference only: there is no override
   * hook for it today, so a slice has nowhere to go until one is added.
   */
  target?: string
  /** Why a cell has no target, or what the painter has to preserve. */
  note?: string
  art: CellArt
}

export interface SheetSpec {
  id: string
  /** Base filename, without the scale suffix or extension. */
  file: string
  title: string
  /** Lattice width. Height is derived from the cells. */
  cols: number
  /** One paragraph on what this sheet is for, carried into the README. */
  brief: string
  cells: SheetCell[]
}

/** Lattice height of a sheet, in cells. */
export const sheetRows = (s: SheetSpec): number =>
  s.cells.reduce((m, c) => Math.max(m, c.row + c.ch), 0)

// ─── A. Blocks ──────────────────────────────────────────────────────────────
//
// Three rows per band, and the order of the three is the whole point.
//
//   assembled — what the block IS. A bare archer platform and a bare mortar
//               platform are the same grey box; the gun is the identity, so the
//               painter has to see it.
//   body      — what the block's override FILE is. `drawFixture` composites the
//               barrel, bow, coil and blade live, every frame, on top of
//               whatever the block bitmap decodes to. Ship a bitmap with a
//               barrel already on it and the block grows a second one.
//   glyph     — the pictogram the tray and the inspector use. It is not the
//               block; it is the road sign for the block, and it has different
//               rules (filled masses, readable at 14 px, light on dark).
//
// So the body row is the one that gets sliced back into the game, and the row
// above it is there to tell the painter what the body is holding up.

const BLOCK_COLS = 8

/** Catalogue order, Gate first — it is the block the whole game protects. */
const BLOCK_ORDER: string[] = Object.values(BLOCK_DEFS)
  .sort((a, b) => a.order - b.order)
  .map((d) => d.id)

/** Blocks whose fixture is drawn live, so body is not the same as assembled. */
const HAS_FIXTURE = new Set([
  'archer', 'cannon', 'bombard', 'mortar', 'tesla', 'frost',
  'repair', 'sawmill', 'quarry', 'mint', 'spikes',
  'banner', 'obelisk', 'lumberHut', 'stonepit', 'coffer',
  'skiff', 'longship', 'galley'
])


// ─── Which block stands in for its base ─────────────────────────────────────
//
// Blocks share bitmaps (see `BLOCK_ART_BASE`), so only ONE cell per base can
// carry a delivery target — five cells all writing `timber.webp` would just
// overwrite each other in whatever order the slicer happened to run.
//
// The first block of each base, in catalogue order, is the one that ships. The
// rest stay on the sheet as reference and say which base they borrow, because a
// painter still needs to see that a sawmill and an archery post are the same
// crate underneath.


/**
 * What a SHARED base is made of.
 *
 * Deliberately describes material and nothing else. The moment a base blurb
 * mentions a bow or a saw blade, the painter puts one in — and it is worn by
 * six different blocks, five of which are not that.
 */
const BASE_ART: Record<string, string> = {
  timber: 'a square plank crate with a flat top: horizontal plank courses, iron corner brackets and nail heads',
  masonry: 'a square block of running-bond masonry with a flat top, mortared, chipped and a little mossy',
  metal: 'a square iron-plated block with a flat top, riveted around its edges, warm and slightly worn rather than cold',
  braced: 'a square plank crate with a flat top and a bold X of squared timber bolted across its face',
  arcane: 'a square dark arcane block with a flat top, pale blue glyphs inlaid around its border',
  heraldry: 'a square block with a flat top, gilt edging over deep rose cloth around its border',
  gate: 'a square iron-banded block with a flat top, its face an arched fortress door with warm light glowing between the bars'
}

const BASE_OWNER: Record<string, string> = {}
const BASE_MEMBERS: Record<string, string[]> = {}
for (const id of BLOCK_ORDER) {
  const base = blockArtBase(id)
  if (!BASE_OWNER[base]) BASE_OWNER[base] = id
  ;(BASE_MEMBERS[base] ??= []).push(id)
}

/** Human list of everything that shares a base, minus the owner. */
const sharers = (base: string): string[] =>
  (BASE_MEMBERS[base] ?? []).filter((x) => x !== BASE_OWNER[base])

const blockCells = (): SheetCell[] => {
  const cells: SheetCell[] = []
  BLOCK_ORDER.forEach((id, i) => {
    const band = Math.floor(i / BLOCK_COLS)
    const col = i % BLOCK_COLS
    const top = band * 3
    const def = blockDef(id)
    const live = HAS_FIXTURE.has(id)
    const hull = isShip(id)

    const art = BLOCK_ART[id]!

    cells.push({
      id: `block/${id}/assembled`,
      palette: def.palette,
      blurb: art.fixture
        ? `${art.name}: ${art.base}, WITH ${art.fixture} mounted on it.`
        : `${art.name}: ${art.base}.`,
      col, row: top, cw: 1, ch: 1,
      label: id,
      sub: 'assembled',
      note: live
        ? 'Reference only — the fixture on this cell is composited live every frame. Paint it to understand the block; ship the row below it.'
        : 'This block has no live fixture, so the assembled cell and the body cell are the same drawing.',
      art: { kind: 'blockAssembled', typeId: id }
    })

    // A hull is not a cube of material. The renderer branches on ships before
    // it ever reaches the block-sprite path, so nothing at `images/blocks/`
    // would be consulted for one — the cell is here for completeness, and
    // giving it a target would promise a drop-in that silently does nothing.
    const base = blockArtBase(id)
    const owns = BASE_OWNER[base] === id
    const shared = sharers(base)

    cells.push({
      id: `block/${id}/body`,
      palette: def.palette,
      blurb: owns
        ? `The shared ${base.toUpperCase()} base: ${BASE_ART[base] ?? art.base}.`
          + (shared.length
            ? ` ONE bitmap worn by ${[id, ...shared].length} different blocks`
              + ` (${[id, ...shared].join(', ')}), so paint the MATERIAL and nothing`
              + ` block-specific — no weapon, no machinery, no tools, no signage.`
              + ` LEAVE THE MIDDLE PLAIN: the game draws a different machine there`
              + ` for each block, and anything painted in the centre ends up buried`
              + ` under it. Material and edge detail only; the centre is a clear wall.`
            : ' Nothing is composited on top of this one, so it is the whole block.')
        : `Reference only — this block reads from the shared ${base} base.`,
      col, row: top + 1, cw: 1, ch: 1,
      label: id,
      sub: hull ? 'hull — no slot'
        : owns ? `${base} base — SLICE THIS`
        : `uses ${base} base`,
      ...(hull || !owns ? {} : { target: `images/blocks/${base}.webp` }),
      note: hull
        ? 'Ships bypass the block-sprite path entirely — the hull is drawn, clipped at the waterline and rolled every frame. Adopting art here needs a probe inside the ship branch.'
        : owns
          ? `The shared ${base} base.${shared.length ? ` Also worn by ${shared.join(', ')}.` : ''} Paint the MATERIAL, not this one block — the fixture on top is what tells them apart.`
          : `Reference only. Reads from the shared ${base} base, owned by ${BASE_OWNER[base]}.`,
      art: { kind: 'blockBody', typeId: id }
    })

    cells.push({
      id: `block/${id}/icon`,
      palette: def.palette,
      blurb: `Build-tray ICON for the ${art.name} — a bold flat pictogram on a dark round plate over the block's material. Not a miniature painting.`,
      col, row: top + 2, cw: 1, ch: 1,
      label: id,
      sub: 'tray icon',
      note: 'The build-tray tile: block body, dark backing disc, near-white pictogram. The disc and the constant ink are what keep the glyph legible on a pale block AND a dark one, so keep both.',
      art: { kind: 'blockGlyph', typeId: id }
    })
  })
  return cells
}

// ─── B. Merged blocks ───────────────────────────────────────────────────────
//
// Column per weapon, row per tier, so the progression reads straight down.
//
// Only armed blocks fuse — merging is a damage bet, and a wall has no damage to
// bet — which is why this sheet is nine columns wide and not twenty-three.
//
// Every cell is ONE lattice cell. In game a fused block keeps the cells its
// halves stood on, so a tier-3 is really a 2x2 bastion; here it is squared up
// so the sheet stays a uniform grid. What changes down a column is the gun
// (the fixture span doubles per tier, overflowing the carriage on purpose) and
// the riveted steel tier plate.

const MERGE_TYPES = BLOCK_ORDER.filter(canMergeType)

const mergedCells = (): SheetCell[] => {
  const cells: SheetCell[] = []
  MERGE_TYPES.forEach((id, col) => {
    for (let tier = 1; tier <= 3; tier++) {
      const ma = BLOCK_ART[id]!
      cells.push({
        id: `merged/${id}/t${tier}`,
        palette: blockDef(id).palette,
        blurb: tier === 1
          ? `${ma.name}: ${ma.base}, with ${ma.fixture ?? 'its weapon'}.`
          : `${ma.name} fused to tier ${tier === 2 ? 'II' : 'III'}: the same emplacement rebuilt heavier, carrying a visibly bigger, better-made ${ma.fixture ?? 'weapon'} — overbuilt for its carriage. Keep the small steel II/III rank plate crisp.`,
        col, row: tier - 1, cw: 1, ch: 1,
        label: id,
        sub: tier === 1 ? 'tier I (base)' : tier === 2 ? 'tier II' : 'tier III',
        note: tier === 1
          ? 'The unfused block, for comparison. Its override slot is on the blocks sheet.'
          : 'Reference only — the renderer reads one bitmap per block id for every tier, so there is no per-tier override slot yet.',
        art: { kind: 'blockAssembled', typeId: id, tier }
      })
    }
  })
  return cells
}

// ─── C. Enemies ─────────────────────────────────────────────────────────────
//
// Keyed by ENEMY id, because that is what the override probe asks for — but the
// body that gets drawn belongs to a monster DESIGN, and two ranks field more
// than one design (a grunt is a Grumpling or a Rattlejack depending on its uid).
// The alternates get their own cells at the end, marked as having no slot of
// their own: one bitmap at the enemy's path replaces both.
//
// Authored facing RIGHT. The battlefield mirrors by travel direction, so a
// left-facing repaint walks backwards into the tower.

const ENEMY_COLS = 6

const MONSTER_ENEMIES = Object.values(ENEMY_DEFS).filter((d) => d.monster && !d.siege)

/** Name and one-line design intent, straight off the monster bench. */
const MONSTER_ART = Object.fromEntries(
  MONSTERS.map((m) => [m.id, { name: m.name, tagline: m.tagline }])
) as Record<string, { name: string; tagline: string } | undefined>

const enemyCells = (): SheetCell[] => {
  const cells: SheetCell[] = []
  const alts: { design: string; enemy: string }[] = []
  let i = 0

  for (const def of MONSTER_ENEMIES) {
    const bound = Array.isArray(def.monster) ? def.monster : [def.monster!]
    const primary = bound[0]!
    for (const extra of bound.slice(1)) alts.push({ design: extra, enemy: def.id })

    const mon = MONSTER_ART[primary]
    cells.push({
      id: `enemy/${def.id}`,
      palette: def.palette,
      blurb: `${mon?.name ?? primary}${mon ? ` — ${mon.tagline}` : ''} Facing RIGHT, drawn at ${def.scale} cells in game.`,
      col: i % ENEMY_COLS, row: Math.floor(i / ENEMY_COLS), cw: 1, ch: 1,
      label: def.id,
      sub: `${primary} · ${def.scale}c`,
      target: `images/enemies/${def.id}.webp`,
      note: def.movement === 'sea'
        ? 'Sea creature: a fish, not a serpent. Drawn twice per frame and clipped at the waterline, so the tail must trail DOWNWARD.'
        : bound.length > 1
          ? `Fields ${bound.length} designs; one bitmap replaces all of them.`
          : 'An override is a static pose — it replaces the whole walk cycle.',
      art: { kind: 'monster', designId: primary }
    })
    i++
  }

  for (const a of alts) {
    const alt = MONSTER_ART[a.design]
    cells.push({
      id: `enemy/alt/${a.design}`,
      blurb: `${alt?.name ?? a.design}${alt ? ` — ${alt.tagline}` : ''} Facing RIGHT.`,
      col: i % ENEMY_COLS, row: Math.floor(i / ENEMY_COLS), cw: 1, ch: 1,
      label: a.design,
      sub: `alt of ${a.enemy}`,
      note: `Second body for ${a.enemy}. No slot of its own — that enemy's bitmap replaces both.`,
      art: { kind: 'monster', designId: a.design }
    })
    i++
  }
  return cells
}

// ─── D. Siege engines ───────────────────────────────────────────────────────
//
// The biggest silhouettes in the game — a trebuchet is 2.1 cells — and the ones
// that lose the most to a static bitmap, because they animate on STATE rather
// than on a clock: wheels turn with distance travelled, so a halted engine's
// wheels stop, and that is the tell that it has set up to fire.
//
// Painted here engaged and mid-cycle, which is the pose a still has to sell.

const SIEGE_IDS = Object.values(ENEMY_DEFS).filter((d) => d.siege).map((d) => d.id)

const siegeCells = (): SheetCell[] =>
  SIEGE_IDS.map((id, i) => ({
    id: `siege/${id}`,
    palette: ENEMY_DEFS[id]!.palette,
    blurb: `${id}: ${SIEGE_ART[id] ?? 'a wheeled medieval siege engine'}. Facing RIGHT, ${ENEMY_DEFS[id]!.scale} cells in game.`,
    col: i % 3, row: Math.floor(i / 3), cw: 1, ch: 1,
    label: id,
    sub: `${ENEMY_DEFS[id]!.scale}c`,
    target: `images/enemies/${id}.webp`,
    note: id === 'ironRam'
      ? 'COLD IRON. It is the only enemy immune to arrows, and the riveted plate — with spent arrows lodged in it — is the whole of how the player is told. Never timber.'
      : 'Chassis only if you can help it: the wheels, arm and ramp animate off the simulation and a static override loses all of it.',
    art: { kind: 'siege', engineId: id }
  }))

// ─── E. Allies and projectiles ──────────────────────────────────────────────
//
// One row. The ally is deliberately the coolest, brightest thing on the field —
// a friendly unit that reads as a target is worse than no art at all — and the
// rounds are the smallest, so they are the two extremes of the same sheet.

// `zap` is deliberately absent. Lightning is a polyline rebuilt every frame
// from the simulation's own fork points, so `drawProjectile` renders nothing
// standalone for it — and a blank cell on a contact sheet is not documentation,
// it is an invitation for an image model to fill the hole with something the
// game does not have. It is recorded in the README instead.
const ROUNDS: { round: ProjectileKind; label: string; slot: boolean; note: string }[] = [
  { round: 'bolt', label: 'bolt', slot: true, note: 'Arrow. The most-fired round in the game.' },
  { round: 'ball', label: 'ball', slot: true, note: 'Cannonball.' },
  { round: 'shell', label: 'shell', slot: true, note: 'Mortar shell — finned, fuse lit, points along its arc.' },
  { round: 'bomb', label: 'bomb', slot: true, note: 'Enemy ordnance, nose-down along its fall.' },
  { round: 'fire', label: 'fire', slot: true, note: 'Molotov, tumbling.' },
  { round: 'frost', label: 'frost', slot: false, note: 'The frost round is a live particle emitter; this is only its core shard.' }
]

const allyCells = (): SheetCell[] => {
  const cells: SheetCell[] = [{
    id: 'ally/cavalry',
    palette: 'cavalry',
    blurb: 'Cavalry: an armoured rider on a barded warhorse, cool blue livery and a gold pennant, facing RIGHT. The FRIENDLY unit — it must never read as something to shoot at.',
    col: 0, row: 0, cw: 1, ch: 1,
    label: 'cavalry',
    sub: '0.80c · ally',
    target: 'images/allies/cavalry.webp',
    note: 'Cool blue, gold pennant, facing right. Must stay unmistakable against the warm-toned enemies at a glance.',
    art: { kind: 'cavalry' }
  }]
  ROUNDS.forEach((r, i) => {
    cells.push({
      id: `projectile/${r.round}`,
      blurb: `${r.label}: ${ROUND_ART[r.round] ?? 'a projectile'}. Must stay recognisable at a few pixels across in flight.`,
      col: (i + 1) % 8, row: Math.floor((i + 1) / 8), cw: 1, ch: 1,
      label: r.label,
      sub: r.slot ? 'round' : 'live FX',
      note: r.slot
        ? `${r.note} No override hook today — adding one means a projectile probe keyed by kind.`
        : r.note,
      art: { kind: 'projectile', round: r.round }
    })
  })
  return cells
}

// ─── F. Props and sky ───────────────────────────────────────────────────────
//
// Only the DISCRETE background objects. The mountains, forest band, grass and
// water are drawn as full-width parallax layers that tile horizontally and get
// re-tinted per wave tier — squeezing one into a 128 px square would produce a
// picture of a mountain rather than a tileable mountain range, so they are
// deliberately absent. They want a wide strip sheet, which is a different job.
//
// ONE sun and ONE moon, despite the sky running dawn → day → dusk → night →
// blood moon every five waves.
//
// The tier is a real thing, but it does not live in the disc. `celestialSprite`
// takes a tier and uses it to jitter the sun's ray angles by a fifth of a
// radian — and ignores it completely for the moon, which is byte-identical at
// every tier. What actually changes with the wave is the sky gradient and the
// wide bloom wash behind the body, both painted by `drawCelestial` around the
// sprite rather than into it.
//
// Five near-identical suns and five identical moons would tell a painter there
// are ten assets here. There are two.

const propCells = (): SheetCell[] => {
  const cells: SheetCell[] = [
    {
      id: 'prop/conifer',
      blurb: 'A dark spruce for a distant parallax tree line — notched stacked canopy, silhouette over detail, seen small and hazy.',
      col: 0, row: 0, cw: 1, ch: 1,
      label: 'conifer', sub: 'forest band',
      note: 'Stacked canopy tiers with a lit right edge. Reads at 30 px in a parallax band, so silhouette over detail.',
      art: { kind: 'tree', species: 'conifer', seed: 3 }
    },
    {
      id: 'prop/broadleaf',
      blurb: 'A round-crowned broadleaf tree for the same tree line. Must not read as the conifer at distance.',
      col: 1, row: 0, cw: 1, ch: 1,
      label: 'broadleaf', sub: 'forest band',
      note: 'The other half of the tree line. Must not read as the conifer at distance.',
      art: { kind: 'tree', species: 'broadleaf', seed: 7 }
    }
  ]

  cells.push({
    id: 'sky/sun',
    blurb: 'The sun: a warm disc with an uneven ray fan around it.',
    col: 2, row: 0, cw: 1, ch: 1,
    label: 'sun', sub: 'day disc',
    note: 'Disc plus its ray fan. The wide bloom wash across the sky and the dawn/day/dusk tinting are painted around this, not into it, so they stay procedural.',
    art: { kind: 'celestial', night: false, tier: 1 }
  })
  cells.push({
    id: 'sky/moon',
    blurb: 'The moon: a pale cratered disc, no rays.',
    col: 3, row: 0, cw: 1, ch: 1,
    label: 'moon', sub: 'night disc',
    note: 'Cratered disc, no rays. Identical at every wave tier — the blood moon is the SKY going red behind it, not the moon itself.',
    art: { kind: 'celestial', night: true, tier: 1 }
  })

  const shipped = [
    { id: 'coin', src: 'images/props/coin_128x128.webp', sub: 'shipped bitmap' },
    { id: 'movie', src: 'images/icons/movie_128x96.webp', sub: 'rewarded button' },
    { id: 'ribbon', src: 'images/bg/parchment-ribbon_553x188.webp', sub: 'result screen' },
    { id: 'logo', src: 'images/logo/logo_256x256.webp', sub: 'splash' }
  ]
  shipped.forEach((s, k) => {
    const i = 4 + k
    cells.push({
      id: `ui/${s.id}`,
      blurb: `UI art: the ${s.id}. Keep it clean, flat and high-contrast — it is interface, not scenery — and do not restyle any lettering.`,
      col: i % 6, row: Math.floor(i / 6), cw: 1, ch: 1,
      label: s.id, sub: s.sub,
      target: s.src,
      note: 'Already a bitmap. Letterboxed into the cell here — check its real aspect ratio in the index before overwriting it.',
      art: { kind: 'bitmap', src: s.src }
    })
  })
  return cells
}

// ─── The sheets ─────────────────────────────────────────────────────────────

export const SHEETS: SheetSpec[] = [
  {
    id: 'blocks',
    file: 'sheet-blocks',
    title: 'Blocks — assembled, body, glyph',
    cols: BLOCK_COLS,
    brief: 'Every buildable block in three rows per band: the block as played, the body that is actually the override file, and the tray pictogram. Slice the BODY row.',
    cells: blockCells()
  },
  {
    id: 'merged',
    file: 'sheet-merged',
    title: 'Merged blocks — tier I / II / III',
    cols: MERGE_TYPES.length,
    brief: 'Column per fusable weapon, row per tier. Only armed blocks fuse. Reference only until the renderer keys overrides by tier.',
    cells: mergedCells()
  },
  {
    id: 'enemies',
    file: 'sheet-enemies',
    title: 'Enemies — land, air and sea',
    cols: ENEMY_COLS,
    brief: 'One cell per enemy id, drawn with its bound monster design. Authored facing RIGHT; the battlefield mirrors by travel direction.',
    cells: enemyCells()
  },
  {
    id: 'siege',
    file: 'sheet-siege',
    title: 'Siege engines',
    cols: 3,
    brief: 'The six wheeled engines, engaged and mid-cycle. The largest silhouettes in the game and the ones that lose most to a static bitmap.',
    cells: siegeCells()
  },
  {
    id: 'allies',
    file: 'sheet-allies-rounds',
    title: 'Ally and projectiles',
    cols: 8,
    brief: 'The cavalry ally plus every projectile kind. Two of the rounds are live effects and cannot be bitmaps.',
    cells: allyCells()
  },
  {
    id: 'props',
    file: 'sheet-props-sky',
    title: 'Props, sky bodies and shipped UI',
    cols: 6,
    brief: 'The discrete background objects and the four bitmaps that already ship. The tileable parallax bands are deliberately absent — they need a strip, not a grid.',
    cells: propCells()
  }
]

// ─── Row strips ─────────────────────────────────────────────────────────────
//
// The whole-sheet pass failed in a way worth recording, because it was a
// FRAMING mistake rather than a model one.
//
// A block band is three rows deep and each row means something different — the
// block as played, the block without its gun, the tray icon. Handed all three at
// once, the model read them as three variations on a theme and painted a weapon
// into every row, including the one whose entire job is to have no weapon. It
// also had 114 px per cell to work in, which is not enough to be asked for
// craft.
//
// A strip fixes both at once. One row, one instruction, 256 px a cell, and every
// cell named in the prompt — so "the seventh square is a gold mine" is stated
// rather than inferred from a small grey shape with a coin on it.

/** Cell edge on a strip, px. Double the sheet, because detail was the ask. */
export const STRIP_SCALE = 2

export interface StripSpec {
  id: string
  /** Base filename, no extension. */
  file: string
  sheet: string
  row: number
  cols: number
  width: number
  height: number
  /** The cells on this row, left to right. */
  cells: SheetCell[]
}

export const stripsOf = (s: SheetSpec): StripSpec[] => {
  const byRow = new Map<number, SheetCell[]>()
  for (const c of s.cells) {
    if (!byRow.has(c.row)) byRow.set(c.row, [])
    byRow.get(c.row)!.push(c)
  }
  return [...byRow.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([row, cells]) => ({
      id: `${s.id}-r${row}`,
      file: `strip-${s.id}-r${row}`,
      sheet: s.id,
      row,
      cols: s.cols,
      width: s.cols * CELL * STRIP_SCALE,
      height: CELL * STRIP_SCALE,
      cells: cells.sort((a, b) => a.col - b.col)
    }))
}

export const ALL_STRIPS: StripSpec[] = SHEETS.flatMap(stripsOf)

// ─── Prompts ────────────────────────────────────────────────────────────────

/**
 * The style lock.
 *
 * Written from what actually came back, not from what was asked for. The first
 * pass was briefed "realistic" and returned inked, muted, hand-drawn storybook
 * art — which is a BETTER answer to a portal rejecting a game for looking
 * machine-made, so it is now the target rather than the miss.
 *
 * The two prohibitions are the ones that pass came back wrong on: it matted
 * several objects onto little parchment cards with decorative borders, which
 * turns a wall of masonry into a wall of museum labels; and it filled a cell
 * that was deliberately empty.
 */
export const STYLE = [
  'STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated',
  'storybook or a hand-painted board game. Match this in every square:',
  '· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly',
  '  sketchy and uneven, with the line weight varying like a real pen. The',
  '  drawing should look drawn, with the linework still showing.',
  '· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little',
  '  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no',
  '  specular highlights, no rendered 3D volume.',
  '· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty',
  '  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.',
  '· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any',
  '  paper tooth belongs to the OBJECT itself — never paint a sheet of',
  '  paper, a parchment card or a cream backdrop behind it.',
  '· Honest, slightly naive craft — charming rather than slick.',
  '',
  'AVOID — this is exactly how earlier attempts went wrong:',
  '· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no',
  '  smooth 3D-rendered shading, no bevelled plastic edges.',
  '· NO saturated, candy-bright colour. If it looks vivid, it is wrong.',
  '· NO heavy uniform black outlines and no hard cel-shaded banding.',
  '· NO cold grey, gritty, weathered-industrial or grimdark look.',
  '· NO frames, borders, cards, vignettes, matting or paper background inside a',
  '  square. The object itself fills the square edge to edge, corner to corner.',
  '· Do not invent content for a square that is blank. Leave it blank.',
  '· Keep each object the same subject and silhouette it already has. This is a',
  '  restyle, not a redesign.'
].join('\n')

/**
 * The background clause, stated FIRST.
 *
 * Buried at the bottom under the style it lost every time: one return came back
 * on cream parchment, one with the transparency checkerboard painted in as
 * literal pixels, and one with the subject on a cream CARD floating in the
 * magenta. Models weight what they read first, and this matters more than any
 * of the styling, because a background that cannot be removed is welded into
 * the sprite forever.
 *
 * The card clause is the specific one worth keeping: "magenta must touch the
 * object's own outline on every side" is the sentence that rules out a panel.
 */
export const BACKGROUND_RULE = [
  'BACKGROUND — read this before anything else. It matters more than the style.',
  'Fill every pixel that is not the object itself with solid, flat, pure magenta',
  '#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.',
  '· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty',
  '  pink, not mauve, not a soft or tinted version of it. Only the true colour can',
  '  be cut away cleanly; a near miss has to be flood-filled instead, and a flood',
  '  fill eats any pale paint it can reach.',
  '· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD',
  '  and then baked into the artwork as though the squares were paint.',
  '· NOT white, cream, parchment, paper, or any tinted or textured ground.',
  '· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of',
  '  any kind. The magenta must touch the outline of the object on every side.',
  '· No drop shadow onto the background, and no vignette.',
  '· The object itself must contain no magenta or hot pink.'
].join('\n')

/** A ready-to-paste prompt for one strip, naming every cell in order. */
export const promptFor = (s: StripSpec): string => {
  const sheet = SHEETS.find((x) => x.id === s.sheet)
  const list = s.cells
    .map((c) => {
      const cols = paletteLine(c.palette)
      return `${c.col + 1}. ${c.blurb}${cols ? ` ${cols}` : ''}`
    })
    .join('\n')

  // Only worth shouting about on a row where it is the whole point.
  const noGun = s.cells.some((c) => c.sub.startsWith('body') && /NO /.test(c.blurb))
    ? '\nCRITICAL: this row is the BASE of each block with its moving part REMOVED.'
      + ' No barrels, bows, coils, blades, wrenches or banners anywhere in this'
      + ' row. The game draws those on top at runtime — paint one in and the'
      + ' block ends up with two.\n'
    : ''

  // A block row lives or dies on being stackable; a row of enemies does not
  // care. Only state the rule where it applies, or it becomes noise.
  const blocks = s.cells.some((c) => c.id.startsWith('block/') && c.sub !== 'tray icon')
    ? '\n' + BLOCK_RULE + '\n'
    : ''

  const icons = s.cells.every((c) => c.sub === 'tray icon')
    ? '\nThese are UI ICONS, not scenery: one bold flat pictogram per square on a'
      + ' dark round plate, readable at thumbnail size. Do not turn them into'
      + ' little paintings.\n'
    : ''

  return [
    `# ${sheet?.title ?? s.sheet} — row ${s.row}  (${s.file}.png)`,
    '',
    `Repaint this strip of ${s.cols} square game sprites.`,
    '',
    STYLE,
    blocks + noGun + icons,
    `WHAT EACH SQUARE IS, left to right:`,
    list,
    '',
    'BACKGROUND: fill every part of the image that is not an object with solid',
    'pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT',
    'draw a grey-and-white checkerboard — the last attempt painted the',
    'checkerboard in as if it were art. The magenta is keyed out automatically',
    'on the way back in, so no object may contain magenta or hot pink.',
    '',
    `OUTPUT: exactly ${s.width} x ${s.height} pixels — ${s.cols} squares of `
      + `${CELL * STRIP_SCALE} x ${CELL * STRIP_SCALE} in a single row. Every object stays in its own `
      + 'square, at the same position and the same size, and the squares must stay '
      + 'SQUARE — do not letterbox, crop, pad or change the strip proportions. Do '
      + 'not add, remove, reorder, resize or re-centre anything, and put no labels, '
      + 'numbers or captions anywhere in the image.'
  ].join('\n')
}

// ─── Single cells ───────────────────────────────────────────────────────────
//
// Three passes through an image model, three different ways of losing the grid:
// a whole sheet drifted 4 px per cell and matted things onto cards; a strip came
// back at half size and 4% squashed; the next strip INVENTED a ninth object in
// an eight-cell row and crammed the remaining six into five squares.
//
// The art was never the problem. By the third attempt the style was right —
// warm timber, mossy stone, brown contours. What an image model will not do is
// hold a lattice while it repaints, because repainting is a re-composition and
// the grid is not something it has a reason to preserve.
//
// So stop asking. One object, one image, no grid to keep. There is nothing left
// to drift, nothing to miscount, and the whole of the model's resolution budget
// goes to a single asset instead of an eighth of it. The cost is more
// generations; the benefit is that every one of them is usable.
//
// Only cells that have somewhere to go are exported — painting a reference cell
// one at a time would be work with no destination.

/** Edge of an exported single-cell reference, px. */
export const SINGLE_SIZE = 512

export interface SingleSpec {
  id: string
  /** Base filename, no extension. Cell ids carry slashes; these cannot. */
  file: string
  sheet: string
  cell: SheetCell
}

export const SINGLES: SingleSpec[] = SHEETS.flatMap((s) =>
  s.cells.filter((c) => c.target).map((c) => ({
    id: c.id,
    file: `cell-${c.id.replace(/[^a-zA-Z0-9]+/g, '-')}`,
    sheet: s.id,
    cell: c
  })))

/** A ready-to-paste prompt for one object. No grid clause — there is no grid. */
export const promptForCell = (s: SingleSpec): string => {
  const c = s.cell
  const cols = paletteLine(c.palette)
  const fill = c.id.startsWith('block/') && c.sub !== 'tray icon'
    ? BLOCK_RULE
    : 'Centre the object in the frame with a little clear space around it, and '
      + 'do not crop any part of it.'

  return [
    `# ${c.label} — ${c.sub}  (${s.file}.png)`,
    '',
    'Repaint this single game sprite.',
    '',
    BACKGROUND_RULE,
    '',
    STYLE,
    '',
    `WHAT IT IS: ${c.blurb}${cols ? ` ${cols}` : ''}`,
    '',
    fill,
    '',

    'OUTPUT — read this twice, it is where every previous attempt failed:',
    `· ONE image, exactly SQUARE (1:1), ${SINGLE_SIZE} x ${SINGLE_SIZE} pixels or larger.`,
    '  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns',
    '  have twice come back at 1024x559, which is the tool default overriding',
    '  this line — the setting wins, so change the setting.',
    '· ONE object. Not two, not a comparison, not variants side by side, not a',
    '  before-and-after pair. A single sprite, alone, filling the frame.',
    '· No frame, border, card, label, caption, arrow, annotation or drop shadow.'
  ].join('\n')
}

// ─── Scenery ────────────────────────────────────────────────────────────────
//
// The landscape, as painted assets rather than as drawing code.
//
// Three rounds of restyling the procedural renderer — warm shadows, brown ink,
// cross-hatching, inked ridge lines, paper tooth — produced changes that are
// invisible at gameplay size next to a hand-painted block. The blocks work
// because they ARE paintings; the scenery is the larger half of the screen and
// almost none of it animates, so it takes paint far more comfortably than the
// cast does.
//
// These are NOT on the 128 lattice. A mountain range is a wide band that has to
// repeat across an infinite world, so it is its own asset with its own shape,
// and the ones marked `tileable` must join to themselves seamlessly at the left
// and right edges or the horizon shows a visible seam every screen width.

export interface SceneryAsset {
  id: string
  file: string
  /** Path under `public/` this belongs at. */
  target: string
  w: number
  h: number
  /** Must the left edge join the right edge invisibly? */
  tileable: boolean
  /**
   * What the EMPTY part of the frame has to be.
   *
   * `magenta`     the whole object floats on chroma key
   * `magenta-sky` a band: sky above the ridge is chroma key, artwork below
   * `opaque`      no empty part at all; the band fills the frame
   *
   * Split out because the mountains need transparency ABOVE the ridge and the
   * brief simply said "transparent" — so the model exported the grey-and-white
   * checkerboard and painted it in as if the squares were scenery.
   */
  bg: 'magenta' | 'magenta-sky' | 'opaque'
  blurb: string
}

export const SCENERY: SceneryAsset[] = [
  {
    id: 'sun', file: 'bg-sun', target: 'images/bg/sun.webp',
    w: 512, h: 512, tileable: false, bg: 'magenta',
    blurb: 'The sun: a warm disc with a soft ray fan around it, sitting with pure magenta #FF00FF everywhere around it. It is drawn high in a daytime sky, so it wants to feel gentle and golden rather than blinding.'
  },
  {
    id: 'moon', file: 'bg-moon', target: 'images/bg/moon.webp',
    w: 512, h: 512, tileable: false, bg: 'magenta',
    blurb: 'The moon: a pale cratered disc with a soft, narrow halo close around its rim. Calm and cool, but still warm-toned in its shadows. Keep the halo tight — a wide glow blends into the background and has to be reconstructed.'
  },
  {
    id: 'conifer', file: 'bg-conifer', target: 'images/bg/conifer.webp',
    w: 384, h: 512, tileable: false, bg: 'magenta',
    blurb: 'A single spruce, standing upright, whole tree from root to tip, with pure magenta #FF00FF everywhere around it. It is repeated across a distant tree line at about 30 px tall, so the SILHOUETTE has to carry it — a notched, tiered canopy rather than fine needles.'
  },
  {
    id: 'broadleaf', file: 'bg-broadleaf', target: 'images/bg/broadleaf.webp',
    w: 384, h: 512, tileable: false, bg: 'magenta',
    blurb: 'A single round-crowned broadleaf tree, whole, upright, with pure magenta #FF00FF everywhere around it. It stands next to the spruce in the same tree line and must not read as the same shape at distance.'
  },
  {
    id: 'mountains-far', file: 'bg-mountains-far', target: 'images/bg/mountains-far.webp',
    w: 1536, h: 512, tileable: true, bg: 'magenta-sky',
    blurb: 'The FAR mountain range: a pale, hazy ridge line of peaks with a little snow on the highest tops, fading toward the sky. Solid magenta sky above the ridge line, opaque artwork below it — the near range and the forest are drawn over the bottom of this band. It is the most distant thing in the scene, so keep it low-contrast and blue-grey; detail here competes with the tower.'
  },
  {
    id: 'mountains-near', file: 'bg-mountains-near', target: 'images/bg/mountains-near.webp',
    w: 1536, h: 512, tileable: true, bg: 'magenta-sky',
    blurb: 'The NEAR mountain range: darker, heavier peaks with more defined rock faces, standing in front of the far range. Solid magenta sky above the ridge line, opaque artwork below. Still background — richer than the far range, but it must sit behind the tower rather than compete with it.'
  },
  {
    // 8:1 rather than 4:1. The meadow renders only about 25 px tall against a
    // 900 px frame, and `tileBand` scales a tile by HEIGHT — so a 4:1 asset
    // came out roughly 100 px wide and repeated nine times across the screen,
    // which is where tiling starts to be visible as tiling.
    id: 'grass', file: 'bg-grass', target: 'images/bg/grass.webp',
    w: 1024, h: 128, tileable: true, bg: 'opaque',
    blurb: 'The meadow the enemies walk across: a long, LOW band of grass seen slightly from above, with tufts, a few small stones and gentle tonal variation. Fully opaque, top to bottom. It is drawn as a thin strip only about 25 px tall on screen, so keep the detail broad — fine blades disappear. Units walk ON it, and busy grass makes a walking enemy hard to see.'
  },
  {
    id: 'water', file: 'bg-water', target: 'images/bg/water.webp',
    w: 1024, h: 512, tileable: true, bg: 'opaque',
    blurb: 'The lake in front of the tower: calm water with soft horizontal ripple bands, darkening toward the bottom. Fully opaque. The tower is mirrored on top of this by the engine, so keep the surface quiet and avoid strong highlights that would fight the reflection.'
  }
  ,
  {
    id: 'roof', file: 'bg-roof', target: 'images/bg/roof.webp',
    w: 512, h: 384, tileable: false, bg: 'magenta',
    blurb: 'A roof GABLE seen straight on from the front: a simple pitched roof, deep red clay tiles or shingles, with eaves overhanging a little at each side and a visible ridge line. No walls, no building under it — just the roof, as if lifted off a house. It is composited on TOP of a wooden crate in game, so the underside must be a clean straight horizontal edge with nothing hanging below it. It is the ONLY red thing in the tower, deliberately, because it marks a block nothing can be built on top of.'
  },
  {
    id: 'icon-wood', file: 'icon-wood', target: 'images/icons/wood.webp',
    w: 512, h: 512, tileable: false, bg: 'magenta',
    blurb: 'The WOOD resource icon: a small stack of cut logs seen end-on, growth rings showing on the cut faces, warm timber browns. It sits in the HUD bar at about 26 px, so it must read instantly at thumbnail size — bold shapes, strong silhouette, no fine detail.'
  },
  {
    id: 'icon-stone', file: 'icon-stone', target: 'images/icons/stone.webp',
    w: 512, h: 512, tileable: false, bg: 'magenta',
    blurb: 'The STONE resource icon: two or three chunks of quarried grey rock with chipped facets. Read at about 26 px in the HUD bar, so keep it to bold shapes with a strong silhouette and no fine detail. It must not be mistakable for the wood icon at a glance.'
  },
  {
    id: 'icon-gold', file: 'icon-gold', target: 'images/icons/gold.webp',
    w: 512, h: 512, tileable: false, bg: 'magenta',
    blurb: 'The GOLD resource icon: a small bar or stack of coins in warm gold. Read at about 26 px in the HUD bar — bold shape, strong silhouette, no fine detail. It is the premium currency, so it should be the brightest and most eye-catching of the three.'
  }
]

// ─── Walk cycles ────────────────────────────────────────────────────────────
//
// One sheet per monster DESIGN, not per enemy type.
//
// The enemy sheet already offers a still per type, and a still is the wrong
// shape of answer: dropping one in freezes the unit, and a monster's gait is
// most of what makes it read as alive rather than as a sticker sliding across
// the grass. What the battlefield actually plays is a strip — sixteen baked
// frames covering exactly one locomotion cycle — so what a painter has to
// return is a strip too.
//
// The panel is the BAKE'S OWN FRAME BOX, scaled up. That is the whole trick:
// because the panel has the same proportions and the same feet line as the
// frame the renderer already draws, a returned strip is a drop-in replacement
// for the bake at a higher resolution, and nothing downstream has to be told
// where the character's feet are.

/** Panels per sheet. Eight reads as a walk; sixteen is twice the drift. */
export const WALK_FRAMES = 8

/** Grid, chosen so the sheet lands on a clean 16:9 that every tool offers. */
export const WALK_COLS = 4
export const WALK_ROWS = WALK_FRAMES / WALK_COLS

/** One panel, px. 4 x 320 = 1280 and 2 x 360 = 720 — exactly 16:9. */
export const WALK_PANEL_W = 320
export const WALK_PANEL_H = 360

export interface WalkSpec {
  /**
   * What is cycling.
   *
   * `monster` is a step and `siege` is a wheel revolution, and the difference
   * reaches further than the label: a monster's frame box is taller than it is
   * wide and a siege engine's is square, so the two lay out on different sheets
   * and the runtime counts their panels against different aspects.
   */
  kind: 'monster' | 'siege'
  /** The DESIGN id — `images/<kind>s/<id>.webp` is where the strip lands. */
  id: string
  file: string
  target: string
  name: string
  tagline: string
  /** Which way the design is authored. Left-facers are NOT flipped for export:
   *  the strip has to match the bake it replaces, and the battlefield does its
   *  own mirroring by travel direction. */
  faces: 'left' | 'right' | 'front'
  /** How the body hangs — by the feet, or by its middle (swimmers). */
  anchor: 'feet' | 'centre'
  cols: number
  rows: number
  frames: number
  /** One panel, px. Its proportions ARE the procedural frame box's. */
  panelW: number
  panelH: number
  w: number
  h: number
}

/**
 * A siege panel is SQUARE, because the sprite box the renderer blits is.
 *
 * Which costs the tidy 16:9 the monster sheets get — eight square panels on a
 * 4x2 grid is 2:1 — but a panel that is not the frame box's own shape would put
 * every painted engine at the wrong size, and the sheet's proportions are the
 * cheaper thing to give up.
 */
export const SIEGE_PANEL = 360

/**
 * The engines a painted chassis can replace, and only these three.
 *
 * All six roll, but only the ballista, catapult and trebuchet have their ARM
 * drawn as a separate live layer. The ram, the iron ram and the siege tower
 * draw their moving parts inside the static pass, interleaved in z-order with
 * their own shells, so a painted chassis would freeze them — see the note on
 * `SIEGE_STRIPS` in the renderer.
 */
const SIEGE_ENGINES = [
  {
    id: 'ballista', name: 'Bolt Thrower',
    blurb: 'A wheeled bolt thrower: two cart wheels, a heavy timber frame and a '
      + 'stock. Draw the CARRIAGE ONLY — no bow, no arms, no bolt. The weapon is '
      + 'painted on separately in game and must not appear here.'
  },
  {
    id: 'catapult', name: 'Catapult',
    blurb: 'A wheeled catapult carriage: two cart wheels, a squat braced timber '
      + 'frame, a winch drum. Draw the CARRIAGE ONLY — no throwing arm, no bowl, '
      + 'no stone. The arm is painted on separately in game.'
  },
  {
    id: 'trebuchet', name: 'Trebuchet',
    blurb: 'A trebuchet standing FRAME: two cart wheels, a heavy A-frame of '
      + 'timbers with a cross axle at the top, ropes and a winch. Draw the FRAME '
      + 'ONLY — no throwing arm, no counterweight, no sling. The arm swings '
      + 'separately in game and must not appear here.'
  }
] as const

const monsterWalks: WalkSpec[] = MONSTERS.map((m) => ({
  kind: 'monster',
  id: m.id,
  file: `walk-${m.id}`,
  target: `images/monsters/${m.id}.webp`,
  name: m.name,
  tagline: m.tagline,
  faces: m.faces ?? 'front',
  anchor: m.anchor ?? 'feet',
  cols: WALK_COLS,
  rows: WALK_ROWS,
  frames: WALK_FRAMES,
  panelW: WALK_PANEL_W,
  panelH: WALK_PANEL_H,
  w: WALK_COLS * WALK_PANEL_W,
  h: WALK_ROWS * WALK_PANEL_H
}))

const siegeWalks: WalkSpec[] = SIEGE_ENGINES.map((e) => ({
  kind: 'siege',
  id: e.id,
  file: `roll-${e.id}`,
  target: `images/siege/${e.id}.webp`,
  name: e.name,
  tagline: e.blurb,
  // Machines are authored facing +X and the battlefield mirrors by travel
  // direction, exactly as the cast is.
  faces: 'right',
  anchor: 'centre',
  cols: WALK_COLS,
  rows: WALK_ROWS,
  frames: WALK_FRAMES,
  panelW: SIEGE_PANEL,
  panelH: SIEGE_PANEL,
  w: WALK_COLS * SIEGE_PANEL,
  h: WALK_ROWS * SIEGE_PANEL
}))

export const WALKS: WalkSpec[] = [...monsterWalks, ...siegeWalks]

/**
 * A ready-to-paste prompt for one walk cycle.
 *
 * Almost all of this is about ONE failure: an image model handed eight panels
 * of the same character will happily return eight different characters. So the
 * consistency clause is stated before the style, in the same position and for
 * the same reason `BACKGROUND_RULE` is — it is the thing that makes the result
 * usable or useless, and models weight what they read first.
 */
export const promptForWalk = (w: WalkSpec): string => [
  `# ${w.id} — ${w.name}  (${w.target})`,
  '',
  `Repaint a WALK CYCLE. The attached sheet is ${w.cols} columns x ${w.rows} rows`,
  `= EXACTLY ${w.frames} panels, read left to right along the top row and then the`,
  'bottom row. Every panel is the SAME creature at a different moment of one step.',
  '',
  `· ${w.frames} panels. Not ${w.frames + 4}, not ${w.frames * 3}.`
  + ` Exactly ${w.rows} rows of ${w.cols} — do not add a row.`,
  '',
  'ONE CHARACTER — read this before anything else.',
  `All ${w.frames} panels must show the same individual: identical colours,`,
  'identical clothing and gear, identical proportions, identical silhouette,',
  'identical markings, identical number of limbs and horns. Only the POSE changes,',
  'and it changes exactly as the reference shows — same limb positions, same body',
  'lean, same head angle, same height off the ground, panel for panel.',
  '· ONE colour scheme, taken from the reference, in every panel. A creature that',
  '  is blue-grey in one panel and tan in another is not one creature animated,',
  '  it is several creatures side by side, and the result is unusable.',
  '· Do not redesign it. Do not add or remove equipment between panels.',
  '· Do not turn it to face a different direction in any panel.',
  '· Do not re-scale it: the creature must be the same size in every panel, and',
  '  the same size it is in the reference. Do not move it around inside its panel.',
  `· It faces ${w.faces === 'front' ? 'the viewer' : w.faces.toUpperCase()} in the`
  + ` reference. Keep that direction in all ${w.frames} panels.`,
  '',
  `WHAT IT IS: ${w.name} — ${w.tagline}`,
  '',
  STYLE,
  '',
  'LAYOUT — the grid is a cutting guide, and it is cut blindly.',
  `Each panel is exactly 1/${w.cols} of the width and 1/${w.rows} of the height.`,
  'ONE correction to the style note above: "fills the square edge to edge" is for',
  'building blocks and is WRONG here. A creature does NOT fill its panel — it is',
  'centred in it, at the size the reference draws it, with clear magenta all round.',
  'Never let a limb, tail, weapon or shadow cross into a neighbouring panel.',
  'Do not add, drop, merge or reorder panels.',
  'Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or',
  'numbers — in ANY colour, magenta included. The magenta is the empty space the',
  'creatures sit in, not a grid to draw with: the space BETWEEN two panels is the',
  'same flat background as the space around each creature, and nothing marks the',
  'join. The panels are found by measuring, so a drawn line is not a help, it is',
  'a mark that ends up welded into the sprite.',
  '',
  BACKGROUND_RULE,
  '',
  w.anchor === 'centre'
    ? 'This one SWIMS. It has no feet and is centred on the middle of its body, so\n'
      + 'keep it centred vertically in the panel exactly as the reference has it.'
    : 'The feet land on the same line in every panel — the same height from the\n'
      + 'bottom of the panel as in the reference. If the feet drift up or down\n'
      + 'between panels the creature bobs when it walks.',
  '',
  `OUTPUT: one image, ${w.w} x ${w.h} pixels (16:9). If your tool has an`,
  'aspect-ratio control, set it to 16:9. No labels, captions or watermarks.'
].join('\n')

/** A ready-to-paste prompt for one scenery asset. */
export const promptForScenery = (a: SceneryAsset): string => [
  `# ${a.id}  (${a.target})`,
  '',
  `Paint one background element for a cozy medieval-fantasy tower-defence game.`,
  '',
  STYLE,
  '',
  `WHAT IT IS: ${a.blurb}`,
  '',
  a.bg === 'opaque'
    ? 'BACKGROUND: none. This band is FULLY OPAQUE from its top edge to its bottom\n'
      + 'edge and from side to side. No transparency, no checkerboard, no magenta.'
    : a.bg === 'magenta-sky'
      ? 'BACKGROUND — read this before anything else.\n'
        + 'Everything ABOVE the ridge line is sky, and it must be solid, flat, pure\n'
        + 'magenta #FF00FF — a green-screen colour, keyed out automatically.\n'
        + 'NOT transparent: transparency gets exported as a grey-and-white\n'
        + 'CHECKERBOARD and then baked in as though the squares were paint. NOT\n'
        + 'white, NOT pale blue, NOT a paper texture, and no gradient or haze in it.\n'
        + 'BELOW the ridge the artwork is fully opaque, right down to the bottom\n'
        + 'edge — do not fade it out, the ground is drawn over it.'
      : BACKGROUND_RULE,
  '',
  a.tileable
    ? 'SEAMLESSLY TILEABLE, HORIZONTALLY. This image is repeated end to end across\n'
      + 'a landscape wider than the screen. The right edge must join the left edge\n'
      + 'with no visible seam, no matching feature straddling the join, and no\n'
      + 'vignette or fade at either side. It does NOT need to tile vertically.'
    : 'One object, centred in the frame.',
  '',
  `OUTPUT: exactly ${a.w} x ${a.h} pixels. If your tool has an aspect-ratio`,
  `control, set it to match. No labels, captions or watermarks.`
].join('\n')
