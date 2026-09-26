import { prependBaseUrl } from '@/utils/function'

/**
 * ─── Art contract ───────────────────────────────────────────────────────────
 *
 * Sandbox Tower ships with ZERO gameplay bitmaps: every block, enemy and
 * background layer is drawn procedurally in `useTowerArt.ts` from the palettes
 * below. That keeps the download tiny, makes the art resolution-independent
 * (crisp at any DPR and any zoom), and means the game is playable the instant
 * the JS parses.
 *
 * When real art arrives, it drops in with NO code change: `spriteFor()` probes
 * `/public/images/<folder>/<id>.webp` and, if the image decodes, the renderer
 * blits it instead of drawing. Paths are catalogued in `art-todo.md`.
 */

// ─── Palettes ───────────────────────────────────────────────────────────────
//
// Each palette is the full material description for one drawable: a base ramp
// (dark → mid → light) plus an accent used for fixtures, glows and trim. The
// renderer derives bevels, rim light and ambient occlusion from these, so a
// palette swap restyles the whole object coherently.

export interface Palette {
  /** Deepest shadow tone. */
  dark: string
  /** Body / mid tone. */
  mid: string
  /** Lit face. */
  light: string
  /** Fixture / trim / glow colour. */
  accent: string
  /** Secondary accent, used for details (bolts, rivets, eyes). */
  accent2: string
  /** RGB triplet for particle debris from this material. */
  debris: [number, number, number]
}

