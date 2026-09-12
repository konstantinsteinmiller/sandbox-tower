import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'
import { saveDataVersion, flushSaveNow } from '@/use/useSaveStatus'
import { getState, setState, setStates, towerState } from '@/use/useTowerState'
import {
  BEST_HEIGHT_KEY, BEST_BLOCKS_KEY,
  TOTAL_KILLS_KEY, TOTAL_WAVES_KEY, RUNS_KEY, TOTAL_BLOCKS_KEY, BEST_SCORE_KEY
} from '@/keys'
import useTowerEconomy from '@/use/useTowerEconomy'
import {
  TECH_NODES, techCost, sumEffect, unlockedBlocks, nodeIn
} from '@/game/tech'
import { BLOCK_DEFS } from '@/game/blocks'
import { activeRules, onRulesChange, type RuleSet } from '@/game/rules'
import type { TechNode } from '@/game/types'

/**
 * Meta progression: permanent tech levels + lifetime statistics.
 *
 * Everything here lives inside the single `tower_state` blob and is re-read on
 * BOTH `saveDataVersion` (cloud hydrate finished) and `towerState` identity
 * changes (a cloud sync wrote back into the blob) — the two-watcher pattern is
 * what keeps a returning player from being rendered as a fresh one for the
 * frame or two between boot and hydrate.
 *
 * WHICH tree and WHICH keys are the active rule set's business
 * (`@/game/rules`): the desktop DAG lives under `ts_tech`, a mobile-fit mode's
 * strip under its own key, and the two never see each other's levels. The
 * wallet, the lifetime counters and the run count are shared on purpose —
 * progress follows the player across devices.
 */

interface TechState { levels: Record<string, number> }

const R = (): RuleSet => activeRules.current
const nodesNow = (): ReadonlyArray<TechNode> => R().tech.nodes
const nodeOf = (id: string): TechNode | undefined => nodeIn(nodesNow(), id)

/** Bumped whenever the rule set changes, so every computed below re-reads. */
const rulesVersion = ref(0)

const readNumber = (key: string, fallback: number): number => {
  const v = getState<unknown>(key)
  if (v === undefined || v === null) return fallback
  const n = typeof v === 'number' ? v : parseInt(String(v), 10)
  return Number.isFinite(n) ? n : fallback
}

const loadTech = (): TechState => {
  const v = getState<Partial<TechState> | null>(R().tech.stateKey, null)
  const levels: Record<string, number> = {}
  if (v && v.levels && typeof v.levels === 'object') {
    for (const node of nodesNow()) {
      const lvl = (v.levels as Record<string, unknown>)[node.id]
      if (typeof lvl === 'number' && Number.isFinite(lvl)) {
        // Repeatable nodes are uncapped, so the clamp only ever bites on the
        // binary unlock nodes.
        levels[node.id] = Math.max(0, Math.min(node.maxLevel, Math.floor(lvl)))
      }
    }
  }
  return { levels }
}

const tech: Ref<TechState> = ref(loadTech())
const bestWave: Ref<number> = ref(readNumber(R().save.bestWaveKey, 0))
const bestHeight: Ref<number> = ref(readNumber(BEST_HEIGHT_KEY, 0))
const bestBlocks: Ref<number> = ref(readNumber(BEST_BLOCKS_KEY, 0))
const bestScore: Ref<number> = ref(readNumber(BEST_SCORE_KEY, 0))
const totalKills: Ref<number> = ref(readNumber(TOTAL_KILLS_KEY, 0))
const totalWaves: Ref<number> = ref(readNumber(TOTAL_WAVES_KEY, 0))
const totalBlocks: Ref<number> = ref(readNumber(TOTAL_BLOCKS_KEY, 0))
const runs: Ref<number> = ref(readNumber(RUNS_KEY, 0))

const refresh = (): void => {
  tech.value = loadTech()
  bestWave.value = readNumber(R().save.bestWaveKey, bestWave.value)
  bestHeight.value = readNumber(BEST_HEIGHT_KEY, bestHeight.value)
  bestBlocks.value = readNumber(BEST_BLOCKS_KEY, bestBlocks.value)
  bestScore.value = readNumber(BEST_SCORE_KEY, bestScore.value)
  totalKills.value = readNumber(TOTAL_KILLS_KEY, totalKills.value)
  totalWaves.value = readNumber(TOTAL_WAVES_KEY, totalWaves.value)
  totalBlocks.value = readNumber(TOTAL_BLOCKS_KEY, totalBlocks.value)
  runs.value = readNumber(RUNS_KEY, runs.value)
}
watch(saveDataVersion, refresh)
watch(towerState, refresh, { deep: false })

