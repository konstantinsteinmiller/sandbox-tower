/**
 * ─── Driving Tower Siege ────────────────────────────────────────────────────
 *
 * Everything game-specific lives here, so the scenario modules read as beat
 * sheets. When the recorder is ported to another game, this file, the scenarios
 * and `preview.config.mjs` are what get rewritten; `record.mjs` and `lib/` are
 * copied verbatim.
 *
 * ── The seams this game gives us ──
 *
 *   the save        ONE localStorage key, `tower_state`, holding a flat
 *                   `{ ts_*: value }` blob (`src/use/useTowerState.ts`). Seeded
 *                   before the app's first line runs, so the game BOOTS into
 *                   the staged position rather than being mutated into it.
 *   `ts_run` /      the resumable run: wave, purse, and every block as
 *   `ts_m2_run`     `[c, r, typeId, hp, roof, enhanced, rank, tier, w, h]`.
 *                   `resumeRun()` rebuilds the exact tower from it — which is
 *                   the whole staging mechanism here. No live mutation, no
 *                   renderer/display-copy split to fight.
 *   `window.__ts`   the LIVE simulation module — the handle the APP publishes
 *                   (`window.__tower`, `src/use/useCheats.ts`), switched on by
 *                   seeding `localStorage.cheat`. See `attachSim` for why the
 *                   obvious `import('/src/use/useTowerGame.ts')` is a trap.
 *   `?clean=1`      `src/game/cleanFeed.ts` — the painted interface off, the
 *   `?fit=`         board framed in the whole viewport. `?fit=desktop` /
 *   `?tier=high`    `?fit=dropmerge` pins WHICH GAME; `?tier=high` pins the
 *                   quality ladder so it cannot step down mid-take.
 *
 * ── Time ──
 *
 * The clip is not the whole wave. A wave takes 20-40 s and its first seconds
 * are an empty field while the horde walks on, so every scenario FAST-FORWARDS
 * in `setup()` to the moment the fight is already at the walls. That is done by
 * arming the recorder's virtual clock EARLY and stepping it from Node — not by
 * sleeping in real time — so the opening frame is identical on every run and on
 * any machine. `armPageClock` later finds the clock already armed and continues
 * from where we left it.
 *
 * ── The two boards ──
 *
 * Portrait is the phone's Drop & Merge board and landscape (and the square
 * Poki thumbnail) is the desktop tower — the same rule the game itself uses to
 * pick a scene, pinned on the URL rather than inferred, and then ASSERTED.
 */

/** Which game this clip is of. Portrait → the phone board; everything else →
 *  the desktop tower. See `preview.config.mjs`. */
export const boardFor = (ctx) => (ctx.variant.orientationId === 'portrait' ? 'dropmerge' : 'desktop')

/**
 * Authoring override: `PREVIEW_WAVE=16 pnpm preview:video --only-setup …`.
 *
 * Which wave a clip stages is the single number that decides whether the horde
 * ever reaches the walls, and it cannot be reasoned out — the wave's size comes
 * from the adaptive director reading THIS tower, this purse and this streak.
 * So it is found by trying, and an env var means trying costs one flag instead
 * of an edit per attempt. Never set in a real run.
 */
export const waveFor = (planned) => Number(process.env.PREVIEW_WAVE) || planned

const dayString = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// ─── The save fixture ───────────────────────────────────────────────────────
//
// Pin EVERY field a clip depends on. Most of these exist to stop something
// appearing over the battlefield: a first-run tutorial hand, a coach mark, a
// merge-ladder card (which HOLDS THE CLOCK on the phone board), a daily-reward
// modal, a mission toast, the flying chest, a gift tile. The recorder hides the
// DOM, but a card that pauses the simulation is not a DOM problem — it is ten
// seconds of a frozen board.

