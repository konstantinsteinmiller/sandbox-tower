import { ART_FOLDERS } from '@/game/art'
import { BACKGROUND_RULE, STYLE_HEAD } from '@/game/artSheet'

/**
 * ─── Promotion manifest — the art that goes OUTSIDE the game ────────────────
 *
 * A side step of the art pipeline (`tools/art-promotion.mjs`, `pnpm
 * art:promotion`), and a side step on purpose: nothing here is a drawable. The
 * renderer never probes for any of it, the slicer never cuts it, `spriteFor`
 * has never heard of it. These are the images a PORTAL asks for — the cover
 * tile on CrazyGames' grid, Poki's landscape hero, GamePix's 512x384 thumb —
 * and they live in `src/assets/promotion/` where a submission picks them up,
 * not in `public/` where a build would ship them to every player.
 *
 *   plate (the game's own painted cast, composited at the target aspect)
 *         → painter (the Art Desk's Gemini window, one generation per aspect)
 *         → master in `art-sheets/promotion/painted/`
 *         → every deliverable size cut from its OWN family's master
 *         → jpg + webp, compressed by `scripts/compress-images.mjs`
 *
 * THREE RULES THIS FILE EXISTS TO HOLD:
 *
 * 1. NO TEXT, NO UI, NO LOGO in a cover. Every portal typesets the game's name
 *    over the art itself; a painted title crosses theirs, and it is the one
 *    thing that gets a cover rejected before anybody judges the art. The logo
 *    is a SEPARATE deliverable in this same folder.
 * 2. A DELIVERABLE IS ONLY EVER CUT FROM ITS OWN ASPECT. An aspect FAMILY is
 *    painted once and every size in it is a resize, never a reframe.
 * 3. THE PLATE IS THE FALLBACK. A cover with no painting is still written, from
 *    the plate, so `src/assets/promotion/` is never half a folder.
 *
 * Sandbox Tower is played SIDE-ON — bugs walk in along the sand from the right
 * toward a sandcastle on the left — so unlike a top-down game the plate is a
 * scene, not a tiled floor: sky, the neighbours' roofs, the fence and trees,
 * the sand, the castle, the cast. `tools/art-promotion.mjs` builds it from
 * `COVER_SCENES` below.
 *
 * Loadable under plain Node (`tools/ts-resolve.mjs`) like `artSheet.ts`.
 */

// ─── Shapes ─────────────────────────────────────────────────────────────────

export interface CoverSize {
  w: number
  h: number
}

/**
 * One sprite laid onto a plate. `size` is a fraction of the plate's SHORT
 * side, so the same cast lands at the same physical size whether the plate is
 * lying down or standing up.
 */
export interface PlateLayer {
  /** Path under `public/` — a painted sprite the game already ships. */
  src?: string
  /** Or an inline SVG, for the one prop no sprite carries (the balloon). */
  svg?: string
  /** Centre of the layer, as a fraction of the plate. */
  cx: number
  cy: number
  /** Width, as a fraction of the plate's short side. */
  size: number
  rotate?: number
  opacity?: number
  /** Frames in a horizontal strip (a walk is 8). Default 1. */
  frames?: number
  frame?: number
  /** Mirror left-right: a front-facing flyer can head either way. */
  flip?: boolean
}

/** A block of the sandcastle, and the toy standing on it, if any. */
export interface CastleBlock {
  block: string
  fixture?: string
}

/**
 * The sandcastle, as the game stacks it: rows of block bodies from the ground
 * up, each toy standing on its own block. Positions in the same units as a
 * layer — `cx`/`base` as plate fractions, `cell` as a fraction of the short side.
 */
export interface CastleSpec {
  cx: number
  /** Where the bottom row stands, as a fraction of the plate height. */
  base: number
  cell: number
  /** Bottom row first. Each row is centred on `cx`. */
  rows: CastleBlock[][]
}

export interface CoverScene {
  /** Where the sand meets the fence, as a fraction of the plate height. */
  horizon: number
  /** Height of the fence-and-trees band, as a fraction of the plate height. */
  near: number
  /** Height of the rooftops band, as a fraction of the plate height. */
  far: number
  castle: CastleSpec
  /** Painted back to front: supporting cast, then the hero, then the foreground. */
  layers: PlateLayer[]
  /** Where the eye is meant to land — the hero's face. The glow pools here and
   *  the vignette darkens away from it. */
  focus: { x: number; y: number }
}

