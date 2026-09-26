import { BLOCK_DEFS, blockDef, canMergeType, isShip } from '@/game/blocks'
import { PALETTES, blockArtBase } from '@/game/art'
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
 * Sandbox Tower draws everything procedurally, which is wonderful for payload and
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
  // Tower Siege asked for these muted and paper-toned, because its painted
  // look was a dusty storybook. Sandbox Tower is a sunny backyard of toy
  // plastic, and its palettes were tuned bright on purpose: one saturated toy
  // colour per gun is how a player finds the squirt gun in a tower full of
  // sand. So the colours go over as they are — what must not happen is the
  // model greying them into the sand around them.
  return `Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty):`
    + ` body around ${p.mid}, shadows ${p.dark}, highlights ${p.light},`
    + ` accent details ${p.accent}.`
}

/** Drop a leading article, so "NO ${fixture}" does not read "NO a bow". */
const bare = (s: string): string => s.replace(/^(a|an|the) /i, '')

interface BlockArt {
  /** The player-facing name (`blocks.names.*` in the English locale). */
  name: string
  /** The block BODY — what its bitmap is — without anything drawn live on it. */
  body: string
  /** The live-drawn part, if any. Named so a prompt can forbid it. */
  fixture?: string
  /** What the build-tray pictogram shows (`blockGlyph.ts`). */
  glyph: string
  /**
   * A TOY block: a sand plinth wearing a band of the toy's own plastic. Its
   * palette describes the plastic, not the block, so the colour line has to
   * say so — "body around #ff8a2b" painted a whole orange cube.
   */
  toy?: boolean
  /** A colour line of its own, where the palette does not describe the body. */
  colours?: string
}

/** The shared sand plinth every toy block stands on (`sandBlockArt.ts`). */
const plinth = (band: string): string =>
  'a square sand plinth: pale packed sand with a lighter packed cap band across the top,'
  + ' one faint horizontal mould ridge and fine grain speckle, and a strip of glossy'
  + ` ${band} toy plastic running across its lower third, with a white gloss streak`
  + ' and two round studs'

const BLOCK_ART: Record<string, BlockArt> = {
  gate: {
    name: 'Castle Gate',
    body: 'a sandcastle gatehouse block of bright dry sand — two shallow square notches cut down into its top edge leave three little merlons that stop exactly AT the top edge; a raised packed-sand arch with pressed joints frames a dark doorway glowing with warm golden light, a popsicle-stick door standing ajar against the right jamb, and a coral-pink scallop shell set over the arch — the thing the whole game protects',
    glyph: 'a gatehouse with three merlons and a round arched doorway'
  },
  wood: {
    name: 'Sand Block',
    body: 'a bucket-moulded cube of dry pale sand: a lighter packed band along the top, three wavy horizontal mould ridges, dark and light grain speckle, and one tiny white shell crumb',
    glyph: 'a bucket-moulded sand block in three bands'
  },
  brace: {
    name: 'Packed Sand',
    body: 'a cube of darker, wetter packed sand with a few damp blotches, and a big X pressed deep into its face from corner to corner — crumbs along the lips of the groove, a couple of wet glints at the upper left, and no frame around the X',
    glyph: 'a solid square with a thick X cut through it'
  },
  stone: {
    name: 'Pebble Wall',
    body: 'a cube of damp sand grout faced edge to edge with smooth grey-blue pebbles — about ten big ovals and five small ones in slightly different blue-greys, each with a white glint at its upper left — visibly heavier than sand',
    glyph: 'a cluster of seven oval pebbles'
  },
  spikes: {
    name: 'Toothpick Wall',
    body: 'a cube of golden sand with one mould ridge and grain speckle, and six short pale wooden toothpick stubs pushed into its face in two rows of three, angled upward',
    fixture: 'long wooden toothpicks bristling out of all four sides',
    glyph: 'a small square with toothpicks splayed out on all four sides, like a hedgehog'
  },
  archer: {
    name: 'Dart Blaster', toy: true, body: plinth('ORANGE'),
    fixture: 'an orange-and-blue toy foam-dart blaster',
    glyph: 'a foam dart flying up and to the right'
  },
  cannon: {
    name: 'Squirt Gun', toy: true, body: plinth('GREEN'),
    fixture: 'a chunky green toy water pistol with a water tank on top',
    glyph: 'a squirt gun with a dome tank and a water drop'
  },
  mortar: {
    name: 'Mud Mortar', toy: true, body: plinth('PURPLE'),
    fixture: 'a blue toy bucket tube lobbing a mud ball',
    glyph: 'a tilted bucket tube with a mud ball flying out'
  },
  bombard: {
    name: 'Balloon Launcher', toy: true,
    body: 'a square sand plinth with a sunken firing pit in the middle of its face — a dark oval crater ringed in glossy TEAL plastic with a white glint — and three little sand mounds along the bottom edge. No plastic band on this one',
    fixture: 'a cardboard launch tube with a water balloon',
    glyph: 'a knotted water balloon with a wiggly string',
    colours: 'Colours: the plinth pale sand (around #f3dca8, shadows #ab7c42); the pit ring teal plastic around #1fb5a8 (shade #138a80); the crater dark brown #6e4a24.'
  },
  tesla: {
    name: 'Bug Zapper', toy: true, body: plinth('INDIGO'),
    fixture: 'a glowing blue-violet bug-zapper lantern',
    glyph: 'a bug-zapper lantern with a hanging ring and a lightning bolt'
  },
  frost: {
    name: 'Ice Pop', toy: true,
    body: `${plinth('SKY-BLUE')}, with icy white rime dripping in a wavy line over its top edge`,
    fixture: 'a giant blue ice pop on a wooden stick',
    glyph: 'an ice pop with a bite out of the top'
  },
  repair: {
    name: 'Bucket & Spade', toy: true, body: plinth('BLUE'),
    fixture: 'a green toy bucket with a spade',
    glyph: 'a bucket with an arched handle and a spade beside it'
  },
  banner: {
    name: 'Paper Flag', toy: true,
    body: 'a square sand plinth with a paper party frill across its lower third — light rose paper cut with pinking-shear teeth, a deep plum-rose stripe along it dotted with six gold dots',
    fixture: 'a paper swallowtail flag on a toothpick',
    glyph: 'a swallowtail flag on a toothpick planted in a sand mound',
    colours: 'Colours: the plinth pale sand (around #f3dca8, shadows #ab7c42); the paper frill light rose #e685c6 with a deep plum-rose #b8479a stripe and gold #ffd35c dots.'
  },
  obelisk: {
    name: 'Magic Seashell', toy: true,
    body: 'a square pearly plinth — pale lilac mother-of-pearl rather than sand — with two soft sheen bands, one lilac and one pale cyan, and a scatter of little white four-point glitter stars',
    fixture: 'a glowing pink scallop shell',
    glyph: 'a ribbed scallop shell on a small base, with a sparkle',
    colours: 'Colours: pearly lilac — body around #e8cde4, shadows #ae88b6, highlights #fbeefa; sheen bands #b99ae6 and #9be8ff; glitter #e6fbff.'
  },
  lumberHut: {
    name: 'Sand Sifter', toy: true, body: plinth('LIME-GREEN'),
    fixture: 'a toy sand wheel under a funnel of sand',
    glyph: 'a sieve with falling grains over a sand heap'
  },
  stonepit: {
    name: 'Pebble Digger', toy: true, body: plinth('SUNSHINE-YELLOW'),
    fixture: 'a yellow toy digger scooping pebbles',
    glyph: 'a toy digger with tracks, a cab and a scoop holding a pebble'
  },
  coffer: {
    name: 'Piggy Bank', toy: true, body: plinth('BUBBLE-GUM PINK'),
    fixture: 'a pink piggy bank',
    glyph: 'a piggy bank with a coin above its slot'
  },
  skiff: {
    name: 'Paper Boat',
    body: 'a folded notebook-paper boat, blue ruled lines and a red margin line on the paper',
    fixture: 'a toothpick spear stuck in a pink eraser',
    glyph: 'a paper boat with a toothpick spear angled up and to the right'
  },
  longship: {
    name: 'Rubber Duck',
    body: 'a fat yellow rubber bath duck with an orange beak and a blue saddle strap, facing left',
    fixture: 'a toy dart launcher on its back',
    glyph: 'a duck with a harpoon angled up and to the right'
  },
  galley: {
    name: 'Toy Pirate Ship',
    body: 'a brown moulded-plastic toy pirate ship with gold trim, portholes and a red-striped sail',
    fixture: 'two cork cannons',
    glyph: 'a hull with a stern castle, a mast and a sail'
  }
}

/**
 * The colour line for a block cell.
 *
 * A material block's palette IS the block. A toy block's palette is its
 * plastic band and the toy moulded from the same plastic, so the line says
 * which part it is for; a handful of bodies have colours no palette carries.
 */
const blockColours = (id: string, palette: string): string => {
  const art = BLOCK_ART[id]
  if (art?.colours) return art.colours
  const p = PALETTES[palette]
  if (!art?.toy || !p) return paletteLine(palette)
  return 'Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb);'
    + ` the plastic BAND only is the toy colour — around ${p.mid}, its lower half ${p.dark},`
    + ` studs and gloss ${p.light}. Keep that band bright and saturated.`
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
  '· Nothing may stick out past the square: no sandcastle turrets, battlements or',
  '  crenellations, no bucket-shaped tops, no wheels, no peaked roof, no rounded',
  '  shoulders, no legs, no protruding parts. It is ONE cube cut from a sandcastle',
  '  wall, not a little sandcastle. Anything above the top edge leaves the next',
  '  block floating in mid-air.',
  '· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a',
  '  wall. It is a face seen straight on, not an object standing in space.',
  '· No margin, no drop shadow, no ground beneath it, no background around it.'
].join('\n')

/**
 * The ant contraptions — siege engines built from toy junk (`siegeArt.ts`) —
 * as a whole, for the enemy still cells. The chassis and arm sheets further
 * down describe the layers separately.
 *
 * Each carries its own colour line: the siege palettes hold each machine's
 * toy colour (the car paint, the bottle caps), and a line reading "body
 * around #43b649" turned a popsicle-stick crossbow green all over.
 */
const SIEGE_ART: Record<string, { name: string; whole: string; colours: string }> = {
  ram: {
    name: 'Pencil Ram',
    whole: 'a red die-cast toy car driven by ants, with a popsicle-stick gantry over its roof from which a sharpened yellow pencil hangs on two rubber bands as a battering ram, point forward, an ant in an acorn-cap helmet riding it like a jouster',
    colours: 'Colours: car red #e5483b with a yellow #ffc93c racing stripe, pencil yellow with a sharpened cedar tip, popsicle sticks #efcd92, ants glossy black #342b31.'
  },
  ironRam: {
    name: 'Tin-Can Ram',
    whole: 'a soup tin lying on its side on a popsicle-stick sled with bottle-cap wheels, its can-opened lid bent up over the open mouth like a visor, a steel dinner fork sliding out of the mouth as the ram, and foam darts stuck uselessly to the tin — shiny cold TIN, never cardboard or plastic, because it is the only enemy foam darts cannot hurt',
    colours: 'Colours: tin #b7c0cb with bright specular bands, a torn red label #d8402f with a cream disc, fork steel #d3dae2, bottle caps dark grey #4a4f58.'
  },
  ballista: {
    name: 'Rubber-Band Crossbow',
    whole: 'an ant-built crossbow on green bottle-cap wheels: a popsicle-stick carriage and stock, two popsicle-stick arms strung with a fat pink rubber band, a toothpick loaded in the groove, a corrugated-cardboard shield at the front, and an ant turning a brass wind-up key at the back',
    colours: 'Colours: popsicle sticks #efcd92, bottle caps green #43b649, rubber bands pink #ff5f8f, toothpicks #f3d6a6, cardboard #cf9f62, brass key #e2b447.'
  },
  catapult: {
    name: 'Spoon Catapult',
    whole: 'an ant-built catapult on yellow bottle-cap wheels: a stacked popsicle-stick frame, a pink plastic spoon as the throwing arm sprung by a wad of rubber bands, a kitchen sponge at the front as its stop, a cotton reel of thread at the tail, and pebbles on the deck',
    colours: 'Colours: spoon pink #ff6fae, bottle caps and bands yellow #ffc93c, popsicle sticks #efcd92, sponge #ffd23f with a green #3fa84a scourer, pebbles grey #9aa3ad.'
  },
  siegeTower: {
    name: 'Juice-Box Tower',
    whole: 'an orange juice box on red button wheels, with a red bottle cap on top as a fighting top holding two ant archers with toothpick bows, a striped bendy-straw flagpole with a red paper flag, and a cardboard ramp hinged at the top front',
    colours: 'Colours: carton orange #ff8a2b with a white top band and a green #43b649 wave, red #e5483b cap, buttons and flag, cardboard #cf9f62.'
  },
  trebuchet: {
    name: 'Pencil Trebuchet',
    whole: 'an ant-built trebuchet on red bottle-cap wheels: a popsicle-stick A-frame lashed with green rubber bands, a long yellow pencil as the throwing beam on a red pushpin pivot, a big pink eraser hanging from a paperclip as the counterweight, and a string sling with a pale cloth pouch',
    colours: 'Colours: popsicle sticks #efcd92, bottle caps red #e5483b, bands green #43b649, pencil yellow #ffc93c, eraser pink #ff8ea4, pouch #ffe08a.'
  }
}