export const PALETTES: Record<string, Palette> = {
  // ── Blocks (the sandcastle) ──────────────────────────────────────────────
  //
  // Two families, and the ramp means something different in each:
  //
  //   * MATERIAL blocks — the Sand Block, Packed Sand, the Pebble Wall, the
  //     Toothpick Wall and the Castle Gate. The ramp IS the block: dry sand,
  //     wet sand, grey-blue pebbles.
  //   * TOY blocks — every gun, producer and buff. They stand on a shared sand
  //     plinth (`sandBlockArt.ts`), so their ramp is the TOY's plastic: the
  //     plinth wears it as trim, the fixture is moulded from it, the tray tile
  //     is filled with it and the debris flies off in it. A tower full of sand
  //     still has one saturated colour per gun to find it by.
  //
  // Red is deliberately missing from the toy colours: the roof cap is the red
  // bucket, and "can I build on this?" has to stay one glance.
  wood: { dark: '#b88c4c', mid: '#e3c07e', light: '#f6e2ae', accent: '#9c7038', accent2: '#fff4d6', debris: [227, 192, 126] },
  brace: { dark: '#8d673a', mid: '#c79a5c', light: '#dcb57c', accent: '#6e4c26', accent2: '#f2d7a2', debris: [199, 154, 92] },
  stone: { dark: '#5f6975', mid: '#8f9aa6', light: '#c9d0d6', accent: '#454d57', accent2: '#e8edf1', debris: [154, 163, 173] },
  gate: { dark: '#b3803f', mid: '#eccb8c', light: '#fff1cc', accent: '#ffb42e', accent2: '#ffd36b', debris: [236, 203, 140] },
  archer: { dark: '#c75416', mid: '#ff8a2b', light: '#ffb56e', accent: '#2f7de1', accent2: '#ffe2c2', debris: [255, 138, 43] },
  cannon: { dark: '#23833b', mid: '#43b649', light: '#86dc6e', accent: '#34b3d1', accent2: '#d4f7ff', debris: [67, 182, 73] },
  mortar: { dark: '#5b36a8', mid: '#8a5cd8', light: '#b894f0', accent: '#7a4a22', accent2: '#eadcff', debris: [138, 92, 216] },
  tesla: { dark: '#2b2f8f', mid: '#4d52d6', light: '#8189f2', accent: '#57e2ff', accent2: '#ccf7ff', debris: [77, 82, 214] },
  frost: { dark: '#2382b5', mid: '#5cc4ea', light: '#aaeaff', accent: '#8ef0ff', accent2: '#effdff', debris: [170, 234, 255] },
  spikes: { dark: '#a57539', mid: '#d8ae6a', light: '#f2d9a0', accent: '#7d5a2e', accent2: '#fbecc8', debris: [216, 174, 106] },
  bombard: { dark: '#138a80', mid: '#1fb5a8', light: '#6adccf', accent: '#ffc93c', accent2: '#d6fff9', debris: [31, 181, 168] },
  repair: { dark: '#1d5fb5', mid: '#2f7de1', light: '#72acf2', accent: '#ffc93c', accent2: '#fff3c4', debris: [47, 125, 225] },
  sawmill: { dark: '#5c961d', mid: '#94cc3a', light: '#c8ee82', accent: '#ff8a2b', accent2: '#f4ffd6', debris: [148, 204, 58] },
  quarry: { dark: '#c98a00', mid: '#ffc21f', light: '#ffe07a', accent: '#4a4f57', accent2: '#c9d0d6', debris: [255, 194, 31] },
  mint: { dark: '#d05a8e', mid: '#ff8fbf', light: '#ffc3dc', accent: '#ffc93c', accent2: '#fff3b0', debris: [255, 143, 191] },
  // Buffs read as a party, not a fort — paper bunting and a pearly shell — so a
  // player can pick the block that is doing nothing on its own out of a crowded
  // tower. The flag keeps its heraldic magenta and gilt.
  banner: { dark: '#7a2a63', mid: '#b8479a', light: '#e685c6', accent: '#ffd35c', accent2: '#fff0bd', debris: [184, 71, 154] },
  obelisk: { dark: '#7656a8', mid: '#b99ae6', light: '#efe0ff', accent: '#9be8ff', accent2: '#e6fbff', debris: [185, 154, 230] },

  // ── Enemies ──────────────────────────────────────────────────────────────
  grunt: { dark: '#4a1f22', mid: '#8d3238', light: '#c04b52', accent: '#2a1012', accent2: '#ffcf6b', debris: [141, 50, 56] },
  runner: { dark: '#4a3a12', mid: '#8f7020', light: '#c39c33', accent: '#231b08', accent2: '#ffe08a', debris: [143, 112, 32] },
  slinger: { dark: '#20402f', mid: '#376b4f', light: '#529b74', accent: '#12241a', accent2: '#b8f0d0', debris: [55, 107, 79] },
  brute: { dark: '#3a1f4a', mid: '#63348d', light: '#8d52c0', accent: '#1c0f24', accent2: '#e0b8ff', debris: [99, 52, 141] },
  bomber: { dark: '#4a2a10', mid: '#8d4f1c', light: '#c4762e', accent: '#ff5a2a', accent2: '#ffd0a0', debris: [141, 79, 28] },
  bat: { dark: '#241f3a', mid: '#3f376b', light: '#61549b', accent: '#ff5ad0', accent2: '#ffc0ef', debris: [63, 55, 107] },
  bulwark: { dark: '#1f303f', mid: '#37536b', light: '#527c9b', accent: '#c9a227', accent2: '#ffe9a8', debris: [55, 83, 107] },
  golem: { dark: '#2a2620', mid: '#514838', light: '#7d7055', accent: '#ff7a1f', accent2: '#ffd08a', debris: [81, 72, 56] },
  wyvern: { dark: '#2d1a3a', mid: '#57306e', light: '#8a4fa8', accent: '#ff9a3c', accent2: '#ffe0b0', debris: [87, 48, 110] },
  bombardier: { dark: '#3a3020', mid: '#6a5936', light: '#9b8552', accent: '#4a5560', accent2: '#cfd8e2', debris: [106, 89, 54] },
  firebug: { dark: '#3d1a12', mid: '#7a3418', light: '#b45a24', accent: '#ff8a2a', accent2: '#ffe0a0', debris: [122, 52, 24] },
  eel: { dark: '#123040', mid: '#1f5a68', light: '#2f8a94', accent: '#7ef0d0', accent2: '#d8fff4', debris: [31, 90, 104] },
  // Slate, so the fin cutting the surface reads as iron-grey against the water
  // rather than as another green eel.
  shark: { dark: '#1b2c3a', mid: '#3f5c74', light: '#6d8ba6', accent: '#c9d8e4', accent2: '#eef4f8', debris: [63, 92, 116] },
  kraken: { dark: '#1a1030', mid: '#332055', light: '#553a85', accent: '#b06bff', accent2: '#e8d0ff', debris: [51, 32, 85] },
  seadrake: { dark: '#12332f', mid: '#2f7f74', light: '#57b0a2', accent: '#c9503a', accent2: '#ffd76a', debris: [47, 127, 116] },

  // ── Siege engines (ant contraptions built from toy junk) ─────────────────
  // `mid` is each machine's own toy colour (car paint, spoon plastic, juice
  // carton, bottle caps); `accent` its rubber bands / caps / label. All WARM:
  // toy-blue belongs to the player's knights and must never appear on a
  // machine the player is supposed to shoot. `debris` is the material that
  // flies off it — popsicle stick for the stick-built ones.
  ram: { dark: '#8f231c', mid: '#e5483b', light: '#ff8577', accent: '#ffc93c', accent2: '#fff1c2', debris: [229, 72, 59] },
  // Bright, cold tin — the palette itself says "darts will not do anything
  // here" before the player has read a single tooltip.
  ironRam: { dark: '#4c545e', mid: '#9aa4b0', light: '#d7dee6', accent: '#d8402f', accent2: '#fff4dc', debris: [154, 164, 176] },
  ballista: { dark: '#23702a', mid: '#43b649', light: '#86dc7a', accent: '#ff5f8f', accent2: '#fff0a8', debris: [236, 201, 142] },
  catapult: { dark: '#b0306a', mid: '#ff6fae', light: '#ffa9cf', accent: '#ffc93c', accent2: '#fff3c0', debris: [236, 201, 142] },
  siegeTower: { dark: '#b8561a', mid: '#ff8a2b', light: '#ffb66b', accent: '#e5483b', accent2: '#fff6e0', debris: [255, 138, 43] },
  trebuchet: { dark: '#962018', mid: '#e5483b', light: '#ff8577', accent: '#43b649', accent2: '#ffe08a', debris: [255, 201, 60] },

  // ── Allies ───────────────────────────────────────────────────────────────
  // Deliberately the brightest, coolest palette on the field: a friendly unit
  // must never be mistaken for something you are supposed to shoot. Toy-blue
  // plastic with gold trim — the Toy Knights.
  cavalry: { dark: '#1a4f9c', mid: '#2f7de1', light: '#6fb0f5', accent: '#ffc93c', accent2: '#fff3b0', debris: [47, 125, 225] },

  // ── Ships ──
  // Bath toys on the paddling pool: a folded notebook-paper boat, a yellow
  // rubber duck and a brown plastic pirate ship with gold trim.
  skiff: { dark: '#8ea3ba', mid: '#e4ecf5', light: '#ffffff', accent: '#5a9be6', accent2: '#ff6b6b', debris: [228, 236, 245] },
  longship: { dark: '#d99400', mid: '#ffc93c', light: '#ffe78f', accent: '#ff8a2b', accent2: '#fff7cc', debris: [255, 201, 60] },
  galley: { dark: '#4f2a18', mid: '#8c4d2b', light: '#bd7a45', accent: '#ffc93c', accent2: '#e5483b', debris: [140, 77, 43] },

  // ── Projectiles / effects ────────────────────────────────────────────────
  bolt: { dark: '#5b4326', mid: '#a07a45', light: '#e0c089', accent: '#ffffff', accent2: '#ffe9b0', debris: [224, 192, 137] },
  ball: { dark: '#14161a', mid: '#2c3138', light: '#565c66', accent: '#ffb03a', accent2: '#fff0c0', debris: [44, 49, 56] },
  fire: { dark: '#7a2200', mid: '#e05a10', light: '#ffb43a', accent: '#fff3c0', accent2: '#ffffff', debris: [224, 90, 16] },
  smoke: { dark: '#2b2b2f', mid: '#55555c', light: '#8a8a94', accent: '#b8b8c2', accent2: '#d8d8e0', debris: [85, 85, 92] },
  spark: { dark: '#a05a00', mid: '#ffb03a', light: '#fff0c0', accent: '#ffffff', accent2: '#ffffff', debris: [255, 176, 58] },
  coin: { dark: '#8a6410', mid: '#e0a81c', light: '#ffe066', accent: '#fff8d0', accent2: '#ffffff', debris: [224, 168, 28] },
  blood: { dark: '#3a0a0e', mid: '#7a1620', light: '#b02a36', accent: '#d8505c', accent2: '#ff8a94', debris: [122, 22, 32] }
}