export const saveFixture = (over = {}) => {
  const today = dayString()
  return {
    // A returning player, well past every first-session branch: no scripted
    // opening, no discounted opening waves, no "you have never seen the tech
    // tree" nudge, and no first-clear present waiting to be placed.
    ts_best_wave: 22,
    ts_m2_best_wave: 18,
    ts_runs: 40,
    ts_total_waves: 180,
    ts_total_kills: 2400,
    ts_total_blocks: 900,
    ts_coins: 1800,
    ts_total_coins: 6000,
    ts_best_score: 900,
    ts_best_height: 9,
    ts_best_blocks: 30,

    // Onboarding, both boards. Every one of these is a card or a hand that
    // plays over the board on the run it belongs to.
    ts_onboarded: true,
    ts_tutorial: true,
    ts_trap_tutorial: true,
    ts_merge_guide: true,
    ts_tech_found: true,
    ts_tech_spotlight_seen: true,
    ts_tech_intro: true,
    ts_tech_intro_p1: true,
    ts_hints_seen: ['place', 'call', 'sell', 'upgrade', 'drop', 'merge'],
    ts_m2_onboarded: true,
    ts_m2_tutorial: true,
    ts_m2_drop_learned: true,
    ts_m2_merge_guide: true,
    ts_m2_tech_intro: true,
    ts_m2_tech_intro_p1: true,

    // Nothing to claim, nothing to regenerate, nothing ready to pop.
    ts_missions: { day: today, missions: [] },
    ts_daily_rewards: { streak: 3, lastClaimDay: today },
    ts_daily_bonus_day: today,
    ts_chest: { readyAt: Date.now() + 6 * 3600_000 },
    ts_chest_day: { day: today, coins: 0 },
    ts_first_clear_gift: true,
    ts_m2_first_clear_gift: true,
    ts_gifts: [],
    ts_m2_gifts: [],
    ts_ad_cooldown: Date.now() + 6 * 3600_000,

    // No tech, on purpose: every number the staging was checked against (the
    // headless probe behind each beat sheet) comes from a tower with no tree
    // behind it. A purchased node changes block HP, wave pricing and the
    // adaptive difficulty all at once.
    ts_tech: { levels: {} },
    ts_m2_tech: { levels: {} },

    // The browser is launched with `--mute-audio` as well; this stops the game
    // from even building its audio graph.
    ts_user_sound_volume: 0,
    ts_user_music_volume: 0,
    ts_mobile_mute: true,
    ts_user_language: 'en',
    ts_user_language_explicit: true,
    ts_user_difficulty: 'medium',
    ...over
  }
}

// ─── Towers worth filming ───────────────────────────────────────────────────
//
// `[c, r, typeId]`, bottom-left cell of the board is the Gate at (0, 0); `r`
// grows upward. Everything is stored at full health.
//
// THE GATE'S HIT POINTS ARE NOT OPTIONAL. `resumeRun` clamps every other block
// to its current maximum but takes the Gate's number as given
// (`spawnGate(Math.max(1, Number(hp) || 1))`) — so an absent one is a Gate on
// ONE hit point and the clip is over in a second.
const GATE_HP = 300

/**
 * The desktop keep: a wide stone base, guns stacked up the middle, archers on
 * the shoulders. Twenty-five blocks — enough that losing four to a wave reads
 * as damage rather than as collapse.
 */
const DESKTOP_TOWER = [
  ['gate', 0, 0],
  ['stone', -1, 0], ['stone', 1, 0], ['stone', -2, 0], ['stone', 2, 0],
  ['wood', -3, 0], ['wood', 3, 0],
  ['stone', -1, 1], ['stone', 1, 1], ['wood', -2, 1], ['wood', 2, 1],
  ['cannon', 0, 1],
  ['wood', -1, 2], ['wood', 1, 2], ['stone', 0, 2],
  ['archer', -2, 2], ['archer', 2, 2],
  ['wood', 0, 3], ['wood', -1, 3], ['wood', 1, 3],
  ['mortar', 0, 4], ['tesla', -1, 4], ['cannon', 1, 4],
  ['wood', 0, 5], ['archer', 0, 6]
]

/**
 * The phone board: five columns, and it is STAGED FOR A CASCADE.
 *
 * One drop can weld twice here, and that chain is the shot the portrait clips
 * exist for. It only fires from an exact arrangement, measured against the
 * game's own resolver rather than assumed:
 *
 *   • a weld collapses into the LOWER of the two cells, so the tier-2 waiting
 *     for a neighbour has to stand on the row the weld will land on — (0,1),
 *     not (0,2);
 *   • an archer dropped into column 1 lands at (1,2), fuses DOWN into the
 *     archer at (1,1) to make a tier 2 at (1,1), and that new tier 2 is then
 *     side by side with the tier 2 at (0,1) — so it fuses again, and a TIER 3
 *     appears above the Gate.
 *
 * Change any of those three cells and the payoff quietly becomes an ordinary
 * stack. The fourth tuple field is the merge tier.
 */