export interface CoverAspect {
  /** `16x9` — the id everything keys on, and the plate's filename. */
  id: string
  label: string
  /** The plate handed to the painter. Its shape is what makes the return come
   *  back at this aspect: an image model follows the reference it is given far
   *  more reliably than a ratio written in words. */
  plate: CoverSize
  sizes: CoverSize[]
  shape: 'landscape' | 'portrait' | 'square'
  shot: string[]
}

// ─── The cast on a plate ────────────────────────────────────────────────────
//
// Every sprite here is one the game already ships, painted. Handing the painter
// a photograph of THIS cast is the difference between a cover of Sandbox Tower
// and a cover of some other bug game.

export const COVER_BACKDROP = {
  far: `${ART_FOLDERS.bg}/mountains-far.webp`,
  near: `${ART_FOLDERS.bg}/mountains-near.webp`,
  sand: `${ART_FOLDERS.bg}/grass.webp`,
  sun: `${ART_FOLDERS.bg}/sun.webp`
}

/** The hero: the Stag Beetle, the boss. The biggest silhouette in the cast and
 *  the one design drawn FACING the viewer, which is what a cover needs — the
 *  face is the hook, and a profile has half a face. */
const HERO = 'images/monsters/thornwick.webp'

const bug = (id: string, cx: number, cy: number, size: number, frame = 0, flip = false): PlateLayer =>
  ({ src: `images/monsters/${id}.webp`, cx, cy, size, frames: 8, frame, flip })

const hero = (cx: number, cy: number, size: number): PlateLayer =>
  ({ src: HERO, cx, cy, size, frames: 8, frame: 2 })

/** The water balloon, mid-air, a hand's breadth above the hero's head. No
 *  sprite carries it (the launcher fires a drawn one), so the plate paints a
 *  plain stand-in: a round, tied, glossy balloon with three speed streaks. */
const BALLOON_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">',
  '<g stroke="#3b2a21" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.8">',
  '<path d="M52 30 L20 8"/><path d="M40 52 L6 38"/><path d="M70 22 L50 2"/></g>',
  '<path d="M120 170 l-10 16 l22 0 z" fill="#e8455a" stroke="#3b2a21" stroke-width="5" stroke-linejoin="round"/>',
  '<ellipse cx="118" cy="104" rx="62" ry="68" fill="#ff5a6e" stroke="#3b2a21" stroke-width="7"/>',
  '<ellipse cx="96" cy="78" rx="18" ry="24" fill="#ffd3da" opacity="0.9"/>',
  '<ellipse cx="140" cy="140" rx="30" ry="18" fill="#d93550" opacity="0.5"/>',
  '</svg>'
].join('')

const balloon = (cx: number, cy: number, size: number): PlateLayer => ({ svg: BALLOON_SVG, cx, cy, size })

/** The castle every cover defends: the Castle Gate in the middle of the ground
 *  row, the Squirt Gun and the Dart Blaster above it, and the Balloon Launcher
 *  on top — the toy that has just fired the balloon. */
const castle = (cx: number, base: number, cell: number, wide = true): CastleSpec => ({
  cx, base, cell,
  rows: wide
    ? [
        [{ block: 'stone' }, { block: 'gate' }, { block: 'wood' }],
        [{ block: 'cannon', fixture: 'cannon' }, { block: 'archer', fixture: 'archer' }],
        [{ block: 'bombard', fixture: 'bombard' }]
      ]
    : [
        [{ block: 'gate' }, { block: 'stone' }],
        [{ block: 'cannon', fixture: 'cannon' }],
        [{ block: 'bombard', fixture: 'bombard' }]
      ]
})

/**
 * LANDSCAPE — 16:9, 4:3, 3:2. The castle holds the left, the beetle charges
 * in from the right of centre, and the balloon hangs between them above its
 * head — the diagonal from the launcher, through the balloon, down to the face.
 */
const LANDSCAPE: CoverScene = {
  horizon: 0.56,
  near: 0.36,
  far: 0.30,
  castle: castle(0.2, 0.84, 0.2),
  layers: [
    bug('skewer', 0.86, 0.22, 0.24),
    bug('wispling', 0.40, 0.2, 0.16, 3),
    bug('grumpling', 0.85, 0.74, 0.2, 1),
    bug('rattlejack', 0.97, 0.66, 0.18, 4),
    bug('grumpling', 0.36, 0.86, 0.18, 5),
    hero(0.6, 0.66, 0.66),
    balloon(0.52, 0.18, 0.2),
    // Foreground, big and cropped by the frame: the third plane of depth.
    bug('cinderhound', 0.92, 0.9, 0.5, 2)
  ],
  focus: { x: 0.58, y: 0.5 }
}