export const paletteFor = (key: string): Palette => PALETTES[key] ?? PALETTES.wood!

// ─── Palette lookup ─────────────────────────────────────────────────────────
//
// A single flat lookup. There is deliberately no re-skinning layer: cosmetic
// block themes were removed because they fought the one thing the renderer has
// to guarantee — that a player can tell a cannon from a crate at a glance while
// forty enemies are on screen. Palette identity IS the readability.

/** Palette for a drawable. */
export const themedPalette = (key: string): Palette => paletteFor(key)

// ─── Drop-in bitmap overrides ───────────────────────────────────────────────
//
// Probing is lazy and one-shot per id: the first `spriteFor()` call kicks off an
// `Image` load; until (and unless) it decodes, the renderer's procedural path
// runs. A 404 marks the id as "procedural forever" so we never re-request it.
//
// OFF BY DEFAULT. The probe's whole design assumes a miss is free — and for the
// game it is, since the procedural path draws either way. It is not free for a
// PORTAL: CrazyGames' QA console reports every 404 as
// `Missing resource detected: …/images/blocks/wood.webp`, one line per block
// and per enemy, which reads as a broken build to a reviewer. With no override
// art shipping, every one of those requests was guaranteed to miss.
//
// Flip `VITE_ENABLE_ART_OVERRIDES=true` when there is art in `public/images` to
// find; until then nothing is requested at all.