const DROP_TOWER = [
  // The Gate and the walls either side of it.
  ['gate', 0, 0],
  ['stone', -1, 0], ['stone', 1, 0], ['wood', -2, 0], ['wood', 2, 0],
  // Row 1 is the one that matters: the tier-2 archer sits at (0,1) and its
  // plain twin at (1,1), with column 1 left OPEN above — that is the cascade.
  ['archer', 0, 1, 2], ['archer', 1, 1], ['cannon', -1, 1],
  ['wood', -2, 1], ['wood', 2, 1],
  // Built up, and ARMED. Two reasons, and the second one is not obvious: a
  // four-row tower in a nine-row portrait frame reads as a game that has not
  // started yet — and the wave director prices a wave against how much GUN is
  // standing (`adaptiveFactor` over `towerPower`). A board of mostly wood took
  // wave 10 at difficulty 2.03 and was chewed from 21 blocks to 8 inside ten
  // seconds, which is not the clip a SUCCESS cut is supposed to be.
  ['cannon', -1, 2], ['bombard', 0, 2], ['wood', -2, 2], ['wood', 2, 2],
  ['bombard', -2, 3], ['archer', 0, 3], ['archer', 2, 3],
  ['wood', -2, 4], ['tesla', 0, 4], ['wood', 2, 4],
  ['archer', 0, 5]
]

const blockTuples = (tower) => tower.map(([typeId, c, r, tier = 1]) => [
  c, r, typeId, typeId === 'gate' ? GATE_HP : 9999, 0, 0, 0, tier, 1, 1
])

/**
 * The run snapshot the game boots into.
 *
 * `wave` is the wave already SURVIVED, so a clip that wants wave 12 stages 11
 * and calls it — which is also what makes the HUD, the incoming warnings and
 * the boss banner agree about what is arriving.
 */
export const runSnapshot = (board, wave, { gateHp = GATE_HP, ...over } = {}) => ({
  wave: wave - 1,
  wood: 400,
  stone: 200,
  runCoins: 300,
  kills: 40,
  killsByType: {},
  // `gateHp` is how a fail clip is made to land ON TIME rather than whenever
  // the boss happens to finish: a siege already in trouble is an honest thing
  // to stage, and it is the only lever that moves the defeat without changing
  // the wave or the tower the viewer sees.
  blocks: blockTuples(board === 'dropmerge' ? DROP_TOWER : DESKTOP_TOWER)
    .map((b) => (b[2] === 'gate' ? [b[0], b[1], b[2], gateHp, ...b.slice(4)] : b)),
  // Left empty on purpose: `resumeRun` rolls a fresh hand for anything the
  // snapshot does not carry, and the scenarios set the hand they need anyway.
  offers: [],
  arrowRain: 3,
  rules: board === 'dropmerge' ? 'dropmerge' : 'desktop',
  startedAt: Date.now()
})

/**
 * Written into the page before any app code runs.
 *
 * Runs in the PAGE, so it closes over nothing from this module — `tower_state`
 * is the one localStorage key the game keeps (`src/use/useTowerState.ts`) and
 * is spelt out here rather than referenced.
 */
const seedScript = (blob) => {
  try {
    localStorage.clear()
    sessionStorage.clear()
    localStorage.setItem('tower_state', JSON.stringify(blob))
    // Makes the app hand its OWN live simulation to `window.__tower`
    // (`src/use/useCheats.ts`, DEV only, read at module load — which is why it
    // is seeded here rather than set later). See `attachSim`.
    localStorage.setItem('cheat', 'true')
  } catch { /* private mode */ }
}

/**
 * Give the scenario a handle on the LIVE simulation.
 *
 * The obvious way to do this is `import('/src/use/useTowerGame.ts')` from the
 * page, and it works exactly until someone edits a source file. Vite then
 * serves the app a version-stamped URL for the same module — `…ts?t=1757…` —
 * and a plain import of the unstamped path is a DIFFERENT module: a second,
 * inert copy of a singleton that is supposed to be the game. It answers every
 * call, reports `blockCount 0` forever, and nothing about it looks wrong.
 *
 * Measured: the take that found this had eleven clips recorded off the
 * unstamped import, and then every clip in the next run timed out in boot the
 * moment a component had been edited between them. The same trap is written up
 * in `useCheats.ts`, which is also the way out of it — the app publishes the
 * module it is actually running, so the handle is taken from the app rather
 * than reconstructed beside it.
 */
export const attachSim = async (ctx) => {
  const how = await ctx.page.evaluate(async () => {
    const w = window
    if (w.__tower) { w.__ts = w.__tower; return 'published' }
    // Nothing published it — an older build, or the cheat flag did not take.
    // The import is still better than failing outright, and the boot assertion
    // below is what decides whether it was the live one.
    w.__ts = await import('/src/use/useTowerGame.ts')
    return 'imported'
  })
  if (how === 'imported') {
    ctx.log.warn(
      'the app did not publish window.__tower — falling back to a page-side import, '
      + 'which is a DIFFERENT module instance whenever Vite has version-stamped the app\'s copy'
    )
  }
  return how
}

// ─── Boot ───────────────────────────────────────────────────────────────────

/**
 * Navigate with the save seeded, wait out every curtain, freeze the build
 * clock, take the page clock, and prove we are on the board we asked for.
 *
 * @param {object} ctx
 * @param {{ wave: number, save?: object, snapshot?: object }} plan
 */
