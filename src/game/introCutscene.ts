// ─── The opening cutscene, as data ──────────────────────────────────────────
//
// A player who opens Sandbox Tower is shown a small fort, a hand of blocks and a
// countdown, and is told none of what any of it is FOR. The 2026-09-11 blind
// playtest put numbers on it: not one of ten first-time players was told the
// goal, and every one of them had to infer it from monsters eventually
// arriving — which is a minute after the five seconds in which somebody
// decides whether this is a game they want to play.
//
// `IncomingBanner` says the premise in words. This says it in PICTURES: the
// camera leaves the tower, flies west along the ground the enemy is coming
// over, and shows the player the army — a few scouts, then the first waves,
// then a horde, then a host, and finally the siege train that is going to
// arrive around wave twenty. Then it whips back to the tower and the coach
// marks start, on a player who now knows exactly what the fort is for.
//
// ── Why this file has no imports ──
//
// Everything here is DATA and pure arithmetic: where the cast stands, where
// the camera goes, and what the overlay is saying at a given millisecond. The
// director (`useIntroCutscene`) does the spawning, the camera writes, the
// audio and the teardown; the component does the letterbox and the type.
//
// The split is not tidiness. A cutscene is the single hardest thing in a game
// to check by eye — it runs once per save, it is ten seconds long, and it is
// the first thing a new player sees, so "I watched it and it looked right" is
// the whole of the QA anyone will ever do. Composition, framing, pacing and
// beat boundaries are therefore pinned by tests that need no canvas.

// ─── Framing ────────────────────────────────────────────────────────────────

/**
 * Zoom bounds, in px per world cell.
 *
 * Deliberately the same numbers `useTowerCamera` clamps to. A cinematic frame
 * outside the range the game itself can produce would hand the player back a
 * view that jumps on the first frame after the cutscene.
 */
export const INTRO_ZOOM_MIN = 14
export const INTRO_ZOOM_MAX = 120

/**
 * The tallest slice of world a shot may frame, in cells.
 *
 * This is what makes the cutscene survive a portrait phone. A shot asks for a
 * WIDTH — "frame forty-five cells of army" — and on a 16:9 monitor the height
 * that falls out of it is about twenty-five cells, which is sky, army and a
 * strip of water. Ask the same of a 9:19.5 phone and the height that falls out
 * is sixty-five cells: the army becomes a line of ants along the bottom under
 * fifty cells of empty blue.
 *
 * So the height is capped, and on a narrow screen it — not the width — decides
 * the zoom. A phone then frames about twelve cells instead of forty-five, and
 * sees less of the army at once. That is the right trade and not really a
 * compromise at all: the ranks are laid out by DENSITY (see the tableaus
 * below), so a narrow window into the horde is still visibly a horde, and a
 * trebuchet four cells wide at thirty-five pixels a cell is the most imposing
 * thing a phone screen can be shown.
 */
export const INTRO_MAX_ROWS = 26

/** A camera placement in world space — exactly what `useTowerCamera` holds. */
export interface IntroFrame {
  /** Centre, world cells. */
  x: number
  y: number
  /** Pixels per world cell. */
  zoom: number
}

/**
 * Where a keyframe points the camera.
 *
 * `'home'` is the frame the game itself would have chosen — whatever
 * `snapToFit` produced for this tower on this viewport. The cutscene opens and
 * closes on it so that neither edge of it is a cut: the first frame of the
 * cutscene is the frame the player would have been looking at anyway, and the
 * last one is the frame the game hands back.
 */
export type IntroAnchor =
  | 'home'
  | {
    /** Centre of the shot, world cells (negative: west of the tower). */
    x: number
    /** How much world the shot wants across the screen, in cells. */
    span: number
    /** Where the ground line sits, as a fraction of viewport height. */
    ground: number
  }

/**
 * How the camera travels INTO a keyframe from the one before it.
 *
 *   linear — a sustained pan. The only honest curve for the middle of a
 *            fly-over: any ease across a long travel reads as the camera
 *            hesitating.
 *   in     — leaving a held shot.
 *   out    — arriving and settling.
 *   inOut  — a considered move between two held shots.
 *   whip   — the snap back to the tower. Quintic both ends, so almost the
 *            whole distance is covered in the middle third and the move reads
 *            as a whip-pan rather than as a scroll.
 */
