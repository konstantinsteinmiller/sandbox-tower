import { describe, expect, it, vi } from 'vitest'

// ─── The merge preview tells the truth ──────────────────────────────────────
//
// The drop guides show, before the tap, what every column's drop would weld
// into (`previewDropMerge`). A preview that promises a tier 3 and delivers a
// tier 2 is worse than no preview — the player plans a column around it — so
// every spec here holds the preview to the REAL outcome: the piece is actually
// dropped, the board actually settles, and the blocks whose tier went up are
// compared with what was promised.

const TICK = 1000 / 60

type Game = typeof import('@/use/useTowerGame')

const load = async () => {
  vi.resetModules()
  localStorage.clear()
  const game = await import('@/use/useTowerGame')
  const { DROPMERGE_RULES, BOARD_MAX_ROW } = await import('@/mobile-fit/rules')
  game.applyRules(DROPMERGE_RULES)
  game.startRun()
  // The board, not the opening wave — see the note in `dropmerge.test.ts`.
  game.buildClockHeld.value = true
  rich(game)
  return { game, BOARD_MAX_ROW }
}

const rich = (game: Game): void => {
  game.wood.value = 50_000
  game.runCoins.value = 50_000
}

const settle = (game: Game, maxTicks = 600): void => {
  for (let i = 0; i < maxTicks; i++) {
    game.step(TICK)
    if (game.getDebris().length === 0) return
  }
  throw new Error('the board never settled')
}

/** Stand a block of `typeId` at `(c, r)` and give it a tier. */
const stand = (game: Game, typeId: string, c: number, r: number, tier = 1): void => {
  expect(game.placeBlock(typeId, c, r), `${typeId} at ${c},${r}`).toBe(true)
  game.getBlocks().get(`${c},${r}`)!.tier = tier
}

interface Weld { c: number; r: number; typeId: string; tier: number }

const order = (list: Weld[]): Weld[] =>
  [...list].sort((a, b) => b.tier - a.tier || a.c - b.c || a.r - b.r)

/**
 * Drop `shapeId` into column `c` for real and report the blocks whose tier it
 * raised — the same measure the preview promises. Only honest when nothing is
 * already in the air: a piece still falling would weld on its own and be
 * credited to this drop.
 */
const realWelds = (game: Game, shapeId: string, c: number): Weld[] => {
  expect(game.getDebris()).toHaveLength(0)
  const before = new Map<number, number>()
  for (const b of game.getTowerBlocks().values()) before.set(b.uid, b.tier ?? 1)
  game.offers.value = [shapeId, 'b_archer', 'b_wood']
  expect(game.dropOffer(0, c)).toBe(true)
  settle(game)
  const out: Weld[] = []
  for (const b of game.getTowerBlocks().values()) {
    if (b.typeId === 'gate') continue
    const tier = b.tier ?? 1
    if (tier > (before.get(b.uid) ?? 1)) out.push({ c: b.c, r: b.r, typeId: b.typeId, tier })
  }
  return order(out)
}

/** Preview, then drop for real, and demand they agree. Returns the preview. */
const agrees = (game: Game, shapeId: string, c: number): Weld[] => {
  const promised = order(game.previewDropMerge(shapeId, c))
  expect(realWelds(game, shapeId, c)).toEqual(promised)
  return promised
}