export const boot = async (ctx, plan) => {
  const board = boardFor(ctx)

  // The runner has ALREADY opened the page at the full recording URL — the
  // resolved port and every param: the config's (`tier`, `art`), the clean
  // feed's (`clean=1`), the scenario's, `--url-param`. Reuse it; never rebuild
  // it from the config, or a clean run silently records with the HUD on while
  // every log line looks right.
  const current = typeof ctx.page.url === 'function' ? ctx.page.url() : ''
  if (!/^https?:/.test(current)) {
    throw new Error(
      `preview-video: boot() expected the runner to have opened the recording URL, got "${current}".`
    )
  }
  const url = new URL(current.split('#')[0])
  // WHICH GAME, pinned rather than inferred. `resolveFitMode` reads a coarse
  // pointer and a mobile UA, and Playwright's `isMobile`/`hasTouch` do not
  // reliably produce either — so an unpinned portrait take records the DESKTOP
  // game at phone size, which looks almost right and is the wrong game.
  url.searchParams.set('fit', board === 'dropmerge' ? 'dropmerge' : 'desktop')

  const save = { ...saveFixture(plan.save ?? {}) }
  const snap = plan.snapshot ?? runSnapshot(board, plan.wave)
  save[board === 'dropmerge' ? 'ts_m2_run' : 'ts_run'] = snap

  await ctx.page.addInitScript(seedScript, save)
  // Bounce through about:blank first: the router is on hash history, so a
  // `goto` back to the same address would be a SAME-DOCUMENT navigation — the
  // document is never rebuilt, the init script never runs, and the game keeps
  // whatever save it booted with.
  await ctx.page.goto('about:blank')
  await ctx.page.goto(url.href, { waitUntil: 'domcontentloaded' })

  // The curtains, in order: the static splash in index.html, then the Vue one.
  await ctx.page.waitForFunction(() => !document.getElementById('static-splash'), null, { timeout: 60_000 })
    .catch(() => {})
  await ctx.page.waitForFunction(
    () => !document.querySelector('.splash, .splash-backdrop, .rotate-overlay'),
    null, { timeout: 60_000 }
  ).catch(() => {})
  // The canvas of the board we asked for, and the run resumed onto it.
  const sel = board === 'dropmerge' ? 'canvas.drop__canvas' : 'canvas.scene__canvas'
  await ctx.page.waitForFunction((s) => !!document.querySelector(s), sel, { timeout: 60_000 })

  // The live simulation — the app's own handle where it has one (`attachSim`).
  // Waited for rather than grabbed: `useCheats` publishes it through a dynamic
  // import, so it lands a tick or two after the scene mounts.
  await ctx.page.waitForFunction(() => !!window.__tower, null, { timeout: 30_000 }).catch(() => {})
  const simFrom = await attachSim(ctx)

  // As patient as the curtain waits above, and for the same reason: this is
  // the first moment the mobile-fit chunk is compiled and the run resumed onto
  // it, and a full 14-clip pass has four `-preset veryslow` encoders competing
  // for the machine. Measured: one take of the CrazyGames portrait cut died
  // here on a 30 s timeout while every other clip in the same run booted fine.
  await ctx.page.waitForFunction(() => (window.__ts?.blockCount?.value ?? 0) > 0, null, { timeout: 90_000 })
    .catch(() => {
      throw new Error(
        'preview-video: the simulation never reported a block. '
        + (simFrom === 'imported'
          ? 'The handle came from a page-side import, which is a different module instance from the one '
            + 'the app is running whenever Vite has version-stamped its copy — restart the dev server, or '
            + 'check that `localStorage.cheat` still makes useCheats publish `window.__tower`.'
          : 'The run snapshot did not resume.')
      )
    })

  // A real player's first gesture. Trusted events only (`useFirstInteraction`
  // checks `isTrusted`), and Shift is the one key the scenes ignore.
  await ctx.page.keyboard.press('Shift')

  // Stop the build clock BEFORE anything else: it auto-calls the wave when it
  // runs out, and everything from here to the first frame would otherwise be
  // racing a fifteen-second countdown that started while the page was loading.
  await ctx.page.evaluate(() => { window.__ts.buildClockHeld.value = true })

  // Take the page clock NOW, so every step from here is virtual and the
  // opening frame is the same on any machine. `armPageClock` finds it already
  // armed later and simply carries on.
  await armClock(ctx)

  const state = await snapshot(ctx)
  if (state.blocks < 8 || state.phase !== 'build') {
    throw new Error(
      `preview-video: booted into ${state.phase} with ${state.blocks} blocks — the run snapshot did not take.`
    )
  }
  ctx.log.info(
    `booted ${board} board, wave ${state.wave + 1} pending, ${state.blocks} blocks` +
    `${ctx.clean ? ', clean feed' : ''}`
  )
  return board
}

