import { prependBaseUrl } from '@/utils/function'

/**
 * ─── Art contract ───────────────────────────────────────────────────────────
 *
 * Tower Siege ships with ZERO gameplay bitmaps: every block, enemy and
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
  // ── Blocks ───────────────────────────────────────────────────────────────
  wood: { dark: '#6b3f1d', mid: '#a9682f', light: '#d99a53', accent: '#4a2a12', accent2: '#f0c185', debris: [169, 104, 47] },
  brace: { dark: '#5d3a1b', mid: '#97602c', light: '#c98d4b', accent: '#3a2410', accent2: '#e8bb7d', debris: [151, 96, 44] },
  stone: { dark: '#4a5058', mid: '#767e88', light: '#a8b2bd', accent: '#333940', accent2: '#c9d3dd', debris: [118, 126, 136] },
  gate: { dark: '#2a2140', mid: '#4b3d70', light: '#7a63ad', accent: '#c9a227', accent2: '#ffe9a8', debris: [75, 61, 112] },
  archer: { dark: '#4d3a20', mid: '#8a6a3a', light: '#c2995a', accent: '#2f7d5a', accent2: '#7ef0bb', debris: [138, 106, 58] },
  cannon: { dark: '#2f3338', mid: '#565c64', light: '#868e98', accent: '#d0761f', accent2: '#ffcf7a', debris: [86, 92, 100] },
  mortar: { dark: '#3a3a44', mid: '#5f5f6e', light: '#8d8da0', accent: '#c0453a', accent2: '#ff9a7a', debris: [95, 95, 110] },
  tesla: { dark: '#1e2c44', mid: '#33507a', light: '#5680bd', accent: '#57e2ff', accent2: '#ccf7ff', debris: [51, 80, 122] },
  frost: { dark: '#1f3a48', mid: '#356577', light: '#5d9db4', accent: '#8ef0ff', accent2: '#e6fdff', debris: [53, 101, 119] },
  spikes: { dark: '#3d3a35', mid: '#6d6862', light: '#a5a099', accent: '#8a6a3a', accent2: '#e8e2d6', debris: [109, 104, 98] },
  bombard: { dark: '#33302c', mid: '#5c564e', light: '#8c8478', accent: '#c98a2a', accent2: '#ffd98a', debris: [92, 86, 78] },
  repair: { dark: '#204035', mid: '#356b52', light: '#57a37c', accent: '#ffe08a', accent2: '#fff6d6', debris: [53, 107, 82] },
  sawmill: { dark: '#59401f', mid: '#8d6a34', light: '#bf9553', accent: '#9fd45a', accent2: '#e2ffb0', debris: [141, 106, 52] },
  quarry: { dark: '#403f47', mid: '#6a6875', light: '#9a97a8', accent: '#d3b06a', accent2: '#ffeab8', debris: [106, 104, 117] },
  mint: { dark: '#4b3a15', mid: '#836424', light: '#b9903c', accent: '#ffd93c', accent2: '#fff3b0', debris: [131, 100, 36] },
  // Buffs read as heraldry — cloth and gilt, not masonry — so a player can pick
  // the block that is doing nothing on its own out of a crowded tower.
  banner: { dark: '#3d1c33', mid: '#6f3059', light: '#a3557f', accent: '#ffd35c', accent2: '#fff0bd', debris: [111, 48, 89] },
  obelisk: { dark: '#23203a', mid: '#3f3a63', light: '#6a63a0', accent: '#9be8ff', accent2: '#e6fbff', debris: [63, 58, 99] },

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

  // ── Siege engines ────────────────────────────────────────────────────────
  // Timber-and-iron tones, deliberately close to one another: engines should
  // read as one category of threat that the player answers the same way.
  ram: { dark: '#3a2614', mid: '#6b4522', light: '#9c6a38', accent: '#8a8f96', accent2: '#d6dae0', debris: [107, 69, 34] },
  // Cold, hard iron rather than timber — the palette itself says "arrows will
  // not do anything here" before the player has read a single tooltip.
  ironRam: { dark: '#22262c', mid: '#454c56', light: '#727c8a', accent: '#b9c2cd', accent2: '#eef2f7', debris: [69, 76, 86] },
  ballista: { dark: '#3d2c18', mid: '#705027', light: '#a37a42', accent: '#b8bcc4', accent2: '#eef1f5', debris: [112, 80, 39] },
  catapult: { dark: '#382412', mid: '#68431f', light: '#9a6733', accent: '#c07a2a', accent2: '#ffd08a', debris: [104, 67, 31] },
  siegeTower: { dark: '#33291a', mid: '#5e4a2c', light: '#8c7044', accent: '#9a3a2e', accent2: '#e8a08a', debris: [94, 74, 44] },
  trebuchet: { dark: '#2e2314', mid: '#574024', light: '#856439', accent: '#6a8fbf', accent2: '#cfe2ff', debris: [87, 64, 36] },

  // ── Allies ───────────────────────────────────────────────────────────────
  // Deliberately the brightest, coolest palette on the field: a friendly unit
  // must never be mistaken for something you are supposed to shoot.
  cavalry: { dark: '#123a5e', mid: '#1f6aa8', light: '#42a3e0', accent: '#ffd93c', accent2: '#fff3b0', debris: [31, 106, 168] },

  // ── Ships ──
  // Warm timber hulls with a livery sail, so a harbour reads as the player's
  // even though the tower above it is grey stone.
  skiff: { dark: '#4a3520', mid: '#7d5c34', light: '#b2874d', accent: '#3f7fbf', accent2: '#cfe4ff', debris: [125, 92, 52] },
  longship: { dark: '#42301f', mid: '#755331', light: '#a87d49', accent: '#c1543f', accent2: '#ffd0b0', debris: [117, 83, 49] },
  galley: { dark: '#38301f', mid: '#665534', light: '#96814f', accent: '#d8a12c', accent2: '#ffe6a8', debris: [102, 85, 52] },

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
  siege: 'images/siege'
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
export const spriteFor = (kind: ArtKind, id: string): HTMLImageElement | null => {
  // Before the cache, before the `Image` — with the feature off, not one
  // request is made and the renderer simply keeps drawing.
  if (!enabled) return null

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
    img.addEventListener('load', () => {
      // A zero-size decode is as good as missing.
      if (img.naturalWidth > 0) {
        probe!.state = 'ready'
        probe!.img = img
        // The whole point: whoever painted before this arrived gets to repaint.
        artChanged()
      } else probe!.state = 'missing'
      done()
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
 * The resource glyphs, which the HUD shows before anything else is on screen.
 *
 * They sit in the bar at the top of every single frame of the game, so a
 * hand-painted tower above three flat vector icons is the one mismatch the eye
 * cannot avoid.
 */
const ICON_IDS = ['wood', 'stone', 'gold'] as const

/**
 * Wait for every drop-in bitmap to decode, so the splash can hold for them.
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
  onProgress?: (done: number, total: number) => void
): Promise<void> => {
  if (!enabled) return
  const jobs: Promise<void>[] = []
  const want = (kind: ArtKind, id: string): void => {
    spriteFor(kind, id)
    const p = probes.get(`${kind}/${kind === 'block' ? blockArtBase(id) : id}`)
    if (p) jobs.push(p.settled)
  }
  for (const id of BLOCK_ART_BASES) want('block', id)
  for (const id of BG_IDS) want('bg', id)
  for (const id of ICON_IDS) want('icon', id)

  let done = 0
  const total = jobs.length
  onProgress?.(0, total)
  await Promise.allSettled(jobs.map((j) => j.then(() => { onProgress?.(++done, total) })))
}

/** Kick off override probing for everything the scene might draw, on an idle
 *  slot after first paint. Purely opportunistic — nothing waits on it. */
export const warmSpriteProbes = (blockIds: string[], enemyIds: string[]): void => {
  if (!enabled) return
  for (const id of blockIds) spriteFor('block', id)
  for (const id of enemyIds) spriteFor('enemy', id)
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