const ROUND_ART: Record<string, string> = {
  bolt: 'a toy foam dart in flight: a fat orange foam shaft, a blue rubber suction cup on the front, two little blue fins at the tail, pointing right',
  quarrel: 'a party toothpick fired by an ant-built rubber-band crossbow: thin pale wood, sharp at both ends, a red cellophane frill round the tail. It must not be mistakable for the foam dart, pointing right',
  ball: 'a squirt-gun water blob: a turquoise droplet with a white glint, tail streaming back (the ant catapult throws the same-sized round as a grey pebble or a sand clod)',
  shell: 'a lumpy wet mud ball flicking two drips (the balloon launcher fires the same-sized round as a water balloon in pink, blue, green or yellow, knot trailing)',
  bomb: 'a bumblebee’s honey bomb: a golden honey drop with drips hanging off its belly',
  fire: 'a firefly’s glowing ember: a tumbling coal under its own small flame',
  frost: 'an ice-pop shard of blue ice'
}

export interface SheetCell {
  /** Stable identity for this cell. Never reused across sheets. */
  id: string
  /** One sentence saying what this object IS, for the painter. */
  blurb: string
  /** Key into `PALETTES`, so a prompt can hand over the real colours. */
  palette?: string
  /**
   * The colour line itself, where a palette would say the wrong thing: a toy
   * block's palette is its plastic band, and the bugs do not draw from their
   * enemy palettes at all. Wins over `palette` when both are set.
   */
  colours?: string
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


// ─── Which block owns a body bitmap ─────────────────────────────────────────
//
// Every block reads its OWN body today (`BLOCK_ART_BASE` is empty): each toy
// stands on a sand plinth wearing its own colour band, so there is nothing two
// blocks could share without one of them losing its colour.
//
// The ownership bookkeeping stays so that sharing, if it ever comes back, cannot
// silently put two targets on one file: only ONE cell per bitmap may carry a
// delivery target, or two cells writing the same `<id>.webp` would overwrite
// each other in whatever order the slicer happened to run.

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
    const colours = blockColours(id, def.palette)