// ─── Time ───────────────────────────────────────────────────────────────────

/** Take the page clock (idempotent — the recorder arms it again later). */
export const armClock = (ctx) => ctx.page.evaluate(() => new Promise((done) => {
  const v = window.__vclock
  if (!v) { done(null); return }
  if (v.armed) { done(v.state()); return }
  v.native.raf(() => done(v.arm()))
}))

/**
 * Run the game forward WITHOUT recording it — the pre-roll that puts the fight
 * at the walls before frame 0.
 *
 * One page step per call rather than a loop inside one `evaluate`, deliberately
 * twice over: a tight synchronous loop never yields, so Vue's watchers never
 * flush (wave-clear handlers, toasts and mission credit silently do not run)
 * and the page never paints, so every queued particle effect drains into one
 * frame at the end. A step per round trip costs a few milliseconds and behaves
 * exactly like play.
 */
export const fastForward = async (ctx, ms, { fps = 30 } = {}) => {
  const dt = 1000 / fps
  const n = Math.max(0, Math.round(ms / dt))
  for (let i = 0; i < n; i++) await ctx.evaluate((d) => window.__vclock.step(d), dt)
  return n * dt
}

/**
 * Roll the pre-roll forward until the horde is actually ON the tower.
 *
 * A fixed pre-roll is not enough on its own: the wave's size — and so how long
 * it takes to cross the field — moves with the adaptive difficulty, which
 * reads the tower, the purse and the streak. A clip that opens on an empty
 * approach has spent its first two beats on a walk, so the floor gets the
 * boring part out of the way and the condition finds the fight.
 *
 * @param {number} o.floorMs  fast-forward this far regardless
 * @param {number} o.within   cells from the tower that count as contact
 */
export const prerollToContact = (ctx, { floorMs = 6_000, within = 3, maxMs = 14_000 } = {}) =>
  prerollUntil(ctx, {
    floorMs,
    maxMs,
    label: `contact within ${within} cells`,
    arg: within,
    until: (w) => window.__ts.getEnemies().some((e) => e.dying <= 0 && Math.abs(e.x) < w)
  })

/**
 * The same, for a fail clip: hold the pre-roll until the GATE IS UNDER ATTACK.
 *
 * A fail clip lives or dies on when the Gate falls, and that is not a fixed
 * number of seconds into a wave — the horde has to get through whatever is in
 * front of it first, and how long that takes depends on the wave's own roll.
 * Opening the clip once the Gate is already losing health puts the fall a
 * known few seconds away instead of a guessed twenty.
 */
export const prerollToGatePressure = (ctx, { floorMs = 12_000, lost = 0.1, maxMs = 20_000 } = {}) =>
  prerollUntil(ctx, {
    floorMs,
    maxMs,
    label: `Gate has lost ${Math.round(lost * 100)}% of its health`,
    arg: lost,
    // Measured against where the Gate STARTED, not against an absolute
    // percentage: a fail clip stages a wounded Gate on purpose, so an absolute
    // threshold is either already true at the first frame of the pre-roll (no
    // wait at all) or unreachable. What the clip actually needs to know is
    // that the horde is through the walls and hitting the Gate NOW.
    until: (d) => {
      const w = window
      const pct = w.__ts.gateHpPct.value
      if (w.__gateStart === undefined) w.__gateStart = pct
      return pct < w.__gateStart - d
    }
  })

/** Fast-forward `floorMs`, then on until `until` is true (or `maxMs`). */
export const prerollUntil = async (ctx, { floorMs = 6_000, until, arg, maxMs = 14_000, label = '' }) => {
  await fastForward(ctx, floorMs)
  const extra = until ? await fastForwardUntil(ctx, until, { maxMs, arg }) : 0
  ctx.log.info(`pre-roll ${((floorMs + extra) / 1000).toFixed(1)}s of game time${label ? ` (${label})` : ''}`)
  return floorMs + extra
}

/**
 * Fast-forward until `fn` is true in the page, or `maxMs` of game time has
 * passed. SETUP ONLY — `ctx.stepUntil` is the version for `record()`.
 */
export const fastForwardUntil = async (ctx, fn, { maxMs = 20_000, fps = 30, arg } = {}) => {
  const dt = 1000 / fps
  for (let t = 0; t < maxMs; t += dt) {
    if (await ctx.evaluate(fn, arg)) return t
    await ctx.evaluate((d) => window.__vclock.step(d), dt)
  }
  ctx.log.warn(`fastForwardUntil: gave up after ${maxMs} ms of game time`)
  return maxMs
}