export type IntroEase = 'linear' | 'in' | 'out' | 'inOut' | 'whip'

export interface IntroKey {
  /** Milliseconds from the first frame of the cutscene. */
  at: number
  anchor: IntroAnchor
  /** The curve used to reach this key from the previous one. */
  ease: IntroEase
}

/**
 * The flight.
 *
 * Read it as a shot list. The numbers that matter, and why they are these:
 *
 *   · the pull-back starts SLOW (0 → 800 ms, three cells). A cutscene that
 *     begins already moving reads as the page having scrolled; a beat of
 *     near-stillness on the tower is what makes the departure deliberate.
 *   · the middle (2300 → 5600 ms) is `linear` and covers thirty-four cells.
 *     This is the fly-over proper and it must not ease.
 *   · the span opens from 21 to 45 cells across the flight. The army is drawn
 *     at a constant density, so pulling back IS the "ever growing amounts":
 *     more of them fit on screen every second.
 *   · the siege line is reached at 6900 ms and held, with a slow creep from 41
 *     cells down to 39.5. A dead-still hold on a static tableau reads as the
 *     game having frozen; a fifth of a cell per second reads as a camera.
 *   · the hold is 3.2 s, which is the three seconds the design asks for plus
 *     the beat the horn needs to land.
 *   · the whip home is 400 ms. Under ~300 it is a cut and the player does not
 *     register that they went anywhere; over ~500 it is a scroll.
 */
export const INTRO_KEYS: readonly IntroKey[] = [
  { at: 0, anchor: 'home', ease: 'linear' },
  { at: 800, anchor: { x: -3, span: 21, ground: 0.72 }, ease: 'out' },
  { at: 2300, anchor: { x: -18, span: 30, ground: 0.70 }, ease: 'inOut' },
  { at: 4100, anchor: { x: -35, span: 38, ground: 0.68 }, ease: 'linear' },
  { at: 5600, anchor: { x: -52, span: 45, ground: 0.66 }, ease: 'linear' },
  { at: 6900, anchor: { x: -70, span: 41, ground: 0.64 }, ease: 'out' },
  { at: 10100, anchor: { x: -70.8, span: 39.5, ground: 0.64 }, ease: 'linear' },
  { at: 10500, anchor: 'home', ease: 'whip' },
  // The landing is HELD, and the hold is the point. Two hundred milliseconds
  // of tower was a cut — the camera arrived and the cutscene was over before
  // the player had focused on what it arrived at. This beat is where the
  // riders come home (see `INTRO_RIDERS`), so it has to be long enough to
  // watch three of them cross the frame and vanish into the Gate.
  { at: 12400, anchor: 'home', ease: 'out' }
]

/** Total length of the cutscene, ms. */
export const introDurationMs = (keys: readonly IntroKey[] = INTRO_KEYS): number =>
  keys.length === 0 ? 0 : keys[keys.length - 1]!.at

/**
 * Where the clock jumps to when the player skips.
 *
 * NOT to the end. Skipping cuts the flight, not the landing: the camera still
 * whips back to the tower, so a player who taps out of the cutscene is handed
 * the same arrival — and the same understanding of where they now are — as one
 * who watched it. It costs about half a second and it is the difference
 * between "I skipped an intro" and "the screen changed".
 */
export const introSkipMs = (keys: readonly IntroKey[] = INTRO_KEYS): number => {
  const i = keys.findIndex((k) => k.ease === 'whip')
  // No whip in the list (a tableau-only variant, a test fixture): skipping is
  // then genuinely the end.
  return i > 0 ? keys[i - 1]!.at : introDurationMs(keys)
}

const clamp01 = (u: number): number => (u < 0 ? 0 : u > 1 ? 1 : u)