/**
 * PORTRAIT — 9:16, 2:3. One vertical gesture read top to bottom: the balloon
 * high in the frame, falling STRAIGHT down onto the beetle, who fills the
 * lower middle looking up at it. The castle stands small at the left, cropped
 * by the frame, so it is there without competing.
 */
const PORTRAIT: CoverScene = {
  horizon: 0.5,
  near: 0.24,
  far: 0.18,
  castle: castle(0.14, 0.64, 0.24, false),
  layers: [
    bug('skewer', 0.84, 0.12, 0.34),
    bug('grumpling', 0.86, 0.6, 0.28, 1),
    bug('grumpling', 0.2, 0.9, 0.3, 5),
    hero(0.56, 0.72, 0.92),
    balloon(0.5, 0.26, 0.32),
    bug('cinderhound', 0.88, 0.9, 0.62, 2)
  ],
  focus: { x: 0.55, y: 0.6 }
}

/** SQUARE — 1:1. The landscape pulled in tight: the beetle and the balloon fill
 *  most of the square, the castle is a corner of it, three supporting bugs. */
const SQUARE: CoverScene = {
  horizon: 0.5,
  near: 0.34,
  far: 0.26,
  // Low and a little smaller: stacked to near the top edge, the first return
  // tore the top two blocks off the castle and flew them round the sky.
  castle: castle(0.14, 0.9, 0.19, false),
  layers: [
    bug('skewer', 0.86, 0.14, 0.26),
    bug('grumpling', 0.9, 0.72, 0.22, 1),
    hero(0.6, 0.66, 0.74),
    balloon(0.5, 0.16, 0.22),
    bug('cinderhound', 0.9, 0.9, 0.48, 2)
  ],
  focus: { x: 0.58, y: 0.52 }
}

export const COVER_SCENES: Record<CoverAspect['shape'], CoverScene> = {
  landscape: LANDSCAPE,
  portrait: PORTRAIT,
  square: SQUARE
}

// ─── The six families ───────────────────────────────────────────────────────
//
// Each plate is its family's largest deliverable or an exact multiple of it, so
// the cut from master to deliverable is a clean downscale.

export const COVER_ASPECTS: CoverAspect[] = [
  {
    id: '16x9',
    label: '16:9 landscape',
    plate: { w: 1920, h: 1080 },
    sizes: [{ w: 1920, h: 1080 }],
    shape: 'landscape',
    shot: [
      'A WIDE LANDSCAPE SHOT. This is the big hero image on a game page, the one',
      'that runs full width above the fold, so it has room for the siege and must',
      'use it: the sandcastle holding the left, the stag beetle charging in right of',
      'centre, bugs swarming along the sand all the way out to the right edge.'
    ]
  },
  {
    id: '9x16',
    label: '9:16 portrait',
    plate: { w: 1080, h: 1920 },
    sizes: [{ w: 1080, h: 1920 }],
    shape: 'portrait',
    shot: [
      'A TALL PORTRAIT SHOT, the shape of a phone held upright. Build it as ONE',
      'vertical gesture read from top to bottom: the water balloon high in the frame',
      'falling STRAIGHT down, the stag beetle filling the lower middle and looking',
      'up at it, and the gap between them is the whole story. Do not lay the',
      'landscape composition on its side, and keep everything important out of the',
      'left and right margins of a frame this narrow.',
      'THE BEETLE IS HUGE, exactly as big as the plate draws it: its body and jaws',
      'span at least three quarters of the frame\'s width and it fills most of the',
      'lower half. Do not pull the camera back to fit more in. The castle stays',
      'where the plate has it — a narrow stack at the left edge, cropped by the',
      'frame — never a wall of blocks lined up across the picture behind the beetle.',
      '(The first tall return zoomed out: a small beetle in front of a block wall.)'
    ]
  },
  {
    id: '2x3',
    label: '2:3 portrait',
    plate: { w: 1024, h: 1536 },
    sizes: [{ w: 800, h: 1200 }],
    shape: 'portrait',
    shot: [
      'A PORTRAIT POSTER, a little wider than a phone screen. The same vertical',
      'gesture as the tall one — balloon above, beetle below looking up — with',
      'enough width for the sandcastle at the left and an ant or two at the right.'
    ]
  },
  {
    id: '1x1',
    label: '1:1 square',
    plate: { w: 1024, h: 1024 },
    sizes: [
      { w: 800, h: 800 },
      { w: 628, h: 628 },
      { w: 600, h: 600 },
      { w: 512, h: 512 }
    ],
    shape: 'square',
    shot: [
      'A SQUARE TILE. It sits in a grid of forty other squares and has to win, shown',
      'as small as 250 pixels across. Crop in HARDER than the wide shot: the beetle',
      'and the balloon above it fill most of the square, the sandcastle is a corner',
      'of it, the supporting bugs are few and large, and there is no empty sky or sand.'
    ]
  },
  {
    id: '4x3',
    label: '4:3 landscape',
    plate: { w: 1024, h: 768 },
    sizes: [{ w: 512, h: 384 }],
    shape: 'landscape',
    shot: [
      'A SLIGHTLY BOXY LANDSCAPE THUMBNAIL, shown small — 512 pixels wide at most.',
      'Fewer things, each one bigger. The beetle, the balloon and the castle carry',
      'the whole image; three supporting bugs is plenty and six is mud at this size.'
    ]
  },
  {
    id: '3x2',
    label: '3:2 landscape',
    plate: { w: 1024, h: 680 },
    sizes: [{ w: 512, h: 340 }],
    shape: 'landscape',
    shot: [
      'A WIDE LANDSCAPE THUMBNAIL, shown small and short — 512 pixels wide at most.',
      'Keep the castle, the balloon and the beetle\'s face on one band through the',
      'middle of the frame: the top and bottom edges of a strip this shallow are the',
      'first thing a portal crops.'
    ]
  }
]

