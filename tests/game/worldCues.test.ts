import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  __setReducedMotion, beginStrandedScan, endStrandedScan, gateAlarm, gateBlinkRed,
  gateBlinkWhite, gatePopScale, isStranded, lostMarkFade, lostMarkSlots, markStranded,
  noteGateHit, noteLostBlock, rejectFlash, rejectShake, requestRejectFlash, resetWorldCues,
  strandedCount, vignette, GATE_ALARM_MS, GATE_POP_MS, LOST_MARK_MS, MAX_LOST_MARKS,
  REJECT_MS, VIGNETTE_GAP_MS, VIGNETTE_MS
} from '@/use/useWorldCues'
import type { Block } from '@/game/types'
import type { FxEvent } from '@/use/useTowerVfx'

// ─── World cues ─────────────────────────────────────────────────────────────
//
// The blind playtest's three "the game is broken" moments — a block gone with
// nothing left behind, a Gate losing with nothing on screen, an enemy nothing
// could shoot — are answered by pictures on the battlefield. The pictures are
// drawn by the renderer; the RULES that decide when they show live in
// `useWorldCues` and are pinned here, because a cue that fires on the wrong
// frame (or never stops) is worse than no cue.

beforeEach(() => {
  resetWorldCues()
  __setReducedMotion(false)
})
afterEach(() => __setReducedMotion(false))

const liveMarks = (now: number) => lostMarkSlots().filter((m) => lostMarkFade(m, now) > 0)

describe('lost-block ghosts', () => {
  it('stand at full strength when they appear and are gone after their life', () => {
    noteLostBlock(2, 1.5, 1, 1, 1000)
    const [m] = liveMarks(1000)
    expect(m).toBeDefined()
    expect(lostMarkFade(m!, 1000)).toBe(1)
    expect(lostMarkFade(m!, 1000 + LOST_MARK_MS / 2)).toBeGreaterThan(0)
    expect(lostMarkFade(m!, 1000 + LOST_MARK_MS)).toBe(0)
    expect(liveMarks(1000 + LOST_MARK_MS)).toHaveLength(0)
  })

  it('keep the footprint of a merged block, never less than one cell', () => {
    noteLostBlock(0.5, 1, 2, 1, 0)
    noteLostBlock(3, 0.5, 0, 0, 0)
    const [wide, tiny] = liveMarks(0)
    expect([wide!.w, wide!.h]).toEqual([2, 1])
    expect([tiny!.w, tiny!.h]).toEqual([1, 1])
  })

  it('never hold more than the ring, overwriting the oldest loss', () => {
    for (let i = 0; i < MAX_LOST_MARKS + 3; i++) noteLostBlock(i, 0.5, 1, 1, 100)
    const live = liveMarks(100)
    expect(live).toHaveLength(MAX_LOST_MARKS)
    // The first three losses were overwritten by the last three.
    expect(live.some((m) => m.x === 0)).toBe(false)
    expect(live.some((m) => m.x === MAX_LOST_MARKS + 2)).toBe(true)
  })

  it('expire rather than freeze when the clock goes backwards', () => {
    noteLostBlock(1, 0.5, 1, 1, 5000)
    expect(liveMarks(10)).toHaveLength(0)
  })
})

describe('the Gate under attack', () => {
  it('holds the alarm while blows land and lets it go after', () => {
    noteGateHit(-1, 1000)
    expect(gateAlarm(1000)).toBe(1)
    noteGateHit(-1, 1900)
    // The second blow restarts it — a sustained siege keeps the outline on.
    expect(gateAlarm(1900 + GATE_ALARM_MS / 2)).toBeGreaterThan(0)
    expect(gateAlarm(1900 + GATE_ALARM_MS)).toBe(0)
  })

  it('flashes the edge the blow came from, and only that edge', () => {
    noteGateHit(1, 2000)
    expect(vignette(1, 2000 + 50)).toBeGreaterThan(0)
    expect(vignette(-1, 2000 + 50)).toBe(0)
    expect(vignette(1, 2000 + VIGNETTE_MS)).toBe(0)
  })

  it('throttles each edge so a steady siege cannot strobe', () => {
    noteGateHit(-1, 0)
    // Blows every 300 ms: the edge must NOT restart its flash on each one.
    for (let t = 300; t < VIGNETTE_GAP_MS; t += 300) noteGateHit(-1, t)
    expect(vignette(-1, VIGNETTE_MS + 10)).toBe(0)
    // After the gap a new blow may flash again.
    noteGateHit(-1, VIGNETTE_GAP_MS)
    expect(vignette(-1, VIGNETTE_GAP_MS + 50)).toBeGreaterThan(0)
  })

  it('under reduced motion holds a steady tint instead of flashing', () => {
    __setReducedMotion(true)
    noteGateHit(1, 0)
    const early = vignette(1, 40)
    const later = vignette(1, 600)
    expect(early).toBeGreaterThan(0)
    expect(later).toBe(early)
    expect(vignette(1, GATE_ALARM_MS + 10)).toBe(0)
  })
})