const easeWith = (kind: IntroEase, u: number): number => {
  const t = clamp01(u)
  switch (kind) {
    case 'in': return t * t * t
    case 'out': return 1 - Math.pow(1 - t, 3)
    case 'inOut': return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    case 'whip': return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2
    default: return t
  }
}

/**
 * Turn an anchor into a camera placement for this viewport.
 *
 * The zoom is the LARGER of what the width wants and what the height cap
 * allows — see `INTRO_MAX_ROWS`. The centre is then whatever puts the ground
 * line at the fraction the shot asked for: `worldToScreenY(0)` is
 * `viewH / 2 + y · zoom`, so `y = viewH · (ground − ½) / zoom`.
 */
export const resolveIntroAnchor = (
  anchor: IntroAnchor, home: IntroFrame, viewW: number, viewH: number
): IntroFrame => {
  if (anchor === 'home' || viewW <= 0 || viewH <= 0) return home
  const wanted = Math.max(viewW / anchor.span, viewH / INTRO_MAX_ROWS)
  const zoom = Math.max(INTRO_ZOOM_MIN, Math.min(INTRO_ZOOM_MAX, wanted))
  return { x: anchor.x, y: (viewH * (anchor.ground - 0.5)) / zoom, zoom }
}

/**
 * The camera at `ms`.
 *
 * Position is lerped; ZOOM IS NOT. Zoom is interpolated geometrically, because
 * the eye reads zoom as a ratio: a linear ramp from 105 px/cell to 35 spends
 * its first half crossing a 1.5× change and its second half crossing a 2×,
 * which is seen as the pull-back accelerating into the horde for no reason.
 */
export const sampleIntroCamera = (
  ms: number, home: IntroFrame, viewW: number, viewH: number,
  keys: readonly IntroKey[] = INTRO_KEYS
): IntroFrame => {
  if (keys.length === 0) return home
  const first = keys[0]!
  if (ms <= first.at) return resolveIntroAnchor(first.anchor, home, viewW, viewH)

  for (let i = 1; i < keys.length; i++) {
    const b = keys[i]!
    if (ms > b.at) continue
    const a = keys[i - 1]!
    const fa = resolveIntroAnchor(a.anchor, home, viewW, viewH)
    const fb = resolveIntroAnchor(b.anchor, home, viewW, viewH)
    const span = Math.max(1, b.at - a.at)
    const u = easeWith(b.ease, (ms - a.at) / span)
    return {
      x: fa.x + (fb.x - fa.x) * u,
      y: fa.y + (fb.y - fa.y) * u,
      // Geometric: equal ratios in equal times.
      zoom: fa.zoom * Math.pow(fb.zoom / fa.zoom, u)
    }
  }
  return resolveIntroAnchor(keys[keys.length - 1]!.anchor, home, viewW, viewH)
}

// ─── Beats ──────────────────────────────────────────────────────────────────

/**
 * What the cutscene is DOING at a moment, for everything that is not the
 * camera: which card is up, when the horn blows, when the letterbox opens.
 *
 * Boundaries are set against the shot list above and are the one part of this
 * file that has to be read alongside it — a card that appears while the camera
 * is still travelling is a caption on a blur.
 */
export type IntroBeat = 'tower' | 'march' | 'horde' | 'siege' | 'whip' | 'land'

/** Start of each beat, ms. Exported so the overlay can cross-fade against
 *  them rather than carrying a second copy of the numbers. */
export const INTRO_BEATS: ReadonlyArray<readonly [IntroBeat, number]> = [
  ['tower', 0],
  ['march', 1500],
  ['horde', 4100],
  ['siege', 6600],
  ['whip', 10100],
  ['land', 10500]
]

export const introBeatAt = (ms: number): IntroBeat => {
  let beat: IntroBeat = 'tower'
  for (const [id, at] of INTRO_BEATS) if (ms >= at) beat = id
  return beat
}

/**
 * When the premise cards are on screen, ms.
 *
 * Three lines across ten seconds, each over a shot that is holding or nearly
 * holding. The fourth thing the player reads is `hud.monstersIncoming`, which
 * is not a card — it is the banner the game already owns, shown here over the
 * siege line instead of over the opening board (see `INTRO_BANNER`).
 */
