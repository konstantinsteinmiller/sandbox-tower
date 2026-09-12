/**
 * ─── FAIL, 5 s: Poki's animated thumbnail, the other cut ────────────────────
 *
 * The same square, the same three-scene shape, the opposite outcome — so the
 * portal's own A/B has something to choose between.
 *
 *   0.0–1.8  the golem on the wall, taking the tower apart a block at a time
 *   1.8–3.2  THE GATE GOES: the collapse, the flash
 *   3.2–5.0  a fresh siege standing on the same ground — the retry, happening
 *
 * Five seconds cannot carry a near-miss (there is no time to be ahead first),
 * so this one is not sold as a loss the viewer should feel: it is sold as the
 * biggest thing in the game hitting the thing the player was protecting.
 */

import * as g from './_drive.mjs'

export default {
  id: 'fail-5s',
  label: 'Thumbnail — the Gate goes',

  async setup(ctx) {
    // A boss wave with the Gate already on its last legs: five seconds has no
    // room to wear one down, and the beat this clip is built around is the
    // moment it breaks.
    const wave = g.waveFor(20)
    await g.boot(ctx, {
      wave,
      snapshot: g.runSnapshot('desktop', wave, { gateHp: 110 })
    })
    const called = await g.callWave(ctx)
    ctx.log.info(`wave ${called.wave}: ${called.total} enemies${called.boss ? ' (BOSS)' : ''}`)
    // Hold until the GATE ITSELF is losing health, not merely until something
    // is close: the escort reaches the walls in seconds and dies there, and a
    // thumbnail built around the Gate breaking cannot open before anything has
    // laid a hand on it. Measured — on a contact condition, this clip ended
    // with the Gate still standing.
    await g.prerollToGatePressure(ctx, { floorMs: 14_000, lost: 0.08, maxMs: 24_000 })
    await g.log(ctx, 'frame 0')
  },

  async record(ctx) {
    const t = g.budget(ctx)
    const end = ctx.durationMs

    // ── scene 1 (0.0–1.8): the tower coming apart ──
    ctx.beat('open')
    await t.until(1_600)

    // ── scene 2 (1.8–3.2): the Gate falls ──
    const fell = await ctx.stepUntil(
      () => window.__ts.phase.value === 'defeat',
      { timeoutMs: 1_800, label: 'the Gate falls' }
    )
    if (fell) {
      // Half a second past the blow: at the blow the screen is a white wash,
      // and this thumbnail's cover is the one frame Poki shows when it is not
      // playing.
      await t.until(t.spent() + 500)
      await g.poster(ctx, { needEnemies: false })
    } else {
      ctx.beat('holding')
      ctx.log.warn('the Gate held — the thumbnail ends mid-siege')
    }
    await t.until(3_100)

    // ── scene 3 (3.2–5.0): a whole tower standing there again ──
    await g.playAgain(ctx)
    ctx.beat('retry')
    await g.callWave(ctx)
    await t.until(end)
    await g.log(ctx, 'last frame')
  }
}