// The module-level refs were read from the DESKTOP keys at import time. A mode
// that applies its own rules afterwards has to re-read, or it would play its
// first run on the desktop's tech levels until the next cloud hydrate.
onRulesChange(() => {
  rulesVersion.value++
  // `bestWave` is per mode; a fresh read must not fall back to the other
  // mode's record.
  bestWave.value = 0
  refresh()
})

// ─── Derived combat modifiers ───────────────────────────────────────────────
//
// One computed per effect kind, each read once per wave (not per frame) by the
// simulation. Percentages accumulate additively across nodes, which keeps the
// numbers legible to the player ("+8 % per level, three levels = +24 %")
// instead of compounding into something nobody can reason about.

export const levelOf = (id: string): number => tech.value.levels[id] ?? 0

const sum = (kind: Parameters<typeof sumEffect>[1]): number => {
  void rulesVersion.value
  return sumEffect(tech.value.levels, kind, nodesNow())
}

export const damageMul: ComputedRef<number> = computed(() => 1 + sum('damage') / 100)
export const fireRateMul: ComputedRef<number> = computed(() => 1 + sum('fireRate') / 100)
export const rangeMul: ComputedRef<number> = computed(() => 1 + sum('range') / 100)
export const splashMul: ComputedRef<number> = computed(() => 1 + sum('splash') / 100)
export const chainBonus: ComputedRef<number> = computed(() => sum('chain'))
export const blockHpMul: ComputedRef<number> = computed(() => 1 + sum('blockHp') / 100)
export const gateHpMul: ComputedRef<number> = computed(() => 1 + sum('gateHp') / 100)
export const armorBonus: ComputedRef<number> = computed(() => sum('armor'))
export const waveRewardMul: ComputedRef<number> = computed(() => 1 + sum('waveReward') / 100)
export const coinDropMul: ComputedRef<number> = computed(() => 1 + sum('coinDrop') / 100)
export const waveRepairPct: ComputedRef<number> = computed(() => sum('waveRepair') / 100)
/** Spiked-wall reflect multiplier. */
export const thornsMul: ComputedRef<number> = computed(() => 1 + sum('thorns') / 100)
/** Cavalry HP + damage multiplier. */
export const cavalryMul: ComputedRef<number> = computed(() => 1 + sum('cavalryPower') / 100)

// ─── Merging ────────────────────────────────────────────────────────────────

/**
 * Whether adjacent blocks fuse at all.
 *
 * The rule set is the ONLY answer now: merging is the game's best verb and it
 * is on from the first placement of a first run, on both boards. It used to be
 * sold in the tech tree for 200 coins, and the measured outcome was that most
 * players never met it — finding it required reading a screen they had no
 * reason to open. A mechanic nobody discovers is worth less than a mechanic
 * nobody pays for, so the node is gone and the tutorial teaches the merge
 * instead. `off` stays reachable for a rule set that genuinely wants no
 * merging; nothing ships with it today.
 */
export const mergeUnlocked: ComputedRef<boolean> = computed(() => {
  void rulesVersion.value
  return R().merge !== 'off'
})

/**
 * Extra damage for MERGED blocks only.
 *
 * Deliberately not a general damage node: it rewards the player who has
 * committed to concentrating their tower, and does nothing at all for one who
 * has not. A flat damage bonus dressed up as a merge bonus would be neither.
 */
export const mergeDamageMul: ComputedRef<number> = computed(
  () => 1 + sum('mergePower') / 100
)

// ─── The Harbour ────────────────────────────────────────────────────────────
//
// Naval bonuses are their OWN multipliers rather than a share of the tower's.
// The harbour is a separate tree bought with separate gold, and a player who
// poured everything into ships should not be quietly buying archer damage —
// nor should a fully-teched tower arrive with a free fleet.

/** Damage multiplier for ship weapons only. */
export const navalDamageMul: ComputedRef<number> = computed(
  () => 1 + sum('navalDamage') / 100
)
/** Max-HP multiplier for hulls only. */
export const navalHpMul: ComputedRef<number> = computed(
  () => 1 + sum('navalHp') / 100
)

// ─── The Works ──────────────────────────────────────────────────────────────

/**
 * How strong a buff block's aura is, as a multiplier on its EXCESS over 1.
 *
 * `rallyCry` scales what a banner is worth, not how far it reaches — a rank
 * turns a ×1.25 aura into ×1.275, and because auras multiply across neighbours
 * that compounds through every block touching more than one of them.
 */
export const buffPowerMul: ComputedRef<number> = computed(
  () => 1 + sum('buffPower') / 100
)