export interface IntroCard {
  /** i18n key. */
  key: string
  /** On screen from / until, ms. */
  from: number
  to: number
}

export const INTRO_CARDS: readonly IntroCard[] = [
  { key: 'intro.premise', from: 250, to: 2050 },
  { key: 'intro.horde', from: 4300, to: 6100 },
  { key: 'intro.siege', from: 6700, to: 7700 }
]

/** The window `IncomingBanner` owns: the back half of the siege hold. */
export const INTRO_BANNER: readonly [number, number] = [7500, 10100]

/** The moment the siege line is revealed — the horn, and the one shake. */
export const INTRO_SIEGE_HIT_MS = 6600
/** The moment the whip lands back on the tower. */
export const INTRO_LAND_HIT_MS = 10500

export const introCardAt = (ms: number): IntroCard | null => {
  for (const c of INTRO_CARDS) if (ms >= c.from && ms < c.to) return c
  return null
}

/** When a beat begins, ms. For the overlay, which cross-fades against the same
 *  boundaries the director reads rather than carrying its own copy. */
export const introBeatStart = (beat: IntroBeat): number =>
  INTRO_BEATS.find(([id]) => id === beat)?.[1] ?? 0

export const introBannerAt = (ms: number): boolean =>
  ms >= INTRO_BANNER[0] && ms < INTRO_BANNER[1]

// ─── The cast ───────────────────────────────────────────────────────────────

/**
 * One monster standing in the tableau.
 *
 * Nothing here moves. The army is a PHOTOGRAPH of a march — every unit frozen
 * on its own frame of the walk cycle, which is what `pose` picks — and the
 * motion in the shot is entirely the camera's. That is a deliberate choice and
 * not a shortcut: seventy units actually walking would need seventy units'
 * worth of simulation over a ten-second window in which the player can do
 * nothing, and an army marching on the spot at the far end of a pan reads as
 * worse animation, not better. What does move is the sky — flyers keep
 * flapping, because a bat hanging motionless reads as a hung game.
 */
export interface IntroUnit {
  typeId: string
  /** World x, cells. Negative: west of the tower. */
  x: number
  /** World y, cells. Omitted for ground units, which stand on the line. */
  y?: number
  /** Frozen walk-cycle phase. One full cycle is 2π / 2.4 ≈ 2.618. */
  pose: number
}

/** One band of the army, laid out between `far` and `near`. */
export interface IntroRank {
  /** Nearest edge of the band, world cells (negative, closer to the tower). */
  near: number
  /** Furthest edge, world cells (more negative). */
  far: number
  /** Ground units, dealt round-robin across the band. */
  ground: readonly string[]
  /** How many ground units. Density — count over span — is what sells the
   *  rank: 0.6 a cell is a patrol, 1.4 a cell is a wall of bodies. */
  count: number
  /** Flyers over this band. */
  air?: readonly string[]
  airCount?: number
  /** The sky band the flyers occupy, world cells above the ground line. */
  sky?: readonly [number, number]
}

/**
 * Units placed by hand rather than dealt into a band.
 *
 * The siege engines, and only them. Everything else in the tableau is a crowd
 * and a crowd is better scattered, but these are the shot: machines in a
 * deliberate order, biggest last, arranged so the hold frame centres on the
 * trebuchet at every aspect ratio. A phone frames about twelve cells of this
 * and has to land on the right three.
 */
export interface IntroPlacement {
  typeId: string
  x: number
  y?: number
  pose?: number
}

export interface IntroTableau {
  ranks: readonly IntroRank[]
  placed: readonly IntroPlacement[]
}

/**
 * The desktop army.
 *
 * Reading west from the tower, and the whole point is that each band is denser
 * and heavier than the one before it:
 *
 *   −12 … −17   four grumplings, spread out. Wave one, and it looks survivable.
 *   −20 … −29   eight, with runners among them and bats overhead. Wave three.
 *   −31 … −45   thirteen, now with slingers and snaggletusks. This is the first
 *               band that reads as "too many".
 *   −46 … −58   fifteen heavies — bulwarks, brutes, a thornwick — and five
 *               flyers. A host.
 *   −57 … −81   the siege train, with ten escort grumplings walking between the
 *               machines. The escort is not decoration: a trebuchet means
 *               nothing without something human-sized beside it to be four
 *               times the size of, and scale contrast is the only tool a flat
 *               side-on camera has for conveying mass.
 */
