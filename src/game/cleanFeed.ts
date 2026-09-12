// ─── Clean feed: the battlefield with nothing drawn on top of it ────────────
//
// Portal trailer specs keep asking for the same thing in the same words: "pure
// gameplay — no hardcoded text, score counters, watermarks, UI or logos"
// (CrazyGames also forbids logos, promotional text and a visible cursor in a
// preview video). The recorder in `tools/preview-video` covers two thirds of
// that on its own: it hides every DOM node but the game canvas, and it no-ops
// `fillText`/`strokeText` so nothing the renderer WRITES can appear.
//
// What neither of those can reach is the interface this game PAINTS: damage
// bars, the build overlay's placement grid and drop ghost, the off-screen edge
// arrows, the "nothing can reach it" marks, the ghosts of blocks that just
// died, the merge-tier plate. Only the renderer can switch those off, so it
// gets a flag of its own and the recorder turns it on through the URL
// (`clean.urlParams` in `tools/preview-video/preview.config.mjs`).
//
// Two rules about the flag itself:
//
//   • DEV ONLY. A player's build has no business hiding its own interface, and
//     a portal reviewer must never be one query parameter away from a game with
//     no HUD. Vite folds `import.meta.env.DEV` to `false` in every portal build
//     and the whole branch goes with it.
//   • RESOLVED ONCE, at module load. The gates below sit in per-frame draw
//     paths — a flag that re-parsed the URL would cost a `URLSearchParams` per
//     block per frame.

/** `?clean=1` and `#/?clean=1` both read, the router being hash-based. */
const readCleanParam = (): boolean => {
  try {
    const url = new URL(window.location.href)
    const hashQuery = url.hash.includes('?') ? url.hash.slice(url.hash.indexOf('?') + 1) : ''
    const raw = url.searchParams.get('clean') ?? new URLSearchParams(hashQuery).get('clean')
    return raw !== null && ['1', 'on', 'true', 'yes'].includes(raw.toLowerCase())
  } catch {
    return false
  }
}

/**
 * Pure gameplay: no painted interface, and the board framed in the WHOLE frame
 * rather than in the band the (hidden) HUD leaves free.
 *
 * The layout half matters as much as the drawing half. The recorder hides the
 * HUD with `visibility: hidden`, which keeps every box — deliberately, so
 * nothing reflows mid-take — so a scene that measures its own top bar and build
 * tray still measures them, and the board stays wherever the HUD left it with
 * an empty band above and below. Both scenes read this flag when they compute
 * their insets (`GameScene.measureInsets`, `GameSceneDrop.layoutFrame`).
 */
export const CLEAN_FEED: boolean =
  import.meta.env.DEV && typeof window !== 'undefined' && readCleanParam()

/** The query-parsing half, exported for its test — `CLEAN_FEED` is frozen at
 *  module load and so cannot be exercised directly. */
export const __readCleanParam = readCleanParam