describe('the Gate taking a blow', () => {
  const samples = (from: number, to: number, f: (t: number) => number): number[] => {
    const out: number[] = []
    for (let t = from; t < to; t += 4) out.push(f(t))
    return out
  }

  it('rests at 1 until struck', () => {
    expect(gatePopScale(0)).toBe(1)
    expect(gateBlinkWhite(0)).toBe(0)
    expect(gateBlinkRed(0)).toBe(0)
  })

  it('hops about 12 %, overshoots below rest, and settles inside its window', () => {
    noteGateHit(0, 1000)
    const s = samples(1000, 1000 + GATE_POP_MS, gatePopScale)
    const peak = Math.max(...s)
    expect(peak).toBeGreaterThan(1.1)
    expect(peak).toBeLessThan(1.13)
    // The cartoon part: it comes back down PAST rest before it settles.
    expect(Math.min(...s)).toBeLessThan(0.97)
    expect(gatePopScale(1000 + GATE_POP_MS)).toBe(1)
  })

  it('blinks white and red in turn, sharp, then lets the red drain', () => {
    noteGateHit(0, 0)
    expect(gateBlinkWhite(10)).toBeGreaterThan(0.5)
    expect(gateBlinkRed(10)).toBe(0)
    expect(gateBlinkWhite(70)).toBe(0)
    expect(gateBlinkRed(70)).toBeGreaterThan(0.5)
    expect(gateBlinkWhite(130)).toBeGreaterThan(0.5)
    // After the strobe: no white, a red that only ever falls, then nothing.
    const tail = samples(250, GATE_POP_MS, gateBlinkRed)
    expect(samples(250, GATE_POP_MS, gateBlinkWhite).every((a) => a === 0)).toBe(true)
    for (let i = 1; i < tail.length; i++) expect(tail[i]!).toBeLessThanOrEqual(tail[i - 1]!)
    expect(gateBlinkRed(GATE_POP_MS)).toBe(0)
  })

  it('does not restart the hop on every blow of a siege', () => {
    noteGateHit(0, 0)
    // A blow every 100 ms: the hop started at 0 keeps playing, rather than
    // being pinned at its first frame by each new one.
    for (let t = 100; t < GATE_POP_MS * 0.7; t += 100) noteGateHit(0, t)
    expect(gatePopScale(GATE_POP_MS + 1)).toBe(1)
    // Once most of it has played, the next blow does start a new one.
    noteGateHit(0, GATE_POP_MS)
    expect(Math.max(...samples(GATE_POP_MS, GATE_POP_MS * 1.3, gatePopScale))).toBeGreaterThan(1.1)
  })

  it('under reduced motion does not move or strobe — one red wash', () => {
    __setReducedMotion(true)
    noteGateHit(0, 0)
    expect(samples(0, GATE_POP_MS, gatePopScale).every((s) => s === 1)).toBe(true)
    expect(samples(0, GATE_POP_MS, gateBlinkWhite).every((a) => a === 0)).toBe(true)
    const red = samples(0, GATE_POP_MS, gateBlinkRed)
    expect(red[0]).toBeGreaterThan(0.5)
    for (let i = 1; i < red.length; i++) expect(red[i]!).toBeLessThanOrEqual(red[i - 1]!)
  })
})

describe('a refused placement', () => {
  it('is stamped on the renderer\'s next frame and fades over its window', () => {
    expect(rejectFlash(100)).toBe(0)
    requestRejectFlash()
    expect(rejectFlash(5000)).toBe(1)
    expect(rejectFlash(5000 + REJECT_MS / 2)).toBeCloseTo(0.5, 5)
    expect(rejectFlash(5000 + REJECT_MS)).toBe(0)
  })

  it('shakes only in the first half, and not at all under reduced motion', () => {
    requestRejectFlash()
    rejectFlash(0)
    let peak = 0
    for (let t = 0; t < REJECT_MS / 2; t += 7) peak = Math.max(peak, Math.abs(rejectShake(t)))
    expect(peak).toBeGreaterThan(0)
    expect(peak).toBeLessThanOrEqual(0.09)
    for (let t = REJECT_MS / 2 + 1; t < REJECT_MS; t += 7) expect(rejectShake(t)).toBe(0)

    resetWorldCues()
    __setReducedMotion(true)
    requestRejectFlash()
    for (let t = 0; t < REJECT_MS; t += 7) expect(rejectShake(t)).toBe(0)
    // …while the green anchors still carry the answer.
    expect(rejectFlash(10)).toBeGreaterThan(0)
  })
})

