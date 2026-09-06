import { describe, expect, it, vi } from 'vitest'
import {
  waveReward, previewsFor, planWave, countAir, countSea, countBlast, countSiege
} from '@/game/waves'
import {
  expectedPower, towerPower, adaptiveFactor, clampDifficulty,
  MIN_ADAPTIVE, MAX_ADAPTIVE, MAX_STREAK_MUL, FlawlessTracker
} from '@/game/difficulty'
import { BLOCK_DEFS, sellRefund, blockUpgradeCost } from '@/game/blocks'
import { ENEMY_DEFS } from '@/game/enemies'
import { TECH_BY_ID, TECH_NODES, techCost } from '@/game/tech'

/**
 * Contracts from the first-time-player balance pass (see `balancing.md`).
 *
 * Each of these encodes a specific way the game used to be unfair to a new
 * player, so that a future tuning pass has to break the test deliberately
 * rather than by accident.
 */

/** The tower a player fields by simply spending their income — the reference
 *  line `expectedPower` is fitted to. Mirrors `tools/balance-replay.ts`. */
const referencePower = (wave: number): number => {
  let wood = 120
  let stone = 40
  const blocks = ['gate', 'wood', 'wood', 'cannon']
  for (let w = 1; w <= wave; w++) {
    let guard = 0
    for (;;) {
      if (guard++ > 400) break
      const guns = blocks.filter((b) => BLOCK_DEFS[b]!.weapon).length
      const walls = blocks.length - guns
      const wantGun = walls > guns * 2
      if (wantGun && wood >= 25 && stone >= 10) { wood -= 25; stone -= 10; blocks.push('cannon'); continue }
      if (wantGun && wood >= 20) { wood -= 20; blocks.push('archer'); continue }
      if (stone >= 16) { stone -= 16; blocks.push('stone'); continue }
      if (wood >= 10) { wood -= 10; blocks.push('wood'); continue }
      break
    }
    const r = waveReward(w)
    wood += r.wood
    stone += r.stone
  }
  const hp = blocks.reduce((n, id) => n + BLOCK_DEFS[id]!.hp + (BLOCK_DEFS[id]!.armor ?? 0) * 6, 0)
  const dps = blocks.reduce((n, id) => {
    const w = BLOCK_DEFS[id]!.weapon
    if (!w) return n
    return n + (w.damage / w.cooldownMs) * 1000 * (1 + (w.splash ?? 0) * 0.6)
  }, 0)
  return towerPower({ hp, dps, blocks: blocks.length, height: 1, antiAir: 0 })
}

describe('difficulty calibration', () => {
  it('centres the reference tower near ratio 1, not far above it', () => {
    // The old curve claimed ~620 power at wave 1 against a tower that actually
    // measures ~1050, so `adaptiveFactor` never dropped near 1 and competent
    // play paid a permanent surcharge it could not see or escape.
    for (const w of [1, 3, 6, 10, 15, 20]) {
      const ratio = referencePower(w) / expectedPower(w)
      expect(ratio).toBeGreaterThan(0.6)
      expect(ratio).toBeLessThan(1.7)
    }
  })

  it('lets the adaptive term move in BOTH directions for a reference tower', () => {
    // A curve the reference player is always above is not adaptive difficulty,
    // it is a surcharge. Somewhere in the first twenty waves it must be able to
    // price a wave below neutral as well as above it.
    const factors = [1, 3, 6, 10, 15, 20].map((w) => adaptiveFactor(w, referencePower(w)))
    expect(Math.min(...factors)).toBeLessThan(1.1)
    expect(Math.max(...factors)).toBeGreaterThan(0.85)
  })

  it('bounds the COMBINED scalar, not just the adaptive half', () => {
    // adaptive x flawless could reach 2.6 * 2.2 = 5.72 — about 3.5x the units
    // arriving 2.4x faster, which is the exact "unrecognisable from its number"
    // the bound exists to prevent.
    expect(clampDifficulty(MAX_ADAPTIVE * MAX_STREAK_MUL)).toBeLessThanOrEqual(MAX_ADAPTIVE)
    expect(clampDifficulty(0.01)).toBe(MIN_ADAPTIVE)
    expect(clampDifficulty(Number.NaN)).toBe(MIN_ADAPTIVE)
    expect(clampDifficulty(1.4)).toBeCloseTo(1.4, 5)
  })

  it('gives a struggling player back the floor they earned away', () => {
    // With a one-way ratchet, ten clean waves banked x2.2 forever — so the
    // adaptive FLOOR for that player became 0.75 * 2.2 = 1.65 and the rescue
    // could never reach them.
    const f = new FlawlessTracker()
    for (let i = 0; i < 20; i++) f.recordWave(false)
    expect(f.multiplier).toBeCloseTo(MAX_STREAK_MUL, 5)
    for (let i = 0; i < 20; i++) f.recordWave(true)
    expect(f.multiplier).toBe(1)
  })
})