// ─── The feature flag ───────────────────────────────────────────────────────
//
// Three layers, most specific first:
//
//   1. `?art=on` / `?art=off` in the URL — flips it for this device and is
//      REMEMBERED, so a reload keeps the answer and the param can be dropped.
//   2. Whatever was remembered from a previous `?art=`.
//   3. `VITE_ENABLE_ART_OVERRIDES` — the build's default, and the only layer a
//      portal ever sees.
//
// The build default has to stay the floor because a miss is only free for the
// GAME. CrazyGames' QA console reports every 404 as `Missing resource detected:
// …/images/blocks/wood.webp`, one line per block and per enemy, which reads as a
// broken build to a reviewer. So art is shipped off until it is ready, while a
// URL param still lets it be switched on and — the point of the flag — straight
// back OFF, live, with no rebuild, when the new art turns out worse than the
// drawn version.
//
// Read as a plain boolean rather than a `ref`: `spriteFor` runs per drawable per
// frame, and a reactive read in that loop costs dependency tracking on every
// block in the tower for a value that changes when a human clicks something.

const BUILD_DEFAULT = import.meta.env.VITE_ENABLE_ART_OVERRIDES === 'true'
const STORAGE_KEY = 'artOverrides'

const readStored = (): boolean | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw === null ? null : !!JSON.parse(raw)
  } catch { return null }
}

const readParam = (): boolean | null => {
  try {
    // The router is on hash history, so a param can arrive in either half of
    // the URL — `?art=on#/` from a typed link, `#/?art=on` from a route push.
    const url = new URL(window.location.href)
    const hashQuery = url.hash.includes('?') ? url.hash.slice(url.hash.indexOf('?') + 1) : ''
    const raw = url.searchParams.get('art') ?? new URLSearchParams(hashQuery).get('art')
    if (raw === null) return null
    return ['1', 'on', 'true', 'yes'].includes(raw.toLowerCase())
  } catch { return null }
}

let enabled = BUILD_DEFAULT
/** Bumped on every explicit refresh, to bust the HTTP cache. See `spriteFor`. */
let probeGeneration = 0