describe('the stranded list', () => {
  it('is rebuilt in place by each scan and counted for the HUD', () => {
    beginStrandedScan()
    markStranded(7)
    markStranded(9)
    endStrandedScan()
    expect(strandedCount.value).toBe(2)
    expect(isStranded(7)).toBe(true)
    expect(isStranded(8)).toBe(false)

    beginStrandedScan()
    markStranded(9)
    endStrandedScan()
    expect(strandedCount.value).toBe(1)
    expect(isStranded(7)).toBe(false)

    resetWorldCues()
    expect(strandedCount.value).toBe(0)
    expect(isStranded(9)).toBe(false)
  })
})

// ─── What the simulation publishes ──────────────────────────────────────────

const loadGame = async () => {
  vi.resetModules()
  localStorage.clear()
  const game = await import('@/use/useTowerGame')
  const vfx = await import('@/use/useTowerVfx')
  const cues = await import('@/use/useWorldCues')
  return { game, vfx, cues }
}

const gateOf = (blocks: Map<number, Block>): Block => {
  for (const b of blocks.values()) if (b.typeId === 'gate') return b
  throw new Error('no gate')
}

describe('events the renderer draws from', () => {
  it('a destroyed block reports its footprint so its ghost can stand there', async () => {
    const { game, vfx } = await loadGame()
    game.startRun()
    game.wood.value = 500
    game.stone.value = 500
    expect(game.placeBlock('wood', -1, 0)).toBeTruthy()
    const block = game.blockAt(-1, 0)!
    vfx.drainFx()
    game.damageBlockForTest(block, 1e6)
    const shatter = vfx.drainFx().find((e): e is Extract<FxEvent, { kind: 'shatter' }> => e.kind === 'shatter')
    expect(shatter).toBeDefined()
    expect([shatter!.w, shatter!.h]).toEqual([game.spanW(block), game.spanH(block)])
  })

  it('a sale leaves no ghost — it is not a loss', async () => {
    const { game, vfx } = await loadGame()
    game.startRun()
    game.wood.value = 500
    game.placeBlock('wood', -1, 0)
    vfx.drainFx()
    game.sellBlock(-1, 0)
    expect(vfx.drainFx().some((e) => e.kind === 'shatter')).toBe(false)
  })

  it('a blow on the Gate says which side it came from', async () => {
    const { game, vfx } = await loadGame()
    game.startRun()
    const gate = gateOf(game.getTowerBlocks())
    const gx = game.centreX(gate)
    vfx.drainFx()

    game.damageBlockForTest(gate, 1, undefined, gx - 4)
    game.damageBlockForTest(gate, 1, undefined, gx + 4)
    game.damageBlockForTest(gate, 1)
    const sides = vfx.drainFx()
      .filter((e): e is Extract<FxEvent, { kind: 'gateHit' }> => e.kind === 'gateHit')
      .map((e) => e.side)
    expect(sides).toEqual([-1, 1, 0])
  })

  it('a blow on any other block is not a Gate alarm', async () => {
    const { game, vfx } = await loadGame()
    game.startRun()
    game.wood.value = 500
    game.placeBlock('wood', -1, 0)
    vfx.drainFx()
    game.damageBlockForTest(game.blockAt(-1, 0)!, 1, undefined, -5)
    expect(vfx.drainFx().some((e) => e.kind === 'gateHit')).toBe(false)
  })

  it('an enemy hitting a tower that has no gun is marked stranded', async () => {
    const { game, cues } = await loadGame()
    game.startRun()
    expect(game.bestWeaponReach()).toBe(0)
    game.callWave()
    game.debugSpawn(['grunt'])
    const grunt = game.getEnemies().find((e) => e.typeId === 'grunt')!
    for (let i = 0; i < 4000 && grunt.targetUid < 0 && grunt.dying <= 0; i++) game.step(16.67)
    expect(grunt.targetUid).toBeGreaterThanOrEqual(0)
    // Let the 4 Hz reach scan see it.
    for (let i = 0; i < 20; i++) game.step(16.67)
    expect(cues.isStranded(grunt.uid)).toBe(true)
    expect(cues.strandedCount.value).toBeGreaterThanOrEqual(1)
  })

  it('an enemy still walking in is never marked, even with no gun on the tower', async () => {
    const { game, cues } = await loadGame()
    game.startRun()
    game.callWave()
    game.debugSpawn(['grunt'])
    const grunt = game.getEnemies().find((e) => e.typeId === 'grunt')!
    for (let i = 0; i < 20; i++) game.step(16.67)
    expect(grunt.targetUid).toBeLessThan(0)
    expect(cues.isStranded(grunt.uid)).toBe(false)
  })

  it('an enemy the tower can shoot is never marked', async () => {
    const { game, cues } = await loadGame()
    game.startRun()
    game.wood.value = 500
    game.stone.value = 500
    game.placeBlock('archer', 0, 1)
    game.callWave()
    game.debugSpawn(['ram'])
    for (let i = 0; i < 400; i++) game.step(16.67)
    expect(cues.strandedCount.value).toBe(0)
  })

  it('a standoff engine beyond every gun is marked', async () => {
    const { game, cues } = await loadGame()
    game.startRun()
    game.wood.value = 500
    game.placeBlock('archer', 0, 1)
    game.callWave()
    game.debugSpawn(['trebuchet'])
    for (let i = 0; i < 400; i++) game.step(16.67)
    const treb = game.getEnemies().find((e) => e.typeId === 'trebuchet')!
    expect(game.unreachableSiege.value).toBe(1)
    expect(cues.isStranded(treb.uid)).toBe(true)
  })
})