/** End-of-wave yield multiplier for every economy block. */
export const economyMul: ComputedRef<number> = computed(
  () => 1 + sum('economyYield') / 100
)

/** Starting build resources for a fresh run. */
export const startWood: ComputedRef<number> = computed(
  () => R().economy.startWood + sum('startWood')
)
export const startStone: ComputedRef<number> = computed(
  () => R().economy.startStone + sum('startStone')
)

/**
 * Half-width of the FOUNDATION: four cells either side of the Gate at the
 * start, grown by the foundation nodes.
 *
 * This is the ground floor only — every floor above it is unbounded (see
 * `halfWidthAt`). That makes the foundation tech exactly what its name says:
 * it buys FOOTPRINT, which is the scarce thing, because ground-level cells are
 * the ones every enemy can reach and the ones everything above has to stand on.
 */
export const buildHalfWidth: ComputedRef<number> = computed(
  () => 4 + sum('buildWidth')
)

/**
 * Half-width of the DOCK — how far out into the lake hulls may be moored.
 *
 * Starts narrower than the foundation and widens on its own node, so a harbour
 * player is buying berths the same way a tower player buys footprint. Zero
 * until the Harbour itself is owned, because a dock with no ships is not a
 * thing the player should be able to see the outline of.
 */
export const dockHalfWidth: ComputedRef<number> = computed(
  () => 3 + sum('dockWidth')
)

/** Block ids the player may place right now. */
export const availableBlocks: ComputedRef<Set<string>> = computed(() => {
  void rulesVersion.value
  const unlocked = unlockedBlocks(tech.value.levels, nodesNow())
  const catalogue = R().blocks.catalogue
  const out = new Set<string>()
  for (const def of Object.values(BLOCK_DEFS)) {
    if (def.kind === 'core') continue
    if (catalogue && !catalogue.has(def.id)) continue
    // A mode's tree may gate a block the desktop deals freely (the lumber hut
    // is un-gated there): if ANY node in the active tree unlocks it, that node
    // decides; otherwise the block's own `unlockNode` does.
    const gatedHere = nodesNow().some(
      (n) => n.effect.kind === 'unlock' && n.effect.blockId === def.id
    )
    if (gatedHere) {
      if (unlocked.has(def.id)) out.add(def.id)
      continue
    }
    if (!def.unlockNode || unlocked.has(def.id)) out.add(def.id)
  }
  return out
})

// ─── GamePix / portal metrics ───────────────────────────────────────────────
// The GamePix toolkit reports a "level" and a lifetime play count; wave and run
// counters are the natural fit.
export const gamesPlayedTotal: ComputedRef<number> = computed(() => runs.value)
export const maxStageReached: ComputedRef<number> = computed(() => Math.max(1, bestWave.value))

const persistTech = (): void => setState(R().tech.stateKey, tech.value)