describe('merge preview', () => {
  it('shows a weld DOWN into the twin the piece lands on', async () => {
    const { game } = await load()
    stand(game, 'wood', 2, 0)
    expect(agrees(game, 'b_wood', 2)).toEqual([{ c: 2, r: 0, typeId: 'wood', tier: 2 }])
  })

  it('shows a SIDEWAYS weld at the older block, not where the piece lands', async () => {
    const { game } = await load()
    stand(game, 'wood', -1, 0)
    expect(agrees(game, 'b_wood', -2)).toEqual([{ c: -1, r: 0, typeId: 'wood', tier: 2 }])
    expect(game.getBlocks().has('-2,0')).toBe(false)
  })

  it('follows a cascade to the tier it ends at', async () => {
    // The piece welds down into the tier 1 → a tier 2, which is now the twin
    // of the tier 2 beside it → a tier 3, standing where the OLDER one stood.
    // This is the weld nobody finds by themselves.
    const { game } = await load()
    stand(game, 'wood', -1, 0, 2)
    stand(game, 'wood', -2, 0, 1)
    expect(agrees(game, 'b_wood', -2)).toEqual([{ c: -1, r: 0, typeId: 'wood', tier: 3 }])
  })

  it('promises nothing when the piece would just stand there', async () => {
    const { game } = await load()
    stand(game, 'archer', 1, 0)
    expect(agrees(game, 'b_wood', 1)).toEqual([])
  })

  it('never welds across tiers', async () => {
    const { game } = await load()
    stand(game, 'cannon', 2, 0, 2)
    expect(agrees(game, 'b_cannon', 2)).toEqual([])
  })

  it('reports both welds a two-tall piece makes', async () => {
    // The crate welds down into the crate; the bow then lands where the crate
    // was and welds sideways into the bow beside it.
    const { game } = await load()
    stand(game, 'stone', 1, 0)
    stand(game, 'archer', 1, 1)
    stand(game, 'wood', 2, 0)
    expect(agrees(game, 'perchArcher', 2)).toEqual([
      { c: 1, r: 1, typeId: 'archer', tier: 2 },
      { c: 2, r: 0, typeId: 'wood', tier: 2 }
    ])
  })

  it('follows a weld into the column next door, and what settles there', async () => {
    // The piece welds down into the crate at (2,1) → a tier 2, the twin of
    // the tier-2 crate beside it at (1,1). The OLDER of the two survives, and
    // that is (2,1) — so it is (1,1) that is absorbed, its cell empties, and
    // the stone standing on it drops onto the stone below the gap and welds
    // into it. Two welds from one drop, one of them in a column the finger
    // never touched.
    const { game } = await load()
    stand(game, 'stone', 2, 0)
    stand(game, 'wood', 2, 1)
    stand(game, 'stone', 1, 0)
    stand(game, 'wood', 1, 1, 2)
    stand(game, 'stone', 1, 2)
    expect(agrees(game, 'b_wood', 2)).toEqual([
      { c: 2, r: 1, typeId: 'wood', tier: 3 },
      { c: 1, r: 0, typeId: 'stone', tier: 2 }
    ])
  })

  it('lets a HARD settle land without welding, as the real one does', async () => {
    // Only a gentle landing welds. On this board every settle is gentle, so
    // the rule is invisible — run the same scene with hard settles and the
    // stone that drops into the gap must stay a tier 1.
    const { game } = await load()
    const { DROPMERGE_RULES } = await import('@/mobile-fit/rules')
    game.applyRules({ ...DROPMERGE_RULES, fall: { killCells: 99, gentleSettle: false } })
    game.startRun()
    game.buildClockHeld.value = true
    rich(game)
    stand(game, 'stone', 2, 0)
    stand(game, 'wood', 2, 1)
    stand(game, 'stone', 1, 0)
    stand(game, 'wood', 1, 1, 2)
    stand(game, 'stone', 1, 2)
    expect(agrees(game, 'b_wood', 2)).toEqual([{ c: 2, r: 1, typeId: 'wood', tier: 3 }])
  })

  it('welds a two-tall piece of twins into itself', async () => {
    // Both halves are the same block: the top one lands on the bottom one and
    // the pair arrives as a tier 2 — the shape a stacked reward piece takes.
    const { game } = await load()
    expect(agrees(game, 'w2v', -2)).toEqual([{ c: -2, r: 0, typeId: 'wood', tier: 2 }])
  })

  it('is empty for a full column and for a piece that is not a drop piece', async () => {
    const { game, BOARD_MAX_ROW } = await load()
    for (let r = 0; r <= BOARD_MAX_ROW; r++) stand(game, 'stone', 2, r)
    expect(game.previewDropMerge('b_stone', 2)).toEqual([])
    // A desktop shape two columns wide: not something this board drops.
    expect(game.previewDropMerge('w2h', -1)).toEqual([])
  })

  it('lands the piece already in the air first, and credits its weld to it', async () => {
    const { game } = await load()
    stand(game, 'wood', 2, 0)
    // In the air, and about to weld into the crate on its own.
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    expect(game.dropOffer(0, 2)).toBe(true)
    expect(game.getDebris()).toHaveLength(1)
    // A second crate meets the tier 2 that makes: no weld of ITS own…
    expect(game.previewDropMerge('b_wood', 2)).toEqual([])
    // …while a tier-1 crate dropped beside the column would still find the
    // (soon to be) tier 2 is no twin of its own.
    expect(game.previewDropMerge('b_wood', 1)).toEqual([])
    settle(game)
    expect(game.getBlocks().get('2,0')?.tier).toBe(2)
  })

  it('sees the piece in the air as the twin the next one lands on', async () => {
    const { game } = await load()
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    expect(game.dropOffer(0, 2)).toBe(true)
    expect(game.previewDropMerge('b_wood', 2)).toEqual([{ c: 2, r: 0, typeId: 'wood', tier: 2 }])
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    expect(game.dropOffer(0, 2)).toBe(true)
    settle(game)
    expect(game.getBlocks().get('2,0')?.tier).toBe(2)
    expect(game.getBlocks().has('2,1')).toBe(false)
  })

  it('writes nothing: the board, the air and the uid counter are untouched', async () => {
    const { game } = await load()
    stand(game, 'wood', -1, 0, 2)
    stand(game, 'wood', -2, 0)
    const snapshot = (): string => JSON.stringify(
      [...game.getTowerBlocks().values()].map((b) => [b.uid, b.c, b.r, b.typeId, b.tier ?? 1, b.hp])
    )
    const before = snapshot()
    const version = game.towerVersion.value
    for (let c = -2; c <= 2; c++) game.previewDropMerge('b_wood', c)
    expect(snapshot()).toBe(before)
    expect(game.towerVersion.value).toBe(version)
    expect(game.getDebris()).toHaveLength(0)
    // Had the preview taken a uid, the real drop's piece would be younger than
    // promised and could lose a tie it was promised to win. Agreement on a
    // cascade proves the counter is where the preview left it.
    expect(agrees(game, 'b_wood', -2)).toEqual([{ c: -1, r: 0, typeId: 'wood', tier: 3 }])
  })
})

