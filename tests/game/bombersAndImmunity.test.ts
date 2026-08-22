import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ENEMY_DEFS, isImmuneTo, resistOf } from '@/game/enemies'
import { BLOCK_DEFS } from '@/game/blocks'
import { bombShare, countBombers, planWave } from '@/game/waves'

// The simulation is a module-level singleton (project convention), so each test
// re-imports it fresh to get a clean tower.
const loadGame = async () => {
  vi.resetModules()
  localStorage.clear()
  return import('@/use/useTowerGame')
}

/** Run the fixed-step sim for `ms` of simulated time. */
const advance = (g: { step: (ms: number) => void }, ms: number): void => {
  for (let t = 0; t < ms; t += 16) g.step(16)
}

beforeEach(() => {
  localStorage.clear()
})

describe('arrow resistance', () => {
  it('turns three quarters of an arrow aside on both rams, and nothing else', () => {
    for (const id of ['ram', 'ironRam'] as const) {
      expect(resistOf(id, 'bolt'), id).toBeCloseTo(0.75, 5)
      expect(resistOf(id, 'ball'), id).toBe(0)
      expect(resistOf(id, 'shell'), id).toBe(0)
      expect(resistOf(id, 'zap'), id).toBe(0)
    }
  })

  it('stops short of immunity, so nothing invalidates a weapon outright', () => {
    // Graded, not binary. An absolute immunity makes every archer in the tower
    // stop firing and makes an AREA attack aimed at the thing do literally
    // nothing — which reads as a bug rather than as a rule.
    for (const d of Object.values(ENEMY_DEFS)) {
      for (const kind of ['bolt', 'ball', 'shell', 'zap', 'frost'] as const) {
        expect(isImmuneTo(d.id, kind), `${d.id}/${kind}`).toBe(false)
      }
    }
  })

  it('leaves every enemy but the rams taking full damage from everything', () => {
    for (const d of Object.values(ENEMY_DEFS)) {
      if (d.id === 'ram' || d.id === 'ironRam') continue
      expect(d.resist, d.id).toBeUndefined()
    }
  })

  it('is answered better by at least one starting weapon', () => {
    // A resist that no reachable block can beat is not a puzzle, it is a wall.
    // The Cannon is unlocked from the first run, so the better answer always
    // exists even if the player never touched the tech tree.
    const answers = Object.values(BLOCK_DEFS).filter(
      (b) => b.weapon && resistOf('ironRam', b.weapon.projectile) === 0
    )
    expect(answers.length).toBeGreaterThan(0)
    expect(answers.some((b) => !b.unlockNode)).toBe(true)
  })

  it('still lets archers shoot a ram — for a quarter of their worth', async () => {
    const g = await loadGame()
    g.startRun()
    g.wood.value = 999
    g.stone.value = 999
    expect(g.placeBlock('archer', 1, 0)).toBe(true)
    g.callWave()

    const def = ENEMY_DEFS.ironRam!
    const enemies = g.getEnemies()
    enemies.length = 0
    // Spawned through the real path, not hand-pushed into the array: a homing
    // round resolves its target through `enemiesByUid`, so an enemy that was
    // never registered there is one every arrow flies straight past.
    g.debugSpawn(['ironRam'])
    const ram = enemies.find((e) => e.typeId === 'ironRam')!
    ram.x = -4
    ram.cd = 999_999

    // Its ceiling is the SPAWNED one — the wave's difficulty scaling is already
    // on it, so the printed `def.hp` is not what is standing there.
    const full = ram.maxHp
    expect(full).toBeGreaterThan(0)

    advance(g, 3000)

    // It IS a legal target now — a bad trade is still a trade, and a turret
    // that refuses to take it leaves the player watching an idle tower.
    expect(ram.hp).toBeLessThan(full)
    // But a bad one. A fresh run has no damage tech, no ranks and no banners,
    // so an arrow is worth exactly its printed damage — and what landed here
    // must divide into whole arrows each worth a QUARTER of that.
    const dealt = full - ram.hp
    const quarterArrow = BLOCK_DEFS.archer!.weapon!.damage * 0.25
    const arrows = dealt / quarterArrow
    expect(arrows).toBeCloseTo(Math.round(arrows), 4)
    expect(Math.round(arrows)).toBeGreaterThan(0)
  })
})