type ProbeState = 'idle' | 'loading' | 'ready' | 'missing'

interface Probe {
  state: ProbeState
  img: HTMLImageElement | null
  /** Resolves once this probe has decoded or failed. Never rejects. */
  settled: Promise<void>
}

const probes = new Map<string, Probe>()

// ─── Repaint notification ───────────────────────────────────────────────────
//
// Probing is ASYNC. `spriteFor` returns null while the image is still in
// flight, so anything that paints once and stops — the build tray, the shape
// preview — captures the procedural look and keeps it forever. In game that
// showed as tray tiles that were drawn art only after the first block was
// placed, because placing one happened to repaint them.
//
// A canvas cannot bind to a value, so it has to be told.

const artListeners = new Set<() => void>()

/** Repaint when drop-in art arrives or the flag flips. Returns an unsubscribe. */
export const onArtChanged = (fn: () => void): (() => void) => {
  artListeners.add(fn)
  return () => { artListeners.delete(fn) }
}

const artChanged = (): void => {
  for (const fn of artListeners) fn()
}

/**
 * Forget every probe result.
 *
 * A 404 is remembered FOREVER — that is what stops the renderer re-requesting a
 * file that is not coming. Which is also exactly wrong the moment new art lands
 * on disk: without this, dropping in `wood.webp` and flipping the flag would
 * change nothing, because the miss from boot is still cached.
 */
export const refreshArtOverrides = (): void => {
  probes.clear()
  probeGeneration++
  artChanged()
}

/** Whether drop-in bitmap art is being looked for right now. */
export const artOverridesEnabled = (): boolean => enabled

/** Where the current answer came from, for diagnostics. */
export const artOverrideSource = (): 'url' | 'stored' | 'build' =>
  readParam() !== null ? 'url' : readStored() !== null ? 'stored' : 'build'

/**
 * Turn drop-in art on or off for this device, live.
 *
 * `remember: false` flips it for the session only — useful for an A/B look
 * without leaving a flag behind on a machine that will later be used to check a
 * portal build.
 */
export const setArtOverrides = (on: boolean, remember = true): boolean => {
  if (remember) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(on)) } catch { /* harmless */ }
  }
  const changed = enabled !== on
  enabled = on
  // Always re-probe on an explicit switch-on, even if the flag was already on:
  // the reason somebody calls this is usually that the files changed.
  if (on) refreshArtOverrides()
  else if (changed) probes.clear()
  console.warn(`[art] Bitmap overrides ${on ? 'ENABLED' : 'DISABLED'}.`)
  artChanged()
  return enabled
}

// Resolve at module load. A `?art=` in the URL is treated as an instruction,
// so it is persisted immediately and the param becomes optional from then on.
if (typeof window !== 'undefined') {
  const fromUrl = readParam()
  const stored = readStored()
  if (fromUrl !== null) {
    enabled = fromUrl
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl)) } catch { /* harmless */ }
  } else if (stored !== null) {
    enabled = stored
  }

  // A console handle, so the flag can be worked without a UI. Attached
  // unconditionally because the whole point is to reach it on a built preview
  // — it is three closures over a boolean, not a debug surface worth gating.
  ;(window as unknown as Record<string, unknown>).__art = {
    on: () => setArtOverrides(true),
    off: () => setArtOverrides(false),
    refresh: () => { refreshArtOverrides(); console.warn('[art] probes cleared; art re-reads on next draw.') },
    status: () => ({ enabled, source: artOverrideSource(), probes: probes.size })
  }
}