describe('the unannounced walls', () => {
  it('previews every mechanic before the wave that tests it', () => {
    const previewed = (id: string): number =>
      [...Array(20).keys()].find((w) => previewsFor(w).some(([t]) => t === id)) ?? Infinity

    // A bomber one-shots un-armoured wood in a 1.7-cell radius and eight of
    // them landed at wave 8 with the first one a player ever saw among them.
    expect(previewed('bomber')).toBeLessThan(ENEMY_DEFS.bomber!.minWave ?? 99)
    // Wave 12 used to debut armour, bomb-runs AND re-open the sea lane at once.
    expect(previewed('bulwark')).toBeLessThan(12)
    expect(previewed('bombardier')).toBeLessThan(12)
    // The first enemy neither starting weapon can reach.
    expect(previewed('ballista')).toBeLessThan(16)
  })

  it('keeps a single bomber blast from deleting a whole wood cluster', () => {
    // Blast damage applies to EVERY block in the radius, so at 45 against a
    // 40-hp un-armoured crate one bomber removed three to seven cells at once —
    // more than the entire wave's income at the wave it arrives.
    expect(ENEMY_DEFS.bomber!.suicide!.damage).toBeLessThan(BLOCK_DEFS.wood!.hp)
  })

  it('leaves the first standoff engine inside a starting weapon s reach', () => {
    expect(ENEMY_DEFS.ballista!.siege!.standoff!)
      .toBeLessThanOrEqual(BLOCK_DEFS.cannon!.weapon!.range)
  })

  it('keeps every standoff engine answerable by more than one weapon', () => {
    // The point of a standoff engine is to ask for reach, not to be immortal.
    // At 12 the catapult could only be answered by a mortar, a galley or a
    // cavalry sortie, and at wave 17 a player who has bought neither reach node
    // simply watches it work.
    const ranges = Object.values(BLOCK_DEFS)
      .map((b) => b.weapon?.range ?? 0)
      .filter((r) => r > 0)
    for (const id of ['ballista', 'catapult', 'trebuchet'] as const) {
      const standoff = ENEMY_DEFS[id]!.siege!.standoff!
      const answers = ranges.filter((r) => r >= standoff)
      // More than one, because "answerable by the single longest gun in the
      // game" means owning it AND having it on the right edge facing the right
      // way, which is not an answer a player can plan around.
      expect(answers.length, `${id} answerable by ${answers.length}`).toBeGreaterThan(1)
    }
  })

  it('exposes every threat count the HUD needs', () => {
    // These helpers shipped with the wave director, documented as feeding the
    // incoming-threat warning, and had no caller for the life of the project.
    const plan = planWave(16, 1)
    for (const fn of [countAir, countSea, countBlast, countSiege]) {
      expect(typeof fn(plan)).toBe('number')
    }
  })
})