export default function useTowerProgress() {
  const { coins, spendCoins, addCoins } = useTowerEconomy()

  /**
   * A node is visible+purchasable once every prerequisite has ≥ 1 level — or
   * once the player owns it at all.
   *
   * The second clause is for saves made before a tree was re-ordered. The phone
   * strip moved its HP card to the front on 2026-09-11, so a player can own
   * Sharp Bolts without the card that now precedes it; the card they paid for
   * must not turn into a padlock. On a tree nobody has re-ordered the clause
   * never bites: `sellBlockers` refuses the sale that would orphan a node.
   */
  const isUnlocked = (id: string): boolean => {
    const node = nodeOf(id)
    if (!node) return false
    if (levelOf(id) > 0) return true
    return node.requires.every((req) => levelOf(req) > 0)
  }

  const costOf = (id: string): number => techCost(id, levelOf(id), nodesNow())

  const canBuy = (id: string): boolean => {
    const node = nodeOf(id)
    if (!node) return false
    if (!isUnlocked(id)) return false
    if (levelOf(id) >= node.maxLevel) return false
    return coins.value >= costOf(id)
  }

  const buyTech = (id: string): boolean => {
    if (!canBuy(id)) return false
    if (!spendCoins(costOf(id))) return false
    tech.value = { levels: { ...tech.value.levels, [id]: levelOf(id) + 1 } }
    persistTech()
    // Hard checkpoint: a purchase MUST survive an immediate reload, so bypass
    // both the blob debounce and the strategy's flush debounce.
    void flushSaveNow()
    return true
  }

  // ─── Refunds ──────────────────────────────────────────────────────────────
  //
  // A tech tree with no way back is a tree players stop spending in. The cost
  // curve is steep and specialisation is the point, so the first branch anyone
  // commits to is chosen with almost no information — and if that choice is
  // permanent, the rational move is to hoard rather than commit.
  //
  // Half back, the same rate a sold block returns. Refunding in full would make
  // respeccing free and the whole tree a scratchpad; refunding nothing is what
  // we had.

  /** Coins returned for selling the top rank of `id`. */
  const refundOf = (id: string): number => {
    const level = levelOf(id)
    if (level <= 0) return 0
    return Math.floor(techCost(id, level - 1, nodesNow()) * 0.5)
  }

  /**
   * Which OWNED nodes would lose their prerequisite if `id` dropped to zero.
   *
   * Selling the last rank of `foundations` out from under a bought
   * `sharpBolts` would leave the tree in a state the player could never have
   * built, so the sale is refused and the blockers are named.
   */
  const sellBlockers = (id: string): string[] => {
    if (levelOf(id) !== 1) return []
    return nodesNow()
      .filter((n) => n.requires.includes(id) && levelOf(n.id) > 0)
      .map((n) => n.id)
  }

  const canSellTech = (id: string): boolean =>
    levelOf(id) > 0 && sellBlockers(id).length === 0

  /** Sell one rank back. Returns the coins refunded, or 0 if refused. */
  const sellTech = (id: string): number => {
    if (!canSellTech(id)) return 0
    const refund = refundOf(id)
    const next = levelOf(id) - 1
    const levels = { ...tech.value.levels }
    if (next <= 0) delete levels[id]
    else levels[id] = next
    tech.value = { levels }
    persistTech()
    addCoins(refund)
    // Same hard checkpoint as a purchase: a refund MUST survive a reload.
    void flushSaveNow()
    return refund
  }

  /** Count of affordable, not-yet-maxed nodes — drives the Tech button badge
   *  and the one-shot "spend your coins" spotlight. */
  const affordableCount = computed(() => {
    void rulesVersion.value
    return nodesNow().filter((n) => canBuy(n.id)).length
  })

  /** Record a finished run. Every lifetime counter is written in ONE batched
   *  state update so the persist layer schedules a single write. */
  const recordRunEnd = (stats: {
    wave: number
    kills: number
    /** Leaderboard score for the run: kills, bosses worth five. */
    score: number
    wavesCleared: number
    height: number
    blocks: number
    blocksPlaced: number
  }): void => {
    const nextBestWave = Math.max(bestWave.value, stats.wave)
    const nextBestHeight = Math.max(bestHeight.value, stats.height)
    const nextBestBlocks = Math.max(bestBlocks.value, stats.blocks)
    const nextBestScore = Math.max(bestScore.value, Math.max(0, Math.floor(stats.score)))
    const nextKills = totalKills.value + Math.max(0, stats.kills)
    const nextWaves = totalWaves.value + Math.max(0, stats.wavesCleared)
    const nextBlocks = totalBlocks.value + Math.max(0, stats.blocksPlaced)

    bestWave.value = nextBestWave
    bestHeight.value = nextBestHeight
    bestBlocks.value = nextBestBlocks
    bestScore.value = nextBestScore
    totalKills.value = nextKills
    totalWaves.value = nextWaves
    totalBlocks.value = nextBlocks

    setStates({
      [R().save.bestWaveKey]: nextBestWave,
      [BEST_HEIGHT_KEY]: nextBestHeight,
      [BEST_BLOCKS_KEY]: nextBestBlocks,
      [BEST_SCORE_KEY]: nextBestScore,
      [TOTAL_KILLS_KEY]: nextKills,
      [TOTAL_WAVES_KEY]: nextWaves,
      [TOTAL_BLOCKS_KEY]: nextBlocks
    })
    void flushSaveNow()
  }

  /** Count a started run (battle-pass cadence + portal "games played"). */
  const recordRunStart = (): void => {
    runs.value += 1
    setState(RUNS_KEY, runs.value)
  }

  return {
    tech,
    coins,
    bestWave,
    bestHeight,
    bestBlocks,
    bestScore,
    totalKills,
    totalWaves,
    totalBlocks,
    runs,
    levelOf,
    isUnlocked,
    canBuy,
    costOf,
    buyTech,
    refundOf,
    sellBlockers,
    canSellTech,
    sellTech,
    affordableCount,
    availableBlocks,
    recordRunEnd,
    recordRunStart,
    /** The desktop DAG — the tech-tree modal lays it out; a mode's own tree
     *  is read through `activeRules`. */
    TECH_NODES
  }
}

export { tech, bestWave, bestHeight, bestBlocks, bestScore, totalKills, totalWaves, totalBlocks, runs }