/** Folder layout the art pipeline should target. */
export const ART_FOLDERS = {
  block: 'images/blocks',
  enemy: 'images/enemies',
  prop: 'images/props',
  bg: 'images/bg',
  /** UI glyphs that ship as SVG components and can be repainted. */
  icon: 'images/icons',
  /**
   * Painted WALK CYCLES, one horizontal strip per monster design.
   *
   * Not the same thing as `enemy`, which is one still per enemy TYPE and stops
   * the unit animating altogether. A monster is a character with a gait, and a
   * gait is most of what makes it read as alive — so the strip is keyed on the
   * DESIGN (the thing that has a walk), sliced back into frames at runtime, and
   * played from the same clock that drives the procedural bake.
   */
  monster: 'images/monsters',
  /**
   * Painted siege chassis, one strip per engine covering a wheel revolution.
   *
   * Only the STATIC layer: the throwing arm is keyed to each machine's own
   * reload and stays procedural on top, exactly as a block's fixture does over
   * its painted body.
   */
  siege: 'images/siege',
  /**
   * Painted throwing arms, one strip per engine across its RELOAD.
   *
   * Composited over the chassis on the same box, and indexed by `cycle` —
   * the simulation's own progress toward the next shot — so a painted arm
   * still swings against the moment the machine actually fires.
   */
  siegeArm: 'images/siege-arms',
  /**
   * The player's own cavalry, one strip across ONE gallop.
   *
   * A still was the target here for a while and nothing ever read it, which
   * is the worst of both: the sheet promised a drop-in and the game ignored
   * the file. A rider is a character with a gait — four beats and a
   * suspension phase — and freezing that is more damage than leaving it
   * drawn, so it is a strip on the same terms the monsters get.
   */
  ally: 'images/allies',
  /**
   * Painted HULLS, one still per ship.
   *
   * A ship is a block that floats: a base with a weapon bolted to it. So it
   * adopts art the way a block does — the hull is a bitmap and the deck gun
   * stays drawn, because it aims. The still covers the clip band a hull is
   * visible in, and the roll, the heave and the wake are applied to it live.
   */
  ship: 'images/ships',
  /**
   * The WEAPON a block carries, authored level and pointing RIGHT.
   *
   * A gun turns. So the bitmap is one still at aim zero and the renderer
   * rotates it to the block's own firing angle, exactly as a projectile is
   * authored pointing right and blitted along its heading — 48 aim buckets
   * out of one file rather than 48 files.
   */
  fixture: 'images/fixtures',
  /**
   * Projectiles, keyed by round.
   *
   * A round is authored pointing RIGHT and blitted rotated to its heading,
   * the same way the drawn shape is — so one still covers every direction.
   * Only the shafted rounds have a hook: a cannonball is a circle and a
   * lightning bolt is a polyline rebuilt every frame from the simulation.
   */
  round: 'images/rounds'
} as const

export type ArtKind = keyof typeof ART_FOLDERS

// ─── Shared block bases ─────────────────────────────────────────────────────
//
// Twenty block types do NOT need twenty bitmaps.
//
// Almost every block is a slab of material with a machine bolted to it, and the
// machine is drawn live: the bow, the barrel, the coil, the blade and the pick
// are all `drawFixture` every frame. What the bitmap underneath actually has to
// say is what the block is MADE OF. An archery post and a sawmill are the same
// timber crate wearing different hardware, and painting two of them buys
// variety nobody can see while costing two downloads.
//
// So blocks share a base, and the fixture on top carries the identity. Three
// keep their own art because nothing is drawn over them to tell them apart —
// the Gate's door, the braced crate's X and the obelisk's glyphs ARE the block.
//
// Applied inside `spriteFor` rather than at the call sites. There are five
// places that paint a block face (world, build ghost, water reflection, tray
// tile, shape preview) and a mapping applied per-site is a mapping that will
// eventually be missed at one of them — which is exactly the bug the ghost
// preview already had.

export const BLOCK_ART_BASE: Record<string, string> = {
  // Timber — a plank crate. The workhorse.
  wood: 'timber', archer: 'timber', repair: 'timber',
  sawmill: 'timber', lumberHut: 'timber', spikes: 'timber',
  // Masonry — quarried, mortared, heavier than timber.
  stone: 'masonry', cannon: 'masonry', quarry: 'masonry',
  stonepit: 'masonry', mint: 'masonry',
  // Iron — plated and riveted. Everything that runs hot or holds a charge.
  mortar: 'metal', bombard: 'metal', tesla: 'metal',
  frost: 'metal', coffer: 'metal',
  // Their own, because the block IS the picture.
  brace: 'braced', obelisk: 'arcane', banner: 'heraldry', gate: 'gate'
}

