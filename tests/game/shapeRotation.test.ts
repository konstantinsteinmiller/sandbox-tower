import { describe, expect, it } from 'vitest'
import {
  SHAPE_DEFS, SHAPE_BY_ID, canRotateShape, normRot, rotatedShape, shapeCost
} from '@/game/shapes'

const keyOf = (cells: ReadonlyArray<[number, number, string]>): string =>
  cells.map(([x, y, t]) => `${x},${y},${t}`).sort().join('|')

describe('turning a piece', () => {
  it('leaves single-cell pieces alone', () => {
    // Rotating a 1×1 is a no-op that still costs a keypress and a moment
    // wondering whether the game heard you.
    for (const def of SHAPE_DEFS) {
      if (def.cells.length > 1) continue
      expect(canRotateShape(def.id), def.id).toBe(false)
      for (const rot of [1, 2, 3]) {
        expect(keyOf(rotatedShape(def.id, rot).cells), def.id).toBe(keyOf(def.cells))
      }
    }
  })

  it('offers four orientations for every multi-cell piece', () => {
    for (const def of SHAPE_DEFS) {
      if (def.cells.length <= 1) continue
      expect(canRotateShape(def.id), def.id).toBe(true)
    }
  })

  it('comes back to where it started after four turns', () => {
    for (const def of SHAPE_DEFS) {
      expect(keyOf(rotatedShape(def.id, 4).cells), def.id).toBe(keyOf(def.cells))
    }
  })

  it('never loses, gains or changes a cell', () => {
    // Rotation moves cells; it must not alter WHAT the piece is made of, or the
    // price charged at placement stops matching the thing placed.
    for (const def of SHAPE_DEFS) {
      const want = [...def.cells.map(([, , t]) => t)].sort().join(',')
      for (const rot of [1, 2, 3]) {
        const got = rotatedShape(def.id, rot)
        expect(got.cells.length, `${def.id}@${rot}`).toBe(def.cells.length)
        expect([...got.cells.map(([, , t]) => t)].sort().join(','), `${def.id}@${rot}`).toBe(want)
      }
    }
  })

  it('re-anchors every orientation to the origin', () => {
    // Placement treats the anchor as the low-left cell of the footprint. An
    // orientation that kept negative offsets would silently shift the piece off
    // the cell the player is pointing at.
    for (const def of SHAPE_DEFS) {
      for (const rot of [0, 1, 2, 3]) {
        const { cells } = rotatedShape(def.id, rot)
        expect(Math.min(...cells.map(([x]) => x)), `${def.id}@${rot}`).toBe(0)
        expect(Math.min(...cells.map(([, y]) => y)), `${def.id}@${rot}`).toBe(0)
      }
    }
  })

  it('keeps every orientation a connected piece', () => {
    for (const def of SHAPE_DEFS) {
      for (const rot of [0, 1, 2, 3]) {
        const { cells } = rotatedShape(def.id, rot)
        const all = new Set(cells.map(([x, y]) => `${x},${y}`))
        const seen = new Set<string>()
        const stack = [`${cells[0]![0]},${cells[0]![1]}`]
        while (stack.length > 0) {
          const at = stack.pop()!
          if (seen.has(at)) continue
          seen.add(at)
          const [x, y] = at.split(',').map(Number) as [number, number]
          for (const n of [`${x - 1},${y}`, `${x + 1},${y}`, `${x},${y - 1}`, `${x},${y + 1}`]) {
            if (all.has(n) && !seen.has(n)) stack.push(n)
          }
        }
        expect(seen.size, `${def.id}@${rot}`).toBe(all.size)
      }
    }
  })

  it('turns an L the way the player sees it — clockwise', () => {
    // wL is (0,0) (0,1) (1,1): a vertical bar with a foot to the upper right.
    // `dy` grows UPWARD, so one clockwise quarter-turn on screen sends the
    // upright arm to the right and the foot to the lower right.
    expect(keyOf(rotatedShape('wL', 1).cells))
      .toBe(keyOf([[0, 1, 'wood'], [1, 1, 'wood'], [1, 0, 'wood']]))
  })

  it('costs exactly the same in every orientation', () => {
    for (const def of SHAPE_DEFS) {
      const base = shapeCost(def.id)
      for (const rot of [1, 2, 3]) {
        const cells = rotatedShape(def.id, rot).cells
        expect(cells.length).toBe(def.cells.length)
      }
      expect(shapeCost(def.id)).toEqual(base)
    }
  })

  describe('gables', () => {
    it('never invents one on a piece that had none', () => {
      for (const def of SHAPE_DEFS) {
        if ((def.roofs?.length ?? 0) > 0) continue
        for (const rot of [0, 1, 2, 3]) {
          expect(rotatedShape(def.id, rot).roofs, `${def.id}@${rot}`).toEqual([])
        }
      }
    })

    it('re-derives them onto cells with open sky, so a turned piece is legal', () => {
      // This is the trap. `wRoof2` is a horizontal pair with a gable on BOTH
      // cells. Carrying those indices through a quarter-turn puts a gable on
      // the BOTTOM cell of a vertical pair — sealing the column against the
      // piece's own second cell, which no placement could ever satisfy.
      for (const def of SHAPE_DEFS) {
        if ((def.roofs?.length ?? 0) === 0) continue
        for (const rot of [0, 1, 2, 3]) {
          const { cells, roofs } = rotatedShape(def.id, rot)
          expect(roofs.length, `${def.id}@${rot}`).toBeGreaterThan(0)
          const own = new Set(cells.map(([x, y]) => `${x},${y}`))
          for (const i of roofs) {
            const [x, y] = cells[i]!
            expect(own.has(`${x},${y + 1}`), `${def.id}@${rot} gable at ${x},${y}`).toBe(false)
          }
        }
      }
    })

    it('caps a rotated roofed run at its top cell only', () => {
      const upright = rotatedShape('wRoof2', 1)
      expect(upright.roofs).toHaveLength(1)
      const [, ry] = upright.cells[upright.roofs[0]!]!
      expect(ry).toBe(1)
    })
  })

  it('wraps the rotation index in both directions', () => {
    expect(normRot(0)).toBe(0)
    expect(normRot(4)).toBe(0)
    expect(normRot(-1)).toBe(3)
    expect(normRot(-5)).toBe(3)
    expect(normRot(7)).toBe(3)
  })

  it('does not mutate the authored definition', () => {
    const before = keyOf(SHAPE_BY_ID.wL!.cells)
    rotatedShape('wL', 1)
    rotatedShape('wL', 2)
    expect(keyOf(SHAPE_BY_ID.wL!.cells)).toBe(before)
  })
})
