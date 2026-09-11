import { BLOCK_DEFS, blockDef, canMergeType, isShip } from '@/game/blocks'
import { PALETTES, paletteFor, blockArtBase } from '@/game/art'
import { ENEMY_DEFS } from '@/game/enemies'
import { MONSTERS } from '@/game/monsters'
import { tierStyle } from '@/game/tierStyle'
import {
  TIER_ART_WEAPONS, tierFixtureId, CHEST_WING_BOX
} from '@/game/paintedArt'
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
  bolt: 'an archer’s arrow in flight, pale ash shaft, feather fletching, a bright leaf-shaped steel broadhead, pointing right',
  quarrel: 'a siege ballista’s quarrel: SHORT and heavy, a thick dark oiled timber shaft, a cord binding at the socket, stiff cut-leather vanes and a squat blunt four-sided iron bodkin head. It must not be mistakable for the archer’s arrow, pointing right',
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
  'repair', 'spikes',
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
        ? 'Reference only — a hull is not a square cell of material, so it has its own sheet: paint hull-<id>.png, which is cut to the band the boat is actually visible in. The deck weapon stays drawn live on top of it.'
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
  { round: 'bolt', label: 'arrow', slot: true, note: 'The most-fired round in the game — the archer post and both bolt-throwing ships.' },
  { round: 'quarrel', label: 'quarrel', slot: true, note: 'The siege ballista’s round, and the one shot the player has to see coming and answer.' },
  { round: 'ball', label: 'ball', slot: true, note: 'Cannonball.' },
  { round: 'shell', label: 'shell', slot: true, note: 'Mortar shell — finned, fuse lit, points along its arc.' },
  { round: 'bomb', label: 'bomb', slot: true, note: 'Enemy ordnance, nose-down along its fall.' },
  { round: 'fire', label: 'fire', slot: true, note: 'Molotov, tumbling.' },
  { round: 'frost', label: 'frost', slot: false, note: 'The frost round is a live particle emitter; this is only its core shard.' }
]

/**
 * Rounds that can be replaced by a bitmap.
 *
 * The two shafted ones, and only those. They are drawn pointing right and
 * rotated to their heading, so a single still serves every direction — which a
 * cannonball (a circle, deliberately not aligned to its velocity) and a frost
 * shard (a live particle emitter) cannot make use of.
 *
 * The shell, the bomb and the molotov are shafted too and could join them, but
 * each carries something drawn live on top — a fuse spark, a burning rag — and
 * a target here that the renderer does not actually read is a promise the sheet
 * cannot keep. They stay reference-only until the hook exists.
 */
const ROUND_TARGETS = new Set<ProjectileKind>(['bolt', 'quarrel'])