export const DESKTOP_TABLEAU: IntroTableau = {
  ranks: [
    { near: -12, far: -17, ground: ['grunt'], count: 4, air: ['bat'], airCount: 1, sky: [3.4, 4.6] },
    { near: -20, far: -29, ground: ['grunt', 'grunt', 'runner'], count: 8, air: ['bat'], airCount: 2, sky: [3.2, 6] },
    {
      near: -31, far: -45,
      ground: ['grunt', 'runner', 'slinger', 'grunt', 'brute', 'runner'],
      count: 13,
      air: ['bat', 'bat', 'wyvern'], airCount: 4, sky: [3, 8]
    },
    {
      near: -46, far: -58,
      ground: ['brute', 'bulwark', 'grunt', 'brute', 'golem', 'bulwark'],
      count: 15,
      air: ['bat', 'wyvern', 'bombardier'], airCount: 5, sky: [3.2, 9.5]
    },
    {
      near: -57, far: -81,
      ground: ['grunt', 'grunt', 'brute'],
      count: 10,
      air: ['wyvern', 'bombardier'], airCount: 4, sky: [5, 11]
    }
  ],
  // Camera holds on x = −70.8. Ordered so the flight meets them lightest
  // first, and so the two biggest straddle the hold centre.
  placed: [
    { typeId: 'ram', x: -60.5 },
    { typeId: 'ballista', x: -63.5 },
    { typeId: 'siegeTower', x: -66.5 },
    { typeId: 'catapult', x: -69.5 },
    { typeId: 'trebuchet', x: -73.5 },
    { typeId: 'ironRam', x: -77.5 },
    { typeId: 'golem', x: -80.5 }
  ]
}

/**
 * The phone army.
 *
 * The Drop & Merge board has no siege engines, no slingers and no sea lane
 * (see `DROPMERGE_ROSTER`), so its cutscene must not promise any of them. The
 * peak is what that board actually escalates to: thornwick golems on the
 * ground and a sky full of wyverns, bombardiers and firebugs — which on a
 * portrait screen, where the sky is two thirds of the frame, is the more
 * frightening picture anyway.
 */
export const DROPMERGE_TABLEAU: IntroTableau = {
  ranks: [
    { near: -12, far: -18, ground: ['grunt'], count: 4, air: ['bat'], airCount: 1, sky: [3.4, 6] },
    { near: -20, far: -30, ground: ['grunt', 'grunt', 'runner'], count: 9, air: ['bat'], airCount: 3, sky: [3.2, 8] },
    {
      near: -31, far: -45,
      ground: ['grunt', 'runner', 'brute', 'grunt', 'bomber', 'runner'],
      count: 14,
      air: ['bat', 'bat', 'wyvern'], airCount: 6, sky: [3, 11]
    },
    {
      near: -46, far: -58,
      ground: ['brute', 'bulwark', 'grunt', 'brute', 'golem', 'bulwark'],
      count: 16,
      air: ['wyvern', 'bombardier', 'bat'], airCount: 7, sky: [3.2, 13]
    },
    {
      near: -59, far: -81,
      ground: ['bulwark', 'brute', 'grunt'],
      count: 12,
      air: ['wyvern', 'bombardier', 'firebug'], airCount: 9, sky: [4, 15]
    }
  ],
  placed: [
    { typeId: 'golem', x: -63 },
    { typeId: 'bulwark', x: -66.5 },
    { typeId: 'golem', x: -70.5 },
    { typeId: 'golem', x: -74.5 },
    { typeId: 'bulwark', x: -78 }
  ]
}

// ─── The fleet ──────────────────────────────────────────────────────────────