// ─── Reading the game ───────────────────────────────────────────────────────

/** Whatever the game thinks is true right now — for logging and assertions. */
export const snapshot = (ctx) => ctx.evaluate(() => {
  const g = window.__ts
  const live = g.getEnemies().filter((e) => e.dying <= 0)
  return {
    phase: g.phase.value,
    wave: g.wave.value,
    blocks: g.blockCount.value,
    kills: g.kills.value,
    alive: live.length,
    nearest: live.length ? Math.min(...live.map((e) => Math.abs(e.x))) : null,
    gate: Math.round(g.gateHpPct.value * 100),
    wood: g.wood.value,
    speed: g.gameSpeed.value
  }
})

/** One line of it in the log — the cheapest way to compare two runs. */
export const log = async (ctx, label) => {
  const s = await snapshot(ctx)
  ctx.log.info(
    `${label}: ${s.phase} w${s.wave} — ${s.alive} alive (nearest ${s.nearest === null ? '—' : s.nearest.toFixed(1)}), ` +
    `${s.kills} kills, ${s.blocks} blocks, gate ${s.gate}%`
  )
  return s
}

// ─── Acting on the game ─────────────────────────────────────────────────────

/**
 * Send the wave in. Returns what it is made of, for the log — the head count
 * and the difficulty scalar are what a beat sheet is really staged against,
 * and they are decided by the director at the moment of the call.
 */
export const callWave = (ctx) => ctx.evaluate(() => {
  const g = window.__ts
  g.buildClockHeld.value = false
  g.callWave()
  const plan = g.wavePlan()
  const roster = {}
  for (const o of plan.orders) roster[o.typeId] = (roster[o.typeId] ?? 0) + 1
  return {
    wave: g.wave.value,
    total: plan.total,
    boss: plan.boss,
    difficulty: g.difficultyMul.value,
    roster: Object.entries(roster).map(([k, n]) => `${n}x${k}`).join(' ')
  }
})

/** Put an exact hand in the tray. The deck is wave-gated and random, so a beat
 *  that places "the mortar" has to say which slot holds one. */
export const setHand = (ctx, shapeIds) => ctx.evaluate((ids) => {
  const g = window.__ts
  g.offers.value = ids.slice()
  g.offerEnhanced.value = ids.map(() => false)
  return g.offers.value.slice()
}, shapeIds)

/**
 * Place the piece in `slot` at the first of `cells` the game will accept.
 *
 * A list rather than one cell because placement legality is a live question —
 * support, the board's half-width at that row, whatever the wave just knocked
 * down — and a beat that silently places nothing is a beat of a tower standing
 * still. The purse is topped up rather than consulted: these clips are about
 * the spectacle, not about whether this staged wallet could afford it.
 */
export const placeWhereLegal = (ctx, slot, cells, rot = 0) => ctx.evaluate((a) => {
  const g = window.__ts
  const id = g.offers.value[a.slot]
  if (!id) return { ok: false, id: null }
  g.wood.value = Math.max(g.wood.value, 400)
  g.stone.value = Math.max(g.stone.value, 300)
  g.runCoins.value = Math.max(g.runCoins.value, 300)
  for (const [c, r] of a.cells) {
    if (!g.canPlaceShapeAt(id, c, r, a.rot)) continue
    return { ok: g.placeShape(a.slot, c, r, a.rot), id, c, r }
  }
  return { ok: false, id }
}, { slot, cells, rot })

/** Drop the piece in `slot` down column `c` — the phone board's whole verb. */
export const drop = (ctx, slot, c) => ctx.evaluate((a) => {
  const g = window.__ts
  g.wood.value = Math.max(g.wood.value, 400)
  g.stone.value = Math.max(g.stone.value, 300)
  g.runCoins.value = Math.max(g.runCoins.value, 300)
  // Read the piece BEFORE the drop: `dropOffer` rerolls the slot the moment it
  // is released, so reading afterwards logs the NEXT piece and every beat
  // sheet's log line names something that was never dropped.
  const id = g.offers.value[a.slot] ?? null
  return { ok: g.dropOffer(a.slot, a.c), c: a.c, id }
}, { slot, c })

/**
 * The phone board's payoff beat, made to actually happen.
 *
 * A weld needs a piece whose TYPE matches the top of some column, and the hand
 * is dealt at random from a wave-gated deck — so a beat sheet that says "now
 * weld something" and then drops whatever it was holding produces a weld about
 * half the time and an ordinary stack the rest. Measured on the 30 s cut: the
 * beat billed as the payoff landed `merge tier 0`.
 *
 * So the board is read first and the HAND IS CHOSEN to match it: find a column
 * whose top block is a type this board deals as a droppable piece, put that
 * piece in the tray, drop it there. Prefers the deepest weld available, and
 * prefers a WEAPON when tiers tie — a bigger gun reads from across the board,
 * a bigger crate does not.
 */