describe('economy', () => {
  it('opens a second income slope once attrition outruns the first', () => {
    // Waves 12-20 destroy far more than the linear term replaces; the early
    // game keeps its scarcity because that is where the offer deck matters.
    expect(waveReward(5).wood).toBe(15 + 5 * 2.4)
    expect(waveReward(9).wood).toBe(15 + 9 * 2.4)
    expect(waveReward(20).wood).toBeGreaterThan(15 + 20 * 2.4)
    // ...and it is a ramp, not a step.
    const gain = (w: number): number => waveReward(w).wood / (15 + w * 2.4)
    expect(gain(12)).toBeLessThan(gain(20))
    expect(gain(20)).toBeGreaterThan(1.3)
  })

  it('prices producers so one pays back well inside a run', () => {
    // Every yield carries a +20 % pass over its first tuning. A producer is a
    // cell that neither shoots nor soaks, so it competes with a gun for space
    // AND for the resources that would have bought the gun.
    const payback = (id: string): number => {
      const d = BLOCK_DEFS[id]!
      const cost = (d.cost.wood ?? 0) + (d.cost.stone ?? 0) + (d.cost.coins ?? 0)
      const per = (d.economy!.wood ?? 0) + (d.economy!.stone ?? 0)
        + (d.economy!.gold ?? 0) + (d.economy!.coins ?? 0)
      return cost / per
    }
    // Derived, not listed. The hardcoded list went stale the moment the
    // duplicate producer tier was removed, and a test that names blocks by hand
    // fails for the wrong reason: it reports a balance regression when what
    // actually happened is that the catalogue changed under it.
    const producers = Object.values(BLOCK_DEFS).filter((d) => d.kind === 'economy')
    expect(producers.length).toBeGreaterThan(0)
    for (const d of producers) {
      expect(payback(d.id), d.id).toBeLessThan(12)
    }
  })

  it('ships exactly ONE producer per resource', () => {
    // The whole point of removing the deep tier. Two blocks that share a
    // palette, a glyph and a description, and differ only by a number the
    // player cannot see, are not a choice — they are a memory test.
    const byResource = new Map<string, string[]>()
    for (const d of Object.values(BLOCK_DEFS)) {
      if (d.kind !== 'economy' || !d.economy) continue
      for (const res of ['wood', 'stone', 'gold', 'coins'] as const) {
        if ((d.economy[res] ?? 0) <= 0) continue
        byResource.set(res, [...(byResource.get(res) ?? []), d.id])
      }
    }
    for (const [res, ids] of byResource) expect(ids, res).toHaveLength(1)
    // ...and every resource the bar displays still has one.
    expect([...byResource.keys()].sort()).toEqual(['gold', 'stone', 'wood'])
  })

  it('grows producers through tech instead of replacing them', () => {
    // The nodes that used to unlock the second tier now raise what the first
    // one yields, and they are RANKED rather than binary — a one-shot unlock
    // converted to a one-shot buff would have been the same dead end.
    const lane = TECH_NODES.filter((n) => n.effect.kind === 'economyYield')
    expect(lane.length).toBeGreaterThanOrEqual(3)
    for (const n of lane) expect(n.maxLevel, n.id).toBeGreaterThan(1)
    // Nothing in the tree still points at a block that no longer exists.
    for (const n of TECH_NODES) {
      if (n.effect.kind !== 'unlock') continue
      expect(BLOCK_DEFS[n.effect.blockId], n.id).toBeDefined()
    }
  })

  it('keeps the in-game Fusion offer buyable in one tap', () => {
    // GameScene offers Fusion from the HUD — the mechanic almost nobody found
    // in the store — and buys it with the prerequisite in a single tap, for a
    // total it reads off this tree. That shortcut assumes the shape below:
    // ONE prerequisite, itself a root. Grow the chain and the offer would
    // charge for the first node and silently fail on the second, which is the
    // worst outcome available. Break this deliberately, and fix `onBuyMerge`.
    const merge = TECH_BY_ID['unlockMerge']!
    expect(merge.requires).toEqual(['foundations'])
    expect(TECH_BY_ID['foundations']!.requires).toEqual([])

    // And the price the HUD shows. 200 for the unlock, plus 20 for the first
    // rank of `foundations` — half of its 40, because a ranked node's opening
    // rank is discounted. This is the "220 coins" the offer waits for.
    expect(techCost('unlockMerge', 0)).toBe(200)
    expect(techCost('foundations', 0)).toBe(20)
  })

  it('refunds the gold sunk into a block s ranks', () => {
    // `sellRefund` read `def.cost` alone, so every coin invested in a block was
    // destroyed on sale — which made upgrading anything you might rearrange a
    // trap the game never warned about.
    const plain = sellRefund('cannon')
    const ranked = sellRefund('cannon', 1, 3)
    const spent = blockUpgradeCost('cannon', 0)
      + blockUpgradeCost('cannon', 1)
      + blockUpgradeCost('cannon', 2)
    expect(ranked.coins - plain.coins).toBe(Math.floor(spent * 0.5))
  })
})