export const coverDeliverables = (): Array<{ aspect: CoverAspect; size: CoverSize }> =>
  COVER_ASPECTS.flatMap((aspect) => aspect.sizes.map((size) => ({ aspect, size })))

export const COVER_FORMATS = ['jpg', 'webp'] as const
export type CoverFormat = (typeof COVER_FORMATS)[number]

/** `cover-1920x1080.jpg` — the size is in the name because the thing on the
 *  other end of this folder is a file picker in a submission form. */
export const coverFile = (size: CoverSize, format: CoverFormat | string): string =>
  `cover-${size.w}x${size.h}.${format}`

export const plateStem = (aspect: CoverAspect): string => `cover-${aspect.id}`

// ─── The brand files ────────────────────────────────────────────────────────
//
// NOT REPAINTED HERE: resizes of the shipped sandbox logo, so a store page's
// logo is the game's logo and not a second generation of it. There is no
// separate mark yet, so the favicon comes from the logo too.

export interface BrandDeliverable {
  file: string
  from: string[]
  size: number
  format: 'png' | 'webp' | 'ico'
  what: string
}

export const BRAND_DELIVERABLES: BrandDeliverable[] = [
  { file: 'logo_512x512.png', from: ['images/logo/logo_512x512.png'], size: 512, format: 'png', what: 'the logo at full size — the one a store page shows' },
  { file: 'logo_256x256.webp', from: ['images/logo/logo_256x256.webp', 'images/logo/logo_512x512.png'], size: 256, format: 'webp', what: 'the logo for anywhere that takes webp' },
  { file: 'logo_192x192.png', from: ['images/logo/logo_192x192.png', 'images/logo/logo_512x512.png'], size: 192, format: 'png', what: 'the logo at PWA icon size' },
  { file: 'favicon.ico', from: ['images/logo/logo_512x512.png'], size: 128, format: 'ico', what: 'the tab icon' }
]

// ─── The wordmark ───────────────────────────────────────────────────────────
//
// The game's TITLE, as lettering — which Sandbox Tower did not have: the
// sandcastle logo above is an app icon with no name on it, and the only title
// art on disk was still Tower Siege's stone letters (`src/assets/art/logo/`,
// gitignored; sent to the Recycle Bin on 2026-09-27). The plain covers carry no title by rule 1; the LOGO covers
// (`cover-logo-*`, and GameMonetize's sizes, whose grid shows the image alone)
// carry this one, composited, never painted into the cover.
//
// Painted on magenta and keyed, like a sprite, so it can sit on any cover.

