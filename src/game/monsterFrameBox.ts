/**
 * ─── The monster frame box ──────────────────────────────────────────────────
 *
 * The geometry every baked, painted and exported monster frame agrees on.
 *
 * It lives in its own module because two very different things need it and only
 * one of them may touch the DOM. `monsterSprites` runs on the main thread and
 * imports `art` / `spriteStrip`, which reach for `Image` and `document`.
 * `monsterBakeWorker` runs in a worker, where neither exists — so it cannot
 * import `monsterSprites`, and duplicating the numbers there would be a
 * contract maintained by hope: get the frame height out of step between the two
 * and every character silently stands at the wrong height in whichever path
 * happened to bake it.
 *
 * The values and their reasoning are unchanged from where they used to live.
 */

/** Frames per cycle. Sixteen is the low end of what still reads as a walk. */
export const FRAMES = 16

/**
 * Baked frame WIDTH, px.
 *
 * Big enough that a unit at maximum zoom on a 3× screen is still downsampling,
 * small enough that the whole cast fits in a sane amount of canvas memory
 * (17 designs × 16 frames × 156 × 176 × 4 B ≈ 30 MB, and most runs never
 * field all seventeen).
 */
export const PX = 156

/**
 * Baked frame HEIGHT, px.
 *
 * Taller than it is wide, for two reasons that arrived together.
 *
 * The cast is authored feet-at-+1, crown-at-−1.05, but the frame only ever had
 * 1.17 units of headroom — a margin thin enough that one design reaching for a
 * tall silhouette (Thornwick, whose canopy is the character) came out of the
 * bake with its foliage sliced flat. A contract with no slack in it is a
 * contract that gets broken silently, in a strip nobody looks at directly.
 *
 * And the origin now sits at the frame's EXACT vertical centre. The sea
 * creatures are drawn centred on the frame rather than anchored by their feet,
 * so any gap between "middle of the canvas" and "the point the artist drew
 * around" showed up as every fish floating slightly high.
 */
export const FRAME_H = 176

/**
 * Character scale inside a frame.
 *
 * The drawing convention is feet at y = +1, crown at −1.05, and up to ±1.05
 * wide, so 2.25 units across the frame leaves a hair of margin for the ink to
 * bleed into without clipping. Vertically there is now real slack: half of
 * `FRAME_H` is about 1.27 units.
 */
export const SPRITE_S = PX / 2.25

/** Where the character's feet sit inside a frame, in px from the top. */
export const SPRITE_FOOT = FRAME_H / 2 + SPRITE_S

/** Total character height inside a frame, in px. */
export const SPRITE_HEIGHT = 2.05 * SPRITE_S

/**
 * The two numbers above, as FRACTIONS of the frame rather than pixel counts.
 *
 * A painted strip is the bake's frame box at a different resolution — the sheet
 * the painter works on is the same box scaled up, and the slicer cuts it on the
 * same grid without trimming. So the feet line and the character height are the
 * same proportions of the frame whatever size it arrives at, and every caller
 * measures off the frame it was handed instead of off the bake's constants.
 * For a baked frame these are algebraically what the old code computed.
 */
export const SPRITE_FOOT_R = SPRITE_FOOT / FRAME_H
export const SPRITE_HEIGHT_R = SPRITE_HEIGHT / FRAME_H

/** The frame box's width:height. A painted panel is this box, scaled up. */
export const MONSTER_FRAME_ASPECT = PX / FRAME_H