/**
 * Hulls moored out on the lake, under the fly-over.
 *
 * Every ship type, twice, so a player who has never opened the tech tree has
 * still watched a skiff, a longship and a galley ride the swell before wave 1.
 * It is the same trick the siege engines play at the far end of the flight —
 * show the player something they cannot build yet — pointed the other way: the
 * engines are a threat to prepare for, the fleet is a thing to want.
 *
 * Grouped into two flotillas rather than scattered as six lone boats. A boat on
 * its own reads as set dressing; three together, in ascending size, read as a
 * fleet and as a ladder — which is exactly what the harbour branch of the tree
 * is.
 *
 * ── Why these x values ──
 *
 * The dock the player can actually moor on is `dockHalfWidth` cells wide, which
 * starts at 3 and reaches single figures fully upgraded. These sit at 24 and 46
 * cells out, so they are unmistakably NOT on the player's water: nobody can
 * mistake them for something they own, and nothing the player later builds can
 * collide with where they were. They also fall inside the horde stretch, so the
 * geometry alone decides when they are on screen — no timing, no state.
 */
export const INTRO_FLEET: readonly IntroPlacement[] = [
  // The near flotilla, under the third rank.
  { typeId: 'skiff', x: -22 },
  { typeId: 'longship', x: -24.6 },
  { typeId: 'galley', x: -27.6 },
  // The far one, out past the host.
  { typeId: 'skiff', x: -43 },
  { typeId: 'longship', x: -45.8 },
  { typeId: 'galley', x: -49 }
]

/** Every hull the fleet puts on the water — what the director has to have art
 *  for before the flight reaches them. */
export const introFleetTypes = (fleet: readonly IntroPlacement[] = INTRO_FLEET): string[] =>
  [...new Set(fleet.map((f) => f.typeId))]

// ─── The riders ─────────────────────────────────────────────────────────────

/**
 * Three knights galloping home into the Gate, on the closing shot.
 *
 * A cavalry sortie played backwards. The player has been shown, in order: the
 * tower, the horde, and the siege train that outranges everything the tower
 * can ever build — which is a problem with no visible answer. The riders are
 * the answer, arriving before the question has been asked: something leaves
 * this tower, and it comes back.
 *
 * ── The numbers ──
 *
 * They are created while the camera is still on the engines and start running
 * before it turns round, so they are already mid-gallop when it lands — a
 * cutscene that ended on three horses standing still, waiting to be looked at,
 * would be a diorama rather than an arrival.
 *
 * `speed` is faster than the real `ALLY_DEFS.cavalry.speed` of 2.6 cells a
 * second, deliberately. That figure is tuned for riding OUT across an open
 * field under fire; this is the last two seconds of an introduction, the frame
 * around the tower is only about seven cells wide at the opening zoom, and at
 * 2.6 the closing shot would be four seconds of horse. A charge home is
 * allowed to be quicker than a patrol.
 *
 * They enter from the RIGHT — the empty flank. Every monster in the tableau is
 * west of the tower, so the riders cross ground the player has just been shown
 * is clear, which is what makes them read as friendly before the art has to.
 */
export const INTRO_RIDERS = {
  count: 3,
  /**
   * Where the leading rider starts, cells east of the Gate.
   *
   * Inside the nearest monster rank, which sits about 12 cells west. That is a
   * deliberate constraint rather than a coincidence: the riders have to read as
   * belonging to the tower, and a horseman further out than the horde reads as
   * another thing arriving from the horizon. Nine cells also keeps the whole
   * squad within a couple of cells of the opening frame's edge, so they enter
   * from the right rather than being discovered already halfway home.
   */
  startX: 9,
  /** How far behind it each following rider begins. */
  gap: 1,
  /** Cells a second. */
  speed: 5,
  /** When they are put on the field — mid siege-hold, off camera. */
  spawnAt: INTRO_SIEGE_HIT_MS,
  /** When they start moving. */
  runFrom: 9700,
  /** How long the vanish into the Gate takes, ms. */
  fadeMs: 280
} as const