const allyCells = (): SheetCell[] => {
  const cells: SheetCell[] = [{
    id: 'ally/cavalry',
    palette: 'cavalry',
    blurb: 'Cavalry: an armoured rider on a barded warhorse, cool blue livery and a gold pennant, facing RIGHT. The FRIENDLY unit — it must never read as something to shoot at.',
    col: 0, row: 0, cw: 1, ch: 1,
    label: 'cavalry',
    sub: '0.80c · ally',
    // No target: the rider GALLOPS, and the strip on the walk sheet owns
    // `images/allies/cavalry.webp`. A still sliced to the same path would
    // win by being sliced last and freeze the unit mid-stride, which is a
    // worse result than leaving it drawn.
    note: 'Reference only — the rider is adopted as a GALLOP STRIP from walk-cavalry, not as a still. Cool blue, gold pennant, facing right. Must stay unmistakable against the warm-toned enemies at a glance.',
    art: { kind: 'cavalry' }
  }]
  ROUNDS.forEach((r, i) => {
    cells.push({
      id: `projectile/${r.round}`,
      blurb: `${r.label}: ${ROUND_ART[r.round] ?? 'a projectile'}. Must stay recognisable at a few pixels across in flight.`,
      col: (i + 1) % 8, row: Math.floor((i + 1) / 8), cw: 1, ch: 1,
      label: r.label,
      sub: r.slot ? 'round' : 'live FX',
      // Only the shafted rounds can be a bitmap. A cannonball is a circle drawn
      // at its own radius and a frost shard is a live emitter; both would lose
      // by being pinned to one still.
      ...(ROUND_TARGETS.has(r.round) ? { target: `images/rounds/${r.round}.webp` } : {}),
      note: r.slot && !ROUND_TARGETS.has(r.round)
        ? `${r.note} No override hook: this one is drawn from its own geometry every frame.`
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
const STYLE_HEAD = [
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
  '· NO cold grey, gritty, weathered-industrial or grimdark look.'
]

const STYLE_TAIL = [
  '· Do not invent content for a square that is blank. Leave it blank.',
  '· Keep each object the same subject and silhouette it already has. This is a',
  '  restyle, not a redesign.'
]

export const STYLE = [
  ...STYLE_HEAD,
  '· NO frames, borders, cards, vignettes, matting or paper background inside a',
  '  square. The object itself fills the square edge to edge, corner to corner.',
  ...STYLE_TAIL
].join('\n')

/**
 * The same block for artwork that must NOT fill its frame.
 *
 * One bullet differs, and it is the one the panelled prompts then had to argue
 * with three paragraphs further down: "the object fills the square edge to
 * edge" is right for a building-block cell and ruinous for a part that has to
 * keep a bolt-on point, because a model that reads it enlarges the drawing
 * until the placement it was handed is gone. Correcting it afterwards did not
 * work — the arm sheet said both things and what came back was the fill — so
 * the panelled prompts get a block that never says it.
 */
export const STYLE_PART = [
  ...STYLE_HEAD,
  '· NO frames, borders, cards, vignettes, matting or paper background behind',
  '  the drawing. Nothing but flat magenta behind it, right up to its outline.',
  ...STYLE_TAIL
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
    `# ${c.label} — ${c.sub}  (${s.file}.png${c.target ? ` → ${c.target}` : ''})`,
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
  /**
   * Must the artwork reach all four edges of the frame?
   *
   * The default layout line asks for one object centred in the frame, which is
   * right for a tree and wrong for a band. Scenery is never trimmed on the way
   * back in, so a subject painted small inside its frame is written out at the
   * declared size with the empty border baked in — and it arrives on screen as
   * a shrunken version of itself surrounded by dead space. A tileable band gets
   * this for free from the seam rule; anything else has to be told.
   */
  bleed?: boolean
  /**
   * The prompt's opening line, for an asset that is not scenery at all.
   *
   * Everything on this list used to be the landscape, and the prompt still
   * opens "paint one background element". A sprite that is part of a moving
   * thing is not one, and a model told it is paints it as backdrop.
   */
  lead?: string
  /**
   * Where the object sits in its frame, for an asset whose position is part of
   * the contract rather than a composition choice.
   *
   * Replaces the default "one object, centred in the frame" — which is exactly
   * wrong for something the game rotates about a point in its own canvas.
   */
  placement?: string
  blurb: string
}

/** A fraction of a frame as a percentage a painter can check by eye. */
const pct = (f: number): string => `${Math.round(f * 100)}%`

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
  },
  {
    // The result screen's title band, and the reason it is here rather than
    // left as the `ui/ribbon` cell: SHAPE.
    //
    // The shipped `parchment-ribbon_553x188.webp` is 2.94:1 and spends roughly
    // a quarter of its height on a bottom curl the label has to dodge —
    // `.ribbon-content` lifts itself 14% to clear it. At 340 px wide that band
    // stood 116 px tall on a 390 px viewport, and FReward carries four media
    // queries whose only job is to claw the height back. A flat 5:1 band with
    // the writing panel in the middle costs 41% less vertical room at exactly
    // the same width, so none of those widths have to move.
    //
    // A NEW id and a NEW path on purpose. The old bitmap stays where it is and
    // keeps working as the fallback, so a build with no painted ribbon looks
    // exactly like today's.
    id: 'ribbon', file: 'bg-ribbon', target: 'images/bg/ribbon.webp',
    w: 1280, h: 256, tileable: false, bg: 'magenta', bleed: true,
    blurb: 'The result screen TITLE BANNER: one long, flat, horizontal parchment ribbon seen straight on, with a small folded tail at each end. Aged warm vellum, a soft ink border and a little foxing along the edges. SHAPE IS THE WHOLE JOB HERE — it is WIDE AND SHALLOW, a 5:1 band rather than a scroll, and it must use the entire frame: the left tail touches the left edge, the right tail touches the right edge, and the tallest part of the ribbon touches the top and the bottom edge. Leave no magenta margin on any side — a banner painted small inside the frame arrives on screen as a small banner with dead space around it, which is the exact fault this asset replaces. The middle 70% of the width is the WRITING PANEL: flat, straight, parallel top and bottom edges, at least 80% of the frame height, and VERTICALLY CENTRED — the game prints its title across it, so keep that panel an even, quiet, uncluttered surface in a mid parchment tone that white lettering with a dark outline will read on. Do not write anything on it: no words, no letters, no numerals, no monogram, no crest, no icon, no ornament in the centre. The ends carry ONE shallow fold each and nothing more — no deep curls, no rolled scroll ends, no ribbon looping behind itself, no swallowtail notch deeper than a fifth of the width. Nothing may sit above or below the band: no pole, no finial, no hanging cords, tassels, nails, rings, shadow or ground. Every pixel of height that is not ribbon is height the result screen loses.'
  },
  {
    // Not a resource glyph: it is a BUTTON, and the only one on the HUD that
    // rewards looking at it. It also carries a cooldown shade masked to its own
    // silhouette, which is why the outline has to stay one closed shape — a
    // detached strap or a spilled coin masks as a floating fleck of shadow.
    id: 'icon-chest', file: 'icon-chest', target: 'images/icons/chest.webp',
    w: 512, h: 512, tileable: false, bg: 'magenta',
    blurb: 'The daily TREASURE CHEST icon: a small, sturdy, CLOSED wooden chest seen straight on from the front — a domed lid, two dark iron bands running across the body, and a gold lock plate with a keyhole centred on the front. Warm timber browns, dark iron, one warm gold accent. It sits in the HUD at about 50 px and is the thing a player taps for their free coins, so it should look inviting and full: bold shapes, strong silhouette, no fine detail. The lid stays SHUT — the game plays the opening itself. Keep it ONE compact closed shape, with no dangling straps, no key, no spilled coins, no ground and no shadow beneath it: a cooldown shade is masked to this silhouette, so anything detached from the body becomes a floating fleck. It must not be mistakable for the gold resource icon at a glance — that one is the coins, this one is the box they came in.'
  },
  {
    // The flying chest's WING. One wing, not a winged chest: the chest is the
    // painted icon above, and the component flaps each wing by rotating it
    // about its root — which a chest with wings painted on could never do.
    // Mirrored for the left side, so there is one file.
    //
    // A prop, not a lattice cell, because there is no drawing to register it
    // against — the drawn fallback lives in the component, not the renderer —
    // so where the root sits is stated in numbers (`CHEST_WING_BOX`), the same
    // numbers the component rotates about. Scenery is never trimmed on the way
    // back in, which is what keeps those fractions true after slicing.
    id: 'prop-chest-wing', file: 'prop-chest-wing', target: 'images/props/chest-wing.webp',
    w: CHEST_WING_BOX.w, h: CHEST_WING_BOX.h, tileable: false, bg: 'magenta',
    lead: 'Paint ONE game sprite — a single wing — for a cozy medieval-fantasy '
      + 'tower-defence game. Attach `images/icons/chest.webp` with this prompt: the '
      + 'wing belongs to that chest and has to look painted by the same hand.',
    placement: [
      'PLACEMENT IS THE CONTRACT — the game flaps this wing by ROTATING it about',
      'its root, so the root has to be exactly where this says, and the wing',
      'must not be centred.',
      `· The ROOT of the wing — the shoulder, where it meets the chest — sits ${pct(CHEST_WING_BOX.pivotX)}`,
      `  of the way in from the LEFT edge and ${pct(CHEST_WING_BOX.pivotY)} of the way down from the TOP.`,
      '  Make it a compact rounded root of small covert feathers, as if it comes',
      '  out of the chest’s side.',
      '· From the root the wing spreads out to the RIGHT and UP: its leading edge',
      `  rises at about ${CHEST_WING_BOX.restDeg}° above horizontal, the longest flight feathers reach`,
      '  about 94% of the way to the right edge, and the top of the wing comes',
      '  within about 8% of the top edge.',
      '· NOTHING of the wing lies to the LEFT of the root, and nothing hangs',
      '  below about 88% of the height — the trailing feathers sweep back and',
      '  down to the right, not down past the root.',
      '· It is the RIGHT wing. Do not mirror it and do not paint a pair: the game',
      '  mirrors this one for the other side.'
    ].join('\n'),
    blurb: 'The WING of a flying treasure chest — ONE feathered bird wing, spread wide as if in the middle of a wingbeat. Soft layered feathers: small rounded coverts near the root, long flight feathers fanning out along the trailing edge. Warm cream-white feathers with a soft grey-brown shadow side, and the tips of the long flight feathers edged in the same warm GOLD as the chest’s lock plate, so the wing and the chest read as one magical object. The same hand-inked warm-brown contour as the chest, with a strong ink line all the way round the outside — the feathers are pale, and that line is what separates them from the background. It is drawn small in game, about the height of the chest itself, so keep it to bold overlapping feather shapes rather than fine barbs. No chest, no body, no bird, no arm bone sticking out, no glow, no sparkles, no motion lines.'
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
  kind: 'monster' | 'siege' | 'siegeArm' | 'ally' | 'ship' | 'fixture'
  /** The DESIGN id — `images/<kind>s/<id>.webp` is where the strip lands. */
  id: string
  file: string
  target: string
  name: string
  tagline: string
  /**
   * Panel-by-panel notes on what the reference sheet actually shows.
   *
   * Only the arms carry one. A walk cycle is legible from the reference — a
   * leg is forward or it is back — but a reload is not: the ballista's first
   * panel is the frame AFTER the shot, with no bolt in it, and read as a
   * drawing rather than as a moment it just looks like a different machine
   * with a part missing. Saying which moment each panel is stops the painter
   * tidying the odd ones out into a smooth, wrong sequence.
   */
  panels?: string
  /**
   * How big the part is INSIDE its panel, as a fraction a painter can check.
   *
   * Measured off the reference sheet rather than guessed. Every prose way of
   * saying this has now been tried — "small in its panel", "do not re-scale
   * it", "floats clear of all four edges" — and all three came back at about
   * double: the catapult arm at 1.98x, the trebuchet at 1.67x, the ballista at
   * 1.26x. "Small" is a judgement and the painter's judgement is the frame,
   * not the carriage it has never seen. A percentage of the panel width is not
   * a judgement, and it is the number that decides whether the beam meets its
   * pivot or floats a body-length off it.
   */
  span?: string
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
  /**
   * A MERGED weapon's sheet: which weapon, at which tier.
   *
   * Only the tier fixtures carry these. Their id (`cannon-t2`) is not a block
   * type anything can draw, so the bench needs the weapon to paint and the
   * tier to paint it at — the twin or triple battery `paintFixtureBattery`
   * lays out — and the prompt needs the weapon for its colours.
   */
  fixtureType?: string
  fixtureTier?: number
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
 * One siege image, px. Bigger than a panel of the old grid, because it is now
 * the whole generation rather than an eighth of one.
 */
export const SIEGE_SINGLE = 768

/**
 * All six engines. Every one now has its moving part on its own live layer, so
 * a painted chassis animates rather than freezing.
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
  },
  {
    id: 'ram', name: 'Battering Ram',
    blurb: 'A battering ram SHED: two cart wheels, a low timber cart, two corner '
      + 'posts, and a pitched roof covered in stitched hide sloping down to the '
      + 'right, with a couple of spent arrows stuck in it. Draw the CART AND ROOF '
      + 'ONLY — no log, no ropes, no iron head. The log swings separately in game.'
  },
  {
    id: 'ironRam', name: 'Iron Ram',
    blurb: 'An armoured ram CASEMATE: two iron-shod wheels, an iron chassis beam, '
      + 'and a riveted steel box over it with a shallow sloped lid, plate seams, '
      + 'a riveted band along the eaves and a dark vision slit near the top right. '
      + 'Cold grey armour. Draw the BOX ONLY — no log, no ram head. The log slides '
      + 'out of it separately in game.'
  },
  {
    id: 'siegeTower', name: 'Siege Tower',
    blurb: 'A rolling siege tower BODY: two cart wheels under a tall boxy timber '
      + 'tower, roughly planked in uneven horizontal boards with cross-bracing, '
      + 'and a stitched hide panel down the right-hand face against fire arrows. '
      + 'Draw the BODY ONLY — no ramp, no banner, no crew, no battlements on top. '
      + 'Those are all animated separately in game.'
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

/**
 * A siege chassis is ONE image, not a cycle.
 *
 * It shipped as an eight-panel roll first, on the reasoning that the wheels turn
 * and a turning wheel is a cycle. Both halves of that were wrong. In game the
 * engines are small, always moving across the screen and usually shooting at
 * something, so nobody has ever seen a spoke go round — and asking a painter for
 * eight views of one machine got eight machines: the catapult came back at a
 * different three-quarter angle in every panel, the trebuchet likewise. A frame
 * count of one has no perspective to lose and no grid to drift.
 *
 * Nothing downstream had to change for it. The frame count is read off the
 * strip's own shape, so a single square image simply IS a one-frame strip.
 */
const siegeWalks: WalkSpec[] = SIEGE_ENGINES.map((e) => ({
  kind: 'siege',
  id: e.id,
  file: `siege-${e.id}`,
  target: `images/siege/${e.id}.webp`,
  name: e.name,
  tagline: e.blurb,
  // Machines are authored facing +X and the battlefield mirrors by travel
  // direction, exactly as the cast is.
  faces: 'right',
  anchor: 'feet',
  cols: 1,
  rows: 1,
  frames: 1,
  panelW: SIEGE_SINGLE,
  panelH: SIEGE_SINGLE,
  w: SIEGE_SINGLE,
  h: SIEGE_SINGLE
}))

/**
 * The throwing arms — the one part of a siege engine that IS a cycle.
 *
 * Only the three throwing engines. Their arm is drawn from `cycle`, which runs
 * 0 the frame a round leaves to 1 the frame the next one does, so eight panels
 * across it is a genuine loop keyed to the machine's own reload. The ram, the
 * iron ram and the tower move on a wall clock instead and stay procedural.
 *
 * This is the half of an engine that a painted chassis leaves behind: a big,
 * moving share of the silhouette still drawn in the old hand.
 */
const ARM_ENGINES = [
  {
    id: 'ballista', name: 'Bolt Thrower arm',
    // The word "wheeled" used to be in this sentence, describing the machine
    // the part comes off. It came back with wheels. Nothing in a blurb is read
    // as background: every noun in it is read as a thing to draw.
    blurb: 'The bow assembly of a bolt thrower, lifted off its carriage and seen '
      + 'from the side: two upright torsion skeins — short ribbed drums of bound '
      + 'sinew — with one stiff timber arm sweeping out of each, the far arm a '
      + 'tone darker and set back behind the near one; the bowstring strung '
      + 'between the two arm tips; a heavy bolt lying dead level in front of the '
      + 'string, steel head to the RIGHT and cut-leather fletching at its tail; '
      + 'and away to the LEFT, clear of the rest, the windlass that draws it — a '
      + 'small dark timber block with an iron crank handle. NOTHING else: no '
      + 'wheels, no carriage, no bed, no stock, no upright frame, no ground. '
      + 'The two arms are separate straight timbers and the string is two '
      + 'straight runs meeting at the nock: do NOT draw one curved bow limb '
      + 'from tip to tip, and do not outline the assembly with a bow shape.',
    panels: 'Panel 1 is the instant AFTER the loose — the bolt is gone, the '
      + 'string has been thrown forward and the two arms are sprung wide apart, '
      + 'one up and one down. Panels 2 to 6 are the crew winding it back: a '
      + 'fresh bolt lies ready, the string comes further back in each panel and '
      + 'the arms close towards each other. Panels 7 and 8 are held at full '
      + 'draw, loaded and dead still, both arms nearly level and pointing right '
      + '— those two are all but identical. Every panel except the first has '
      + 'the bolt in it.',
    span: 'the assembly spans a little over half the panel’s width — about '
      + '55%, and never more than two thirds even in panel 2 where the bolt is '
      + 'at full stretch — and about two fifths of its height.'
  },
  {
    id: 'catapult', name: 'Catapult arm',
    blurb: 'The throwing arm of a catapult, lifted off its carriage and seen '
      + 'from the side: ONE squared baulk of heavy dark timber — a single beam, '
      + 'not a bundle of canes, poles or reeds and not a rolled mat — bound '
      + 'with two iron straps, a shallow bowl at its outer end, and the winch '
      + 'rope trailing from it. NOTHING else: no wheels, no carriage, no frame, '
      + 'no buffer, no ground.',
    panels: 'Panel 1 is the instant after the throw — the beam has slammed up '
      + 'and forward against its stop, bowl empty and over to the RIGHT. Panels '
      + '2 to 6 are the crew winching it back down: the beam swings up through '
      + 'the vertical (panel 4 is near-upright) and on over to the rear. Panels '
      + '7 and 8 are cocked and still, the beam lying back and low with the bowl '
      + 'over the tail at the LEFT, and only the last panel has a stone in it.',
    span: 'the beam spans about two fifths of the panel’s width — 43% at its '
      + 'longest, in panel 1 — and never more than half. It never covers more '
      + 'than about a third of the panel’s height.'
  },
  {
    id: 'trebuchet', name: 'Trebuchet arm',
    blurb: 'The throwing assembly of a trebuchet, lifted off its frame and seen '
      + 'from the side: one long timber beam pivoting nearer one end, a heavy '
      + 'boxed counterweight hanging off the short end on its own pin so it '
      + 'stays upright however far the beam has swung, and a two-cord sling '
      + 'trailing from the long end. NOTHING else: no wheels, no carriage, no '
      + 'A-frame, no ground.',
    panels: 'Panel 1 is the instant after the release — the long end is thrown '
      + 'up to the RIGHT with the empty sling streaming out past it and the '
      + 'counterweight box down at the LEFT. Panels 2 to 4 wind it back: the '
      + 'long end rises to straight up (panel 4) while the box comes up under '
      + 'the pivot. Panels 5 and 6 carry it on over, and panels 7 and 8 are '
      + 'cocked and still — counterweight raised at the RIGHT, long end down at '
      + 'the LEFT with the sling hanging slack below it, and the stone loaded '
      + 'in the pouch in the last panel only.',
    span: 'beam, counterweight and sling together span about half the panel’s '
      + 'width — 52% at most — and a little over half its height in the '
      + 'tallest panel.'
  }
] as const

/**
 * The cavalry sheet: the one ALLY with a gait.
 *
 * Square panels, not the monsters' tall ones. A monster is blitted into a
 * portrait frame box; the rider is blitted into a square one, the same way a
 * siege engine is, because a galloping horse is as long as it is tall and the
 * lance reaches past its nose. The panel IS the box the renderer draws into,
 * so the shape is not a layout choice.
 */
const ALLY_PANEL = 360

const allyWalks: WalkSpec[] = [{
  kind: 'ally',
  id: 'cavalry',
  file: 'walk-cavalry',
  target: 'images/allies/cavalry.webp',
  name: 'Cavalry',
  tagline: 'An armoured knight at full gallop on a barded warhorse — cool blue '
    + 'livery with gold trim, a caparison with a scalloped hem, a couched lance '
    + 'behind a vamplate, a heater shield and a plumed great helm. This is the '
    + 'player’s OWN unit and the only friendly body on the field: the blue has '
    + 'to say “mine” across the battlefield before any detail resolves, and it '
    + 'must never read as something to shoot at.',
  panels: 'One full gallop, four beats and a suspension. Panel 1 is the moment '
    + 'of suspension with every hoof clear of the ground and the body at its '
    + 'highest; the panels after it land near hind, far hind, far fore, near '
    + 'fore in that order, gathering under the horse and then extending. The '
    + 'lance, the shield and the rider’s seat stay put — it is the legs, the '
    + 'tail, the pennon and the plume that move.',
  faces: 'right',
  anchor: 'feet',
  cols: WALK_COLS,
  rows: WALK_ROWS,
  frames: WALK_FRAMES,
  panelW: ALLY_PANEL,
  panelH: ALLY_PANEL,
  w: WALK_COLS * ALLY_PANEL,
  h: WALK_ROWS * ALLY_PANEL
}]

const siegeArms: WalkSpec[] = ARM_ENGINES.map((e) => ({
  kind: 'siegeArm',
  id: e.id,
  file: `arm-${e.id}`,
  target: `images/siege-arms/${e.id}.webp`,
  name: e.name,
  tagline: e.blurb,
  panels: e.panels,
  span: e.span,
  faces: 'right',
  // The arm is composited on the same square box the chassis is, centred on the
  // machine's origin — so it hangs by the middle, not off a ground line.
  anchor: 'centre',
  cols: WALK_COLS,
  rows: WALK_ROWS,
  frames: WALK_FRAMES,
  panelW: SIEGE_PANEL,
  panelH: SIEGE_PANEL,
  w: WALK_COLS * SIEGE_PANEL,
  h: WALK_ROWS * SIEGE_PANEL
}))

/**
 * The three hulls.
 *
 * Not a cycle — one still each, which is why they are here and not on the
 * blocks sheet: a hull is not a square cell of material. The panel is the
 * CLIP BAND `drawShip` cuts a boat off at, so what comes back drops onto
 * exactly the rectangle the renderer blits, and the roll, the heave and the
 * wake are all applied to it afterwards.
 *
 * 960 x 732 because 960 / 1.6 is a whole 600 px per unit and 1.22 units of
 * height is then exactly 732 — an off-by-a-fraction panel would land the
 * waterline in the wrong place on every boat.
 */
const SHIP_PANEL_W = 960
const SHIP_PANEL_H = 732

const SHIP_HULLS = [
  {
    id: 'skiff', name: 'Skiff hull',
    blurb: 'A small single-masted clinker-built timber boat, seen side-on and '
      + 'facing RIGHT: a shallow raked hull of overlapping planks, a gunwale '
      + 'rail along the sheer, and a stubby mast well aft carrying a scrap of '
      + 'blue livery sail. Cut off flat at the waterline.'
  },
  {
    id: 'longship', name: 'Longship hull',
    blurb: 'A lean clinker-built longship, seen side-on and facing RIGHT: '
      + 'overlapping planks, a carved stem-post curling over the bow, a row of '
      + 'round shields hung along the sheer in red livery, four oars out, and '
      + 'a mast amidships with a red sail. Cut off flat at the waterline.'
  },
  {
    id: 'galley', name: 'War Galley hull',
    blurb: 'A broad oared warship, seen side-on and facing RIGHT: a heavy '
      + 'planked hull, a bronze ram at the waterline on the bow, an armoured '
      + 'bulwark along the sheer with a row of shields above it, a timber '
      + 'fighting castle aft with battlements, five oars out, and a mast with '
      + 'a yellow livery sail. Cut off flat at the waterline.'
  }
] as const

const shipHulls: WalkSpec[] = SHIP_HULLS.map((h) => ({
  kind: 'ship',
  id: h.id,
  file: `hull-${h.id}`,
  target: `images/ships/${h.id}.webp`,
  name: h.name,
  tagline: h.blurb,
  faces: 'right',
  // The waterline IS this thing's ground line, and it is the bottom edge of
  // the panel — so a return is registered by its BOTTOM, exactly as a walking
  // creature is registered by its feet.
  //
  // 'centre' here first, on the reasoning that the cut is always in the same
  // place so there was nothing to align. That is the opposite of true: the
  // normaliser reads this to decide what to line up, and centring let the
  // painted skiff keep the 18%-of-a-frame margin it was drawn with under the
  // hull. In game that margin is the boat hovering a fifth of a cell above
  // its own water.
  anchor: 'feet',
  cols: 1,
  rows: 1,
  frames: 1,
  panelW: SHIP_PANEL_W,
  panelH: SHIP_PANEL_H,
  w: SHIP_PANEL_W,
  h: SHIP_PANEL_H
}))

/**
 * The weapons a block carries, and what they are bolted to.
 *
 * A square panel two fixture-scales across — `FIXTURE_BOX` — because that is
 * the box the renderer bakes a fixture into and blits from, so a return drops
 * straight onto it.
 *
 * Authored at aim ZERO, level and pointing right. The game rotates the weapon
 * to its firing angle out of this one still, which is why the mount is a
 * separate sheet: a carriage rotated with its barrel swings two cart wheels
 * through the air every time the block tracks something.
 *
 * Only the seven WEAPONS. The resource buildings animate off a clock — a
 * swinging axe, a bobbing stack of coins — and a still would freeze them, so
 * they keep their drawing until someone wants to cut them a cycle.
 */
const FIXTURE_PANEL = 512

const FIXTURE_WEAPONS = [
  {
    id: 'cannon', name: 'Cannon barrel',
    blurb: 'A cast-iron cannon barrel on its trunnions, lying dead level '
      + 'and pointing RIGHT: a fat breech and cascabel at the left end, '
      + 'two reinforcing rings, a swell at the muzzle. NOTHING else — '
      + 'no carriage, no wheels, no block, no smoke, no ball.'
  },
  {
    id: 'archer', name: 'Archery bow',
    blurb: 'A war bow seen side-on, drawn and level, pointing RIGHT: two '
      + 'recurved limbs meeting at a wrapped grip, the string back at '
      + 'full draw with a nocked arrow on it. NOTHING else — no '
      + 'parapet, no merlons, no archer, no block.'
  },
  {
    id: 'mortar', name: 'Mortar tube',
    blurb: 'A squat siege mortar tube on its bed, elevated at a steep '
      + 'fixed angle to lob over a wall, mouth up and to the RIGHT: a '
      + 'short fat bore, heavy trunnion straps, a scorched muzzle. '
      + 'NOTHING else — no block, no crew, no shell, no smoke.'
  },
  {
    id: 'bombard', name: 'Bombard barrel',
    blurb: 'A stubby wrought-iron bombard, elevated to lob, mouth up and '
      + 'to the RIGHT: a thick banded barrel bound with hoops along its '
      + 'whole length, wider at the mouth than at the breech. NOTHING '
      + 'else — no block, no carriage, no shot.'
  },
  {
    id: 'tesla', name: 'Arc coil',
    blurb: 'A lightning coil standing upright: an iron post wound with '
      + 'copper wire, a polished ball terminal on top, ceramic '
      + 'insulators at its foot and a faint cool blue charge glow '
      + 'around the terminal. Symmetrical — it has no front. NOTHING '
      + 'else — no arc, no bolt, no block.'
  },
  {
    id: 'frost', name: 'Frost emitter',
    blurb: 'A cluster of pale blue ice crystals growing from a rimed iron '
      + 'socket, tallest in the middle, with hoar frost creeping up '
      + 'their facets. Symmetrical — it has no front. NOTHING else — no '
      + 'mist, no projectile, no block.'
  },
  {
    id: 'stonepit', name: 'Stone pit heap',
    blurb: 'A heap of three rounded pale stones with a quarryman’s pick held '
      + 'raised over them, angled back ready to strike down and to the LEFT: a '
      + 'dark timber haft and a curved iron head. NOTHING else: no block, no '
      + 'ground, no dust.'
  },
  {
    id: 'banner', name: 'Hanging banner',
    blurb: 'A cloth banner hanging from a cross-staff, held in a gentle '
      + 'curve as if in a light breeze: deep rose cloth with a gilt '
      + 'edge and a swallow-tailed hem. NOTHING else: no pole below the '
      + 'hem, no block, no wall.'
  },
  {
    id: 'obelisk', name: 'Arcane spire',
    blurb: 'A tapered standing stone with a pale blue seam of glyphs lit '
      + 'up its face, floating just clear of its base. NOTHING else: no '
      + 'block, no ground, no beam of light.'
  },
  {
    id: 'lumberHut', name: 'Lumber hut roof',
    blurb: 'A steep shingled roof over stacked cut logs, with a thin curl '
      + 'of smoke rising from the ridge. NOTHING else: no block, no '
      + 'walls, no axe, no ground.'
  },
  {
    id: 'coffer', name: 'Open coffer',
    blurb: 'An iron-banded strongbox with its lid held ajar and gold coins '
      + 'spilling over the near edge. NOTHING else: no block, no '
      + 'pedestal, no ground.'
  },
  {
    id: 'repair', name: 'Repair crane',
    blurb: 'A slim timber crane arm with an iron hook and a lit amber lamp '
      + 'at its head, angled up and to the RIGHT. NOTHING else: no '
      + 'block, no rope to the ground, no scaffolding.'
  },
  {
    id: 'spikes', name: 'Iron spikes',
    blurb: 'A row of forged iron spikes on a bolted rail, points up, '
      + 'uneven in height and pitted with rust. Symmetrical — it has no '
      + 'front. NOTHING else — no block, no blood, no ground.'
  }
] as const


const fixtureSheet = (e: { id: string; name: string; blurb: string }): WalkSpec => ({
  kind: 'fixture',
  id: e.id,
  file: `fixture-${e.id}`,
  target: `images/fixtures/${e.id}.webp`,
  name: e.name,
  tagline: e.blurb,
  faces: 'right',
  // 'feet', which reads as odd for a bow — but it is what makes a return
  // register against the REFERENCE rather than against the middle of the
  // panel. 'centre' means "put it in the middle of the box", which is right
  // for a swimmer and wrong for a fixture: the lumber hut's roof sits well
  // above the middle of its box and the painted one was dragged down to the
  // centre, a seventh of a box below where the drawing has it.
  anchor: 'feet',
  cols: 1,
  rows: 1,
  frames: 1,
  panelW: FIXTURE_PANEL,
  panelH: FIXTURE_PANEL,
  w: FIXTURE_PANEL,
  h: FIXTURE_PANEL
})

const fixtureSheets: WalkSpec[] = FIXTURE_WEAPONS.map(fixtureSheet)

/**
 * The merged weapons — each weapon's tier 2 and tier 3, painted outright.
 *
 * Until these are painted the game composites a merged gun out of copies of
 * the plain painting (`paintTieredFixture`): a twin at tier 2, a triple battery
 * from tier 3. That reads, but it is three pastes of one picture. A painting of
 * the battery itself replaces the copies whole.
 *
 * The reference is that composite as DRAWN — the copies at their offsets, the
 * rear rank shaded, no mount — on the same 512 box as the plain fixture, so a
 * return drops onto the same rectangle and the slicer fits it the same way.
 * It leaves out the tier rim, wash and glow on purpose: the game lays those on
 * over the painting too, and a reference that showed them would be painted in
 * and then drawn a second time on top.
 *
 * The words say what the reference cannot: that this is the SAME weapon
 * doubled rather than a new one, which colour the tier is, and that it has to
 * read as more gun at forty pixels.
 */
const TIER_FIXTURES: Record<(typeof TIER_ART_WEAPONS)[number], { name: string; twin: string; triple: string }> = {
  cannon: {
    name: 'Cannon',
    twin: 'TWO cast-iron cannon barrels lying dead level and pointing RIGHT, '
      + 'stacked like a double-barrelled gun: one just ABOVE and a little behind '
      + 'the other, each with its own fat breech and cascabel at the left end, '
      + 'its own reinforcing rings and muzzle swell. The upper, rear barrel is '
      + 'set back a hair to the LEFT and a tone darker.',
    triple: 'THREE cast-iron cannon barrels in a tight stacked battery, all dead '
      + 'level and pointing RIGHT: one above, one below, and the FRONT one in the '
      + 'middle between them, nearest the eye and a touch further forward. The '
      + 'two outer barrels are set back to the LEFT and a tone darker.'
  },
  archer: {
    name: 'Archery bow',
    twin: 'TWO war bows at full draw, level and pointing RIGHT, the second '
      + 'standing just BEHIND the first — offset to the LEFT and a little '
      + 'higher, a tone darker — each with its own nocked arrow, so the pair '
      + 'reads as a volley rather than one tall bow.',
    triple: 'THREE war bows in a stepped rank, all at full draw, level and '
      + 'pointing RIGHT: the rearmost furthest LEFT and highest, the middle one '
      + 'below it, the front one nearest the eye — each with its own nocked '
      + 'arrow, the rear two a tone darker.'
  },
  mortar: {
    name: 'Mortar',
    twin: 'TWO squat siege mortar tubes standing side by side on one bed, both '
      + 'at the same steep lobbing angle, mouths up and to the RIGHT: the rear '
      + 'tube to the LEFT, slightly smaller and a tone darker, the front tube '
      + 'overlapping it.',
    triple: 'THREE squat siege mortar tubes on one bed, all at the same steep '
      + 'lobbing angle, mouths up and to the RIGHT: a front tube in the middle, '
      + 'and one either side of it set back, slightly smaller and a tone darker.'
  },
  bombard: {
    name: 'Bombard',
    twin: 'TWO stubby wrought-iron bombards standing side by side, both at the '
      + 'same steep angle, mouths up and to the RIGHT, each bound with hoops '
      + 'along its whole length: the rear one to the LEFT, slightly smaller and '
      + 'a tone darker.',
    triple: 'THREE stubby hooped bombards side by side, all at the same steep '
      + 'angle, mouths up and to the RIGHT: a front one in the middle, one either '
      + 'side of it set back, slightly smaller and a tone darker.'
  },
  tesla: {
    name: 'Arc coil',
    twin: 'TWO lightning coils standing upright side by side, each an iron post '
      + 'wound with copper wire under a polished ball terminal, on ceramic '
      + 'insulators: the rear coil to the LEFT, shorter and a tone darker.',
    triple: 'THREE lightning coils standing upright: a tall one in the middle and '
      + 'a shorter one either side of it, set back and a tone darker — each wound '
      + 'with copper wire under its own ball terminal.'
  },
  frost: {
    name: 'Frost emitter',
    twin: 'TWO clusters of pale blue ice crystals growing side by side from a '
      + 'rimed iron socket, the rear cluster to the LEFT, smaller and a tone '
      + 'darker.',
    triple: 'THREE clusters of pale blue ice crystals from one rimed iron '
      + 'socket: the tallest in the middle, a smaller one either side of it set '
      + 'back and a tone darker.'
  }
}

const tierFixtureSheets: WalkSpec[] = TIER_ART_WEAPONS.flatMap((type) =>
  [2, 3].map((tier): WalkSpec => {
    const t = TIER_FIXTURES[type]
    const id = tierFixtureId(type, tier)
    return {
      ...fixtureSheet({
        id,
        name: `${t.name} — tier ${tier} ${tier === 2 ? 'twin' : 'battery'}`,
        blurb: `${tier === 2 ? t.twin : t.triple} NOTHING else — no carriage, `
          + 'no block, no crew, no smoke, no ammunition.'
      }),
      fixtureType: type,
      fixtureTier: tier
    }
  }))

export const WALKS: WalkSpec[] = [
  ...monsterWalks, ...allyWalks, ...siegeWalks, ...siegeArms, ...shipHulls,
  ...fixtureSheets, ...tierFixtureSheets
]

/**
 * What a merged weapon's prompt adds to a plain fixture's.
 *
 * Three things the reference cannot say. That it is the SAME weapon doubled,
 * with the plain painting as its design — a model shown two barrels will
 * otherwise design a new gun with two barrels. Which colour the tier is, taken
 * from the ladder the plate and the rim use, so "the green one" is green
 * everywhere it appears. And that the extra barrels have to survive forty
 * pixels, which is what the whole tier art exists to say.
 */
const tierLines = (w: WalkSpec): string[] => {
  if (!w.fixtureType || !w.fixtureTier) return []
  const tier = w.fixtureTier
  const ts = tierStyle(tier)
  const n = tier === 2 ? 'TWO' : 'THREE'
  return [
    '',
    `THIS IS A MERGED WEAPON — tier ${tier}: the SAME weapon as the plain`,
    `\`images/fixtures/${w.fixtureType}.webp\`, welded into ${n}. Attach that`,
    'painting as well as the reference: it is the design. Same materials, same',
    `ink, same proportions, same wear — ${tier === 2 ? 'doubled' : 'tripled'}, not redesigned. The`,
    'reference shows exactly where each copy sits and which one is in front.',
    '',
    `THE TIER COLOUR IS ${tier === 2 ? 'GREEN' : 'BLUE'}, around ${ts.hex}. Put it in`,
    tier === 2
      ? 'the TRIM: green enamel bands and fittings on the steel — steel with green'
      : 'the TRIM: blue enamel bands and fittings on the steel, and a FAINT cool',
    tier === 2
      ? 'accents. The body stays iron, timber or crystal, so it is still THIS'
      : 'glow kept INSIDE the metal’s own outline. The body stays iron, timber or',
    tier === 2
      ? 'weapon. This one accent may be brighter than the rest of the palette —'
      : 'crystal, so it is still THIS weapon. This one accent may be brighter than',
    tier === 2
      ? 'it is how a player tells a tier 2 from a plain gun at a glance.'
      : 'the palette — it is how a player tells a tier 3 from a tier 2 at a glance.',
    '',
    `IT HAS TO READ AS ${n} AT 40 PX. Keep a clear gap or step between the`,
    'copies, a strong ink line round each one, and every muzzle, limb or',
    'terminal separately visible. Two barrels painted into one fat barrel is',
    'the one way this fails that looks fine at full size.'
  ]
}

/**
 * A ready-to-paste prompt for one walk cycle.
 *
 * Almost all of this is about ONE failure: an image model handed eight panels
 * of the same character will happily return eight different characters. So the
 * consistency clause is stated before the style, in the same position and for
 * the same reason `BACKGROUND_RULE` is — it is the thing that makes the result
 * usable or useless, and models weight what they read first.
 */
export const promptForWalk = (w: WalkSpec): string => {
  const machine = w.kind === 'siege' || w.kind === 'siegeArm' || w.kind === 'ship'
    || w.kind === 'fixture'

  // A one-frame sheet is a different job with a different set of ways to go
  // wrong, so it gets its own prompt rather than a cycle prompt with the plural
  // filed off. Nothing here is about consistency between panels, because there
  // are none — it is all about size and placement in the frame.
  if (w.frames === 1) {
    return [
      `# ${w.id} — ${w.name}  (${w.file}.png → ${w.target})`,
      '',
      `Repaint ONE ${w.kind === 'ship' ? 'ship' : machine ? 'machine' : 'character'},`
      + ` in a single ${w.w === w.h ? 'square' : 'landscape'} image.`,
      'The attached reference is exactly what to paint, at exactly the size and',
      'position it is drawn at. Match both.',
      '',
      `WHAT IT IS: ${w.name} — ${w.tagline}`,
      ...tierLines(w),
      // A hull carries its own livery colour — the blue skiff, the red
      // longship, the yellow galley — and that colour is how a player tells
      // three brown boats apart at harbour scale.
      ...(w.kind === 'ship' ? ['', paletteLine(w.id)] : []),
      // A ship IS its palette; a fixture must stand out FROM one.
      //
      // Handing a fixture `paletteLine` was a real mistake: that palette
      // belongs to the block underneath, so it read as "paint the bow in the
      // colour of the crate it sits on" — and the returned bow was pale timber
      // on pale timber, all but invisible from two feet away. The drawn one
      // never had the problem because it is iron and dark oiled wood over the
      // same crate.
      // A merged tier sits on its WEAPON's block, so it reads its colours
      // from there — `cannon-t2` has no palette of its own.
      ...(w.kind === 'fixture' && paletteLine(w.fixtureType ?? w.id)
        ? ['',
          'IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is painted',
          `around ${paletteFor(w.fixtureType ?? w.id).mid} and its neighbouring tones, so do NOT`,
          'paint this part in those colours: pick materials that separate from',
          'them — cold iron and steel, dark oiled',
          'timber, blackened rope, a cool shadow side — and keep the ink line',
          'strong enough to hold the shape on its own. A part in the same hue and',
          'the same value as the block underneath disappears into it, which is',
          'the one way this drawing can fail that looks fine on its own sheet.']
        : []),
      ...(w.kind === 'fixture'
        ? ['',
          'THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on',
          'top of a block that is already there, so the block must not be here:',
          'no crate, no stone face, no wall, no ground, no shadow. Draw only the',
          'part itself, floating on the magenta exactly where the reference has',
          'it — where it sits in the frame is where it bolts on.',
          '',
          'DRAW IT AT REST, level and pointing RIGHT, exactly as the reference',
          'has it. The game turns it to its own firing angle out of this one',
          'picture, so do not draw it already aimed, angled, tilted or',
          'mid-swing, and add no motion blur, sparks, smoke or muzzle flash: a',
          'tilt painted in here is a tilt the game adds its own on top of.',
          '',
          'KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the',
          'background is measured as part of the object when the return is fitted',
          'back onto the reference — a wide aura therefore comes back as a tiny',
          'crystal inside a huge smear. It also cannot be keyed: soft light over',
          'magenta turns pink rather than transparent. Any glow belongs inside',
          'the shape’s own outline, or within a hair of it.']
        : []),
      ...(w.kind === 'ship'
        ? ['',
          'DRAW ONLY WHAT THE REFERENCE SHOWS. A ship here is a BASE for a weapon,',
          'the same way a block is: the deck weapon — the swivel bolt-thrower, the',
          'harpoon, the bombards — aims at whatever the ship is shooting at, so it',
          'is drawn live on top of this and must NOT be painted in. Everything the',
          'reference does show stays, sail and oars and shields included.',
          '',
          'THE WATERLINE IS THE BOTTOM EDGE OF THE IMAGE. The hull runs straight',
          'off the bottom of the frame and is cut flat by it, exactly as the',
          'reference is — the game draws the water, the wake and the reflection',
          'below that edge, and the boat sits down into them. So paint no water,',
          'no foam, no ripples, no shadow, no reflection and no waterline of your',
          'own, and leave no margin under the hull: the last row of pixels in the',
          'image is planking, not background.']
        : machine
          ? ['',
            'DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,',
            'the counterweight, the sling — is painted separately and animated on top of',
            'this in the game. If you add one here the machine ends up with two.',
            'Anything the reference DOES show, including ammunition stacked on the bed,',
            'stays.']
          : []),
      '',
      STYLE,
      '',
      'SIZE AND PLACEMENT — this is the part that goes wrong.',
      'Do not enlarge it to fill the frame. The reference leaves air around the',
      `${w.kind === 'ship' ? 'hull' : machine ? 'machine' : 'character'} on every`
      + ' side and that air is not waste — it',
      'is where the parts that animate get drawn. Keep the subject the same',
      'fraction of the frame that the reference has it, and standing on the same',
      w.kind === 'ship'
        ? 'line: the waterline the hull is cut off at must land at the same height'
        : 'line: the wheels and feet must sit at the same height from the bottom edge.',
      ...(w.kind === 'ship' ? ['from the bottom edge as the reference has it.'] : []),
      `· It faces ${w.faces === 'front' ? 'the viewer' : w.faces.toUpperCase()} in the`
      + ' reference. Keep that direction.',
      '· Do not rotate it or change the viewing angle.',
      '· No cast shadow on the ground. The game draws its own.',
      '',
      BACKGROUND_RULE,
      '',
      `OUTPUT: one image, exactly ${w.w} x ${w.h} pixels`
      + `${w.w === w.h ? ' (square, 1:1)' : ' — landscape, and NOT square'}.`,
      ...(w.w === w.h
        ? []
        : ['If your tool has an aspect-ratio control, set it to match: a square',
          'return squashes the hull and puts the waterline in the wrong place.']),
      'No labels, captions or watermarks.'
    ].join('\n')
  }
  // ── A moving PART, not a machine and not a character ──
  //
  // This needed its own prompt after the first attempt came back as a complete
  // ballista, carriage and wheels and all. The cause was on this side: an arm
  // fell through to the creature branch and was asked for "the SAME creature at
  // a different moment of one step", with the one line that mattered — draw the
  // arm ALONE — buried in the subject description underneath it.
  //
  // So the exclusion is the first thing said, and it is said as a rule about the
  // reference rather than as a list of parts to leave out: a list invites
  // argument about what counts, and the reference does not.
  //
  // It came back a whole ballista a SECOND time, and worse: one square painting
  // of a complete machine in three-quarter view, no grid at all. Three things
  // in here were feeding it, and all three are now fixed rather than argued
  // with. The blurb called it the bow of a "wheeled bolt thrower", which is a
  // noun to draw. The shared style block promised the object fills its square,
  // which this prompt then spent a paragraph retracting. And the only
  // statement of the deliverable's SHAPE was the word "sheet" up top and a
  // pixel size at the very bottom — so the sheet is now the headline, the
  // panel count is a number that cannot be read as a suggestion, and the
  // aspect ratio is repeated at the end where the walk prompt already learned
  // to repeat it.
  if (w.kind === 'siegeArm') {
    return [
      `# ${w.id} — ${w.name}  (${w.file}.png → ${w.target})`,
      '',
      'WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A MACHINE.',
      `One landscape image, ${w.w} x ${w.h} pixels — twice as wide as it is tall —`,
      `holding ${w.frames} SEPARATE small drawings laid out ${w.cols} across and ${w.rows}`,
      'down, on the same grid as the attached reference, read left to right along',
      'the top row and then the bottom row. Each drawing is the same part at a',
      'different moment of one shot.',
      `· ${w.frames} panels. Not 1, not ${w.frames - 2}, not ${w.frames * 2}.`
      + ` Exactly ${w.rows} rows of ${w.cols} — do not add a row.`,
      '· ONE big drawing of a siege engine filling the canvas is the wrong answer',
      '  however well it is painted, and so is a square canvas. That is what came',
      '  back last time, and none of it could be used.',
      '',
      'THIS IS A PART, NOT A MACHINE — read this before anything else.',
      'It is one moving assembly, lifted off the war engine it belongs to. In the',
      'game it is painted ON TOP of a separate carriage that already exists, so',
      'the carriage must not be here as well.',
      '· Draw ONLY what the reference shows in each panel, and nothing else.',
      '· NO wheels. NO cart, bed or stock. NO chassis, frame, A-frame, base or',
      '  stand. NO ground, no shadow, no scenery, no crew. If it is not in the',
      '  reference panel, it is not in the picture.',
      '· Do not complete it into a whole siege engine. Every panel is meant to',
      '  look unfinished, like a part laid out on a bench — the missing half is',
      '  painted separately, and anything you add here ends up doubled.',
      '· The reference settles every argument about what belongs. If you are',
      '  reaching for a part because the machine would "need" it to work, that',
      '  part is already on the other layer.',
      '',
      `WHAT IT IS: ${w.tagline}`,
      ...(w.panels ? ['', `READ THE PANELS: ${w.panels}`] : []),
      // The three arms came back in pale straw and driftwood over a dark-brown
      // reference, which matters more here than on any other sheet: this part
      // is composited ON TOP of a chassis painted from the same palette, and a
      // beam two shades lighter than the frame it swings in reads as somebody
      // else's machine. `paletteLine` already exists for exactly this and was
      // simply never wired to the arms.
      ...(paletteLine(w.id)
        ? ['', paletteLine(w.id),
          `It is the same machine as the ${w.id} carriage sheet, which is painted`,
          'from this palette too and is what this part gets laid on top of. Side',
          'by side the two have to look like one object: the same timber, the same',
          'iron, the same age of wear. Pale straw, driftwood or bleached wood is',
          'the wrong tree.']
        : []),
      '',
      'THE VIEW — a flat side elevation, square on from the side, the way a',
      'woodcut or a joiner’s drawing shows a machine.',
      '· NO three-quarter view, no perspective, no vanishing point, no',
      '  foreshortening, no tilt. Nothing turns to face the viewer, and no part',
      '  is nearer the eye than another.',
      '· Every timber keeps the angle the reference draws it at.',
      '',
      'ONE MECHANISM.',
      `All ${w.frames} panels are the same assembly at a different moment of one`,
      'shot. Identical timbers, identical ironwork, identical rope, identical',
      'proportions and identical thickness in every panel. Only the POSE changes —',
      'the beam swings, the string draws, the weight falls — and it changes exactly',
      'as the reference shows it, panel for panel.',
      '· ONE colour scheme, taken from the reference, in all of them.',
      '· Do not re-scale it between panels, and do not re-scale it from the',
      '  reference: it has to keep meeting a carriage it cannot see.',
      `· It faces ${w.faces === 'front' ? 'the viewer' : w.faces.toUpperCase()} in the`
      + ' reference. Keep that direction throughout.',
      '',
      STYLE_PART,
      '',
      'LAYOUT — the grid is a cutting guide, and it is cut blindly.',
      `Each panel is exactly 1/${w.cols} of the width and 1/${w.rows} of the height.`,
      'The mechanism is SMALL inside its panel and does not fill it. It floats',
      'clear of all four panel edges with wide empty magenta around it, exactly as',
      'the reference has it.',
      ...(w.span
        ? ['',
          'SIZE — measure it against the PANEL, not against the paper. In the',
          `reference ${w.span}`,
          'If yours reaches three quarters of the way across its panel it is about',
          'twice the size it should be, and it will not meet the carriage under it.',
          'Bigger is not clearer here: the empty space is where the machine goes.']
        : []),
      '',
      'WHERE it sits in its panel is not a composition choice — it is the point',
      'the part bolts on to. The exact centre of a panel is the machine’s origin,',
      'the spot a carriage you cannot see holds this part at, so keep every piece',
      'the same distance and direction from that centre as the reference has it,',
      'panel by panel — including the panels where the part sits well off to one',
      'side or high up. Do not re-centre it on its own outline, do not tidy the',
      'arrangement, do not even out the spacing.',
      'Never let it cross into a neighbouring panel.',
      'Do not add, drop, merge or reorder panels.',
      'Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,',
      'in any colour, magenta included.',
      '',
      BACKGROUND_RULE,
      '· The muted, dusty, low-contrast palette above is for the OBJECT. The',
      '  ground is not part of the painting and is not toned down with it: it',
      '  stays a vivid, eye-hurting #FF00FF however soft everything else is.',
      '  Dusty rose, pale pink and mauve are the failure this whole clause is',
      '  about — they cannot be keyed, only flood-filled, and a flood fill eats',
      '  pale paint.',
      '',
      'BEFORE YOU CALL IT FINISHED, count and check:',
      `· ${w.cols} panels across, ${w.rows} down, ${w.frames} in all.`,
      '· The canvas is landscape, twice as wide as it is tall.',
      '· There is not one wheel, cart or frame anywhere in it.',
      '· Nothing in any panel is anywhere near filling it — check the widest',
      '  panel against the SIZE note above, in fractions of the panel.',
      '· Every panel holds the same assembly, at the same size, in the same',
      `  colours, facing ${w.faces === 'front' ? 'the viewer' : w.faces.toUpperCase()}.`,
      '· Every pixel that is not the part itself is flat, vivid #FF00FF — hold it',
      '  against a pure magenta swatch, not against your memory of one.',
      '',
      `OUTPUT: one image, ${w.w} x ${w.h} pixels (2:1, landscape). If your tool`,
      'has an aspect-ratio control, set it to 2:1 — a square return crushes the',
      'grid and cannot be cut. No labels, captions, numbers or watermarks.'
    ].join('\n')
  }

  // The cast is monsters, with one rider in it. Rather than a third branch
  // for a single sheet, the nouns bend: a knight is not a creature, does not
  // have horns to count, and gallops rather than walks — and a prompt that
  // calls him a creature invites exactly the redesign the rest of it forbids.
  const ally = w.kind === 'ally'
  const IT = machine ? 'machine' : ally ? 'rider' : 'creature'
  const ITS = machine ? 'machines' : ally ? 'riders' : 'creatures'
  const CYCLE = machine ? 'ROLL CYCLE' : ally ? 'GALLOP CYCLE' : 'WALK CYCLE'
  const MOMENT = machine
    ? 'the same machine with its wheels at a different angle of one full revolution'
    : ally
      ? 'the SAME horse and rider at a different moment of ONE gallop stride'
      : 'the SAME creature at a different moment of one step'

  return [
    `# ${w.id} — ${w.name}  (${w.file}.png → ${w.target})`,
    '',
    `Repaint a ${CYCLE}. The attached sheet is ${w.cols} columns x ${w.rows} rows`,
    `= EXACTLY ${w.frames} panels, read left to right along the top row and then the`,
    `bottom row. Every panel is ${MOMENT}.`,
    '',
    `· ${w.frames} panels. Not ${w.frames + 4}, not ${w.frames * 3}.`
    + ` Exactly ${w.rows} rows of ${w.cols} — do not add a row.`,
    '',
    `ONE ${machine ? 'MACHINE' : 'CHARACTER'} — read this before anything else.`,
    `All ${w.frames} panels must show the same ${machine ? 'machine' : 'individual'}:`,
    machine
      ? 'identical timbers, identical ironwork, identical proportions, identical'
      : 'identical colours, identical clothing and gear, identical proportions,',
    machine
      ? 'silhouette, identical wheel size. Only the WHEEL ANGLE changes, exactly as'
      : ally
        ? 'identical silhouette, identical livery, identical barding, harness and'
        : 'identical silhouette, identical markings, identical number of limbs and',
    machine
      ? 'the reference shows — the spokes turn and nothing else moves at all.'
      : ally
        ? 'heraldry. Only the POSE changes, and it changes exactly as the reference'
        : 'horns. Only the POSE changes, and it changes exactly as the reference',
    ...(machine ? [] : ['shows — same limb positions, same body lean, same head angle.']),
    `· ONE colour scheme, taken from the reference, in every panel. ${machine
      ? 'A machine built of pale timber in one panel and dark in another is not one'
      : ally
        ? 'A rider whose livery is blue in one panel and green in another is not one'
        : 'A creature that is blue-grey in one panel and tan in another is not one'}`,
    `  ${IT} animated, it is several ${ITS} side by side, and the result is unusable.`,
    '· Do not redesign it. Do not add or remove parts between panels.',
    '· Do not turn it to face a different direction in any panel.',
    `· Do not re-scale it: the ${IT} must be the same size in every panel, and the`,
    '  same size it is in the reference. Do not move it around inside its panel.',
    `· It faces ${w.faces === 'front' ? 'the viewer' : w.faces.toUpperCase()} in the`
    + ` reference. Keep that direction in all ${w.frames} panels.`,
    '',
    `WHAT IT IS: ${w.name} — ${w.tagline}`,
    ...(w.panels ? ['', `READ THE PANELS: ${w.panels}`] : []),
    ...(paletteLine(w.kind === 'ally' ? w.id : '')
      ? ['', paletteLine(w.id)]
      : []),
    ...(machine
      ? ['',
        'DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,',
        'the counterweight, the sling — is painted separately and animated on top of',
        'this in the game. If you add one here the machine ends up with two. Anything',
        'the reference DOES show, including the ammunition stacked on the bed, stays.']
      : []),
    '',
    STYLE,
    '',
    'LAYOUT — the grid is a cutting guide, and it is cut blindly.',
    `Each panel is exactly 1/${w.cols} of the width and 1/${w.rows} of the height.`,
    'ONE correction to the style note above: "fills the square edge to edge" is for',
    `building blocks and is WRONG here. A ${IT} does NOT fill its panel — it is`,
    'centred in it, at the size the reference draws it, with clear magenta all round.',
    'Never let a limb, tail, weapon or shadow cross into a neighbouring panel.',
    'Do not add, drop, merge or reorder panels.',
    'Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or',
    'numbers — in ANY colour, magenta included. The magenta is the empty space the',
    `${ITS} sit in, not a grid to draw with: the space BETWEEN two panels is the`,
    `same flat background as the space around each ${IT}, and nothing marks the`,
    'join. The panels are found by measuring, so a drawn line is not a help, it is',
    'a mark that ends up welded into the sprite.',
    '',
    BACKGROUND_RULE,
    '',
    machine
      ? 'The wheels touch the same line in every panel — the same height from the\n'
        + 'bottom of the panel as in the reference. If the machine drifts up or down\n'
        + 'between panels it will hop as it rolls.'
      : w.anchor === 'centre'
        ? 'This one SWIMS. It has no feet and is centred on the middle of its body, so\n'
          + 'keep it centred vertically in the panel exactly as the reference has it.'
        : 'The feet land on the same line in every panel — the same height from the\n'
          + 'bottom of the panel as in the reference. If the feet drift up or down\n'
          + `between panels the ${IT} bobs when it ${ally ? 'gallops' : 'walks'}.`,
    '',
    `OUTPUT: one image, ${w.w} x ${w.h} pixels`
    + `${w.w * 9 === w.h * 16 ? ' (16:9)' : w.w === w.h * 2 ? ' (2:1)' : ''}. If your`,
    'tool has an aspect-ratio control, set it to match. No labels or watermarks.'
  ].join('\n')
}

/** A ready-to-paste prompt for one scenery asset. */
export const promptForScenery = (a: SceneryAsset): string => [
  `# ${a.id}  (${a.file}.png → ${a.target})`,
  '',
  a.lead ?? `Paint one background element for a cozy medieval-fantasy tower-defence game.`,
  '',
  // A placed asset takes the style block that never says "fill the frame":
  // a model that reads it enlarges the drawing until the placement is gone,
  // which is the lesson `STYLE_PART` records.
  a.placement ? STYLE_PART : STYLE,
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
    : a.bleed
      ? 'FILL THE FRAME — the rule this asset lives or dies on.\n'
        + 'The artwork must reach ALL FOUR EDGES of the image: left, right, top and\n'
        + 'bottom. No margin, no padding, no breathing room, not even a few pixels.\n'
        + 'Nothing is cropped or re-centred on the way back in, so a subject painted\n'
        + 'small inside its frame is shipped small with the empty border baked in,\n'
        + 'and it appears in the game as a shrunken version of itself surrounded by\n'
        + 'dead space. Let the artwork run off every edge rather than leave a border.'
      : a.placement ?? 'One object, centred in the frame.',
  '',
  `OUTPUT: exactly ${a.w} x ${a.h} pixels. If your tool has an aspect-ratio`,
  `control, set it to match. No labels, captions or watermarks.`
].join('\n')

// ─── The prompt documents ───────────────────────────────────────────────────
//
// The four `PROMPTS-*.md` files are rendered HERE, not in the bench, so two
// routes produce the same bytes: the `/art-sheets` bench writes them on export,
// and `pnpm art:prompts` writes them from plain Node with no browser. The Art
// Desk (`tools/art-desk/`) sends what it parses back out of these files, so if
// the routes could disagree, its queue would paint from text nobody wrote.
//
// Every prompt is FENCED: a markdown preview puts a copy button on a fence, so
// one click takes the whole prompt instead of a drag-select through 80 lines.
// The heading stays OUTSIDE the fence — it is the operator's line, not the
// model's — and its last parenthesis, `(<reference>.png[ → <target>])`, is the
// contract the desk ties a block to its image by.

/** A fence longer than any backtick run in the body, so it can never close early. */
const fenceFor = (body: string): string => {
  let longest = 0
  for (const run of body.match(/`+/g) ?? []) longest = Math.max(longest, run.length)
  return '`'.repeat(Math.max(3, longest + 1))
}

/** A builder's `# Title\n\n<prompt>` → a `## Title` heading over a fenced `text` block. */
export const promptBlock = (text: string): string => {
  const cut = text.indexOf('\n')
  const heading = (cut < 0 ? text : text.slice(0, cut)).replace(/^#+\s*/, '')
  const body = (cut < 0 ? '' : text.slice(cut + 1)).replace(/^\n+/, '')
  const fence = fenceFor(body)
  return [`## ${heading}`, '', `${fence}text`, body, fence].join('\n')
}

const promptDoc = (title: string, intro: string[], prompts: string[]): string => [
  `# ${title}`,
  '',
  'Generated from `src/game/artSheet.ts` — do not hand-edit. Run `pnpm art:prompts`',
  '(or export from the `/art-sheets` bench) after changing the manifest.',
  '',
  ...intro,
  '',
  'Copy only the fenced block. The `##` heading is for you, not the model: it',
  'names the image the block belongs to (the reference to attach, and the name',
  'to save the return under) and, after the arrow, where the slice lands under',
  '`public/`. `pnpm art:desk` finds any block by sprite name, copies reference',
  'and prompt in one go, and files, slices and compresses the return.',
  '',
  prompts.map(promptBlock).join('\n\n---\n\n'),
  ''
].join('\n')

/** Every prompt document, by file name under `art-sheets/`. */
export const promptDocs = (): Record<string, string> => ({
  'PROMPTS-CELLS.md': promptDoc('Per-cell prompts — one object per generation', [
    'Attach `art-sheets/cell-<id>.png` and paste the matching block below.',
    'There is no grid to preserve here, which is the whole point: three sheet',
    'and strip passes each lost the lattice a different way, and not one of',
    'them lost the art.'
  ], SINGLES.map((s) => promptForCell(s))),

  'PROMPTS-STRIPS.md': promptDoc('Per-strip prompts', [
    'One strip per generation. Attach `art-sheets/strip-<id>.png` and paste the',
    'matching block below. Every cell is named, because the first whole-sheet',
    'pass inferred subjects from pixels and turned the gold mine into a bow.'
  ], ALL_STRIPS.map((s) => promptFor(s))),

  // The landscape has no reference render: a mountain range is a repeating
  // band, not a lattice cell, so these go out as prompts alone.
  'PROMPTS-SCENERY.md': promptDoc('Scenery prompts — the landscape', [
    'These are NOT on the 128 lattice and have no reference image. Attach one',
    'of your finished BLOCK bitmaps as a style reference alongside the prompt,',
    'so the landscape is painted by the same hand as the tower standing on it.',
    '',
    'Drop results in `art-sheets/painted/`, named after the file in each',
    'heading (e.g. `bg-mountains-far.png`), then run `pnpm slice-sheets`.'
  ], SCENERY.map((a) => promptForScenery(a))),

  // One sheet per monster design: the walk cycle the battlefield actually
  // plays, which a single still cannot replace without freezing the unit.
  'PROMPTS-WALKS.md': promptDoc('Walk-cycle prompts — one monster design per generation', [
    'Attach the reference named in each heading — `walk-<id>.png` for a cycle,',
    '`siege-<id>.png` and `arm-<id>.png` for an engine, `hull-<id>.png` for a',
    'ship, `fixture-<id>.png` for a weapon — and paste the block beside it. A',
    'merged tier (`fixture-cannon-t2.png`) also wants the plain painting',
    '(`public/images/fixtures/cannon.webp`) attached: it is the design.',
    'Most of these are a grid of panels showing ONE subject through ONE cycle,',
    'and the whole job is that it comes back as one subject and not eight.',
    '',
    'Drop results in `art-sheets/painted/`, keeping the `walk-<id>` in the name,',
    'then run `pnpm slice-sheets`. The slicer cuts the grid by proportion, so an',
    'off-size return is fine as long as the panels are where the grid says.'
  ], WALKS.map((w) => promptForWalk(w)))
})
