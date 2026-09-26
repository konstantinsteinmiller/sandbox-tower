/**
 * ─── Sandbox Tower preview-video configuration ────────────────────────────────
 *
 *   pnpm preview:video                       # every format (14 clips, ~40 min)
 *   pnpm preview:video --formats crazygames  # one deliverable
 *   pnpm preview:video --scenarios success   # one scenario, every format
 *   pnpm preview:video --no-clean            # with the HUD on
 *   pnpm preview:video --only-setup          # stop on the opening frame
 *   pnpm preview:video --help
 *
 * Output, one folder per quality — each a complete, uniformly named set:
 *
 *   preview-videos/<quality>/<scenario>-<format>-<orientation>-<W>x<H>.mp4 (+ .png poster)
 *
 * ── TWO GAMES IN ONE BUNDLE ──
 *
 * Sandbox Tower ships a desktop tower game and a phone Drop & Merge board out of
 * the same build (`src/use/useMobileFit.ts`), and which one a device gets is
 * decided at runtime. The clips follow the same rule, so every clip shows the
 * game that shape of device actually plays:
 *
 *   portrait  → the phone board (`?fit=dropmerge`)
 *   landscape → the desktop tower (`?fit=desktop`)
 *   square    → the desktop tower — Poki's thumbnail is one square for both
 *
 * `scenarios/_drive.mjs` pins it on the URL from `ctx.variant.orientationId`
 * and ASSERTS which scene mounted, rather than trusting the resolver's own
 * guess: Playwright's `isMobile`/`hasTouch` do not reliably produce the coarse
 * pointer and mobile UA that `resolveFitMode` reads, so an unpinned portrait
 * take would quietly record the desktop game at phone size.
 */