    cells.push({
      id: `block/${id}/assembled`,
      palette: def.palette,
      colours,
      blurb: art.fixture
        ? `${art.name}: ${art.body}, WITH ${art.fixture} mounted on it.`
        : `${art.name}: ${art.body}.`,
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
    const wearers = [id, ...shared]

    cells.push({
      id: `block/${id}/body`,
      palette: def.palette,
      colours,
      blurb: hull
        ? `Reference only — the ${art.name} hull has its own sheet.`
        : owns
          ? `${art.name} — the block BODY, which is the file that ships: ${art.body}.`
            + (shared.length
              ? ` ONE bitmap worn by ${wearers.length} different blocks (${wearers.join(', ')}),`
                + ' so paint the body and nothing block-specific.'
              : '')
            + (art.fixture
              ? ` The game draws ${art.fixture} live ON TOP of this body, so paint NO`
                + ` ${bare(art.fixture)} here. Keep the face above the ${art.toy ? 'plastic band' : 'bottom edge'} plain:`
                + ' whatever is painted there ends up buried under the toy.'
              : ' Nothing is drawn on top of this one, so it is the whole block.')
          : `Reference only — this block reads from the ${base} body.`,
      col, row: top + 1, cw: 1, ch: 1,
      label: id,
      sub: hull ? 'hull — no slot'
        : owns ? 'body — SLICE THIS'
        : `uses ${base} body`,
      ...(hull || !owns ? {} : { target: `images/blocks/${base}.webp` }),
      note: hull
        ? 'Reference only — a hull is not a square cell of material, so it has its own sheet: paint hull-<id>.png, which is cut to the band the boat is actually visible in. The deck weapon stays drawn live on top of it.'
        : owns
          ? `The ${art.name} body.${shared.length ? ` Also worn by ${shared.join(', ')}.` : ''}${art.toy ? ' The colour band is how a player finds this toy in a tower full of sand — keep it.' : ''}`
          : `Reference only. Reads from the ${base} body, owned by ${BASE_OWNER[base]}.`,
      art: { kind: 'blockBody', typeId: id }
    })

    cells.push({
      id: `block/${id}/icon`,
      palette: def.palette,
      colours,
      blurb: `Build-tray ICON for the ${art.name}: ${art.glyph} — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting.`,
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
// so the sheet stays a uniform grid. What changes down a column is the toy
// (the fixture span grows per tier, overflowing its plinth on purpose) and the
// moulded plastic rank badge.

const MERGE_TYPES = BLOCK_ORDER.filter(canMergeType)

/**
 * What a merge adds to each weapon, as drawn (`toyFixtures.ts`).
 *
 * A merged weapon is the SAME toy made fancier — a stripe and a sticker at
 * tier 2, one extra part at tier 3 — and the renderer grows it and rings it in
 * the tier colour on top. Stated once, because the merged sheet and the
 * tier-fixture prompts both need it and two copies drift. The boats have no
 * entry: a merge scales the whole ship instead.
 */
const TIER_UPGRADES: Record<string, { t2: string; t3: string }> = {
  cannon: {
    t2: 'a racing stripe in the tier colour along the body under the orange decal, and a star sticker near the front',
    t3: 'the stripe and the sticker, plus a white pressure gauge with a red needle on the rear of the body and a bigger water tank on top'
  },
  archer: {
    t2: 'a stripe in the tier colour along the bottom of the body, and a sticker on its side',
    t3: 'the stripe and the sticker, plus a yellow dart drum with six orange dart ends under the barrel, and the sight fin swapped for a blue scope with a pale lens'
  },
  mortar: {
    t2: 'a star sticker on the side of the bucket',
    t3: 'the sticker, plus a yellow band around the bucket'
  },
  bombard: {
    t2: 'a sticker on the cardboard tube',
    t3: 'the sticker, plus a third blue band on the tube and a bigger water balloon'
  },
  tesla: {
    t2: 'a sticker on the base',
    t3: 'the sticker, plus twin charge coils on the roof corners — pale rods topped with pale cyan balls'
  },
  frost: {
    t2: 'a stripe in the tier colour across the upper pop, and a sticker on the stick',
    t3: 'the stripe and the sticker, plus a crown of three ice-crystal diamonds above the top'
  }
}

const mergedCells = (): SheetCell[] => {
  const cells: SheetCell[] = []
  MERGE_TYPES.forEach((id, col) => {
    for (let tier = 1; tier <= 3; tier++) {
      const ma = BLOCK_ART[id]!
      const rank = tier === 2 ? 'II' : 'III'
      const up = TIER_UPGRADES[id]?.[tier === 2 ? 't2' : 't3']
      cells.push({
        id: `merged/${id}/t${tier}`,
        palette: blockDef(id).palette,
        colours: blockColours(id, blockDef(id).palette),
        blurb: tier === 1
          ? `${ma.name}: ${ma.body}, with ${ma.fixture ?? 'its weapon'}.`
          : up
            ? `${ma.name} merged to tier ${rank}: the same ${bare(ma.fixture ?? 'toy')}, made fancier — ${up}. ONE toy, never a pair. Keep the small rounded plastic rank badge reading ${rank} crisp in the top-right corner.`
            : `${ma.name} merged to tier ${rank}: the same boat, grown bigger. Keep the small rounded plastic rank badge reading ${rank} crisp.`,
        col, row: tier - 1, cw: 1, ch: 1,
        label: id,
        sub: tier === 1 ? 'tier I (base)' : tier === 2 ? 'tier II' : 'tier III',
        note: tier === 1
          ? 'The unfused block, for comparison. Its override slot is on the blocks sheet.'
          : 'Reference only — a merged tier is painted as a fixture of its own (fixture-<id>-t2 / -t3 on the walk sheets), not from this cell.',
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

/**
 * What each bug design looks like, for a painter.
 *
 * NOT the bench's taglines: those are character jokes ("it has seen your
 * sandwich") and a model draws every noun it is given. These describe the
 * drawing in `src/game/bugs/*.ts` — body plan, props, face — so a prompt can
 * name what the reference shows.
 *
 * The colours are read off the drawing code, not `PALETTES`: the bugs never
 * draw from their enemy palettes, and those still hold Tower Siege's monster
 * colours — a teal eel and a hot-pink bat, which is the wrong water tiger and
 * a hue the chroma key would eat.
 *
 * `facing` is how the design is actually drawn. `faces: 'front'` in
 * `monsters.ts` means "no extra flip, +x leads", not "looks at the viewer":
 * most of those are turned three-quarters to the right.
 */
interface BugArt {
  look: string
  facing: string
  colours: string
  /** Panel notes for a cycle that holds a one-off moment. */
  panels?: string
}

const BUG_ART: Record<string, BugArt> = {
  grumpling: {
    look: 'a cartoon black ant seen from the side: three glossy beads — a big round head at the front, a small humped thorax and a fat egg-shaped abdomen tilted up at the back with three darker bands — joined by a tiny waist knot; six legs with little knee nubs, the feet flat on the sand; two elbowed antennae with club tips; two curved mandibles. Two white eyes with black pupils under heavy lids that slope together into a determined frown, and a small down-turned mouth.',
    facing: 'LEFT, in side view',
    colours: 'Colours: blue-black slate — body #3e3d58, highlights #5d6588, legs #3a3952, mandibles #4b4a66 — with icy blue-white shine streaks. This one is inked in near-black (#15101a).'
  },
  rattlejack: {
    look: 'a lean red fire ant, reared up on its four back legs, seen from the side: its front pair are raised as arms holding a big grey speckled pebble — about the size of its head — up over its head, and that pebble is its silhouette tell. A double waist knot, a longer banded abdomen with a darker tip, mandibles, yellow eyes under V-shaped lids with the front eye squinting harder, and a lopsided grin.',
    facing: 'LEFT, in side view',
    colours: 'Colours: fire-ant red — body #dd4b2b, abdomen #b93822, legs #cf4a2a, mandibles #a8321c; eyes #ffcf3f; the pebble grey #9aa3ad.'
  },
  cinderhound: {
    look: 'a cartoon cockroach, the lowest and longest shape in the cast: one long glossy oval of wing cases skimming the sand with a long cream shine streak along its back, a ringed belly showing below, a head shield with a cream front rim over a small round head tucked low at the front, two whip antennae longer than its whole body sweeping up and back, two tail prongs, and six splayed spiny legs. Sly V-shaped lids and a smirk.',
    facing: 'LEFT, in side view',
    colours: 'Colours: glossy chestnut — wing cases #9a4a20, belly #733617, head shield #843f1b, legs #ab6531 (far legs #7c4321) — with a cream shine streak.'
  },
  snaggletusk: {
    look: 'a heavy rhino beetle seen from the side, leaning forward like a wedge: a tall glossy domed shell at the back, a lower dome in front, and the head lowest at the front with ONE big thick horn sweeping forward and curling up and back to a point, plus a small second horn jutting forward off the front dome; six thick toothed legs. Orange eyes under heavy V-shaped lids and a flat clamped mouth. Built to hit a wall and keep going.',
    facing: 'LEFT, in side view',
    colours: 'Colours: glossy mahogany — shell and horns #6c2c19, head #7a3520, legs #6c2e1a — with a strong peach shine band on the dome and up the horn; eyes #ffb347.'
  },
  bonecap: {
    look: 'a round, fuzzy cartoon jumping spider in three-quarter view: a big furry tan head with a darker mask across the eyes and cream cheek fur, and a round charcoal abdomen riding behind it like a backpack, with a bold orange arcing stripe and three cream spots; eight legs with high arched knees and pale bands, the front pair crossed in front of its face; two cream fuzzy palps like mittens and small teal jaws with little white fangs. Two ENORMOUS glossy black front eyes (one bigger than the other), two small side eyes and two dots on the crown, under white fur brows in a menacing V. A thin white silk line trails from its rear down to the sand.',
    facing: 'RIGHT, turned three-quarters toward the viewer',
    colours: 'Colours: head tan #9a7452, abdomen charcoal #4d4852 with an orange #ff8a2b stripe, legs #765945 with pale bands #cfb08a, jaws teal #2cb9a5.'
  },
  blorp: {
    look: 'a nervous bombardier beetle in three-quarter side view: a glossy navy-blue shell dome with fine grooves and a blue-white shine, an orange head and middle, six orange legs and two beaded antennae. A too-wide clenched white grin, wide eyes with tiny darting pupils, worried eyebrows and a blue sweat drop behind its head — and cream puffs of stink smoke curling up out of its backside, with a hot yellow puff at the tail. It is about to go pop.',
    facing: 'RIGHT (head at the right, tail at the left), in three-quarter side view',
    colours: 'Colours: shell navy #2c3a6e, head and body orange #ff8a2b, legs #f47a22, smoke puffs cream, sweat drop #a9e4ff.'
  },
  marrowknight: {
    look: 'a roly-poly pill bug in three-quarter view: a tall half-dome of seven overlapping grey armour plates, every other plate a little darker, each with a light lip; many short legs rippling underneath; a small grey head peeking over the top front with two short elbowed antennae, smug flat eyelids and a small smirk. Held out on its RIGHT side, gripped by two front legs, is a red BOTTLE CAP used as a shield — crimped silver rim, a printed yellow ring and a cream star in the middle. That shield is how the player knows it is armoured in front: keep it big and clear.',
    facing: 'RIGHT, turned three-quarters toward the viewer, the shield held out on the right',
    colours: 'Colours: plates grey #9aa3ad, head #7d8693, legs #b3adb5 (far legs #6e7782); bottle cap red #e5483b with a silver #d1d6dc rim, a yellow #ffc93c ring and a cream star.'
  },
  thornwick: {
    look: 'the boss: a huge stag beetle in a near-frontal crest pose — a wide flat black-maroon head with a scowl built into its outline, a wide shield behind it and a bulging mahogany wing case behind that; giant rust-red antler mandibles rising above the head, spreading out and hooking back in at dark tips like a crown (one inner prong on the left antler, two on the right); six long dark spurred legs, comb-tipped antennae and a golden moustache of palps. Amber eyes with slit pupils under heavy angry brow ridges. Slow, patient and enormous.',
    facing: 'the viewer, in a near-frontal crest pose',
    colours: 'Colours: head #422629, shield #62241f, wing case #8c2a1d, antlers rust-red #a8391f, legs #43292b, palps gold #e8a844, eyes amber #ffb428.',
    panels: 'Its eyes are half shut in panel 8 only — a blink. Keep that.'
  },
  nibbler: {
    look: 'a cartoon housefly: a broad grey hairy thorax with four stripes and black bristles along its outline, an olive-grey barrel abdomen with dark chequer patches, six thin dark legs dangling, and two clear veined wings held out in a V behind it. Its silver face sits between two HUGE cherry-red compound eyes with big dark pupils looking to the right — one eye bigger, one brow cocked and one scowling — with a lopsided smirk and a dangling tube mouth.',
    facing: 'the viewer, its eyes looking to the RIGHT',
    colours: 'Colours: thorax grey #5b6072, abdomen olive-grey #7b7560, face silver #d9d4c4, eyes cherry red #e0362d; the wings clear with a faint warm tint — never pink or magenta.'
  },
  wispling: {
    look: 'a lanky cartoon mosquito in side profile: a small humped thorax with a cream stripe, a long abdomen angled down and back with five cream bands and a swollen rosy tip; six very long legs with cream-banded joints, the hind pair curled up high — the legs are half its silhouette; two narrow clear wings raised over its back, feathery antennae, and a long straight needle aimed low and forward with a white glint at the tip. Lime-green eyes under heavy lids.',
    facing: 'RIGHT, in side profile',
    colours: 'Colours: body purple #6d3f86, bands cream #f7eed8, eyes lime #c4ee3a, the needle mauve with a white tip.'
  },
  skewer: {
    look: 'an angry cartoon hornet in side view: a yellow abdomen angled down and back with three near-black bands, ending in a dark tip and a stinger with a cream glint; a fuzzy rust-brown thorax with a pinched dark waist; a yellow face under a dark rust helmet like a mask, elbowed black antennae and two dark toothed pincers held open. Four amber-tinted wings raised over its back; three yellow legs near, three darker far. Red eyes with lowered lids and hard angry V brows.',
    facing: 'LEFT, in side view',
    colours: 'Colours: abdomen yellow #ffc21f with near-black bands, thorax and helmet rust-brown #8e3a22, eyes red, wings amber-tinted.'
  },
  gloomcrow: {
    look: 'a round, fuzzy cartoon bumblebee — one big golden fuzz-ball body with two curved black bands and a cream tail band, fuzz tufts all round its outline, and tiny clear wings on top beating flat out with little white effort arcs. A small dark head with knobbed antennae, pink cheeks, big dark eyes and a cream grin. Its black hind legs stick out to the sides with orange pollen baskets, and its two front legs hug a golden HONEY BOMB under its belly — a ball of honey with a faint honeycomb pattern, a wet shine and drips.',
    facing: 'the viewer',
    colours: 'Colours: body gold #ffc42e with black bands and a cream tail band, honey bomb #ffb319, pollen baskets orange, cheeks soft pink.'
  },
  dustmoth: {
    look: 'a cartoon firefly carrying fire: a dark plum body, dark wing cases raised in a V with yellow edges, smoky clear hind wings spread to the sides, and a salmon-red hood over its head with a black spot and a yellow rim; big dark eyes with huge pupils and sleepy, sly lids. Its tail is a glowing pale-lime lantern. Held out in its front legs on its RIGHT side is a glowing orange ember with a gold core and a few rising sparks; four more legs dangle.',
    facing: 'the viewer, the ember held out on the RIGHT',
    colours: 'Colours: body plum #40333c, wing-case edges yellow #ffd85c, hood salmon #f26c52, lantern pale lime #eaff8a with its green glow kept tight, ember orange #ff6d1f with a gold core.'
  },
  sliverfin: {
    look: 'a water tiger — a diving-beetle larva — swimming side-on: a long thin ribbon of twelve rings, pinched at every ring, with a dark saddle on the back of each ring and a cream belly, six short paddling legs and bristly tail prongs. A flat wedge head with a dark cap and two reddish-brown sickle jaws bowing out and hooking back in — they NEVER close, so its mouth is always open — with a crooked grin between them and lime eyes, the far eye peeking over the crown.',
    facing: 'RIGHT, swimming side-on',
    colours: 'Colours: body ochre #d6b24c, saddles #735424, belly cream, jaws #8e4a22, eyes lime #b8e04a.'
  },
  gnashfin: {
    look: 'a diving beetle swimming side-on: a rigid glossy olive oval shell with a bright yellow rim along its lower edge and around the tail, an olive head at the front with a small chin pincer, a dark belly, an air bubble at its tail, and two big amber oar legs plus two smaller paddles fringed with cream hairs. Amber eyes under a flat, determined brow. Stiff as a pebble — its body never bends.',
    facing: 'RIGHT, swimming side-on',
    colours: 'Colours: shell olive #40602c with a yellow #ffc93c rim and a pale-green catch-light, oar legs amber, fringes cream.'
  },
  tidewyrm: {
    look: 'a fat dragonfly nymph swimming side-on: a moss-green nine-ringed abdomen with a darker mottle on each ring, a pale belly and three tail spikes; two leaf-like wing pads lying back along its top; six long legs with the knees up; one big bulging amber dome eye. Folded under its face is a pale khaki hinged lower lip with a smile line — its hands on its chin — that can shoot forward with two dark hooks flung open.',
    facing: 'RIGHT, swimming side-on',
    colours: 'Colours: body moss green #83a13f, the hinged lip khaki #bdbf6c, hooks dark brown #6a3f1c, eye amber #ffc94a.',
    panels: 'The hinged lip is folded under the face in every panel except panel 6, where it has shot fully forward with both hooks flung open, and panel 7, where it is pulling back in.'
  },
  brinemaw: {
    look: 'a toe-biter — a giant water bug — swimming side-on: a big flat brown oval body tipped slightly so its back shows, folded wings with a pale leathery half and a dark tip, a segment-ticked rim, twin breathing tubes trailing at the tail, and a small pointed head with a beak. Two grabbing arms shaped like a "7" held up in front of its face, each ending in a dark hooked claw; four fringed paddle legs. A stalk arches up off its crown to hang a small glowing pale-green bulb in front of its face, like an angler fish. Pale yellow eyes with tiny pupils under a menacing brow.',
    facing: 'RIGHT, swimming side-on',
    colours: 'Colours: body brown #9a5c28, wings pale leather with dark tips, lure pale green #b6ff8c with its glow kept tight, eyes pale yellow.'
  }
}

/** The design's name off the monster bench, e.g. "Black Ant". */
const BUG_NAME = Object.fromEntries(MONSTERS.map((m) => [m.id, m.name])) as Record<string, string | undefined>

/** One painter's sentence for a design: name, then what it looks like. */
const bugLine = (design: string): string => {
  const art = BUG_ART[design]
  const name = BUG_NAME[design] ?? design
  return art ? `${name}: ${art.look}` : `${name}.`
}

const enemyCells = (): SheetCell[] => {
  const cells: SheetCell[] = []
  const alts: { design: string; enemy: string }[] = []
  let i = 0

  for (const def of MONSTER_ENEMIES) {
    const bound = Array.isArray(def.monster) ? def.monster : [def.monster!]
    const primary = bound[0]!
    for (const extra of bound.slice(1)) alts.push({ design: extra, enemy: def.id })

    cells.push({
      id: `enemy/${def.id}`,
      colours: BUG_ART[primary]?.colours,
      blurb: `${bugLine(primary)} Facing RIGHT, drawn at ${def.scale} cells in game.`,
      col: i % ENEMY_COLS, row: Math.floor(i / ENEMY_COLS), cw: 1, ch: 1,
      label: def.id,
      sub: `${primary} · ${def.scale}c`,
      target: `images/enemies/${def.id}.webp`,
      note: def.movement === 'sea'
        ? 'Water bug, swimming side-on and centred. In game it is drawn twice per frame, split at the waterline, so keep it level and side-on exactly as the reference has it.'
        : bound.length > 1
          ? `Fields ${bound.length} designs; one bitmap replaces all of them.`
          : 'An override is a static pose — it replaces the whole walk cycle.',
      art: { kind: 'monster', designId: primary }
    })
    i++
  }

  for (const a of alts) {
    cells.push({
      id: `enemy/alt/${a.design}`,
      colours: BUG_ART[a.design]?.colours,
      blurb: `${bugLine(a.design)} Facing RIGHT.`,
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

// ─── D. Siege engines (the ant contraptions) ────────────────────────────────
//
// The biggest silhouettes in the game — a trebuchet is 1.7 cells, its sprite box
// four — and the ones that lose the most to a static bitmap, because they animate on STATE rather
// than on a clock: wheels turn with distance travelled, so a halted engine's
// wheels stop, and that is the tell that it has set up to fire.
//
// Painted here engaged and mid-cycle, which is the pose a still has to sell.

const SIEGE_IDS = Object.values(ENEMY_DEFS).filter((d) => d.siege).map((d) => d.id)

const siegeCells = (): SheetCell[] =>
  SIEGE_IDS.map((id, i) => ({
    id: `siege/${id}`,
    colours: SIEGE_ART[id]?.colours,
    blurb: `${SIEGE_ART[id]?.name ?? id}: ${SIEGE_ART[id]?.whole ?? 'an ant contraption built from toy junk'}. Facing RIGHT, ${ENEMY_DEFS[id]!.scale} cells in game.`,
    col: i % 3, row: Math.floor(i / 3), cw: 1, ch: 1,
    label: id,
    sub: `${ENEMY_DEFS[id]!.scale}c`,
    target: `images/enemies/${id}.webp`,
    note: id === 'ironRam'
      ? 'TIN. It is the only enemy immune to foam darts, and the shiny soup tin — with darts stuck uselessly to it — is the whole of how the player is told. Never cardboard or plastic.'
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
  { round: 'bolt', label: 'foam dart', slot: true, note: 'The most-fired round in the game — the dart blaster, the paper boat and the rubber duck.' },
  { round: 'quarrel', label: 'toothpick', slot: true, note: 'The rubber-band crossbow’s round, and the one shot the player has to see coming and answer.' },
  { round: 'ball', label: 'water blob', slot: true, note: 'Squirt-gun water blob (hostile: catapult pebble / sand clod).' },
  { round: 'shell', label: 'mud ball', slot: true, note: 'Mud-mortar mud ball (balloon launcher: water balloon, knot trailing).' },
  { round: 'bomb', label: 'honey bomb', slot: true, note: 'Bumblebee honey bomb — drips hang straight down.' },
  { round: 'fire', label: 'ember', slot: true, note: 'Firefly ember, tumbling under its own flame.' },
  { round: 'frost', label: 'ice shard', slot: false, note: 'The frost round is a live particle emitter; this is only its core shard.' }
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

/**
 * The Toy Knight's colours (`cavalryArt.ts`).
 *
 * Spelled out rather than read off the `cavalry` palette, which is the
 * knight's blue alone: "body around #2f7de1" is right for the rider and
 * paints the white toy horse blue as well.
 */
const KNIGHT_COLOURS = 'Colours: the knight, shield, chanfron and chest plate toy-blue around'
  + ' #2f7de1 (shade #1a4f9c); the caparison light blue #6fb0f5; gold trim, mane, tail,'
  + ' plume and pennant around #f2b52c; the horse warm white plastic #f6f1e6 with grey'
  + ' hooves; brown leather tack #9a6238; the lance white with blue candy stripes.'

const allyCells = (): SheetCell[] => {
  const cells: SheetCell[] = [{
    id: 'ally/cavalry',
    colours: KNIGHT_COLOURS,
    blurb: 'Toy Knight: a blue plastic toy knight with a striped lance on a white plastic toy horse, gold pennant, facing RIGHT. The FRIENDLY unit — it must never read as something to shoot at.',
    col: 0, row: 0, cw: 1, ch: 1,
    label: 'cavalry',
    sub: '1.1c · ally',
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
      blurb: 'A tall garden flower for the flower bed in front of the picket fence — a sunflower: bright yellow star petals round a brown centre with an orange ring, a green stem and two leaves. Seen small, so silhouette over detail.',
      col: 0, row: 0, cw: 1, ch: 1,
      label: 'conifer', sub: 'flower bed — tall',
      note: 'The slot is still called conifer; it is the TALL flower of the bed now (a sunflower, sometimes a hollyhock). Reads at about 5–9% of the screen height, so silhouette over detail.',
      art: { kind: 'tree', species: 'conifer', seed: 3 }
    },
    {
      id: 'prop/broadleaf',
      blurb: 'A low clump of garden flowers for the same bed — tulip cups in red, yellow and pink among broad leaves, with a daisy or two. Must not read as the tall flower at distance.',
      col: 1, row: 0, cw: 1, ch: 1,
      label: 'broadleaf', sub: 'flower bed — low',
      note: 'The slot is still called broadleaf; it is the LOW flower clump of the bed now (tulips, daisies, dandelions or clover). Must not read as the tall flower at distance.',
      art: { kind: 'tree', species: 'broadleaf', seed: 7 }
    }
  ]

  cells.push({
    id: 'sky/sun',
    blurb: 'The sun, drawn like a child’s drawing of one: a yellow disc with an orange edge, twelve round-tipped rays, and a happy face — closed smiling eyes, a smile and rosy cheeks.',
    col: 2, row: 0, cw: 1, ch: 1,
    label: 'sun', sub: 'day disc',
    note: 'Disc plus its ray fan. The wide bloom wash across the sky and the dawn/day/dusk tinting are painted around this, not into it, so they stay procedural.',
    art: { kind: 'celestial', night: false, tier: 1 }
  })
  cells.push({
    id: 'sky/moon',
    blurb: 'The moon: a cream disc with a soft lavender crescent of shade on its right, three soft craters and a sleeping face with pink cheeks. No rays.',
    col: 3, row: 0, cw: 1, ch: 1,
    label: 'moon', sub: 'night disc',
    note: 'Cream disc with a sleeping face, no rays. Identical at every wave tier — the storm sunset on a boss wave is the SKY changing behind it, not the moon itself.',
    art: { kind: 'celestial', night: true, tier: 1 }
  })

  const shipped = [
    { id: 'coin', src: 'images/props/coin_128x128.webp', sub: 'shipped bitmap' },
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
    brief: 'Every buildable block of the sandcastle in three rows per band: the block as played, the body that is actually the override file (one per block), and the tray pictogram. Slice the BODY row.',
    cells: blockCells()
  },
  {
    id: 'merged',
    file: 'sheet-merged',
    title: 'Merged blocks — tier I / II / III',
    cols: MERGE_TYPES.length,
    brief: 'Column per fusable toy weapon, row per tier. Only armed blocks fuse. Reference only: a merged weapon is painted on its own fixture sheet.',
    cells: mergedCells()
  },
  {
    id: 'enemies',
    file: 'sheet-enemies',
    title: 'Bugs — ground, air and water',
    cols: ENEMY_COLS,
    brief: 'One cell per enemy id, drawn with its bound bug design. Authored facing RIGHT; the battlefield mirrors by travel direction.',
    cells: enemyCells()
  },
  {
    id: 'siege',
    file: 'sheet-siege',
    title: 'Ant contraptions (siege engines)',
    cols: 3,
    brief: 'The six ant contraptions built from toy junk, engaged and mid-cycle. The largest silhouettes in the game and the ones that lose most to a static bitmap.',
    cells: siegeCells()
  },
  {
    id: 'allies',
    file: 'sheet-allies-rounds',
    title: 'Toy Knight and projectiles',
    cols: 8,
    brief: 'The Toy Knight ally plus every projectile kind. Only the foam dart and the toothpick can be bitmaps; the rest are reference.',
    cells: allyCells()
  },
  {
    id: 'props',
    file: 'sheet-props-sky',
    title: 'Flowers, sky bodies and shipped UI',
    cols: 6,
    brief: 'The discrete background objects and the two bitmaps that already ship. The tileable parallax bands are deliberately absent — they need a strip, not a grid.',
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
 * Tower Siege's first pass was briefed "realistic" and returned inked, muted,
 * hand-drawn storybook art — a better answer to a portal rejecting a game for
 * looking machine-made, so that became its target. Sandbox Tower keeps the
 * half of that lesson that was about CRAFT (visible hand-drawn ink, paint with
 * texture, nothing airbrushed) and drops the half that was about the medieval
 * mood: a summer backyard is bright, and its toys are plastic. The procedural
 * drawings the painter works from are the house style — warm brown ink, cel
 * fills with one shadow tone, light from the upper left — so the prompt asks
 * for that, painted by hand.
 *
 * The two prohibitions at the end are the ones the first pass came back wrong
 * on: it matted several objects onto little parchment cards with decorative
 * borders, which turns a wall into a wall of museum labels; and it filled a
 * cell that was deliberately empty.
 */
const STYLE_HEAD = [
  'STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page',
  'from a children’s picture book or a hand-painted board game. The world is',
  'a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon',
  'garden bugs attacking it. Match this in every square:',
  '· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around',
  '  #3b2a21, never pure black), with the line weight varying like a real brush',
  '  pen — heavier on the outer silhouette, lighter inside. It should look drawn.',
  '· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow',
  '  tone, one small highlight, with the light from the UPPER LEFT. A little',
  '  hand-painted texture in the fills, like gouache or marker on paper.',
  '· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and',
  '  paddling-pool turquoise — saturated and cheerful, but never neon.',
  '· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are',
  '  smooth and matte, toy plastic is smooth with one soft highlight and a',
  '  faint moulding seam, bug shells are glossy with a single glint.',
  '· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive',
  '  eyes and a mischievous look. Toys look loved and a little worn.',
  '· Chunky, readable shapes — silhouette first, detail second. Charming,',
  '  slightly naive handmade craft, never slick.',
  '',
  'AVOID — these are the ways this goes wrong:',
  '· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no',
  '  rendered volume, no bevel-and-emboss, no lens flare, no bloom.',
  '· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,',
  '  not an old book.',
  '· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,',
  '  goblins or monsters. Everything here is sand, toys, garden and bugs.',
  '· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no',
  '  gore. Cartoon bugs only.',
  '· NO uniform-weight black vector outlines (clip-art) — the ink is warm',
  '  brown and hand-varied.'
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
  '· NOTHING may be see-through. Clear plastic, water tanks, glass and insect',
  '  wings are painted as SOLID pale tints — pale icy blue, pale grey — even',
  '  where the reference lets the magenta show through them. Anything the',
  '  background shows through comes back pink, or with a hole in it.',
  '· The object itself must contain no magenta, fuchsia or hot pink. A toy that',
  '  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,',
  '  warm bubble-gum or salmon pink, clearly lighter and more orange than the',
  '  background, never a purple-pink: nothing pinker than about #ffa8c8, and',
  '  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half',
  '  see-through and greyed, because the key takes it for background.'
].join('\n')

/** A ready-to-paste prompt for one strip, naming every cell in order. */
export const promptFor = (s: StripSpec): string => {
  const sheet = SHEETS.find((x) => x.id === s.sheet)
  const list = s.cells
    .map((c) => {
      const cols = c.colours ?? paletteLine(c.palette)
      return `${c.col + 1}. ${c.blurb}${cols ? ` ${cols}` : ''}`
    })
    .join('\n')

  // Only worth shouting about on a row where it is the whole point.
  const noGun = s.cells.some((c) => c.sub.startsWith('body') && /NO /.test(c.blurb))
    ? '\nCRITICAL: this row is the BASE of each block with its toy REMOVED.'
      + ' No blasters, water pistols, tubes, zappers, ice pops, spades, flags,'
      + ' shells or piggy banks anywhere in this row. The game draws those on'
      + ' top at runtime — paint one in and the block ends up with two.\n'
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
    'on the way back in, so no object may contain magenta or hot pink; a pink',
    'toy is a soft, warm bubble-gum pink.',
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
  const cols = c.colours ?? paletteLine(c.palette)
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
    // Drawn at 4.6 disc radii square, so the disc is under half the image and
    // the rays reach nearly to its edges — said in numbers, because a sun
    // painted small in its frame arrives small in the sky.
    id: 'sun', file: 'bg-sun', target: 'images/bg/sun.webp',
    w: 512, h: 512, tileable: false, bg: 'magenta',
    blurb: 'The sun, drawn the way a child draws one: a round yellow disc with a warm orange edge and a happy face — closed, smiling eyes, a smile and rosy cheeks — ringed by twelve round-tipped rays, alternately long and short, in sunshine yellow with an orange edge. The disc is a little under half the width of the frame and the ray tips reach nearly to its edges, with pure magenta #FF00FF everywhere around it. It sits high in a bright summer sky, so it wants to feel friendly and golden rather than blinding. No glow or bloom around it — the game paints the sky wash itself.'
  },
  {
    id: 'moon', file: 'bg-moon', target: 'images/bg/moon.webp',
    w: 512, h: 512, tileable: false, bg: 'magenta',
    blurb: 'The moon: a round cream disc with a soft lavender crescent of shade along its right side, three soft craters, and a peaceful sleeping face — closed eyes and pink cheeks. No rays. It shares the sun’s size, a little under half the width of the frame, with pure magenta #FF00FF around it. Calm and friendly. Keep any halo tight to the rim — a wide glow blends into the background and has to be reconstructed.'
  },
  {
    // Still called `conifer`: the id is the file the renderer probes. The
    // layer it names is the flower bed's TALL flower now. A painted one is also
    // repeated tiny as the bed's back row, so it has to read as a sunflower at
    // a few pixels too.
    id: 'conifer', file: 'bg-conifer', target: 'images/bg/conifer.webp',
    w: 384, h: 512, tileable: false, bg: 'magenta',
    blurb: 'A single tall SUNFLOWER, whole and upright from the ground to the flower head: a sturdy green stem, two broad leaves, and a big head of bright yellow star-shaped petals round a brown seed centre with an orange ring. Pure magenta #FF00FF everywhere around it. It stands in the flower bed in front of the picket fence at only about 5–9% of the screen height, repeated along the bed — so the SILHOUETTE has to carry it: bold petals and leaves, no fine detail.'
  },
  {
    // Still called `broadleaf`: the LOW flower clump of the same bed.
    id: 'broadleaf', file: 'bg-broadleaf', target: 'images/bg/broadleaf.webp',
    w: 384, h: 512, tileable: false, bg: 'magenta',
    blurb: 'A single low clump of garden flowers, whole, standing on the ground: three or four TULIP cups in red, yellow and pink on short green stems among broad tulip leaves, with a couple of small white daisies at the front. Pure magenta #FF00FF everywhere around it. It stands in the same bed as the tall sunflower at only about 3–5% of the screen height, so it must stay LOW and ROUND and never read as the tall flower at distance.'
  },
  {
    // Still called `mountains-far`: it is the FAR layer of the backyard now.
    // The game tiles it with every other copy mirrored, so the seams join by
    // themselves — but anything with a handedness (writing, a sign) reads
    // backwards on every other house.
    id: 'mountains-far', file: 'bg-mountains-far', target: 'images/bg/mountains-far.webp',
    w: 1536, h: 512, tileable: true, bg: 'magenta-sky',
    blurb: 'The FAR layer of a suburban backyard: a row of neighbours’ houses seen over the garden — cream, pale-blue, butter-yellow and peach walls; terracotta, slate-blue and red roofs, some gabled with a little round attic window and some hipped; chimneys; white-framed upper windows — with round garden trees and a few tall poplars between them and a soft strip of treetops behind. Solid magenta sky above the rooftops and treetops, opaque artwork below. It is the most distant thing in the scene, so keep it soft and hazy, pulled toward a pale summer-sky blue, and low in contrast: detail here competes with the tower. The near garden is drawn over the bottom of this band. No writing, signs or numbers anywhere — the game mirrors every other copy.'
  },
  {
    // Still called `mountains-near`: the NEAR layer of the backyard.
    id: 'mountains-near', file: 'bg-mountains-near', target: 'images/bg/mountains-near.webp',
    w: 1536, h: 512, tileable: true, bg: 'magenta-sky',
    blurb: 'The NEAR layer of the backyard: big round leafy garden trees standing behind a neatly clipped green hedge; in one or two places a washing line strung between two poles with toy-coloured T-shirts, towels and socks pegged on it; and a white wooden PICKET FENCE running right across the front along the bottom of the band — pointed pickets, two rails, a capped post every eighth picket — filling roughly the bottom third. Solid magenta sky above the treetops and poles, opaque artwork below. Richer and closer than the far layer, but still background: it sits behind the tower and must not compete with it. No writing anywhere — the game mirrors every other copy.'
  },
  {
    // 8:1 rather than 4:1. The ground strip renders only about half a cell
    // tall, and `tileBand` scales a tile by HEIGHT — so a 4:1 asset came out
    // narrow and repeated many times across the screen, which is where tiling
    // starts to be visible as tiling.
    //
    // Still called `grass`: it is the sandbox's SAND now.
    id: 'grass', file: 'bg-grass', target: 'images/bg/grass.webp',
    w: 1024, h: 128, tileable: true, bg: 'opaque',
    blurb: 'The SAND of the sandbox, which the bugs walk across: a long, LOW band of warm pale sand seen slightly from above, light at the top and a little deeper and warmer toward the bottom (around #f6e2ae down to #e0bb7a), with soft wind ripples, fine grain speckle, the odd small pebble and a scallop shell or two. Fully opaque, top to bottom. On screen it is only about half a cell tall, so keep the detail broad — single grains disappear. Units walk ON it, and busy sand makes a walking bug hard to see, so keep it calm. No toys, no plank edge and no water — the game draws those on top.'
  },
  {
    id: 'water', file: 'bg-water', target: 'images/bg/water.webp',
    w: 1024, h: 512, tileable: true, bg: 'opaque',
    blurb: 'The paddling-pool moat in front of the sandcastle: clear, bright, shallow-looking water, pale minty aqua at the top edge deepening to turquoise and then to a strong pool blue at the bottom (around #b7e6cf → #34b3d1 → #1f86b0), with a few soft horizontal ripple bands. Fully opaque. The game draws the wet-sand bank, the waterline, the glints and a mirrored reflection of the tower on top of this, so keep the surface quiet — no strong highlights, no foam, no objects, nothing floating.'
  },
  {
    // The cap that says "nothing can be built on this block": an upside-down
    // red toy bucket. `drawRoof` trims the painting to its own bounds, draws
    // it 1.24 cells wide with its bottom just under the block's top, and takes
    // the HEIGHT from the painting's own proportions — so the shape is the
    // contract. The drawn bucket is about twice as wide as it is tall; the
    // canvas is 16:9 rather than the old gable's 4:3, and the bucket fills it,
    // so a painter is never handed room to paint a tall bucket that would
    // stand a head higher than the drawn one.
    id: 'roof', file: 'bg-roof', target: 'images/bg/roof.webp',
    w: 768, h: 432, tileable: false, bg: 'magenta', bleed: true,
    blurb: 'A red toy sand BUCKET turned UPSIDE DOWN and used as a turret cap, seen straight on from the front: its bottom — now its top — is a sandcastle mould with three square merlons; the tapered red plastic body has a moulded rib, a small arched window in relief and a white gloss stripe down its left side; and its wide rolled rim, with a little handle lug on each side, runs along the very bottom of the image. The rim is the widest part: it touches the left and right edges, the rim’s straight underside IS the bottom edge of the image, and the merlon tops touch the top edge. Nothing hangs below the rim — no handle, no shadow, no block, no sand. Glossy toy-red plastic (around #ff7b68 lit, #e5483b body, #a9261c shade). It is the ONLY red thing in the tower, deliberately, because it marks a block nothing can be built on top of.'
  },
  {
    id: 'icon-wood', file: 'icon-wood', target: 'images/icons/wood.webp',
    w: 512, h: 512, tileable: false, bg: 'magenta',
    blurb: 'The SAND resource icon: a small heap of warm golden sand with a toy spade stuck into it at an angle — blue handle, light-blue grip, the yellow blade half-buried — and a few loose grains. It sits in the HUD bar at about 26 px, so it must read instantly at thumbnail size — bold shapes, strong silhouette, no fine detail.'
  },
  {
    id: 'icon-stone', file: 'icon-stone', target: 'images/icons/stone.webp',
    w: 512, h: 512, tileable: false, bg: 'magenta',
    blurb: 'The PEBBLES resource icon: three smooth, rounded grey-blue pebbles in a little pile, each with a soft highlight at its upper left. Read at about 26 px in the HUD bar, so keep it to bold shapes with a strong silhouette and no fine detail. It must not be mistakable for the sand icon at a glance.'
  },
  {
    id: 'icon-gold', file: 'icon-gold', target: 'images/icons/gold.webp',
    w: 512, h: 512, tileable: false, bg: 'magenta',
    blurb: 'The GOLD resource icon: a shiny gold ingot with two small gold nuggets tucked behind it — buried treasure dug out of the sandbox — in warm, bright gold with a strong highlight. Read at about 26 px in the HUD bar — bold shape, strong silhouette, no fine detail. It is the premium resource, so it should be the brightest and most eye-catching of the three. NOT a coin: coins are a different currency with their own icon.'
  },
  {
    // The result screen's title band, and the reason it is here rather than
    // a cell: SHAPE.
    //
    // The ribbon the game draws in CSS keeps the old 2.94:1 box and spends
    // about a quarter of its height on tails the label has to dodge, and
    // FReward carries four media queries whose only job is to claw that height
    // back. A flat 5:1 band with the writing panel in the middle costs 41%
    // less vertical room at exactly the same width, so none of those widths
    // have to move.
    //
    // Optional by design: with no painted banner the CSS ribbon stays, so a
    // build without one looks exactly like today's.
    id: 'ribbon', file: 'bg-ribbon', target: 'images/bg/ribbon.webp',
    w: 1280, h: 256, tileable: false, bg: 'magenta', bleed: true,
    blurb: 'The result screen TITLE BANNER: one long, flat, horizontal ribbon of glossy RED toy plastic seen straight on, with a sunshine-yellow rim around the band and a small folded tail at each end in a deeper red. SHAPE IS THE WHOLE JOB HERE — it is WIDE AND SHALLOW, a 5:1 band rather than a scroll, and it must use the entire frame: the left tail touches the left edge, the right tail touches the right edge, and the tallest part of the ribbon touches the top and the bottom edge. Leave no magenta margin on any side — a banner painted small inside the frame arrives on screen as a small banner with dead space around it, which is the exact fault this asset replaces. The middle 70% of the width is the WRITING PANEL: flat, straight, parallel top and bottom edges, at least 80% of the frame height, and VERTICALLY CENTRED — the game prints its title across it in white letters with a dark outline, so keep that panel an even, quiet, uncluttered red with one soft gloss along the top. Do not write anything on it: no words, no letters, no numerals, no monogram, no icon, no ornament in the centre. The ends carry ONE shallow fold each and nothing more — no deep curls, no rolled ends, no ribbon looping behind itself, no swallowtail notch deeper than a fifth of the width. Nothing may sit above or below the band: no pole, no cords, no tassels, no rings, no shadow and no ground. Every pixel of height that is not ribbon is height the result screen loses.'
  },
  {
    // Not a resource glyph: it is a BUTTON, and the only one on the HUD that
    // rewards looking at it. It also carries a cooldown shade masked to its own
    // silhouette, which is why the outline has to stay one closed shape — a
    // detached strap or a spilled coin masks as a floating fleck of shadow.
    id: 'icon-chest', file: 'icon-chest', target: 'images/icons/chest.webp',
    w: 512, h: 512, tileable: false, bg: 'magenta',
    blurb: 'The daily TREASURE CHEST icon — the pirate treasure a kid dreams of digging up in the sandbox: a small, sturdy, CLOSED wooden chest seen straight on from the front — a domed lid, two dark bands running across the body, and a gold lock plate with a keyhole centred on the front. Warm wood browns, dark bands, one bright gold accent. It sits in the HUD at about 50 px and is the thing a player taps for their free coins, so it should look inviting and full: bold shapes, strong silhouette, no fine detail. The lid stays SHUT — the game plays the opening itself. Keep it ONE compact closed shape, with no dangling straps, no key, no spilled coins, no sand, no ground and no shadow beneath it: a cooldown shade is masked to this silhouette, so anything detached from the body becomes a floating fleck. It must not be mistakable for the gold resource icon at a glance — that one is the gold, this one is the box it came in.'
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
    lead: 'Paint ONE game sprite — a single wing — for a sunny backyard '
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
   * tier the painting is for (`paintTierFixture` draws the weapon's one gun
   * as the reference) — and the prompt needs the weapon for its colours.
   */
  fixtureType?: string
  fixtureTier?: number
  /**
   * How the subject is actually drawn, where `faces` would say it wrong.
   *
   * `faces: 'front'` means "no extra flip, +x leads" to the renderer, and a
   * prompt reading it as "faces the viewer" told the painter to turn a spider
   * that is drawn three-quarters to the right round to face the camera.
   */
  facing?: string
  /** A colour line for this sheet, where no palette describes it honestly. */
  colours?: string
  /**
   * A fixture's rest pose, as the reference draws it. Only the squirt gun and
   * the dart blaster are "level and pointing right"; the lobbers sit at a fixed
   * angle and everything else stands upright and never turns.
   */
  pose?: string
  /**
   * A single subject with a gap right through it — the toothpick ring, whose
   * middle is empty because the block goes there. The slicer's grid check
   * reads that gap as the edge between two panels and refuses the sheet, as
   * it should for a return that painted two objects; this tells it the gap is
   * the design.
   */
  hollow?: boolean
}

/** The direction line a prompt states, honest about three-quarter views. */
const facingOf = (w: WalkSpec): string =>
  w.facing ?? (w.faces === 'front' ? 'the viewer' : w.faces.toUpperCase())

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
    id: 'ballista', name: 'Rubber-Band Crossbow carriage',
    blurb: 'The carriage of an ant-built rubber-band crossbow: two green bottle-cap '
      + 'wheels with a printed cream star; a popsicle-stick bed and a trail stick '
      + 'ending in a pink thumbtack; a wide tongue-depressor stock with a groove '
      + 'along it; an upright stick frame; a corrugated-cardboard shield at the '
      + 'front with a torn top, masking tape and a dark slot; three spare toothpicks '
      + 'standing in a green bottle cap; and a pink eraser wedge under the stock. '
      + 'Draw the CARRIAGE ONLY — no crossbow arms, no rubber band, no wind-up key, '
      + 'no winder ant, no loaded toothpick. Those are painted separately in game.',
    colours: 'Colours: popsicle sticks #efcd92 (rear sticks #d2a86a), bottle caps green '
      + '#43b649 with cream stars, cardboard #cf9f62, toothpicks #f3d6a6, eraser and '
      + 'thumbtack pink #ff8ea4.'
  },
  {
    id: 'catapult', name: 'Spoon Catapult frame',
    blurb: 'The frame of an ant-built spoon catapult: two yellow bottle-cap wheels; '
      + 'a stacked popsicle-stick frame with legs and a collar tie; a big wad of '
      + 'yellow and orange rubber bands low at the back (the spring); a yellow '
      + 'kitchen sponge with a green scourer on a stick at the front top (the stop); '
      + 'a cotton reel of yellow thread at the tail; two grey pebbles and a sand '
      + 'clod on the deck; and an ant in an acorn-cap helmet holding up a pebble. '
      + 'Draw the FRAME ONLY — no spoon, no string, no pebble in a bowl. The spoon '
      + 'swings separately in game.',
    colours: 'Colours: popsicle sticks #efcd92, bottle caps and bands yellow #ffc93c '
      + 'with orange, sponge #ffd23f with a green #3fa84a scourer, pebbles grey '
      + '#9aa3ad, sand clod #cfa15e, ant glossy black #342b31 with an acorn cap #a26d36.'
  },
  {
    id: 'trebuchet', name: 'Pencil Trebuchet frame',
    blurb: 'The frame of an ant-built pencil trebuchet: two red bottle-cap wheels; '
      + 'a popsicle-stick sill; an A-frame of sticks rising to the pivot, with a '
      + 'collar tie and raking braces; green rubber bands lashing the joints; a '
      + 'spool of green thread at the tail; two pebbles and a sand clod on the sill; '
      + 'and an ant in an acorn-cap helmet standing behind the tail holding a '
      + 'pebble. Draw the FRAME ONLY — no pencil beam, no eraser counterweight, no '
      + 'sling, no pushpin. The arm swings separately in game.',
    colours: 'Colours: popsicle sticks #efcd92, bottle caps red #e5483b, bands and '
      + 'thread green #43b649, pebbles grey #9aa3ad, sand clod #cfa15e, ant glossy '
      + 'black #342b31.'
  },
  {
    id: 'ram', name: 'Pencil Ram car',
    blurb: 'A red die-cast toy car driven by ants: a yellow racing stripe with a '
      + 'thin cream line, dark wheel arches, pale-blue windows with a tiny ant '
      + 'driver peering out, a headlight, a tail light and chrome bumpers at both '
      + 'ends, and two toy-car wheels with black tyres and chrome hubs. A '
      + 'popsicle-stick gantry — two posts and a crossbar — stands over the roof, '
      + 'with a lookout ant on the crossbar and a yellow paper pennant on a '
      + 'toothpick; two orange foam darts are stuck to the car. Draw the CAR AND '
      + 'GANTRY ONLY — no pencil, no rubber bands, no riding ant. The pencil ram '
      + 'swings separately in game.',
    colours: 'Colours: car red #e5483b with a yellow #ffc93c stripe, windows #bfe3ec, '
      + 'tyres #3a3540 with chrome hubs #d8dee6, popsicle sticks #efcd92, ants glossy '
      + 'black #342b31.'
  },
  {
    id: 'ironRam', name: 'Tin-Can Ram',
    blurb: 'A soup tin lying on its side on a popsicle-stick sled with two '
      + 'dark-grey bottle-cap wheels: pressed bead ridges round the can, bright '
      + 'specular bands along the top and a darker underside, a torn red label '
      + 'with a cream disc and a tomato, and a rolled rim at the back. The open '
      + 'front mouth is turned toward the viewer, dark inside, with its '
      + 'can-opened lid bent up over it like a visor; a commander ant in an '
      + 'acorn-cap helmet pokes out of a jagged hatch on top; three foam darts '
      + 'are stuck uselessly to the tin. Shiny cold TIN — never cardboard or '
      + 'plastic. Draw the TIN AND SLED ONLY — no fork. The fork slides out of the '
      + 'mouth separately in game.',
    colours: 'Colours: tin #b7c0cb with bright bands and a dark inside #23262c, label '
      + 'red #d8402f with a cream #fff4dc disc, bottle caps #4a4f58, popsicle sticks '
      + '#efcd92, darts orange #ff8a2b with blue #2f7de1 cups.'
  },
  {
    id: 'siegeTower', name: 'Juice-Box Tower',
    blurb: 'A juice box on wheels: an orange carton with a darker side panel at '
      + 'the left, a white top band with a wavy lower edge, a green wave along '
      + 'its foot, a big orange-slice picture with a green leaf, a folded side '
      + 'ear and a white sealed fin along the top, two foam darts stuck in it, '
      + 'and two red sewing-button wheels. Draw the CARTON ONLY — no cardboard '
      + 'ramp, no straw flagpole, no red bottle-cap fighting top, no ant archers. '
      + 'Those are all animated separately in game.',
    colours: 'Colours: carton orange #ff8a2b with a white top band and a green '
      + '#43b649 wave, orange slice #ffb13b, buttons red #e5483b.'
  }
] as const

const monsterWalks: WalkSpec[] = MONSTERS.map((m) => ({
  kind: 'monster',
  id: m.id,
  file: `walk-${m.id}`,
  target: `images/monsters/${m.id}.webp`,
  name: m.name,
  tagline: BUG_ART[m.id]?.look ?? m.tagline,
  ...(BUG_ART[m.id]?.panels ? { panels: BUG_ART[m.id]!.panels } : {}),
  ...(BUG_ART[m.id] ? { facing: BUG_ART[m.id]!.facing, colours: BUG_ART[m.id]!.colours } : {}),
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
  colours: e.colours,
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
    id: 'ballista', name: 'Rubber-Band Crossbow arm',
    // The word "wheeled" was once in this sentence, describing the machine the
    // part comes off. It came back with wheels. Nothing in a blurb is read as
    // background: every noun in it is read as a thing to draw.
    blurb: 'The crossbow assembly of an ant-built rubber-band crossbow, lifted '
      + 'off its carriage and seen from the side: two wads of wound pink rubber '
      + 'bands, one upright behind the other, with one popsicle-stick arm sweeping '
      + 'out of each — the far arm a tone darker and set back behind the near '
      + 'one; one fat pink rubber band strung between the two arm tips as the '
      + 'bowstring; a toothpick with a pale-yellow paper flight lying dead level '
      + 'in front of the band, point to the RIGHT; and away to the LEFT, clear of '
      + 'the rest, a brass wind-up key with two round lobes, turned by a glossy '
      + 'black ant standing beside it. NOTHING else: no wheels, no bottle caps, '
      + 'no bed, no stock, no cardboard shield, no ground. The two arms are '
      + 'separate straight sticks and the band is two straight runs meeting at '
      + 'the nock: do NOT draw one curved bow limb from tip to tip, and do not '
      + 'outline the assembly with a bow shape.',
    colours: 'Colours: popsicle-stick arms #efcd92 (the far one #d2a86a), rubber '
      + 'bands pink #ff5f8f striped with a lighter pink, toothpick #f3d6a6 with a '
      + 'pale-yellow #fff0a8 flight, key brass #e2b447, ant glossy black #342b31.',
    panels: 'Panel 1 is the instant AFTER the shot — the toothpick is gone, the '
      + 'band has been thrown forward and the two arms are sprung wide apart, one '
      + 'up and one down. Panels 2 to 6 are the ant winding the key: a fresh '
      + 'toothpick lies ready, the band comes further back in each panel and the '
      + 'arms close towards level. Panels 7 and 8 are held at full draw, loaded '
      + 'and dead still, both arms nearly level and pointing right — those two '
      + 'are all but identical. Every panel except the first has the toothpick in '
      + 'it, and the ant and the key are in every panel.',
    span: 'the assembly — ant and key included — spans about two thirds of the '
      + 'panel’s width (64% in most panels, 76% at the widest in panel 2, where '
      + 'the fresh toothpick reaches furthest) and never more than about two '
      + 'fifths of its height.'
  },
  {
    id: 'catapult', name: 'Spoon Catapult arm',
    blurb: 'The throwing arm of an ant-built spoon catapult, lifted off its frame '
      + 'and seen from the side: ONE pink plastic spoon — a long straight handle '
      + 'and an oval bowl with a darker hollow and a white sheen — with a yellow '
      + 'rubber band lashed round the handle near its pivot end, and a length of '
      + 'cream string running from the middle of the spoon back toward the tail. '
      + 'NOTHING else: no wheels, no bottle caps, no popsicle frame, no sponge, no '
      + 'rubber-band spring, no cotton reel, no ground.',
    colours: 'Colours: spoon pink #ff6fae with a deeper pink hollow and a white '
      + 'sheen, band yellow #ffc93c, string cream #f0e4c6, pebble grey #9aa3ad.',
    panels: 'Panel 1 is the instant after the throw — the spoon has slammed '
      + 'forward against its stop, lying low and pointing up to the RIGHT with its '
      + 'bowl empty; panel 2 is the same, still shuddering. Panels 3 to 6 are the '
      + 'ants hauling it back: the spoon rises through upright (panels 4 and 5) '
      + 'and on over to the rear, the string pulled taut. Panel 7 is cocked, the '
      + 'spoon lying back and low with its bowl at the LEFT, still empty; panel 8 '
      + 'is the same pose with a grey pebble in the bowl — the only panel with one.',
    span: 'the spoon spans a little under half the panel’s width — 45% at its '
      + 'longest, in panels 1 and 2 — and never more than about two fifths of its '
      + 'height, even standing upright.'
  },
  {
    id: 'trebuchet', name: 'Pencil Trebuchet arm',
    blurb: 'The throwing assembly of an ant-built pencil trebuchet, lifted off '
      + 'its frame and seen from the side: one long yellow pencil as the beam, '
      + 'pivoting near its pink-eraser end on a red pushpin, with two green rubber '
      + 'bands round it at the pivot; a big pink eraser block hanging from a '
      + 'silver paperclip off that short end as the counterweight, always hanging '
      + 'straight down however far the beam has swung; and two string cords '
      + 'trailing from the sharpened graphite end to a pale-yellow cloth pouch. '
      + 'NOTHING else: no wheels, no bottle caps, no popsicle A-frame, no ground.',
    colours: 'Colours: pencil yellow #ffc93c with a sharpened cedar tip #f3d6a6 and '
      + 'a graphite point, eraser pink #ff8ea4, paperclip silver #c9cfd6, bands green '
      + '#43b649, string cream #f0e4c6, pouch pale yellow #ffe08a, pushpin red '
      + '#e5483b, pebble grey #9aa3ad.',
    panels: 'Panel 1 is the instant after the release — the long pencil end is '
      + 'thrown up to the upper RIGHT with the empty sling streaming out past its '
      + 'tip, and the eraser weight hangs low under the pivot. Panels 2 and 3 are '
      + 'the beam settling back and being winched round — the long end dips '
      + 'toward the right, then starts to rise; panel 4 stands it straight up; '
      + 'panels 5 and 6 carry it on over to the LEFT while the eraser weight '
      + 'swings up on the right. Panels 7 and 8 are cocked and still — the long '
      + 'end down at the LEFT with the pouch hanging below it, the eraser raised '
      + 'at the RIGHT — and the pebble is in the pouch in the last panel only.',
    span: 'beam, eraser weight and sling together span about half the panel’s '
      + 'width — 52% at most — and a little over half its height at the tallest, '
      + 'in panel 4 where the pencil stands straight up.'
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
  name: 'Toy Knight',
  tagline: 'A blue plastic TOY knight at full gallop on a white plastic toy horse '
    + '— a toy, glossy and a little stiff, with faint mould-seam lines, not a '
    + 'real knight. The horse: warm white plastic, a gold moulded mane and tail, '
    + 'grey hooves, a painted dot eye, a brown bridle and saddle, a light-blue '
    + 'caparison with a gold scalloped hem and three gold stars, and a blue '
    + 'chanfron and chest plate with gold trim. The knight: toy-blue, a bucket '
    + 'helm with a dark visor slit, a gold crown band and a gold plume streaming '
    + 'back, a gold belt, a blue heater shield with a gold cross, and a couched '
    + 'white lance with blue candy stripes, a gold vamplate, a silver head and a '
    + 'gold swallowtail pennant just behind the tip. This is the player’s OWN '
    + 'unit and the only friendly body on the field: the cool blue has to say '
    + '“mine” across the battlefield before any detail resolves, and it must '
    + 'never read as something to shoot at.',
  panels: 'One full gallop: four hoof beats and a brief moment with every hoof '
    + 'in the air. Panel 1 is the near hind hoof striking the sand; the body '
    + 'rises to its highest around panel 2; panels 3 and 4 gather the legs '
    + 'toward the moment of suspension; the forelegs land in panels 5 and 6; '
    + 'and the hind legs swing back under to land again through panels 7 and 8. '
    + 'The lance, the shield and the knight’s seat stay put — it is the legs, '
    + 'the tail, the pennant and the plume that move.',
  colours: KNIGHT_COLOURS,
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
  colours: e.colours,
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
    id: 'skiff', name: 'Paper Boat hull', faces: 'right',
    blurb: 'A folded notebook-paper boat, seen side-on and facing RIGHT: a tall '
      + 'triangular centre fold standing up out of it — lit on its left half, '
      + 'shaded on its right — and a wide flap whose two ends fold up into points '
      + 'and pinch down toward a flat keel; blue ruled lines running across the '
      + 'paper, a red margin line near the left, soft grey creases and a '
      + 'double-thickness brim. No mast, no sail, no oars. Cut off flat at the '
      + 'waterline.'
  },
  {
    id: 'longship', name: 'Rubber Duck hull', faces: 'left',
    blurb: 'A fat yellow rubber bath duck, seen side-on and facing LEFT: a plump '
      + 'breast and a round head at the left, an orange beak with a smile line, a '
      + 'big glossy black eye with a white glint, orange cheek blush, a tucked '
      + 'wing shading toward orange, a perky tail rising at the upper right, and '
      + 'a toy-blue saddle strap across its back. Cut off flat at the waterline.'
  },
  {
    id: 'galley', name: 'Toy Pirate Ship hull', faces: 'right',
    blurb: 'A moulded brown-plastic toy pirate ship, seen side-on and facing '
      + 'RIGHT: a plank-lined hull with a gold stripe along the sheer and four '
      + 'gold-ringed black portholes, a gold wedge figurehead at the bow, a darker '
      + 'stern castle at the left with three little merlons and a lit window, a '
      + 'dark mast carrying a cream sail with two red stripes and a yard across '
      + 'its head, and a black pennant at the masthead with a plain off-white '
      + 'skull shape on it. No oars, no shields. Cut off flat at the waterline.'
  }
] as const

const shipHulls: WalkSpec[] = SHIP_HULLS.map((h) => ({
  kind: 'ship',
  id: h.id,
  file: `hull-${h.id}`,
  target: `images/ships/${h.id}.webp`,
  name: h.name,
  tagline: h.blurb,
  // The duck is drawn facing LEFT; the reference is not flipped, so neither
  // is the prompt.
  faces: h.faces,
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
 * The toys a block carries (`toyFixtures.ts`).
 *
 * A square panel two fixture-scales across — `FIXTURE_BOX` — because that is
 * the box the renderer bakes a fixture into and blits from, so a return drops
 * straight onto it. The block's own cell is the middle half of the panel.
 *
 * The two aimed guns — the squirt gun and the dart blaster — are authored at
 * aim ZERO, level and pointing right, and the game rotates them to their
 * firing angle out of this one still; their stand and tripod stay drawn and
 * are left out here. The two lobbers sit at a fixed angle, and everything
 * else stands upright and never turns, which is why each carries its own
 * `pose` rather than one sentence for all of them.
 *
 * All thirteen, not only the weapons. Some of them animate off a clock — the
 * zapper's pulse, the ice pop's glints — and a still freezes that; the
 * reference is the pose the game draws at rest, which is the one a still has
 * to sell.
 */
const FIXTURE_PANEL = 512

const FIXTURE_WEAPONS = [
  {
    id: 'cannon', name: 'Squirt Gun',
    pose: 'level and pointing RIGHT, grip hanging down',
    blurb: 'A chunky toy water pistol pointing RIGHT: a rounded green body with '
      + 'an orange stripe decal along its side, a green grip hanging below the '
      + 'rear with an orange trigger, an orange pump slide with three ribs under '
      + 'the barrel, a yellow nozzle barrel ending in an orange tip with a dark '
      + 'hole, an orange knob on the back end, and on top a pill-shaped water '
      + 'tank about half full of turquoise water, with an orange filler cap and '
      + 'two yellow straps. Paint the tank as SOLID pale icy blue above the water '
      + 'line, not see-through. NOTHING else — no stand, no block, no spray, no '
      + 'drips.'
  },
  {
    id: 'archer', name: 'Dart Blaster',
    pose: 'level and pointing RIGHT, grip hanging down',
    blurb: 'A toy foam-dart blaster pointing RIGHT: a chunky orange body with a '
      + 'hump over the chamber, a blue side panel with two yellow screws, a blue '
      + 'grip with a yellow trigger, a small blue sight fin on top, a blue barrel '
      + 'with two darker rings and an orange muzzle ring, a yellow priming slide '
      + 'on a rod at the back, and a loaded dart just poking out of the muzzle — '
      + 'a stub of orange foam and a fat blue suction cup. NOTHING else — no '
      + 'tripod, no block, no flying darts.'
  },
  {
    id: 'mortar', name: 'Mud Mortar',
    pose: 'tilted at its fixed lobbing angle, about 56° up, mouth up and to the '
      + 'RIGHT, the pivot hub at the lower left',
    blurb: 'A blue plastic sand bucket used as a mortar tube: flaring toward its '
      + 'mouth, two moulded ridges round it, a thick yellow rolled rim, a yellow '
      + 'U-shaped handle across its side, a mouth full of dark mud with a round '
      + 'mud ball sitting in it and one drip over the rim, and a yellow pivot hub '
      + 'with a blue centre at its base. NOTHING else — no block, no splatter, no '
      + 'flying mud.'
  },
  {
    id: 'bombard', name: 'Balloon Launcher',
    pose: 'tilted steeply at its fixed angle, about 71° up, mouth up and a little '
      + 'to the RIGHT, the pivot disc at the bottom',
    blurb: 'A launch tube made from a kraft-cardboard tube with a rounded bottom '
      + 'end, diagonal spiral seams and two toy-blue bands; an orange plastic '
      + 'collar round its dark mouth; a glossy PINK water balloon sitting in the '
      + 'mouth, bigger than it, with its knot showing; and a yellow pivot disc at '
      + 'its base. NOTHING else — no block, no pit, no splash.'
  },
  {
    id: 'tesla', name: 'Bug Zapper',
    pose: 'standing upright and symmetrical — it has no front and never turns',
    blurb: 'An electric bug-zapper lantern: a dark indigo cage with a pale UV '
      + 'tube glowing cyan inside it, a pale-lavender wire grid across the front '
      + 'with violet corner posts, a violet flared base, a sloped violet roof, and '
      + 'a pale hanging ring on top. NOTHING else — no zap, no spark, no glow '
      + 'around it, no bug, no block: the game pulses its own glow behind the '
      + 'lantern and throws its own spark across the grid.'
  },
  {
    id: 'frost', name: 'Ice Pop',
    pose: 'standing upright on its stick, never turning',
    blurb: 'A giant ice-blue ice pop on a wooden stick: a rounded top with a bite '
      + 'taken out of the right shoulder, two white moulded ridges, a white gloss '
      + 'streak down the left, and one melt drop at the lower right. NOTHING else '
      + '— no frost glints, no cold glow around it, no block, no puddle, no flying '
      + 'ice: the game twinkles its own glints on it and breathes its own glow '
      + 'behind it.'
  },
  {
    id: 'stonepit', name: 'Pebble Digger',
    pose: 'facing LEFT, standing still, the scoop raised at the top left',
    blurb: 'A yellow toy digger facing LEFT: dark rubber tracks with grey wheels '
      + 'at the right, a yellow cab with a pale-blue window, and a yellow boom '
      + 'and arm with a grey ram reaching up and over to a yellow scoop at the top '
      + 'left with two pebbles in it, above a small heap of grey pebbles at the '
      + 'bottom left. NOTHING else: no block, no ground, no dust.'
  },
  {
    id: 'banner', name: 'Paper Flag',
    pose: 'the toothpick mast upright, the flag flying out to the RIGHT from its '
      + 'top in a slight ripple',
    blurb: 'A little paper flag on a wooden toothpick mast, point up: a plum-red '
      + 'paper swallowtail flying to the RIGHT from the top of the mast, with a '
      + 'gold band and a gold star, and a darker fold where it wraps the mast. '
      + 'NOTHING else: no block, no paper frill, no sand.'
  },
  {
    id: 'obelisk', name: 'Magic Seashell',
    pose: 'standing upright, its fan opening upward from the hinge at the bottom',
    blurb: 'A pearly-pink scallop shell standing on its hinge: seven scalloped '
      + 'lobes, six radial ribs in a deeper pink, a darker pink hinge piece at '
      + 'the bottom with a pale cyan-white pearl on it, and three small '
      + 'sparkles. A soft pale-cyan aura close behind it. NOTHING else: no block, '
      + 'no sand, no beam of light.'
  },
  {
    id: 'lumberHut', name: 'Sand Sifter',
    pose: 'standing upright and still',
    blurb: 'A toy sand wheel: a paddle wheel with yellow spokes, an orange rim, '
      + 'eight orange paddle cups and a blue hub, standing on blue A-frame legs '
      + 'over a small heap of sand, with a green funnel above it heaped with sand '
      + 'and a thin trickle of grains falling into the wheel. NOTHING else: no '
      + 'block, no ground, no sieve.'
  },
  {
    id: 'coffer', name: 'Piggy Bank',
    pose: 'facing RIGHT, standing still',
    blurb: 'A soft-pink piggy bank facing RIGHT: a round body, darker far legs '
      + 'and ear, a curly tail at the left, a pale snout with two nostrils, a '
      + 'glossy dot eye, a red cheek blush, a slot on its back, and a gold coin, '
      + 'seen edge-on, hovering just above the slot with two little motion '
      + 'ticks. NOTHING else: no block, no pedestal, no pile of coins.'
  },
  {
    id: 'repair', name: 'Bucket & Spade',
    pose: 'standing upright, the spade leaning on the bucket’s right side',
    blurb: 'A green toy sand bucket with a yellow rim, a yellow arched handle and '
      + 'a white first-aid-cross sticker on its side, with a toy spade — a yellow '
      + 'handle with a T-grip and an orange blade — leaning against its right '
      + 'side. NOTHING else: no block, no sand, no tools.'
  },
  {
    id: 'spikes', name: 'Toothpick Wall', hollow: true,
    pose: 'symmetrical, pointing outward on all four sides — it has no front',
    blurb: 'A ring of fourteen wooden toothpicks, points out: three poking out '
      + 'to the left, three to the right, four up and four down, each tilted a '
      + 'little by hand, starting well inside the square and reaching well past '
      + 'its edges, in pale wood with a lighter highlight line. The middle is '
      + 'EMPTY — the block goes there. NOTHING else: no block, no ground, no '
      + 'glints — the game twinkles its own at the points.'
  }
] as const


const fixtureSheet = (
  e: { id: string; name: string; blurb: string; pose?: string; hollow?: boolean }
): WalkSpec => ({
  kind: 'fixture',
  id: e.id,
  file: `fixture-${e.id}`,
  target: `images/fixtures/${e.id}.webp`,
  name: e.name,
  tagline: e.blurb,
  ...(e.pose ? { pose: e.pose } : {}),
  ...(e.hollow ? { hollow: true } : {}),
  faces: 'right',
  // 'feet', which reads as odd for a blaster — but it is what makes a return
  // register against the REFERENCE rather than against the middle of the
  // panel. 'centre' means "put it in the middle of the box", which is right
  // for a swimmer and wrong for a fixture: a part that sits above the middle
  // of its box would be dragged down to the centre.
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
 * Until these are painted the game draws a merged toy from the plain painting
 * (`paintTieredFixture`): the same ONE toy, grown by the merge's span and
 * washed in the tier's colour. That reads, but it is the plain toy enlarged. A
 * painting of the upgraded toy itself replaces it whole.
 *
 * The reference is the weapon's one toy as DRAWN at that tier — no stand, the
 * plain fixture's outline, with the tier's stripe, sticker and extra part — on
 * the same 512 box as the plain fixture, so a return drops onto the same
 * rectangle and the slicer fits it the same way. The game grows a merged toy
 * by itself, so the painting keeps that outline and puts the upgrade inside
 * it. The reference leaves out the tier rim, wash and glow on purpose: the
 * game lays those on over the painting too, and a reference that showed them
 * would be painted in and then drawn a second time on top.
 *
 * The words say what the reference cannot: that this is the SAME toy made
 * fancier — ONE of it, never a pair or a rank — which colour the tier is, and
 * that it has to read as the upgraded toy at forty pixels.
 */
const tierFixtureSheets: WalkSpec[] = TIER_ART_WEAPONS.flatMap((type) =>
  [2, 3].map((tier): WalkSpec => {
    const plain = FIXTURE_WEAPONS.find((f) => f.id === type)!
    const up = TIER_UPGRADES[type]![tier === 2 ? 't2' : 't3']
    const id = tierFixtureId(type, tier)
    return {
      ...fixtureSheet({
        id,
        name: `${plain.name} — tier ${tier}`,
        pose: plain.pose,
        blurb: `ONE ${plain.name.toLowerCase()} — the plain toy made fancier: ${up}. `
          + 'Otherwise exactly the plain toy — the same parts, the same colours, the '
          + 'same pose. One toy. NOTHING else — no stand, no block, no ammunition '
          + 'flying, no spray or smoke.'
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
 * Four things the reference cannot say. That it is the SAME toy made fancier,
 * with the plain painting as its design — and ONE of it: a merge makes one
 * block, so a model that paints a pair or a rank has painted a block the game
 * does not have. That it keeps the plain toy's size and place, because the
 * game grows a merged weapon itself and a bigger painting would be grown
 * twice. Which colour the tier is, taken from the ladder the rank badge and
 * the rim use, so "the green one" is green everywhere it appears. And that
 * the upgrade has to survive forty pixels, which is what the whole tier art
 * exists to say.
 */
const tierLines = (w: WalkSpec): string[] => {
  if (!w.fixtureType || !w.fixtureTier) return []
  const tier = w.fixtureTier
  const ts = tierStyle(tier)
  const colour = tier === 2 ? 'GREEN' : 'BLUE'
  return [
    '',
    `THIS IS A MERGED WEAPON — tier ${tier}: the SAME toy as the plain`,
    `\`images/fixtures/${w.fixtureType}.webp\`, made ${tier === 2 ? 'fancier' : 'fancier again'}. Attach that`,
    'painting as well as the reference: it is the design. Same plastic, same',
    'colours, same ink — and ONE toy, never two or three side by side. A merge',
    'makes one block, so it carries one weapon.',
    '',
    'KEEP ITS SIZE AND ITS PLACE. The reference is the plain toy’s own outline,',
    'and the game makes a merged weapon bigger by itself; a painting that fills',
    'more of the frame gets grown twice. Put the upgrade INSIDE that outline:',
    'the stripe, the sticker and the extra part the reference shows.',
    '',
    `THE TIER COLOUR IS ${colour}, around ${ts.hex}. It goes in the stripe and the`,
    'sticker the reference shows, and nowhere else: the toy keeps its own plastic',
    'colours everywhere else, so it is still THIS toy.',
    'This one accent may be brighter than the rest of the palette: it is how a',
    tier === 2
      ? 'player tells a tier 2 from a plain toy at a glance.'
      : 'player tells a tier 3 from a tier 2 at a glance.',
    '',
    'IT HAS TO READ AS THE UPGRADED TOY AT 40 PX. A chunky stripe, a bold',
    'sticker, a clear extra part and a strong ink line round one clear',
    'silhouette. Fine detail that only shows at full size is the one way this',
    'fails that looks fine at full size.'
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
    const subject = w.kind === 'ship' ? 'ship' : w.kind === 'fixture' ? 'toy'
      : machine ? 'contraption' : 'character'
    return [
      `# ${w.id} — ${w.name}  (${w.file}.png → ${w.target})`,
      '',
      `Repaint ONE ${subject}, in a single ${w.w === w.h ? 'square' : 'landscape'} image.`,
      'The attached reference is exactly what to paint, at exactly the size and',
      'position it is drawn at. Match both.',
      '',
      `WHAT IT IS: ${w.name} — ${w.tagline}`,
      ...tierLines(w),
      // A hull carries its own colour — the white paper boat, the yellow duck,
      // the brown pirate ship — and that colour is how a player tells three
      // boats apart at harbour scale. A contraption spells its colours out.
      ...(w.colours ? ['', w.colours]
        : w.kind === 'ship' ? ['', paletteLine(w.id)] : []),
      // A fixture must stand out FROM the block it sits on.
      //
      // Tower Siege handed a fixture its block's palette, which read as "paint
      // the bow in the colour of the crate it sits on" — and the returned bow
      // was pale timber on pale timber. Sandbox Tower's toys are moulded in
      // their block's band colour on purpose (the squirt gun is the green of
      // its band), so the danger is not the palette any more: it is SAND. Every
      // toy block is a pale sand plinth, and a toy painted sand-coloured
      // vanishes into it.
      ...(w.kind === 'fixture'
        ? ['',
          'IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand',
          '(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright',
          'plastic colours from the reference, with no large sand-coloured, beige or',
          'tan areas — a wooden stick or a toothpick is fine, but it needs its ink',
          'line. Keep the warm brown ink line strong all the way round the outside',
          'so the shape holds on its own. A toy the colour and value of sand',
          'disappears into the block, which is the one way this drawing can fail',
          'that looks fine on its own sheet.',
          '',
          'THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on',
          'top of a block that is already there, so the block must not be here:',
          'no sand block, no plinth, no wall, no ground, no shadow. Draw only the',
          'toy itself, floating on the magenta exactly where the reference has',
          'it — where it sits in the frame is where it is fixed on.',
          '',
          `DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: ${w.pose ?? 'level and pointing RIGHT'}.`,
          ...(/pointing RIGHT/.test(w.pose ?? 'pointing RIGHT')
            ? ['The game turns it to its own firing angle out of this one picture, so',
              'do not draw it already aimed or tilted.']
            : ['The game never turns it, so do not tilt, re-angle or re-pose it.']),
          'Add no motion blur, sparks, splashes, smoke or muzzle spray: movement',
          'painted in here is movement the game adds its own on top of.',
          '',
          'KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the',
          'background is measured as part of the object when the return is fitted',
          'back onto the reference — a wide aura therefore comes back as a tiny',
          'toy inside a huge smear. It also cannot be keyed: soft light over',
          'magenta turns pink rather than transparent. Any glow belongs inside',
          'the shape’s own outline, or within a hair of it.']
        : []),
      ...(w.kind === 'ship'
        ? ['',
          'DRAW ONLY WHAT THE REFERENCE SHOWS. A ship here is a BASE for a weapon,',
          'the same way a block is: the deck weapon — the toothpick spear, the dart',
          'launcher, the cork cannons — aims at whatever the ship is shooting at,',
          'so it is drawn live on top of this and must NOT be painted in.',
          'Everything the reference does show stays.',
          '',
          'THE WATERLINE IS THE BOTTOM EDGE OF THE IMAGE. The hull runs straight',
          'off the bottom of the frame and is cut flat by it, exactly as the',
          'reference is — the game draws the water, the wake and the reflection',
          'below that edge, and the boat sits down into them. So paint no water,',
          'no foam, no ripples, no shadow, no reflection and no waterline of your',
          'own, and leave no margin under the hull: the last row of pixels in the',
          'image is the boat, not background.']
        : w.kind === 'siege'
          ? ['',
            'DRAW ONLY WHAT THE REFERENCE SHOWS. The moving part — the throwing',
            'spoon, the crossbow arms and band, the pencil beam and eraser weight,',
            'the ram pencil or fork, the ramp, the flag straw, the fighting top and',
            'its ant archers — is painted separately and animated on top of this in',
            'the game. If you add one here the contraption ends up with two.',
            'Anything the reference DOES show, including the pebbles on the deck',
            'and the ants standing on it, stays.']
          : []),
      '',
      STYLE,
      '',
      'SIZE AND PLACEMENT — this is the part that goes wrong.',
      'Do not enlarge it to fill the frame. The reference leaves air around the',
      `${w.kind === 'ship' ? 'hull' : subject} on every side and that air is not waste — it`,
      'is where the parts that animate get drawn. Keep the subject the same',
      w.kind === 'fixture'
        ? 'fraction of the frame that the reference has it, in the same place.'
        : 'fraction of the frame that the reference has it, and standing on the same',
      ...(w.kind === 'fixture' ? []
        : w.kind === 'ship'
          ? ['line: the waterline the hull is cut off at must land at the same height',
            'from the bottom edge as the reference has it.']
          : ['line: the wheels and feet must sit at the same height from the bottom edge.']),
      w.kind === 'fixture' && w.pose
        ? `· Keep the pose the reference has: ${w.pose}.`
        : `· In the reference it faces ${facingOf(w)}. Keep that direction.`,
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
      '· ONE big drawing of a whole contraption filling the canvas is the wrong answer',
      '  however well it is painted, and so is a square canvas. That is what came',
      '  back last time, and none of it could be used.',
      '',
      'THIS IS A PART, NOT A MACHINE — read this before anything else.',
      'It is one moving assembly, lifted off the ant contraption it belongs to. In the',
      'game it is painted ON TOP of a separate carriage that already exists, so',
      'the carriage must not be here as well.',
      '· Draw ONLY what the reference shows in each panel, and nothing else.',
      '· NO wheels or bottle caps. NO cart, bed or stock. NO chassis, popsicle',
      '  frame, A-frame, base or stand. NO ground, no shadow, no scenery, and no',
      '  crew beyond what the reference shows. If it is not in the reference',
      '  panel, it is not in the picture.',
      '· Do not complete it into a whole contraption. Every panel is meant to',
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
      ...(w.colours
        ? ['', w.colours,
          `It is the same contraption as the ${w.id} carriage sheet, which is painted`,
          'in the same materials and is what this part gets laid on top of. Side',
          'by side the two have to look like one object: the same sticks, the same',
          'plastic, the same colours, the same wear. A part two shades paler than',
          'the carriage it sits on reads as somebody else’s toy.']
        : []),
      '',
      'THE VIEW — a flat side elevation, square on from the side, the way a',
      'toy’s instruction leaflet shows it.',
      '· NO three-quarter view, no perspective, no vanishing point, no',
      '  foreshortening, no tilt. Nothing turns to face the viewer, and no part',
      '  is nearer the eye than another.',
      '· Every stick, pencil and spoon keeps the angle the reference draws it at.',
      '',
      'ONE MECHANISM.',
      `All ${w.frames} panels are the same assembly at a different moment of one`,
      'shot. Identical sticks, identical caps, identical rubber bands, identical',
      'proportions and identical thickness in every panel. Only the POSE changes —',
      'the arm swings, the band draws back, the weight falls — and it changes exactly',
      'as the reference shows it, panel for panel.',
      '· ONE colour scheme, taken from the reference, in all of them.',
      '· Do not re-scale it between panels, and do not re-scale it from the',
      '  reference: it has to keep meeting a carriage it cannot see.',
      `· In the reference it faces ${facingOf(w)}. Keep that direction throughout.`,
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
      '· The palette above is for the OBJECT. The ground is not part of the',
      '  painting and is not warmed, softened or toned with it: it stays a',
      '  vivid, eye-hurting #FF00FF whatever the object looks like.',
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
      `  colours, facing ${facingOf(w)}.`,
      '· Every pixel that is not the part itself is flat, vivid #FF00FF — hold it',
      '  against a pure magenta swatch, not against your memory of one.',
      '',
      `OUTPUT: one image, ${w.w} x ${w.h} pixels (2:1, landscape). If your tool`,
      'has an aspect-ratio control, set it to 2:1 — a square return crushes the',
      'grid and cannot be cut. No labels, captions, numbers or watermarks.'
    ].join('\n')
  }

  // The cast is bugs, with one rider in it. Rather than a third branch for a
  // single sheet, the nouns bend: a toy knight is not a creature, has no
  // antennae to count, and gallops rather than walks — and a prompt that calls
  // the rider a creature invites exactly the redesign the rest of it forbids.
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
      ? 'identical sticks, identical caps, identical proportions, identical'
      : 'identical colours, identical props, identical proportions,',
    machine
      ? 'silhouette, identical wheel size. Only the WHEEL ANGLE changes, exactly as'
      : ally
        ? 'identical silhouette, identical plastic colours, identical saddle, shield and'
        : 'identical silhouette, identical markings, identical number of legs, wings and',
    machine
      ? 'the reference shows — the spokes turn and nothing else moves at all.'
      : ally
        ? 'pennant. Only the POSE changes, and it changes exactly as the reference'
        : 'antennae. Only the POSE changes, and it changes exactly as the reference',
    ...(machine ? [] : ['shows — same limb positions, same body lean, same head angle.']),
    `· ONE colour scheme, taken from the reference, in every panel. ${machine
      ? 'A machine built of pale sticks in one panel and dark in another is not one'
      : ally
        ? 'A knight who is blue in one panel and green in another is not one'
        : 'A bug that is glossy black in one panel and brown in another is not one'}`,
    `  ${IT} animated, it is several ${ITS} side by side, and the result is unusable.`,
    '· Do not redesign it. Do not add or remove parts between panels.',
    '· Do not turn it to face a different direction in any panel.',
    `· Do not re-scale it: the ${IT} must be the same size in every panel, and the`,
    '  same size it is in the reference. Do not move it around inside its panel.',
    `· In the reference it faces ${facingOf(w)}. Keep that direction in all ${w.frames} panels.`,
    '',
    `WHAT IT IS: ${w.name} — ${w.tagline}`,
    ...(w.panels ? ['', `READ THE PANELS: ${w.panels}`] : []),
    ...(w.colours ? ['', w.colours] : []),
    ...(machine
      ? ['',
        'DRAW ONLY WHAT THE REFERENCE SHOWS. The moving part — the throwing spoon,',
        'the crossbow, the pencil arm, the ram, the ramp, the ant crew — is painted',
        'separately and animated on top of this in the game. If you add one here the',
        'machine ends up with two. Anything the reference DOES show stays.']
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
  a.lead ?? 'Paint one background element for a sunny backyard tower-defence game: a kid’s sandcastle in a sandbox, defended with toys against garden bugs.',
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