// ─── The killing blow ───────────────────────────────────────────────────────
//
// The defeat opens on a three-second spotlight on whoever brought the Gate
// down. The simulation names them; these pin that it names the right one.

describe('the killing blow', () => {
  /** A fresh grunt, teleported onto the Gate — the nearest enemy by far. */
  const bystanderAt = (game: Awaited<ReturnType<typeof loadGame>>['game'], gate: Block) => {
    game.debugSpawn(['grunt'])
    const b = game.getEnemies().reduce((m, e) => (e.uid > m.uid ? e : m))
    b.x = game.centreX(gate)
    b.y = game.centreY(gate)
    return b
  }

  it('names the enemy that last struck the Gate, not merely the nearest', async () => {
    const { game } = await loadGame()
    game.startRun()
    const gate = gateOf(game.getTowerBlocks())
    game.callWave()
    game.debugSpawn(['grunt'])
    const hp0 = gate.hp
    for (let i = 0; i < 6000 && gate.hp >= hp0; i++) game.step(16.67)
    expect(gate.hp, 'something reached the Gate').toBeLessThan(hp0)

    // Someone who never swung now stands on the Gate; a finishing blow with no
    // attacker in hand (a fire, say) must still go to the one who did swing.
    const bystander = bystanderAt(game, gate)
    game.damageBlockForTest(gate, 1e9)
    const kb = game.killingBlow.value
    expect(kb).not.toBeNull()
    expect(kb!.uid).toBeGreaterThanOrEqual(0)
    expect(kb!.uid).not.toBe(bystander.uid)
    expect(game.getEnemies().some((e) => e.uid === kb!.uid)).toBe(true)
  })

  it('falls back to the nearest enemy when nobody has struck the Gate yet', async () => {
    const { game } = await loadGame()
    game.startRun()
    const gate = gateOf(game.getTowerBlocks())
    game.callWave()
    const bystander = bystanderAt(game, gate)
    game.damageBlockForTest(gate, 1e9)
    expect(game.killingBlow.value?.uid).toBe(bystander.uid)
    expect(game.killingBlow.value?.typeId).toBe('grunt')
  })

  it('names nobody, at the Gate, on an empty field — and clears with the next run', async () => {
    const { game } = await loadGame()
    game.startRun()
    const gate = gateOf(game.getTowerBlocks())
    const [gx, gy] = [game.centreX(gate), game.centreY(gate)]
    game.damageBlockForTest(gate, 1e9)
    expect(game.killingBlow.value).toEqual({ uid: -1, typeId: '', x: gx, y: gy })
    game.startRun()
    expect(game.killingBlow.value).toBeNull()
  })

  it('is not set by the loss of any other block', async () => {
    const { game } = await loadGame()
    game.startRun()
    game.wood.value = 500
    game.placeBlock('wood', -1, 0)
    game.damageBlockForTest(game.blockAt(-1, 0)!, 1e9)
    expect(game.killingBlow.value).toBeNull()
  })
})