export const WORDMARK = {
  stem: 'wordmark',
  plate: { w: 1536, h: 768 },
  lines: ['SANDBOX', 'TOWER'] as const,
  /** The finish reference: the icon, so the lettering is the same hand. */
  styleRef: 'public/images/logo/logo_512x512.png',
  /** The keyed deliverable, trimmed to the lettering. */
  file: 'wordmark.png'
}

/**
 * Where the wordmark sits on each LOGO cover: centre as a fraction of the
 * image, width as a fraction of its width. Chosen per painting, and the rule
 * each one keeps is the same: the beetle's face and the balloon stay clear.
 * Landscape shots put it over the castle's foot and the sand in front of it;
 * the portraits put it in the open sky, because their beetle fills the bottom.
 */
export interface LogoPlacement { cx: number; cy: number; w: number }

export const LOGO_ON_COVER: Record<string, LogoPlacement> = {
  '16x9': { cx: 0.23, cy: 0.84, w: 0.36 },
  '9x16': { cx: 0.5, cy: 0.11, w: 0.84 },
  '2x3': { cx: 0.6, cy: 0.095, w: 0.58 },
  '1x1': { cx: 0.5, cy: 0.86, w: 0.62 },
  '4x3': { cx: 0.26, cy: 0.85, w: 0.42 },
  '3x2': { cx: 0.24, cy: 0.85, w: 0.4 }
}

/** `cover-logo-1920x1080.jpg` — the same sizes as the plain covers. */
export const logoCoverFile = (size: CoverSize, format: string): string =>
  `cover-logo-${size.w}x${size.h}.${format}`

/**
 * GameMonetize's own set, in one folder a submission can be pointed at. Its
 * catalogue shows the image alone, so every one of them carries the title.
 * 1280x550 and 200x120 are not any family's aspect; they are cut from the
 * closest one (16:9) with a centred crop, and carry their own placement.
 */
export const LOGO_EXTRAS: Array<{ file: string; from: string; size: CoverSize; place: LogoPlacement }> = [
  { file: 'gamemonetize/cover-logo-1280x720', from: '16x9', size: { w: 1280, h: 720 }, place: LOGO_ON_COVER['16x9']! },
  { file: 'gamemonetize/cover-logo-1280x550', from: '16x9', size: { w: 1280, h: 550 }, place: { cx: 0.2, cy: 0.8, w: 0.3 } },
  { file: 'gamemonetize/cover-logo-512x512', from: '1x1', size: { w: 512, h: 512 }, place: LOGO_ON_COVER['1x1']! },
  { file: 'gamemonetize/cover-logo-512x384', from: '4x3', size: { w: 512, h: 384 }, place: LOGO_ON_COVER['4x3']! },
  { file: 'gamemonetize/cover-logo-512x340', from: '3x2', size: { w: 512, h: 340 }, place: LOGO_ON_COVER['3x2']! },
  { file: 'gamemonetize/cover-logo-200x120', from: '16x9', size: { w: 200, h: 120 }, place: { cx: 0.28, cy: 0.78, w: 0.52 } }
]