describe('the tech tree', () => {
  it('puts a visible purchase inside a first run s budget', () => {
    // A first run pays roughly 60-115 coins. Everything affordable used to be a
    // percentage the player could not perceive; at least one node in that band
    // must change what they can BUILD.
    const cheapUnlocks = Object.values(TECH_BY_ID)
      .filter((n) => n.effect.kind === 'unlock' && n.costBase <= 115)
    expect(cheapUnlocks.length).toBeGreaterThan(0)
  })

  it('never offers a strictly dominated node', () => {
    // Enemy armour is percentage-based, so +7% fire rate and +7% damage are the
    // same number. `rapidFire` sat a tier deeper and cost 2.3x `sharpBolts` for
    // exactly that — nobody should ever buy a worse version of what they own.
    const rapid = TECH_BY_ID.rapidFire!
    const sharp = TECH_BY_ID.sharpBolts!
    expect(rapid.effect.pct).toBe(sharp.effect.pct)
    expect(rapid.costBase).toBeLessThan(sharp.costBase * 2)
  })

  it('does not price the harbour below the land tree s opening', () => {
    // Ground infantry cannot reach hulls and no sea enemy exists before wave
    // 12, so a cheap harbour was seven berths of turret that eleven waves could
    // not answer — the correct first purchase for reasons nobody designed.
    expect(TECH_BY_ID.harbour!.costBase)
      .toBeGreaterThan(TECH_BY_ID.unlockBrace!.costBase)
    expect(TECH_BY_ID.harbour!.costBase)
      .toBeGreaterThan(TECH_BY_ID.unlockSpikes!.costBase)
  })
})

describe('no soft-lock at the wallet floor', () => {
  const load = async () => {
    vi.resetModules()
    localStorage.clear()
    const g = await import('@/use/useTowerGame')
    g.startRun()
    return g
  }

  it('always leaves something the player can actually build', async () => {
    // Wave-1 income is 17 wood; the cheapest gun is 20. Below that floor the
    // guarantee used to deal an unaffordable card, and ~82 % of hands contained
    // nothing payable at all. A fresh game per case, because the relief is
    // deliberately once-per-build-phase — see the next test.
    for (const [wood, stone] of [[17, 12], [9, 9], [0, 0], [19, 15]] as const) {
      const g = await load()
      g.wood.value = wood
      g.stone.value = stone
      g.runCoins.value = 0
      g.rerollOffer(0)
      const payable = g.offers.value.filter((id) => g.canAffordShape(id))
      expect(payable.length).toBeGreaterThan(0)
    }
  })

  it('floors the purse once per build phase, not once per reroll', async () => {
    // Otherwise it is an infinite resource tap: spend to zero, reroll, repeat.
    const g = await load()
    g.wood.value = 0
    g.stone.value = 0
    g.runCoins.value = 0
    g.rerollOffer(0)
    const floored = g.wood.value
    expect(floored).toBeGreaterThan(0)

    g.wood.value = 0
    g.rerollOffer(1)
    expect(g.wood.value).toBe(0)
  })

  it('does nothing for a player who can already afford something', async () => {
    const g = await load()
    g.wood.value = 500
    g.stone.value = 500
    const before = g.wood.value
    g.rerollOffer(0)
    expect(g.wood.value).toBe(before)
  })
})