/** Where rider `i` is, and how far into its vanish, at `ms`. */
export interface IntroRider {
  x: number
  /** 1 while riding, falling to 0 as it disappears into the Gate. */
  alpha: number
  /** Past the Gate and fully gone. */
  done: boolean
}

/**
 * Rider `i` at `ms` — pure, so the whole closing shot can be checked frame by
 * frame without a canvas.
 *
 * Position is derived from the clock rather than integrated per frame, which is
 * what makes a SKIP correct for free: a player who taps out at second three
 * jumps the clock to the whip, and the riders are simply wherever that
 * millisecond says they are.
 */
export const introRiderAt = (i: number, ms: number): IntroRider => {
  const r = INTRO_RIDERS
  const from = r.startX + r.gap * i
  const ran = Math.max(0, ms - r.runFrom) * (r.speed / 1000)
  const x = from - ran
  if (x > 0) return { x, alpha: 1, done: false }
  // Past the Gate: held AT it, fading, rather than riding on through the
  // foundation and out the other side.
  const over = -x / (r.speed / 1000)
  const alpha = Math.max(0, 1 - over / r.fadeMs)
  return { x: 0, alpha, done: alpha <= 0 }
}

/** mulberry32 — the same generator the wave director uses, inlined so this
 *  module keeps its "no imports" property. */
const rngFrom = (seed: number): (() => number) => {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** One full walk cycle in `Enemy.phase` units — `drawEnemy` reads the strip at
 *  `phase · 2.4 / 2π`. */
export const INTRO_POSE_CYCLE = (Math.PI * 2) / 2.4

/**
 * Lay the army out.
 *
 * Deterministic for a given seed, and that is load-bearing rather than a
 * convenience: this tableau is the first thing a player ever sees, it is the
 * frame every store screenshot and preview video will be cut from, and a
 * composition that reshuffles on every load cannot be art-directed at all.
 *
 * Units are spread EVENLY across their band with a jitter of well under one
 * slot, so the rank keeps its density — a purely random scatter clumps, and a
 * clump in one place means a hole somewhere else, which on a slow pan reads as
 * the army having a gap in it.
 */
export const buildIntroCast = (
  tableau: IntroTableau = DESKTOP_TABLEAU, seed = 20260915
): IntroUnit[] => {
  const rng = rngFrom(seed)
  const out: IntroUnit[] = []

  for (const rank of tableau.ranks) {
    const span = Math.abs(rank.far - rank.near)
    const step = rank.count > 1 ? span / (rank.count - 1) : 0
    for (let i = 0; i < rank.count; i++) {
      const jitter = (rng() - 0.5) * step * 0.55
      out.push({
        typeId: rank.ground[i % rank.ground.length]!,
        x: rank.near - step * i + jitter,
        pose: rng() * INTRO_POSE_CYCLE
      })
    }

    const airCount = rank.airCount ?? 0
    if (!rank.air || airCount === 0) continue
    const [loY, hiY] = rank.sky ?? [3, 8]
    const airStep = airCount > 1 ? span / (airCount - 1) : 0
    for (let i = 0; i < airCount; i++) {
      out.push({
        typeId: rank.air[i % rank.air.length]!,
        x: rank.near - airStep * i + (rng() - 0.5) * Math.max(1, airStep) * 0.8,
        y: loY + rng() * Math.max(0, hiY - loY),
        pose: rng() * INTRO_POSE_CYCLE
      })
    }
  }

  for (const p of tableau.placed) {
    out.push({ typeId: p.typeId, x: p.x, y: p.y, pose: p.pose ?? rng() * INTRO_POSE_CYCLE })
  }

  return out
}

/** Every distinct enemy type the tableau puts on screen — what the director
 *  has to have art and baked strips for before the flight reaches it. */
export const introCastTypes = (tableau: IntroTableau = DESKTOP_TABLEAU): string[] => {
  const ids = new Set<string>()
  for (const rank of tableau.ranks) {
    for (const id of rank.ground) ids.add(id)
    for (const id of rank.air ?? []) ids.add(id)
  }
  for (const p of tableau.placed) ids.add(p.typeId)
  return [...ids]
}