export const promptForWordmark = (): string => [
  'WHAT COMES BACK',
  `ONE image, ${WORDMARK.plate.w} x ${WORDMARK.plate.h} pixels (2:1): the title lettering of a`,
  'game and nothing else, on a flat magenta ground. Not a sheet of options, not',
  'two versions, not a logo on a badge, card, banner or sign.',
  '',
  'WHAT IT SAYS — exactly this, and every letter must be right:',
  `· Line 1: "${WORDMARK.lines[0]}" — S A N D B O X, seven letters.`,
  `· Line 2: "${WORDMARK.lines[1]}" — T O W E R, five letters, centred under line 1.`,
  '· No other word, letter, number, tagline, trademark sign or signature anywhere.',
  '',
  'READ THE ATTACHED IMAGES',
  '· The FIRST image is the game\'s app icon — a FINISH reference only. Match its',
  '  hand: warm sand, warm dark-brown ink, sunny toy colours. Do not copy its',
  '  castle, its sky or its rounded tile into the picture.',
  '· The LAST image is the LAYOUT: two lines of plain letters on magenta, showing',
  '  where the words go and how big they are. Follow the layout and the spelling;',
  '  replace the plain letters with the lettering described below. Its typeface is',
  '  a PLACEHOLDER — do not trace it. A return that is the same stiff, straight',
  '  letters with sand texture laid on is unusable (that is what the first one',
  '  was): redraw every letter rounder, softer and bouncier, as described below.',
  '',
  'THE LETTERING',
  '· Chunky, rounded, bouncy CAPITAL letters that look MOULDED FROM PACKED SAND,',
  '  like the game\'s sand blocks: warm pale sand (#f3dca8) with a lighter packed top',
  '  edge, fine grain speckle and a deeper warm sand (#dcb676, #ab7c42) on the',
  '  underside of each letter.',
  '· A thick warm dark-brown ink contour (#3b2a21) round every letter, and outside',
  '  it a second thick RIM in bright toy plastic — sunny orange (#ff8a2b) for',
  '  SANDBOX and grass green (#43b649) for TOWER — the coloured rims the game\'s',
  '  blocks wear.',
  '· EVERY LETTER IS FILLED WITH SAND — all twelve of them, the last R included.',
  '  The toy colour is only the RIM round the outside; no letter is filled with',
  '  orange or green. (The first return filled the final R solid green.)',
  '· A little red pennant flag (like the one on the icon\'s castle) planted in the',
  '  top of the letter O in TOWER — the second letter of TOWER, not the W. Nothing',
  '  else decorates it.',
  '· A playful bounce: letters tilt a few degrees either way and sit slightly off',
  '  the line, but every letter stays upright enough to read instantly.',
  '· It has to read at 200 pixels wide: bold, simple shapes, big counters in the',
  '  A, O, B and R, no thin strokes, no fine texture that turns to noise.',
  '',
  STYLE_HEAD.map((l) => l.replace('Match this in every square:', 'Match this in the lettering:')).join('\n'),
  '',
  BACKGROUND_RULE,
  '',
  'CHECK BEFORE YOU ANSWER',
  `· Does it say exactly "${WORDMARK.lines[0]}" over "${WORDMARK.lines[1]}", every letter right?`,
  '· Is everything around the letters flat #FF00FF magenta, with no shadow on it?',
  '',
  'OUTPUT',
  `One image, ${WORDMARK.plate.w} x ${WORDMARK.plate.h} pixels, 2:1. No other text, no border.`
].join('\n')

// ─── The prompt ─────────────────────────────────────────────────────────────

const DELIVERABLE = (a: CoverAspect): string[] => [
  'WHAT COMES BACK',
  `ONE finished piece of cover art, ${a.plate.w} x ${a.plate.h} pixels, exactly`,
  `${a.label}, filled edge to edge. One single image and nothing else — not a`,
  'sheet of options, not a grid, not two versions side by side, not a mock-up of a',
  'store page or a phone, not a poster with a border or a mount around it. The',
  'painting runs all the way to all four edges.'
]

const EXCLUSIONS = [
  'WHAT IS NOT IN IT',
  '· NO TEXT ANYWHERE. No title, no game name, no tagline, no caption, no number,',
  '  no word on a sign, a flag or a banner, no signature, no watermark, no studio',
  '  mark, no age rating. Every portal typesets the game\'s name over this art in',
  '  its own type, and a painted title crosses theirs — it is the single most',
  '  common reason a cover is sent back before anybody has looked at the art.',
  '· NO LOGO and no wordmark. The logo is a separate file delivered beside this one.',
  '· NO USER INTERFACE of any kind: no buttons, no score, no coin or resource',
  '  counter, no timer, no health bar, no wave number, no build tray, no tutorial',
  '  hand, no arrows, no HUD panel, no phone or browser frame around the art.',
  '· No border, no frame, no rounded corners, no drop shadow around the image',
  '  itself, no letterboxing, no bars. The art IS the whole rectangle.'
]

