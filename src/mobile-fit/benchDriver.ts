/**
 * ─── Bench driver — deterministic autoplay for the Drop & Merge board ───────
 *
 * Loaded ONLY when `?bench=<ms>` is present (see `GameSceneDrop.onMounted`), so
 * nothing here reaches a player's bundle: the import is dynamic and the caller
 * is behind a boot-time flag.
 *
 * Why the game drives itself instead of the CDP runner poking at it: the runner
 * can only dispatch touch events at wall-clock intervals, and a throttled rep
 * that runs at 12 fps receives a completely different number of taps from one
 * that runs at 50 — so the FASTER variant would end up playing a fuller board.
 * Driving from the simulation clock instead means both variants play the same
 * game, which is the whole premise of the A/B (MEASURING.md § Determinism).
 *
 * The scenario is the worst realistic moment this board has: a full-ish tower
 * on wave 12+ with a wave permanently in flight, so every rep measures peak
 * enemies, peak projectiles and peak VFX rather than the build phase.
 */

import { BOARD_HALF_WIDTH } from './rules'

export interface BenchApi {
  phase: { value: string }
  wave: { value: number }
  wood: { value: number }
  offers: { value: string[] }
  callWave: () => void
  dropOffer: (slot: number, c: number) => boolean
  canDropAt: (c: number, cells?: number) => boolean
  debugSetWave: (n: number) => void
  setGameSpeed: (n: number) => void
}

/** mulberry32 — same generator the probe installs, kept local so the driver's
 *  column choices do not consume draws from the simulation's stream. */
const rng = (seed: number): (() => number) => {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Step the scripted player. Called once per simulation tick from the scene's
 * loop with the tick's `dt`, so the script advances on SIMULATION time and is
 * identical across variants regardless of how fast each one renders.
 */
export const makeBenchDriver = (api: BenchApi, seed: number, startWave: number) => {
  const rand = rng(seed)
  let elapsed = 0
  let nextAction = 0
  let seeded = false

  return (dtMs: number): void => {
    elapsed += dtMs

    // Seeding waits for the scene to finish booting, and is then re-checked on
    // EVERY tick rather than latched. `boot()` is async — it awaits the
    // first-start interstitial before calling `beginRun()`, which resets the
    // run — so a jump applied on the driver's first tick was thrown away a
    // moment later and the rep quietly ran wave 1 on an empty board. Latching
    // "seeded" the first time the jump appeared to take just moved the race
    // one tick later: `beginRun()` could still land afterwards, and then
    // nothing put the wave back. A re-check costs one comparison a tick and
    // cannot be lost.
    if (elapsed < 1500) return
    if (api.wave.value < startWave - 1) {
      seeded = false
      api.wood.value = 999_999
      api.setGameSpeed(1)
      api.debugSetWave(startWave)
      return
    }
    if (!seeded) {
      seeded = true
      // Start the action clock at the jump, not at page load, so the script
      // plays the same opening however long the boot took.
      nextAction = elapsed
    }

    if (elapsed < nextAction) return
    // One action every 220 ms of SIM time: fast enough to keep the board full,
    // slow enough that the tower is not instantly at the ceiling.
    nextAction = elapsed + 220

    // Keep a wave permanently in flight — the measured scenario is the battle.
    if (api.phase.value === 'build') {
      api.callWave()
      return
    }

    // Drop into a random legal column. Wood is topped up so the only limit is
    // board geometry.
    api.wood.value = Math.max(api.wood.value, 50_000)
    const cols: number[] = []
    for (let c = -BOARD_HALF_WIDTH; c <= BOARD_HALF_WIDTH; c++) {
      if (api.canDropAt(c, 1)) cols.push(c)
    }
    if (cols.length === 0) return
    const c = cols[Math.floor(rand() * cols.length)]!
    const slot = Math.floor(rand() * Math.max(1, api.offers.value.length))
    api.dropOffer(slot, c)
  }
}