export const weldNow = async (ctx, slot = 1) => {
  const pick = await ctx.evaluate((s) => {
    const g = window.__ts
    // The phone board's own deck (`src/mobile-fit/pieces.ts`), by block type.
    const PIECE = {
      wood: 'b_wood', stone: 'b_stone', archer: 'b_archer',
      cannon: 'b_cannon', bombard: 'b_bombard', tesla: 'b_tesla', lumberHut: 'b_lumberHut'
    }
    const GUN = new Set(['archer', 'cannon', 'bombard', 'tesla'])
    let best = null
    for (const c of [-2, -1, 0, 1, 2]) {
      if (!g.canDropAt(c, 1)) continue
      const top = g.columnTop(c)
      if (top < 0) continue
      const block = g.blockAt(c, top)
      const piece = block && PIECE[block.typeId]
      if (!piece) continue
      const preview = g.previewDropMerge(piece, c) ?? []
      const tier = preview.reduce((n, p) => Math.max(n, p.tier ?? 0), 0)
      if (tier <= 0) continue
      const score = tier * 10 + (GUN.has(block.typeId) ? 1 : 0)
      if (best === null || score > best.score) best = { c, piece, tier, score, type: block.typeId }
    }
    if (!best) return null
    const hand = g.offers.value.slice()
    hand[s] = best.piece
    g.offers.value = hand
    g.offerEnhanced.value = hand.map(() => false)
    return best
  }, slot)
  if (!pick) {
    ctx.log.warn('weldNow: nothing on the board can be welded right now — dropping anyway')
    return dropMerging(ctx, slot)
  }
  const done = await drop(ctx, slot, pick.c)
  return { ...done, merged: pick.tier, type: pick.type }
}

/**
 * Drop the piece in `slot` wherever it WELDS, falling back to the emptiest
 * column when nothing would fuse. Returns what happened, for the log.
 */
export const dropMerging = async (ctx, slot, columns = [-2, -1, 0, 1, 2]) => {
  const id = await ctx.evaluate((s) => window.__ts.offers.value[s] ?? null, slot)
  if (!id) return { ok: false, id: null }
  const best = await bestMergeColumn(ctx, id, columns)
  if (best) return { ...(await drop(ctx, slot, best.c)), merged: best.tier }
  const open = await ctx.evaluate((a) => {
    const g = window.__ts
    let pick = null
    for (const c of a.columns) {
      if (!g.canDropAt(c, 1)) continue
      const top = g.columnTop(c)
      if (pick === null || top < pick.top) pick = { c, top }
    }
    return pick
  }, { columns })
  if (!open) return { ok: false, id }
  return { ...(await drop(ctx, slot, open.c)), merged: 0 }
}

/**
 * The column whose drop would WELD, preferring the deepest merge available.
 *
 * `previewDropMerge` answers what a piece would fuse with before it is
 * dropped, which is exactly the question a beat sheet is asking when it says
 * "now weld something": a drop that merely stacks is a different, much duller
 * shot than one that fuses two guns into a bigger one.
 */
export const bestMergeColumn = (ctx, shapeId, columns = [-2, -1, 0, 1, 2]) =>
  ctx.evaluate((a) => {
    const g = window.__ts
    let best = null
    for (const c of a.columns) {
      if (!g.canDropAt(c, 1)) continue
      const preview = g.previewDropMerge(a.shapeId, c) ?? []
      const tier = preview.reduce((n, p) => Math.max(n, p.tier ?? 0), 0)
      if (tier > 0 && (best === null || tier > best.tier)) best = { c, tier }
    }
    return best
  }, { shapeId, columns })

/**
 * Sell the block at `(c, r)` — how a player springs the COLLAPSE TRAP: pull
 * the support out and the crown falls on whatever is underneath.
 *
 * No beat sheet uses it yet, and the reason is measured rather than aesthetic.
 * Selling the third floor of the staged keep mid-wave cost 8 of 23 blocks and
 * killed ONE enemy: the rubble falls down the columns it came from, which is
 * the middle of the tower, while the horde stands beside it at x ±2-4. A clip
 * of it reads as the player demolishing their own tower. Kept because the
 * lever is right — a beat sheet that stages an OVERHANG over a packed lane
 * would get the shot the game's own tutorial calls the best thing in it.
 */
export const sell = (ctx, c, r) =>
  ctx.evaluate((a) => window.__ts.sellBlock(a.c, a.r), { c, r })