// ─── Agreement, everywhere ──────────────────────────────────────────────────
//
// The named cases above are the ones a person thinks of. This is the rest: a
// few hundred seeded boards — random columns of random blocks at random tiers,
// including twins already standing side by side — and every drop piece into
// every column, each one previewed and then played for real.

const mulberry = (seed: number): (() => number) => {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('merge preview, on random boards', () => {
  it('agrees with the real drop on every column of 300 seeded boards', async () => {
    const { game } = await load()
    const TYPES = ['wood', 'stone', 'archer', 'cannon']
    const PIECES = ['b_wood', 'b_stone', 'b_archer', 'b_cannon', 'perchArcher', 'perchCannon', 'w2v', 's2v']
    let welds = 0
    let cascades = 0
    for (let seed = 1; seed <= 300; seed++) {
      const rnd = mulberry(seed)
      const piece = PIECES[Math.floor(rnd() * PIECES.length)]!
      const c = Math.floor(rnd() * 5) - 2
      game.startRun()
      game.buildClockHeld.value = true
      rich(game)
      for (let col = -2; col <= 2; col++) {
        // Column 0 stands on the Gate.
        const base = col === 0 ? 1 : 0
        const height = Math.floor(rnd() * 5)
        for (let r = base; r < base + height; r++) {
          const typeId = TYPES[Math.floor(rnd() * TYPES.length)]!
          const tier = rnd() < 0.55 ? 1 : rnd() < 0.7 ? 2 : 3
          stand(game, typeId, col, r, tier)
        }
      }
      const promised = order(game.previewDropMerge(piece, c))
      if (!game.canDropAt(c, piece === 'b_wood' || piece === 'b_stone' || piece === 'b_archer' || piece === 'b_cannon' ? 1 : 2)) {
        expect(promised, `seed ${seed}: a full column promises nothing`).toEqual([])
        continue
      }
      const real = realWelds(game, piece, c)
      expect(real, `seed ${seed}: ${piece} into column ${c}`).toEqual(promised)
      if (promised.length > 0) welds++
      if (promised.some((w) => w.tier >= 3)) cascades++
    }
    // The sweep has to have exercised the interesting outcomes, or agreement on
    // three hundred non-events proves nothing.
    expect(welds).toBeGreaterThan(40)
    expect(cascades).toBeGreaterThan(5)
  })
})

// ─── Gifts ──────────────────────────────────────────────────────────────────
//
// A gift lands already welded (`dropGiftCell`), so its preview drops a cell at
// the gift's tier rather than a tier-1 piece. The case that matters is the
// first-clear gift: a tier-2 cannon held over a standing tier-2 cannon has to
// promise the tier 3 it becomes — and a gift that lands on nothing must not be
// "raised" to the tier it arrived at.
describe('merge preview for a gift', () => {
  /** Drop a gift for real and report the tiers it raised, as `realWelds` does. */
  const realGiftWelds = (game: Game, typeId: string, tier: number, c: number): Weld[] => {
    expect(game.getDebris()).toHaveLength(0)
    const before = new Map<number, number>()
    for (const b of game.getTowerBlocks().values()) before.set(b.uid, b.tier ?? 1)
    const uidNext = Math.max(0, ...[...game.getTowerBlocks().values()].map((b) => b.uid)) + 1
    expect(game.dropGiftCell(typeId, tier, c)).toBe(true)
    settle(game)
    const out: Weld[] = []
    for (const b of game.getTowerBlocks().values()) {
      if (b.typeId === 'gate') continue
      const t = b.tier ?? 1
      const was = before.get(b.uid) ?? (b.uid >= uidNext ? tier : 1)
      if (t > was) out.push({ c: b.c, r: b.r, typeId: b.typeId, tier: t })
    }
    return order(out)
  }

  it('promises the tier 3 a tier-2 cannon gift makes on a tier-2 cannon — and delivers it', async () => {
    const { game } = await load()
    stand(game, 'cannon', 2, 0, 2)
    const promised = order(game.previewGiftDrop('cannon', 2, 2))
    expect(promised).toEqual([{ c: 2, r: 0, typeId: 'cannon', tier: 3 }])
    expect(realGiftWelds(game, 'cannon', 2, 2)).toEqual(promised)
  })

  it('promises nothing for a gift that lands on nothing, whatever tier it arrives at', async () => {
    const { game } = await load()
    expect(game.previewGiftDrop('frost', 2, -2)).toEqual([])
    expect(realGiftWelds(game, 'frost', 2, -2)).toEqual([])
    expect(game.getBlocks().get('-2,0')?.tier).toBe(2)
  })

  it('does not weld a tier-2 gift into a tier-1 twin', async () => {
    const { game } = await load()
    stand(game, 'cannon', 1, 0, 1)
    expect(game.previewGiftDrop('cannon', 2, 1)).toEqual([])
    expect(realGiftWelds(game, 'cannon', 2, 1)).toEqual([])
  })
})