const CLICKABLE = [
  'WHAT MAKES IT CLICKABLE — this is the whole job',
  'This image is seen about 250 pixels wide, for a fifth of a second, in a grid of',
  'forty other games. Everything below is about winning THAT look, not about being',
  'a nice illustration at full size.',
  '· ONE subject, enormous. The stag beetle and the balloon about to hit it',
  '  together fill at least half the frame. A busy scene of a dozen equal bugs',
  '  reads as noise and is skipped; one huge beetle about to get soaked is read',
  '  instantly.',
  '· THE FACE IS THE HOOK. The beetle faces us in close-up, looking UP at the',
  '  balloon with a huge comic "uh-oh" — eyes enormous and round, pupils tiny,',
  '  jaws dropped open, one bead of sweat flying off. Funny panic, never fear and',
  '  never horror. That face is the first thing a player sees and the reason they',
  '  click.',
  '· THE MOMENT IS THE ONE BEFORE. The balloon has NOT burst. It is in mid-flight',
  '  a hand\'s breadth above the beetle\'s head, falling, wobbling, speed streaks',
  '  trailing back up toward the launcher on top of the castle. It was THROWN — it',
  '  is not tied to anything and hangs from no string. A splash already finished',
  '  has no tension left in it.',
  '· MAXIMUM CONTRAST WHERE THE EYE LANDS. The glossy red balloon sits directly',
  '  against the beetle\'s dark chestnut head and the bright sky behind it, so the',
  '  strongest meeting of colours in the whole image is exactly at the focal point.',
  '· EVERYTHING POINTS AT IT. The balloon\'s arc from the castle, the ants',
  '  scattering away from the beetle, sand kicked up behind its charge — every',
  '  line in the picture leads back to the beetle\'s face and the balloon.',
  '· THREE PLANES OF DEPTH. A cockroach large, sharp and cropped by the frame in',
  '  the foreground; the beetle, the balloon and the castle crisp in the middle;',
  '  the fence, the trees and the neighbours\' roofs softer behind.',
  '· A BRIGHT CENTRE. A sunny glow behind the beetle and the balloon; the corners',
  '  a touch darker and calmer, so the centre is the brightest part of the image.',
  '· NOTHING IMPORTANT IN THE OUTER EIGHTH of the frame, on any side. Portals crop',
  '  this image to shapes nobody warned us about, and what gets cut is whatever',
  '  was nearest the edge.'
]

const READ_THE_PLATE = [
  'READ THE ATTACHED PLATE',
  'The attached image is a BLOCKING PLATE, not a painting to copy. Every creature,',
  'block, toy and backdrop in it is the game\'s own artwork, dropped in at the size',
  'and the place it belongs. Take from it, exactly:',
  '· WHO IS IN IT. The stag beetle with its huge curved antler-jaws, the black ants,',
  '  the red ant, the hornet, the mosquito and the cockroach — these specific',
  '  creatures, with these silhouettes, these colours and these numbers of legs.',
  '  A player has spent an hour looking at them; a cover showing different',
  '  insects is a cover of a different game. The red balloon is the one thing on',
  '  the plate that is a plain stand-in: paint it as a real water balloon.',
  '· THE CASTLE IS THE GAME\'S OWN, BLOCK FOR BLOCK. It is built from the exact',
  '  square blocks on the plate: flat-faced cubes of sand stacked in rows, each with',
  '  rounded corners and a thick coloured RIM round its edge (green, orange, teal,',
  '  grey, gold), the gate block with its lit arch and scallop shell at the bottom,',
  '  and the toys standing on the blocks above it — the green squirt gun, the',
  '  orange dart blaster and, on top, the water-balloon launcher that has just',
  '  fired. Keep every block\'s rim, its colour and its square shape. It is NOT a',
  '  classic sandcastle: no turrets, no towers, no bucket shapes, no crenellated',
  '  walls, no brick courses, no moulded sand hill. A player recognises the game',
  '  by these blocks; a generic sandcastle is a cover of some other game.',
  '  (The first square return painted a generic sandcastle with the toys on it.)',
  '· WHERE THINGS ARE. The castle, the beetle, the balloon and the scattering bugs',
  '  stay roughly where the plate puts them, at roughly the size the plate gives them.',
  '  The castle is ONE stack standing on the sand: every block rests on the one',
  '  below it, and no block or toy floats loose in the air.',
  '· THE WHOLE BEETLE IS PAINTED. Body, legs and jaws get the same finished paint',
  '  and ink as its face — no part of it may be left as the plate\'s flat sprite.',
  '· WHAT THE PLACE IS. A sunny backyard sandbox: warm pale sand, a white picket',
  '  fence with a clipped hedge and leafy trees behind it, a washing line, the',
  '  neighbours\' roofs beyond, a bright blue summer sky.',
  'Change everything else. The plate is stiff, evenly lit, flatly stacked and has',
  'no atmosphere in it at all — that is what you are being asked to fix. Repose the',
  'creatures, give them faces and reactions, throw real sunlight and real shadow',
  'across the sand, add the kicked-up sand, the streaks and the depth.'
]

const CAMERA = [
  'THE CAMERA',
  'A side view at the sandbox\'s own ground level — the angle the game is played',
  'at — tipped just a little upward, so the beetle and the castle loom and the sky',
  'opens up behind them. Not a top-down view and not a flat side diagram.'
]