export default {
  // The <title> the port-ownership check expects. A stale dev server from
  // another project answers on this port perfectly happily, and you find out by
  // watching thirty seconds of somebody else's game.
  title: 'Sandbox Tower',

  // The dev server, NOT a build: the scenarios drive the live simulation
  // through `import('/src/use/useTowerGame.ts')` (a built bundle has no such
  // URL), and `?clean=1` is `import.meta.env.DEV` only. Port 2063 is this
  // pipeline's own — `pnpm dev` takes Vite's default, the perf harness uses
  // 4177/4178 and the playtest daemons 439x, so nothing here collides.
  server: {
    mode: 'dev',
    port: 2063,
    command: 'pnpm',
    args: ['exec', 'vite', '--port', '{port}', '--strictPort'],
    // The recording page's WebSockets to this server are answered locally and
    // never connected, so an art export landing in `public/` — or another
    // session saving a file — cannot reload the page mid-take. `true` only for
    // authoring with `--only-setup --headed`.
    hotReload: false
  },

  // ── The deliverables ──
  //
  // Sizes are output PIXELS; the game sees width/dpr x height/dpr CSS px.
  //
  // THE DPR CAP: both scenes clamp the canvas at the quality tier's `dpr`,
  // which is 2 on `high` (`useDeviceTier.PROFILES`, and `?tier=high` below
  // pins it). Asking for 1080x1920 at dpr 3 would hand back a 720x1280 canvas
  // upscaled by the browser — soft 1080p. So nothing here goes above 2.
  formats: {
    // The generic preview pair.
    '10s': {
      durationMs: 10_000,
      orientations: {
        portrait: { width: 720, height: 1280, dpr: 2, isMobile: true, hasTouch: true },
        landscape: { width: 1280, height: 720, dpr: 2, isMobile: false, hasTouch: false }
      }
    },
    // "MP4 · H.264 · 30 s · 1920x1080 + 1080x1920, pure gameplay." A 30-second
    // clip is a different STORY, not a longer one — its own beat sheets.
    '30s': {
      durationMs: 30_000,
      orientations: {
        portrait: { width: 1080, height: 1920, dpr: 2, isMobile: true, hasTouch: true },
        landscape: { width: 1920, height: 1080, dpr: 2, isMobile: false, hasTouch: false }
      },
      scenarios: { success: 'success-30s', fail: 'fail-30s' }
    },
    // CrazyGames: "15-20 seconds maximum", 50 MB cap, landscape 16:9 AND
    // portrait **2:3** — 1080x1620, not the 9:16 a phone records. `high` only:
    // a lossless 1080p master is past their cap on its own.
    // Plays the 10 s beat sheets, which read `ctx.durationMs` and spend the
    // extra six seconds on one more exchange before the payoff.
    crazygames: {
      durationMs: 16_000,
      quality: 'high',
      orientations: {
        landscape: { width: 1920, height: 1080, dpr: 2, isMobile: false, hasTouch: false },
        portrait: { width: 1080, height: 1620, dpr: 2, isMobile: true, hasTouch: true }
      }
    },
    // Poki's animated thumbnail: 1:1, "4 to 6 seconds", "50fps or higher",
    // muted, and the action must sit CENTRED because the square crops the
    // edges. Its own two-scene beat sheets — five seconds is not an arc.
    poki: {
      durationMs: 5_000,
      fps: 60,
      quality: 'high',
      orientations: {
        square: { width: 1080, height: 1080, dpr: 2, isMobile: false, hasTouch: false }
      },
      scenarios: { success: 'success-5s', fail: 'fail-5s' }
    }
  },

  scenarios: ['success', 'fail'],

  fps: 30,
  // Both from ONE capture, one folder each:
  //   lossless — `-qp 0 -pix_fmt yuv444p`: the master. Big, and Safari and
  //              QuickTime will not play 4:4:4.
  //   high     — CRF 14, yuv420p, High profile: the file a portal upload wants.
  //
  // The master is not free in TIME, and on the 1080p formats it is the whole
  // cost: `-preset veryslow` at 4:4:4 encodes slower than the page renders, so
  // it back-pressures the frame loop through the pipe — a 900-frame 1080p
  // capture measured 319 s here against ~90 s for `high` alone. Iterate with
  // `--quality balanced`; drop to `--quality high` when only the upload matters.
  quality: ['lossless', 'high'],
  outDir: 'preview-videos',
  capture: 'virtual',

  // The page's `Math.random`, pinned. The clock decides WHEN each frame is
  // sampled; this decides WHAT is in it — and this game pulls random for every
  // spark, ember, debris tumble and wave composition. Re-roll it when a burst
  // happens to sit badly.
  seedRandom: 7,

  // ── Pure gameplay ──
  //
  // Three levers (SKILL.md Phase 0.1): the recorder hides every DOM node but
  // the game canvas — the wave HUD, the resource bar, the build tray, the
  // result screen, the mission toasts, the coin badge, the chest; it no-ops
  // canvas text (damage numbers, tier digits, the payout figures); and
  // `?clean=1` switches off what the RENDERER paints as interface — damage
  // bars, the build overlay and its drop ghost, the edge arrows, the "nothing
  // can reach it" marks, the ghosts of blocks that just died, the tier plates
  // — and frames the board in the whole viewport instead of in the band the
  // (hidden) HUD leaves free. See `src/game/cleanFeed.ts`.
  clean: {
    enabled: true,
    // BOTH canvases, by class: the desktop scene's and the phone board's. A
    // bare 'canvas' would also keep every offscreen-ish canvas the HUD draws
    // into (block tiles, the merge guide, gift tiles), which is the DOM this
    // is trying to hide.
    keep: ['canvas.scene__canvas', 'canvas.drop__canvas'],
    suppressCanvasText: true,
    urlParams: { clean: '1' }
  },

  // Pinned for every recording:
  //   tier=high   the adaptive controller measures real frame deltas and steps
  //               quality DOWN when the machine is behind. Under the virtual
  //               clock every frame is 33.3 ms by construction, which reads as
  //               "this machine cannot hold 60 fps" — so without this the
  //               renderer would strip the reflection, the day cycle and the
  //               grain a few seconds into every clip, and settle somewhere
  //               different on each run. `?tier=` also stops the measuring.
  //   art=on      the painted art layer, explicitly rather than by build
  //               default — it is the look the clip is selling.
  urlParams: { tier: 'high', art: 'on' },

  /**
   * Real time, once per page, before `setup()`.
   *
   * The live leaderboard must never see a recorded run: a fail clip ends in a
   * defeat, and a defeat posts a score. Blocked at the browser rather than in
   * the game, so nothing about the build differs from what a player runs — the
   * board falls back to its baked snapshot, which is what an offline portal
   * ships anyway.
   */
  async onPageReady(ctx) {
    await ctx.page.route(
      (url) => /sandbox-tower-leaderboard|workers\.dev/.test(url.href),
      (route) => route.abort()
    )
  }
}