describe('bombers', () => {
  it('never close to melee range', () => {
    for (const d of Object.values(ENEMY_DEFS)) {
      if (!d.bombRun) continue
      // The whole point: a bomber holds station well above the crown, so a
      // tower whose anti-air sits ON the crown cannot simply wait for it.
      expect(d.bombRun.altitude, d.id).toBeGreaterThan(2)
      expect(d.movement, d.id).toBe('air')
    }
  })

  it('reserves budget for bombers only once they unlock', () => {
    expect(bombShare(1)).toBe(0)
    expect(bombShare(10)).toBe(0)
    expect(bombShare(11)).toBeGreaterThan(0)
    for (let w = 11; w <= 60; w++) expect(bombShare(w)).toBeLessThanOrEqual(0.55)
  })

  it('keeps them out of waves before they unlock', () => {
    for (let w = 1; w < 11; w++) expect(countBombers(planWave(w))).toBe(0)
  })

  it('actually schedules them once they unlock', () => {
    let seen = 0
    for (let w = 11; w <= 30; w++) seen += countBombers(planWave(w))
    expect(seen).toBeGreaterThan(0)
  })

  it('climbs above the tower crown instead of diving into it', async () => {
    const g = await loadGame()
    g.startRun()
    g.wood.value = 9999
    g.stone.value = 9999
    // A five-storey tower: the sort of build that used to be safe from air.
    for (let r = 1; r <= 5; r++) expect(g.placeBlock('wood', 0, r)).toBe(true)
    g.callWave()

    const enemies = g.getEnemies()
    enemies.length = 0
    const def = ENEMY_DEFS.bombardier!
    enemies.push({
      uid: 90_002, typeId: 'bombardier', x: -9, y: 1,
      hp: def.hp, maxHp: def.hp, dir: 1, cd: def.attackCooldownMs,
      targetUid: -1, slowMs: 0, slowPct: 0, flash: 0, phase: 0, dying: 0
    })

    advance(g, 9000)

    const e = enemies[0]!
    // Crown is row 5, so the station is 5 + 1 + 3.2 ≈ 9.2 cells up.
    expect(e.y).toBeGreaterThan(7)
    expect(Math.abs(e.x)).toBeLessThan(1.5)
  })

  it('drops ordnance that damages the tower it flies over', async () => {
    const g = await loadGame()
    g.startRun()
    g.wood.value = 9999
    g.stone.value = 9999
    for (let r = 1; r <= 4; r++) expect(g.placeBlock('wood', 0, r)).toBe(true)
    const crown = g.getBlocks().get('0,4')!
    const before = crown.hp
    g.callWave()

    const enemies = g.getEnemies()
    enemies.length = 0
    const def = ENEMY_DEFS.bombardier!
    enemies.push({
      uid: 90_003, typeId: 'bombardier', x: 0, y: 8.2,
      hp: def.hp, maxHp: def.hp, dir: 1, cd: 0,
      targetUid: -1, slowMs: 0, slowPct: 0, flash: 0, phase: 0, dying: 0
    })

    advance(g, 6000)

    // Either the crown took damage, or it was destroyed outright — both prove
    // the round reached a block instead of sailing through the tower.
    const after = g.getBlocks().get('0,4')
    expect(after === undefined || after.hp < before).toBe(true)
  })

  it('sets the tower alight with a molotov and keeps burning after impact', async () => {
    const g = await loadGame()
    g.startRun()
    g.wood.value = 9999
    g.stone.value = 9999
    for (let r = 1; r <= 3; r++) expect(g.placeBlock('stone', 0, r)).toBe(true)
    g.callWave()

    const enemies = g.getEnemies()
    enemies.length = 0
    const def = ENEMY_DEFS.firebug!
    enemies.push({
      uid: 90_004, typeId: 'firebug', x: 0, y: 7.6,
      hp: def.hp, maxHp: def.hp, dir: 1, cd: 0,
      targetUid: -1, slowMs: 0, slowPct: 0, flash: 0, phase: 0, dying: 0
    })

    advance(g, 2500)
    const lit = [...g.getBlocks().values()].filter((b) => (b.burnMs ?? 0) > 0)
    expect(lit.length).toBeGreaterThan(0)

    // Burning keeps eating HP on its own, with the bomber long gone.
    enemies.length = 0
    const target = lit[0]!
    const hpAtIgnition = target.hp
    advance(g, 2000)
    const still = g.getBlocks().get(`${target.c},${target.r}`)
    expect(still === undefined || still.hp < hpAtIgnition).toBe(true)
  })

  it('lets a fire burn itself out rather than eating the tower forever', async () => {
    const g = await loadGame()
    g.startRun()
    g.wood.value = 9999
    g.stone.value = 9999
    expect(g.placeBlock('stone', 1, 0)).toBe(true)
    const b = g.getBlocks().get('1,0')!
    b.burnMs = 800
    b.burnDps = 4

    advance(g, 4000)
    expect(b.burnMs ?? 0).toBe(0)
    const settled = b.hp
    advance(g, 2000)
    expect(b.hp).toBe(settled)
  })
})
