/**
 * ─── SUCCESS, 5 s: Poki's animated thumbnail ────────────────────────────────
 *
 * Poki's square thumbnail is not a trailer. It is "2-3 distinct scenes of 1-2
 * seconds", muted, at 50 fps or better, and the square CROPS THE EDGES — so
 * everything that matters has to happen over the middle of the board.
 *
 * Three scenes, no story:
 *
 *   0.0–1.6  the tower under attack: guns firing, the horde on the walls
 *   1.6–3.2  the volley falls and the pack in front of the Gate dies at once
 *   3.2–5.0  riders through the wreckage; the field empties
 *
 * The square is recorded as the DESKTOP tower (`preview.config.mjs`): the phone
 * board is five columns of a portrait screen and would sit in a square with its
 * head and feet cut off.
 */

import * as g from './_drive.mjs'

export default {
  id: 'success-5s',
  label: 'Thumbnail — the volley',

  async setup(ctx) {
    // The same wave the 10 s success stages: at wave 12 the tower kills the
    // horde at range and the volley fell on two stragglers.
    await g.boot(ctx, { wave: g.waveFor(17) })
    const called = await g.callWave(ctx)
    ctx.log.info(`wave ${called.wave}: ${called.total} enemies`)
    // Further into the wave than the 10 s clip: five seconds has no room for a
    // build-up, so frame 0 is already the thick of it — and a PACK, not a
    // straggler, because the volley is the only beat this thumbnail has.
    await g.prerollUntil(ctx, {
      floorMs: 8_000,
      maxMs: 14_000,
      label: 'a pack on the walls',
      until: () => window.__ts.getEnemies()
        .filter((e) => e.dying <= 0 && Math.abs(e.x) < 6).length >= 3
    })
    await g.log(ctx, 'frame 0')
  },

  async record(ctx) {
    const t = g.budget(ctx)

    // ── scene 1 (0.0–1.6): the siege, at its busiest ──
    ctx.beat('open')
    await t.until(1_500)

    // ── scene 2 (1.6–3.2): the volley — the one thing this thumbnail sells ──
    const volley = await g.arrowRain(ctx)
    ctx.log.info(`arrow rain at x=${volley.at} over ${volley.covered} enemies`)
    await t.until(2_300)
    await g.poster(ctx)
    await t.until(3_200)

    // ── scene 3 (3.2–5.0): riders through what is left ──
    await g.cavalry(ctx)
    await t.until(ctx.durationMs)
    await g.log(ctx, 'last frame')
  }
}