/** Three riders out of the gate, into whatever is standing off. */
export const cavalry = (ctx) => ctx.evaluate(() => {
  const g = window.__ts
  // Never let the beat fail on price: these clips are about the spectacle, not
  // about whether this particular staged purse could afford it.
  if (g.runCoins.value < g.cavalryCost()) g.runCoins.value = g.cavalryCost() + 50
  return g.summonCavalry()
})

/**
 * A volley of arrows out of the sky, onto the thickest part of the horde.
 *
 * Aimed at the densest window of its own radius rather than at a fixed spot:
 * the wave composes itself from a seeded roll, so "where the pack is" is known
 * at record time and not at authoring time. Returns the x it hit and how many
 * were under it.
 */
export const arrowRain = (ctx) => ctx.evaluate(() => {
  const g = window.__ts
  const live = g.getEnemies().filter((e) => e.dying <= 0)
  if (live.length === 0) return { fired: false, at: 0, covered: 0 }
  let best = { x: 0, n: -1 }
  for (let x = -14; x <= 14; x += 0.5) {
    const n = live.filter((e) => Math.abs(e.x - x) <= g.ARROW_RAIN_RADIUS).length
    if (n > best.n) best = { x, n }
  }
  if (!g.arrowRainReady.value) g.arrowRainStock.value = 3
  return { fired: g.callArrowRain(best.x), at: best.x, covered: best.n }
})

/**
 * Leave the verdict and start playing again — the last movement of a clip.
 *
 * With the HUD on this is the result screen's button; in a clean feed the
 * result screen is hidden anyway and what the viewer sees is the board wiping
 * and a fresh siege starting, which is what a preview is selling: there is
 * another run right there.
 */
export const playAgain = (ctx) => ctx.evaluate(() => {
  const g = window.__ts
  g.startRun()
  g.seedScriptedOpening()
  g.buildClockHeld.value = true
  return g.blockCount.value
})

/**
 * Mark the money shot as the clip's cover — everywhere except CrazyGames.
 *
 * Their cover guidance is explicit: "Use your static cover as the opening
 * frame: this creates a seamless transition from the thumbnail to the animated
 * preview." An unmarked clip posters on FRAME 0, which is exactly that — so on
 * the `crazygames` format the beat is deliberately not marked, and the cover
 * that comes out beside the mp4 is the frame the video starts on.
 */
export const poster = async (ctx, { needEnemies = true } = {}) => {
  // CrazyGames covers on frame 0 (above), and one cover per clip: the FIRST
  // moment that qualifies keeps it, because `ctx.beat` overwrites and the last
  // call would otherwise win.
  if (ctx.format.id === 'crazygames' || ctx.__posterTaken) return false
  // A cover with an empty battlefield on it is not a cover. The 30 s cut's
  // payoff beat can land after the wave has already broken — measured, the
  // portrait poster came out as a half-built board, no monsters, coins still
  // drifting up — so a beat sheet may offer the cover at several moments and
  // the board decides which one takes it. If none do, the recorder falls back
  // to frame 0, which the pre-roll has guaranteed is a fight.
  if (needEnemies) {
    // Anything on the field counts, the dying included: the best frame in a
    // clip is often the half-second AFTER a volley lands, when the pack is
    // mid-shatter. Counting only the living refused exactly that frame and the
    // 30 s landscape cut came back with no cover at all.
    const onField = await ctx.evaluate(() => window.__ts.getEnemies().length)
    if (onField === 0) return false
  }
  ctx.__posterTaken = true
  ctx.beat('poster')
  return true
}

/**
 * Clamp every wait to what is left of the clip.
 *
 * `--duration 6` then ends the beat sheet cleanly instead of scheduling beats
 * past the last captured frame, and a loop of exchanges stops on the `false`.
 */
export const budget = (ctx) => {
  const total = Math.max(1000, Number(ctx.durationMs) || 10_000)
  // Elapsed is read off the FRAME the capture loop is on, not accumulated from
  // the waits this budget issued. `ctx.stepUntil` advances the clip too — it
  // waits by recording — so a budget counting only its own waits drifts behind
  // by however long a cue took to arrive, and every later `until(…)` lands
  // late. Measured: a fail clip's retry beat arrived at 9.9 s of a 10 s clip
  // instead of at 8.4 s, leaving three frames for the whole last beat.
  const now = () => (ctx.frame() / Math.max(1, ctx.fps)) * 1000
  return {
    async wait(ms) {
      const left = total - now()
      if (left <= 0) return false
      const take = Math.min(Math.max(0, ms), left)
      if (take > 0) await ctx.wait(take)
      return now() < total
    },
    /** Wait until `at` ms into the clip — beat sheets read better as a score
     *  than as a list of gaps, and a score survives a cue arriving late. */
    until(at) { return this.wait(Math.max(0, at - now())) },
    left: () => total - now(),
    spent: now
  }
}