/**
 * Blocks that have NO block bitmap, ever.
 *
 * A hull is drawn by `drawShip`, which carries its own probe under
 * `images/ships/`. But a ship is still a block to the build tray, and the
 * tray paints every tile through the block path — so each ship tile probed
 * `images/blocks/skiff.webp`, a file that will never exist, and a portal's
 * QA console logged the three misses on every start. Listed here rather
 * than read off the block defs, for the same reason `BG_IDS` is.
 */
const NO_BLOCK_ART = new Set(['skiff', 'longship', 'galley'])

/** The bitmap a block reads from. Falls back to the block's own id. */
export const blockArtBase = (typeId: string): string =>
  BLOCK_ART_BASE[typeId] ?? typeId

/** Every distinct base bitmap, in a stable order. */
export const BLOCK_ART_BASES: string[] =
  [...new Set(Object.values(BLOCK_ART_BASE))]

/**
 * Return a decoded override bitmap for `(kind, id)` or null when none exists.
 * Never throws, never blocks — a missing file simply means "keep drawing it".
 */
/** A hint to the browser's fetch scheduler. Only honoured on the request that
 *  creates a probe; a later call with a different hint changes nothing. */
export type FetchPriority = 'high' | 'low'

export const spriteFor = (
  kind: ArtKind, id: string, priority?: FetchPriority
): HTMLImageElement | null => {
  // Before the cache, before the `Image` — with the feature off, not one
  // request is made and the renderer simply keeps drawing.
  if (!enabled) return null
  if (kind === 'block' && NO_BLOCK_ART.has(id)) return null

  // A block reads from its SHARED base bitmap; everything else is keyed by its
  // own id. Resolved here so no call site has to remember.
  const artId = kind === 'block' ? blockArtBase(id) : id
  const cacheKey = `${kind}/${artId}`
  let probe = probes.get(cacheKey)

  if (!probe) {
    let done: () => void = () => {}
    probe = { state: 'loading', img: null, settled: new Promise<void>((r) => { done = r }) }
    probes.set(cacheKey, probe)
    const img = new Image()
    img.decoding = 'async'
    // `fetchPriority` is what lets the late tiers of `artPreload` go out
    // without elbowing the first wave's strips off the wire. A browser that
    // does not know the property ignores the assignment.
    if (priority) (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = priority
    img.addEventListener('load', () => {
      // A zero-size decode is as good as missing.
      if (img.naturalWidth === 0) { probe!.state = 'missing'; done(); return }

      // `load` means the BYTES arrived, not that they are a bitmap yet, and
      // `decoding: 'async'` above only governs how the browser paints an <img>
      // in the document — these images are never in the document, they are
      // blitted onto a canvas. So the decode was landing on whichever frame
      // first drew the sprite, synchronously, inside `drawScene`: measured at
      // 63 ms on the frame a new monster design walked on and 120 ms on the
      // one that baked the backdrop, at 4x throttle. `decode()` does that work
      // off the frame and only then lets the renderer see the image.
      //
      // Failure is not fatal and must not be: an aborted decode (a navigation,
      // a memory-pressured phone) still leaves a usable `Image`, and the old
      // behaviour — hand it over and let the frame decode it — is exactly the
      // right fallback.
      const ready = (): void => {
        probe!.state = 'ready'
        probe!.img = img
        // The whole point: whoever painted before this arrived gets to repaint.
        artChanged()
        done()
      }
      if (typeof img.decode === 'function') img.decode().then(ready, ready)
      else ready()
    }, { once: true })
    img.addEventListener('error', () => { probe!.state = 'missing'; done() }, { once: true })
    // The generation suffix only appears AFTER an explicit refresh. A clean
    // load stays cacheable; a re-probe after dropping new files on disk has to
    // defeat the browser cache or the old bitmap comes straight back.
    const bust = probeGeneration > 0 ? `?v=${probeGeneration}` : ''
    img.src = prependBaseUrl(`${ART_FOLDERS[kind]}/${artId}.webp${bust}`)
  }

  return probe.state === 'ready' ? probe.img : null
}

/**
 * Every background asset the renderer will ask for.
 *
 * Listed here rather than derived, because this module is on the eager boot
 * path and must not drag the scenery manifest in behind it.
 */
const BG_IDS = [
  'sun', 'moon', 'conifer', 'broadleaf',
  'mountains-far', 'mountains-near', 'grass', 'water', 'roof'
] as const

/**
 * The HUD glyphs, which the bar shows before anything else is on screen.
 *
 * They sit at the top of every single frame of the game, so a hand-painted
 * tower above flat vector icons is the one mismatch the eye cannot avoid.
 *
 * `chest` is the daily-reward button rather than a resource, but it lives in
 * the same bar and is on screen just as early, so it loads on the same tier.
 */
const ICON_IDS = ['wood', 'stone', 'gold', 'chest'] as const

/** One bitmap the scene will ask for: a kind and the id it is keyed by. */
export type ArtWant = readonly [ArtKind, string]

/**
 * The bitmaps that ARE the screen from frame one: the scenery bands and the
 * HUD's resource glyphs. Every other tier-0 want is game knowledge and lives
 * in `artPreload`; these two lists are here because this module is on the
 * eager boot path and must not import a manifest to learn them.
 */
export const sceneArtWants = (): ArtWant[] => [
  ...BG_IDS.map((id): ArtWant => ['bg', id]),
  ...ICON_IDS.map((id): ArtWant => ['icon', id])
]

/**
 * Start probing `(kind, id)` and hand back the promise that settles when it
 * has decoded or failed. Null with overrides off, so a caller can `await`
 * only what it actually asked for.
 */
export const artSettled = (
  kind: ArtKind, id: string, priority?: FetchPriority
): Promise<void> | null => {
  if (!enabled) return null
  spriteFor(kind, id, priority)
  return probes.get(`${kind}/${kind === 'block' ? blockArtBase(id) : id}`)?.settled ?? null
}

/**
 * Wait for the bitmaps in `wants` to decode, so the splash can hold for them.
 *
 * WHICH bitmaps is the caller's business — `artPreload` derives the wave-1
 * set from the enemy definitions, and this module stays off that import path
 * on purpose. It used to hold for every base, every band and every icon at
 * once, and then the first frame fired sixty more probes for the whole cast;
 * see `artPreload` for why a first-time player now waits for a tenth of it.
 *
 * Without this the art POPS IN: the game starts on the procedural drawing and
 * swaps to paint a second or two later, block by block, which reads as the
 * scene glitching rather than as loading. The whole point of the painted art is
 * the first impression, and the first impression was the version without it.
 *
 * Only when overrides are actually on — a portal build with the flag off waits
 * for nothing and requests nothing, exactly as before.
 *
 * Never rejects and never blocks forever: a missing file settles as 'missing'
 * and the procedural path simply keeps drawing.
 */
export const preloadArtOverrides = async (
  wants: ReadonlyArray<ArtWant>,
  onProgress?: (done: number, total: number) => void
): Promise<void> => {
  if (!enabled) return
  const jobs: Promise<void>[] = []
  for (const [kind, id] of wants) {
    const p = artSettled(kind, id, 'high')
    if (p) jobs.push(p)
  }

  let done = 0
  const total = jobs.length
  onProgress?.(0, total)
  await Promise.allSettled(jobs.map((j) => j.then(() => { onProgress?.(++done, total) })))
}


// ─── Colour helpers ─────────────────────────────────────────────────────────

/** Mix two hex colours. `t = 0` → a, `t = 1` → b. */
export const mixHex = (a: string, b: string, t: number): string => {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `rgb(${r},${g},${bl})`
}

/** Hex → `rgba()` with an explicit alpha. */
export const withAlpha = (hex: string, alpha: number): string => {
  const p = parseInt(hex.slice(1), 16)
  return `rgba(${(p >> 16) & 255},${(p >> 8) & 255},${p & 255},${alpha})`
}