const PALETTE = [
  'COLOUR',
  'The game\'s own palette: bright summer-sky blue, warm pale sand, leaf green,',
  'clean toy primaries (the green squirt gun, the orange blaster, the red balloon),',
  'glossy chestnut for the beetle, and warm dark brown ink (#3b2a21) for every',
  'contour. Saturated and sunny throughout. No teal-and-orange grade, no',
  'desaturated wash, no neon, no dark or moody version of this.'
]

/**
 * The house style, with the ground rule DROPPED. Every sprite prompt forbids
 * its subject a shadow or a background, because the renderer draws both; a
 * cover is not composited over anything — it IS the ground, the light and the
 * shadow, out to its four edges.
 */
const COVER_STYLE = [
  ...STYLE_HEAD.map((l) => l.replace('Match this in every square:', 'Match this everywhere in the picture:')),
  '· This is a finished ILLUSTRATION, not a sprite: it has its own ground, its own',
  '  cast shadows, its own light and its own sky, right out to the four edges.'
].join('\n')

/** A ready-to-paste prompt for one cover aspect. */
export const promptForCover = (a: CoverAspect): string => [
  ...DELIVERABLE(a),
  '',
  ...EXCLUSIONS,
  '',
  'WHAT IT IS',
  'Cover art for Sandbox Tower, a cheerful tower-defence game: a kid\'s sandcastle',
  'in a sunny backyard sandbox, armed with toys, holds off a swarm of cartoon',
  'garden bugs. The picture is the most exciting half-second the game has: a',
  'giant stag beetle charging the castle, and a water balloon from the castle\'s',
  'launcher hanging in the air right above its head, an instant before it bursts.',
  '',
  ...a.shot,
  '',
  ...READ_THE_PLATE,
  '',
  ...CLICKABLE,
  '',
  ...CAMERA,
  '',
  ...PALETTE,
  '',
  COVER_STYLE,
  '',
  'CHECK BEFORE YOU ANSWER',
  '· Is there a single letter, digit or logo anywhere in the image? There must not',
  '  be one.',
  '· Is there a button, a bar, a counter or a frame anywhere? There must not be.',
  '· Does the painting reach all four edges with no border and no bars?',
  '· Is the beetle\'s face, looking up at the balloon, the biggest and most',
  '  readable thing in it?',
  '· Would you know what this game is about from a 250-pixel-wide copy?',
  '',
  'OUTPUT',
  `One image, ${a.plate.w} x ${a.plate.h} pixels, aspect ratio exactly ${a.label},`,
  'PNG if you can, JPEG otherwise. No text, no logo, no interface, no border.'
].join('\n')

/**
 * `art-sheets/promotion/PROMPTS-PROMOTION.md` — ONE FOLDER DOWN from the
 * sheets the Art Desk scans, so the desk never turns a cover into a slicer job.
 */
export const promotionPromptDoc = (): string => [
  '# Promotion prompts — one cover per generation',
  '',
  'Generated from `src/game/promotionSheet.ts` — do not hand-edit, re-run',
  '`pnpm art:promotion --plates` instead.',
  '',
  'These are the images that go on a STORE PAGE, not into the game. Attach the',
  'plate named in the heading and paste the block beside it; drop the return in',
  '`art-sheets/promotion/painted/` under the same stem and run `pnpm',
  'art:promotion`, which cuts every deliverable size out of it and compresses',
  'them into `src/assets/promotion/`.',
  '',
  'Every one of them is painted without text, without a logo and without any',
  'interface: a portal typesets the game\'s name over the art itself, and the logo',
  'ships as its own file in the same folder.',
  '',
  ...COVER_ASPECTS.map((a) => [
    `## ${a.id} — ${a.label}  (${plateStem(a)}.png)`,
    '',
    `Cuts ${a.sizes.map((s) => `${s.w}x${s.h}`).join(', ')} in ${COVER_FORMATS.join(' and ')}.`,
    '',
    '```text',
    promptForCover(a),
    '```',
    ''
  ].join('\n')),
  `## wordmark — the game's title lettering  (${WORDMARK.stem}.png)`,
  '',
  `Attach, in this order: \`${WORDMARK.styleRef}\`, then the plate. Keyed and trimmed into`,
  `\`src/assets/promotion/${WORDMARK.file}\`, which the logo covers are composited from.`,
  '',
  '```text',
  promptForWordmark(),
  '```',
  ''
].join('\n')
