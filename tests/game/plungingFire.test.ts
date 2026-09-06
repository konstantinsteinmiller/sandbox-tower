import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BLOCK_DEFS } from '@/game/blocks'

// ─── Plunging fire ──────────────────────────────────────────────────────────
//
// Reach used to be a plain radius for every weapon, which made a tower's own
// height eat its guns' ground coverage: at a mount ten cells up an Archery
// post, a Cannon and a Bombard could not reach the ground AT ALL, so every
// upper floor became an anti-air emplacement whether the player wanted one or
// not. Building upward — the thing the game is named after — was a downgrade.
//
// Weapons that throw a physical round now charge only the horizontal gap once
// the target is at or below the muzzle. The two that throw nothing (a hitscan
// bolt and a chilling burst) keep the honest radius.

/** Every weapon this file mounts sits behind an unlock node, so the tech has to
 *  be seeded BEFORE the module is imported. */
const loadGame = async () => {
  vi.resetModules()
  localStorage.clear()
  localStorage.setItem('tower_state', JSON.stringify({
    ts_tech: {
      levels: {
        foundations: 1, unlockBombard: 1, unlockMortar: 1,
        unlockTesla: 1, unlockFrost: 1
      }
    }
  }))
  return import('@/use/useTowerGame')
}

beforeEach(() => {
  localStorage.clear()
})

/** The column is built at c = 2, not 0: the Gate already owns the middle of
 *  row 0 and refuses to be built over. */
const COL = 2

/**
 * Stack a bare column, mount `weaponId` on top of it, and report whether that
 * weapon ACQUIRES a ground enemy parked `dx` cells from the tower centre.
 *
 * Firing is detected off `recoil`, which `stepTurrets` sets on every shot —
 * projectiles would miss the hitscan weapons, which are half the point here.
 */
const canHit = async (weaponId: string, height: number, dx: number): Promise<boolean> => {
  const g = await loadGame()
  g.startRun()
  g.wood.value = 90000
  g.stone.value = 90000
  g.runCoins.value = 90000
  for (let r = 0; r < height; r++) {
    if (!g.placeBlock('stone', COL, r)) throw new Error(`could not stack to row ${r}`)
  }
  if (!g.placeBlock(weaponId, COL, height)) throw new Error(`could not mount ${weaponId}`)

  const gun = [...g.getTowerBlocks().values()].find((b) => b.typeId === weaponId)!
  // Deliberately NO `callWave`. Turrets cool down and fire during the build
  // phase too, and calling a real wave puts a dozen other enemies on the field
  // — the gun then fires at one of THOSE and the probe reports a hit at a
  // range it never actually reached. One pinned grunt, nothing else moving.
  g.debugSpawn(['grunt'])
  const e = g.getEnemies()[0]!
  expect(g.getEnemies()).toHaveLength(1)

  for (let i = 0; i < 60; i++) {
    // Pin it: the question is acquisition, not whether it survives the walk in.
    e.x = COL + dx
    e.y = 0.5
    e.hp = e.maxHp
    e.dying = 0
    g.step(16.67)
    if (gun.recoil > 0) return true
  }
  return false
}

describe('which weapons plunge', () => {
  it('flags every weapon that throws a physical round, and nothing else', () => {
    const plunging: string[] = []
    const radial: string[] = []
    for (const d of Object.values(BLOCK_DEFS)) {
      if (!d.weapon) continue
      ;(d.weapon.plunging ? plunging : radial).push(d.id)
    }
    // A hitscan bolt and a chilling burst have no arc to fall along.
    expect(radial.sort()).toEqual(['frost', 'tesla'])
    expect(plunging.sort()).toEqual(
      ['archer', 'bombard', 'cannon', 'galley', 'longship', 'mortar', 'skiff']
    )
  })
})

describe('height no longer costs ground coverage', () => {
  it('lets a cannon ten cells up shoot the ground it used to be blind to', async () => {
    // The exact case that motivated this: cannon range 8.5 at a mount ten cells
    // up needs dx² ≤ 8.5² − 9.5², which is negative. It could hit nothing.
    expect(await canHit('cannon', 10, 6)).toBe(true)
  })

  it('gives an archer on a high mount its full horizontal reach', async () => {
    // Just inside 7.5 — under the old radius this was unreachable from row 10.
    expect(await canHit('archer', 10, 7)).toBe(true)
  })

  it('still stops at the horizontal range, so reach is not unlimited', async () => {
    // Plunging removes the HEIGHT cost, not the range. A cannon is still a
    // cannon: past 8.5 cells sideways it has nothing to say.
    expect(await canHit('cannon', 10, 14)).toBe(false)
  })

  it('leaves a ground-level mount exactly as it was', async () => {
    // Nothing about the change may move the numbers the early game is tuned on.
    expect(await canHit('cannon', 1, 6)).toBe(true)
    expect(await canHit('cannon', 1, 14)).toBe(false)
  })
})

describe('the two weapons that throw nothing', () => {
  it('keeps the honest radius on a Lightning Coil', async () => {
    // Tesla range 8: from ten cells up, a ground target 6 across is 6² + 9.5²
    // away — outside, and it stays outside.
    expect(await canHit('tesla', 10, 6)).toBe(false)
  })

  it('keeps the honest radius on a Frost Spire', async () => {
    expect(await canHit('frost', 10, 5)).toBe(false)
  })

  it('still lets both fire from a low mount', async () => {
    expect(await canHit('tesla', 1, 5)).toBe(true)
    expect(await canHit('frost', 1, 4)).toBe(true)
  })
})
