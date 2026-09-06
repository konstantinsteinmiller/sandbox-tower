import { ref, computed, shallowRef, triggerRef, watch, type ComputedRef, type Ref } from 'vue'
import {
  BLOCK_DEFS, blockDef, GATE_ID, isShip, sellRefund, ENHANCED_HP_MUL, ENHANCED_DAMAGE_MUL,
  ROOF_HP_MUL, ROOF_TOP_DEFENSE_DIV,
  MAX_BLOCK_LEVEL, blockUpgradeCost, upgradeHpMul, upgradePowerMul, upgradeArmorBonus,
  SAFE_MAX_TIER, MAX_FOOTPRINT_SPAN, tierOf, mergePowerMul, mergeHpMul, canMergeBlocks,
  FORTIFY_TARGET, canFortifyType, fortifyCost
} from '@/game/blocks'
import { ENEMY_DEFS, enemyDef, isImmuneTo, resistOf } from '@/game/enemies'
import { monsterGore } from '@/game/monsters'
import { pickMonster } from '@/game/monsterSprites'
import { ALLY_DEFS, allyDef, CAVALRY_SQUAD } from '@/game/allies'
import {
  shapeCost, rollOffer, rollOffers, SHAPE_BY_ID, rotatedShape,
  upgradeCrateShape, crateBaseId,
  pickAffordableWeapon, type OfferLaneConfig
} from '@/game/shapes'
import { SEA_SWIM_Y, SEA_STRIKE_Y } from '@/game/world'
import {
  planWave, earlyCallBonus, waveReward, isBossWave, enemyHpScale, type WaveRuleOpts
} from '@/game/waves'
import {
  FlawlessTracker, adaptiveFactor, clampDifficulty, hoardFactor, hoardTier, towerPower,
  type TowerStrength
} from '@/game/difficulty'
import type {
  Block, Enemy, EnemyDef, Ally, Projectile, ProjectileKind,
  WavePlan, Phase, KillTally, RunSnapshot
} from '@/game/types'
import {
  damageMul, fireRateMul, rangeMul, splashMul, chainBonus,
  blockHpMul, gateHpMul, armorBonus, waveRewardMul, coinDropMul,
  waveRepairPct, startWood, startStone, buildHalfWidth, availableBlocks,
  thornsMul, cavalryMul, navalDamageMul, navalHpMul, dockHalfWidth,
  mergeUnlocked, mergeDamageMul, buffPowerMul, economyMul
} from '@/use/useTowerProgress'
import useTowerEconomy from '@/use/useTowerEconomy'
import { difficultyFactor } from '@/use/useUser'
import { getState, setState, removeState } from '@/use/useTowerState'
import { activeRules, setActiveRules, type RuleSet } from '@/game/rules'
import { pushFx } from '@/use/useTowerVfx'

// ─── The rules in force ─────────────────────────────────────────────────────
//
// Read from the holder on EVERY use, never cached in a module variable, so a
// mode that applies its rule set before its first run is in force everywhere
// at once. See `@/game/rules` for what a rule set may change and why the
// simulation is parametrised rather than forked.

const R = (): RuleSet => activeRules.current

/** The director options the active rules translate to. */
const waveOpts = (): WaveRuleOpts => {
  const w = R().waves
  const e = R().enemies
  return {
    budgetMul: w.budgetMul,
    roster: e.roster,
    minWaveOverride: e.minWaveOverride,
    airFromWave: w.airFromWave,
    seaFromWave: w.seaFromWave,
    siegeFromWave: w.siegeFromWave,
    previews: w.previews,
    spawnWindowMs: w.spawnWindowMs,
    bossEvery: w.bossEvery,
    bossBudget: w.bossBudget
  }
}

/** How a mode deals its hand. */
const laneCfg = (): OfferLaneConfig => {
  const o = R().offers
  return { slots: o.slots, lanes: o.lanes, supportSlot: o.supportSlot, pool: o.pool }
}

/**
 * A price as THIS mode charges it.
 *
 * With stone folded into wood (`foldStoneIntoWood`), every stone cost is
 * charged as wood at the fold rate and stone itself is never touched — one
 * "materials" pile on a screen with no room for three. Grants (start stock,
 * refunds, the continue bonus) go through the same conversion, so a stone
 * refund never appears in a currency the mode does not show.
 */
const priceOf = (
  cost: { wood?: number; stone?: number; coins?: number }
): { wood: number; stone: number; coins: number } => {
  const fold = R().blocks.foldStoneIntoWood
  const wood = cost.wood ?? 0
  const stone = cost.stone ?? 0
  const coins = cost.coins ?? 0
  return fold === null
    ? { wood, stone, coins }
    : { wood: wood + Math.round(stone * fold), stone: 0, coins }
}

/** What an offered piece costs under the active rules — for the tray. */
export const priceOfShape = (shapeId: string): { wood: number; stone: number; coins: number } =>
  priceOf(shapeCost(shapeId))

/** What a block costs under the active rules. */
export const priceOfBlock = (typeId: string): { wood: number; stone: number; coins: number } =>
  priceOf(blockDef(typeId).cost)

/**
 * What the hoard surcharge is measured against.
 *
 * With stone folded into wood there is ONE materials pile, and the two-pile
 * band of the ladder has to see it on both sides or it could never fire.
 */
const hoardArgs = (): [number, number, number, number] => {
  const fold = R().blocks.foldStoneIntoWood
  const d = R().difficulty.hoardDivisor
  return fold !== null
    ? [wood.value, wood.value, runCoins.value, d]
    : [wood.value, stone.value, runCoins.value, d]
}

/**
 * ─── Tower Siege — simulation ───────────────────────────────────────────────
 *
 * Owns the tower, the enemies, the projectiles and the wave clock. Runs on a
 * fixed 60 Hz accumulator so behaviour is frame-rate independent and a
 * backgrounded tab can't fast-forward the siege on return.
 *
 * PERFORMANCE CONTRACT: the hot collections (`blocks`, `enemies`,
 * `projectiles`) are PLAIN, non-reactive structures. Vue's proxy overhead on a
 * few hundred entities mutated 60×/s is exactly the kind of cost that makes a
 * mobile browser drop frames. Only HUD-relevant SCALARS are refs, and they are
 * written at most once per tick. The renderer reads the plain collections
 * directly via the exported accessors.
 *
 * World space: cell `(c, r)` spans `x ∈ [c-0.5, c+0.5]`, `y ∈ [r, r+1]`, with
 * `y = 0` on the ground and `+y` pointing UP. The Gate sits at `(0, 0)`.
 */

// ─── Tunables ───────────────────────────────────────────────────────────────

const TICK_MS = 1000 / 60
/** Max substeps per rAF — a tab restored after 30 s must not simulate 30 s. */
// Six, not four. This is the ceiling on how much SIMULATED time one frame may
// advance, and it has to clear the fastest speed the player can buy on the
// slowest refresh they are likely to have: 3x on a 30 Hz frame is 100 ms, which
// is six ticks. At four the clamp silently ate the third multiplier on exactly
// the devices that most need it — the player pays for 3x and gets 2x, with
// nothing on screen to say so. Still a hard bound: the render loop clamps its
// own delta to 120 ms first, so a tab-switch stall can never teleport the siege.
const MAX_SUBSTEPS = 6
/** How far off-screen (in cells) enemies spawn, measured from the tower edge. */
const SPAWN_MARGIN = 6
/** Cells beyond the visible edge an enemy is placed at. Two, not one: the
 *  first stride has to happen out of sight for the entrance to read as one. */
const SPAWN_OFFSCREEN = 2
/** ...but never further from the tower than this, however far out the player
 *  has zoomed. A wave that has to cross forty cells before it threatens
 *  anything is not tense, it is a loading screen. */
const SPAWN_MAX_REACH = 26

/**
 * The camera's horizontal span, in cells, pushed in by `useTowerCamera`.
 *
 * The sim does NOT import the camera: the camera already imports the sim for
 * `towerBounds`, and closing that loop would make the two singletons' init
 * order load-order dependent. A one-way setter keeps the dependency pointing
 * the way it already points.
 */
let viewLeft: number | undefined
let viewRight: number | undefined

export const setViewSpan = (l: number, r: number): void => {
  if (!Number.isFinite(l) || !Number.isFinite(r) || r - l < 1) return
  viewLeft = l
  viewRight = r
}
/** Gravity for ballistic shells and falling debris, cells/s². */
const GRAVITY = 26
/** A falling block is destroyed once it has dropped this far. */
/** Falling this many cells destroys a block outright; less costs a
 *  proportional slice of its max HP. */
const fallKillCells = (): number => R().fall.killCells
/** Crush damage a collapsing block deals to ground enemies beneath it. */
/** How far a crushed boss is shoved away from the tower, in cells. */
const BOSS_KNOCKBACK_CELLS = 2.4
/** Cells of shove applied per second while a knockback is being paid off. */
const KNOCKBACK_SPEED = 11
/** Share of a boss's MAX hp a full-height crush removes. */
const BOSS_CRUSH_PCT = 0.14
/** Radius around the impact point that gets caught, in cells. */
const CRUSH_RADIUS = 0.95
/** Practical bound on how far ANY floor may reach out from the centre. */
export const UPPER_HALF_WIDTH = 22

/**
 * The one row hulls live on.
 *
 * A cell `(c, r)` spans `y ∈ [r, r+1]`, so row −1 spans `[−1, 0]` and its
 * centre lands exactly on `SEA_LEVEL` (−0.5). A ship placed there sits ON the
 * waterline with its deck above and its hull below, for free — no offset, no
 * special case in the renderer.
 */
export const WATER_ROW = -1
/**
 * How long a slot waits before it may be swapped again, ms.
 *
 * PER SLOT, not shared. A single shared charge meant swapping one bad piece
 * locked the other three as well, so the cost of fixing a dead slot was three
 * more dead slots — the opposite of what a reroll is for. Four independent
 * timers let the player fix the hand they were dealt and still have the hand.
 */
// (The cooldown itself is `RuleSet.offers.rerollMs`.)

// ─── Live state (plain, non-reactive) ───────────────────────────────────────

/** Grid occupancy, keyed `"c,r"`. */
const blocks = new Map<string, Block>()
/** Secondary index so projectiles / VFX can resolve a block by uid in O(1). */
const blocksByUid = new Map<number, Block>()
const enemies: Enemy[] = []
const projectiles: Projectile[] = []

/**
 * Live enemies by uid.
 *
 * Kept in step with `enemies` rather than derived, because the projectile
 * integrator asks "where is uid N?" once per homing round per frame and used to
 * answer it with `enemies.find(...)` — a linear scan plus a fresh closure, run
 * again for the same round on the frame it detonates. At 50 enemies and 100
 * rounds in the air that is ten thousand comparisons a frame to answer a
 * question a Map answers in one.
 */
const enemiesByUid = new Map<number, Enemy>()

/** The living enemy with this uid, or undefined if it is gone or already dying. */
const liveEnemy = (uid: number): Enemy | undefined => {
  const e = enemiesByUid.get(uid)
  return e && e.dying <= 0 ? e : undefined
}

/**
 * Spent projectile carcasses, kept for reuse.
 *
 * A busy wave fires hundreds of rounds a second and throws every one away, so
 * the round objects — each carrying its own `trail` array — were the loop's
 * largest source of garbage. Nothing here is about raw allocation speed; it is
 * about not handing the collector a few thousand short-lived objects a second,
 * because the pause it eventually takes to clean them up is a dropped frame the
 * player sees as a stutter mid-fight.
 */
const projectilePool: Projectile[] = []
/** Deep waves are bursty; past this the surplus is genuinely dead and freeing
 *  it is better than holding it. */
const PROJECTILE_POOL_MAX = 256

/**
 * A blank round, recycled where possible.
 *
 * EVERY field is written by the callers or reset here — a pooled object that
 * inherits a stale `hostile` or `burnMs` from its previous life is the classic
 * way this pattern turns into a bug, and here it would mean a friendly arrow
 * that damages the tower.
 */
const acquireProjectile = (): Projectile => {
  const p = projectilePool.pop()
  if (!p) {
    return {
      // Placeholder only — every caller overwrites `kind` before the round is
      // live. `'arrow'` is not a `ProjectileKind`; `'bolt'` is the arrow one.
      uid: 0, kind: 'bolt', x: 0, y: 0, vx: 0, vy: 0, damage: 0, splash: 0,
      ballistic: false, targetUid: -1, life: 0, slowPct: 0, slowMs: 0,
      sourceUid: -1, hostile: false, burnMs: undefined, burnDps: undefined, trail: []
    }
  }
  p.trail.length = 0
  p.hostile = false
  p.burnMs = undefined
  p.burnDps = undefined
  return p
}

/**
 * Retire the round at `i`.
 *
 * The last element backfills the hole instead of `splice` shifting the tail
 * down one. Order carries no meaning here, and the callers all walk the array
 * BACKWARDS — so the element moved into `i` has already been visited this
 * frame and will not be processed twice.
 */
const dropProjectile = (i: number): void => {
  const p = projectiles[i]!
  const last = projectiles.length - 1
  if (i !== last) projectiles[i] = projectiles[last]!
  projectiles.pop()
  if (projectilePool.length < PROJECTILE_POOL_MAX) projectilePool.push(p)
}
/** Blocks currently mid-collapse. Kept out of `blocks` so they no longer
 *  occupy their grid cell (the player may rebuild there immediately). */
const debris: Block[] = []
/** Friendly units currently out on a sortie. */
const allies: Ally[] = []

let uidCounter = 1
let clock = 0 // ms since run start, advanced by the fixed step
let accumulator = 0
let plan: WavePlan = { wave: 0, orders: [], total: 0, boss: false }
let spawnCursor = 0
let waveClock = 0 // ms since the wave started
let buildDeadline = 0 // ms remaining in the build phase
let gateUid = -1
let blocksPlacedThisRun = 0
let wavesClearedThisRun = 0

// Per-wave cached tech multipliers. Read ONCE when a wave starts rather than
// per-frame — these are Vue computeds and touching them 60×/s per turret would
// be a needless dependency-tracking cost.
let mDamage = 1
let mFireRate = 1
let mRange = 1
let mSplash = 1
let mChain = 0
let mArmor = 0
let mCoinDrop = 1
let mThorns = 1
let mCavalry = 1
let mNavalDamage = 1
let mMergeDamage = 1
/** Scales the STRENGTH of a buff block's aura, not the number of them. */
let mBuffPower = 1
/** Scales what every economy block yields at the end of a wave. */
let mEconomy = 1

// ─── Reactive HUD surface (scalars only) ────────────────────────────────────

export const phase: Ref<Phase> = ref('build')
export const wave = ref(0)
export const wood = ref(0)
export const stone = ref(0)
export const runCoins = ref(0)

/**
 * Coins EARNED this run, never decremented.
 *
 * `runCoins` is a spendable balance now that blocks cost gold, and a balance
 * that can fall is the wrong thing to feed progression: `useMissions` credits
 * deltas and treats a counter going backwards as the start of a new run, so
 * every purchase would re-baseline and then re-credit the remaining balance
 * against the daily coin mission. Achievements accumulate the same figure.
 */
export const runCoinsEarned = ref(0)
export const kills = ref(0)
export const killsByType: Ref<KillTally> = ref({})

/** What a boss is worth on the leaderboard, in ordinary kills. */
export const BOSS_SCORE = 5

/**
 * The run's leaderboard score: one point per enemy killed since wave 1, five
 * for a boss.
 *
 * DERIVED from the kill tally rather than counted into a ref of its own. The
 * tally is already in the run snapshot, so a resumed siege restores its score
 * for free — a separately-counted score would have needed its own snapshot
 * field, and would have silently reset to zero for every player mid-run at the
 * moment this shipped.
 */
export const runScore: ComputedRef<number> = computed(() => {
  let total = 0
  for (const typeId in killsByType.value) {
    const n = killsByType.value[typeId] ?? 0
    total += n * (enemyDef(typeId).boss ? BOSS_SCORE : 1)
  }
  return total
})
export const enemiesLeft = ref(0)
export const enemiesTotal = ref(0)
export const gateHp = ref(0)
export const gateMaxHp = ref(1)
export const buildTimeLeft = ref(0)
export const blockCount = ref(0)
export const towerHeight = ref(0)
/** 1× / 2× battle-speed toggle (reference image 3). Build phase is unaffected. */
export const gameSpeed = ref(1)
/** Bumped whenever the tower's cell occupancy changes, so the camera's auto-fit
 *  and the build-tray affordability hints can recompute without deep watching. */
export const towerVersion = ref(0)
/**
 * The four build shapes currently on offer.
 *
 * A shallowRef over a plain array: the tray re-renders on identity change,
 * and we always replace the array rather than mutating it in place.
 */
export const offers = shallowRef<string[]>([])

/** Parallel to `offers`: true where that slot holds an ENHANCED shape dealt by
 *  the rewarded-ad button. */
export const offerEnhanced = shallowRef<boolean[]>(new Array(R().offers.slots).fill(false))

/**
 * Whole SECONDS left on each slot's reroll cooldown; 0 means ready.
 *
 * The millisecond countdown lives in a plain array below and is ticked every
 * frame. Only this whole-second projection is reactive, and it is replaced only
 * when one of the displayed numbers actually changes — otherwise the build tray
 * would re-render sixty times a second to show the same "3".
 */
export const rerollReadyIn = shallowRef<number[]>(new Array(R().offers.slots).fill(0))

/** Live per-slot cooldowns in ms. Plain: ticked every frame, never rendered. */
const rerollTimers: number[] = new Array(R().offers.slots).fill(0)

/** Push the whole-second projection out to the HUD if it changed. */
const syncRerollClocks = (): void => {
  const next = rerollTimers.map((ms) => Math.ceil(ms / 1000))
  const cur = rerollReadyIn.value
  for (let i = 0; i < next.length; i++) {
    if (next[i] !== cur[i]) { rerollReadyIn.value = next; return }
  }
}

/** Live cavalry count, for the HUD button's badge. */
export const allyCount = ref(0)

// ─── Reaching a standoff engine ─────────────────────────────────────────────
//
// A trebuchet parks at twelve cells. Archer reaches 7.5, cannon 8.5, bombard 9
// — so a player who never bought a Mortar, a War Galley or a rank of Long Sight
// watches one flatten the tower with every gun they own firing at nothing. The
// design intends that pressure; what it never intended is for the player to
// have NO readable answer at the moment it happens, which is the rage-quit.
//
// So the simulation publishes the fact itself: how far the tower can actually
// shoot, and how many engines on the field are standing beyond it. The HUD
// turns that into a warning before the wave, a free sortie during it, and a
// paid reach extension for the player who would rather not ride out.

/** How far the tower's longest gun reaches right now, in cells. 0 with no gun.
 *
 *  Measured through the live range multiplier, not off the printed range: ranks
 *  of Long Sight genuinely do walk a bombard out to a trebuchet, and telling
 *  that player they are outranged would be the warning lying to them. */
export const bestWeaponReach = (): number => {
  let best = 0
  for (const b of towerBlocks()) {
    const w = blockDef(b.typeId).weapon
    if (!w) continue
    const r = w.range * mRange
    if (r > best) best = r
  }
  return best
}

/** Can anything on the tower put a shot on this enemy where it stands?
 *
 *  Exact geometry rather than "range vs standoff": a gun on the far shoulder of
 *  a wide tower is metres further from the engine than the printed numbers
 *  suggest, and during a battle the honest test is the cheap one. */
const isReachable = (e: Enemy): boolean => {
  for (const b of towerBlocks()) {
    const w = blockDef(b.typeId).weapon
    if (!w) continue
    if (!w.hitsAir && enemyDef(e.typeId).movement === 'air') continue
    const r = w.range * mRange
    const dx = e.x - centreX(b)
    const dy = e.y - centreY(b)
    // Same rule the turret itself fires by — a warning that measured reach
    // differently from the gun would be wrong in whichever direction hurt more.
    if (reachSq(dx, dy, w.plunging === true) <= r * r) return true
  }
  return false
}

/** Standoff engines currently alive that no gun on the tower can answer. */
export const unreachableSiege = ref(0)

/** Throttle for the scan above — it walks every turret per engine, and the
 *  answer cannot change meaningfully inside a quarter second. */
let reachScanIn = 0

const scanUnreachable = (dt: number): void => {
  reachScanIn -= dt
  if (reachScanIn > 0) return
  reachScanIn = 250
  let n = 0
  for (const e of enemies) {
    if (e.dying > 0) continue
    if (!enemyDef(e.typeId).siege?.standoff) continue
    if (!isReachable(e)) n++
  }
  if (unreachableSiege.value !== n) unreachableSiege.value = n
}

/**
 * When a sortie costs nothing.
 *
 * The rule is "the player has no answer on the field", not "there is siege" —
 * so it is true exactly while an engine stands beyond every gun AND no rider is
 * already out. It cannot be farmed (a second free squad is never granted while
 * the first lives) and it cannot strand (if the squad dies with the engine
 * still parked, the next one is free again). Cavalry is the only counter left
 * in that state, and charging forty coins for the only move on the board is a
 * tax, not a decision.
 */
export const isCavalryFree = computed(
  () => phase.value === 'battle' && unreachableSiege.value > 0 && allyCount.value === 0
)

// ─── Siege spotters (rewarded reach extension) ──────────────────────────────
//
// The paid answer for a player who would rather keep shooting than ride out.
// It lasts to the end of the wave rather than for a timer: it is bought in the
// middle of the emergency it solves, so a countdown would only make the player
// watch a clock instead of the battle, and it can never carry into a wave that
// did not need it.

/** What spotters multiply every weapon's range by. 1.8 is chosen against the
 *  worst honest case: an archer-only tower (7.5) reaching a trebuchet at 12. */
export const RANGE_BUFF_MUL = 1.8

/** True while spotters are up. */
export const isRangeBuffed = ref(false)

/** The multiplier turrets and the range rings both read. */
export const effectiveRangeMul = computed(
  () => rangeMul.value * (isRangeBuffed.value ? RANGE_BUFF_MUL : 1)
)

const syncRangeMul = (): void => { mRange = effectiveRangeMul.value }

/** Grant spotters for the rest of the wave. Called after the rewarded video. */
export const grantRangeBuff = (): void => {
  if (!R().abilities.rangeBoost) return
  isRangeBuffed.value = true
  syncRangeMul()
  // The scan is what drives the free-cavalry offer and the HUD hint; leaving it
  // a quarter second stale would keep an "outranged" warning on screen after
  // the player just paid to fix it.
  reachScanIn = 0
}

const clearRangeBuff = (): void => {
  if (!isRangeBuffed.value) return
  isRangeBuffed.value = false
  syncRangeMul()
}

/** Wave-clear payload for the toast; null while nothing is pending. */
export const lastWaveReward = shallowRef<{
  wave: number
  /** META wallet coins. */
  coins: number
  wood: number
  stone: number
  /** RUN gold minted by coffers this wave. Kill drops are not counted — those
   *  are already shown on the enemy that dropped them. */
  gold: number
  bonusPct: number
  tally: KillTally
} | null>(null)

/**
 * What the player currently has standing.
 *
 * Measured, not estimated: the director prices the next wave against this, so
 * anything it gets wrong is felt directly as a wave that is too easy or too
 * mean. Weapon DPS carries the same tech multipliers the weapons themselves
 * use, which is why it is read from the cached multipliers rather than the
 * reactive ones — those are snapshotted at `callWave`.
 */
export const measureTower = (): TowerStrength => {
  let hp = 0
  let dps = 0
  let antiAir = 0
  let height = 0

  for (const b of towerBlocks()) {
    hp += b.hp + armorFor(b) * 6
    if (topRow(b) + 1 > height) height = topRow(b) + 1
    const w = blockDef(b.typeId).weapon
    if (!w) continue
    const dmg = w.damage
      * (blockDef(b.typeId).waterOnly ? mNavalDamage : mDamage)
      * (b.enhanced ? ENHANCED_DAMAGE_MUL : 1)
      * upgradePowerMul(b.level)
      * mergeOutputMul(b)
      // Counted here too, or the difficulty director would price a banner-fed
      // tower as if the banners were not there and hand it a wave it has
      // already out-grown.
      * (b.buffMul ?? 1)
    const cd = Math.max(120, w.cooldownMs / mFireRate)
    // Splash weapons hit more than one thing, so their real contribution is
    // higher than a naive damage/cooldown suggests.
    const multi = 1 + (w.splash ?? 0) * 0.6 + (w.chain ?? 0) * 0.4
    dps += (dmg / (cd / 1000)) * multi
    if (w.hitsAir) antiAir++
  }

  return { hp, dps, blocks: blocksByUid.size, height, antiAir }
}

/** Current adaptive multiplier, surfaced so the HUD can warn about a spike. */
export const difficultyMul = ref(1)
/** Waves cleared without losing a block, toward the next escalation. */
export const flawlessProgress = ref(0)

const flawless = new FlawlessTracker()
/** Set the moment any block is destroyed during a wave. */
let lostBlockThisWave = false

export const gateHpPct = computed(() => (gateMaxHp.value > 0 ? gateHp.value / gateMaxHp.value : 0))
export const isBossIncoming = computed(() => isBossWave(wave.value + 1, R().waves.bossEvery))

/**
 * What the CURRENT wave is actually made of.
 *
 * The HUD used to answer threat questions by re-running `planWave(wave.value)`
 * with the default difficulty — not the scalar the wave was really built with —
 * so it disagreed with the battlefield on most waves past 14. It now reads the
 * plan the director produced, which is the only version that is true.
 *
 * Bumped by `waveVersion` rather than being reactive itself: `plan` is a hot
 * plain object like `blocks` and `enemies`, and making it a ref would put the
 * whole spawn queue through Vue's proxy for the sake of four counters.
 */
export const waveVersion = ref(0)

export const wavePlan = (): WavePlan => plan

/**
 * The wave the player is ABOUT to call, planned but not committed.
 *
 * The build-phase warning has to describe what is coming, and `plan` still
 * holds the wave that just finished. This runs the same derivation `callWave`
 * runs — measure the tower, price the wave against it — without touching any
 * state, so what the banner promises is what the Call Wave button delivers.
 *
 * It can drift if the player keeps building after reading it, which is the
 * correct direction to drift: the lanes are wave-driven and do not move, and a
 * bigger tower only ever makes the wave the player was already warned about.
 */
export const previewNextWave = (): WavePlan => {
  if (phase.value === 'defeat') return { wave: 0, orders: [], total: 0, boss: false }
  const next = wave.value + 1
  const strength = measureTower()
  strength.hp = Math.max(0, strength.hp - repairedSinceMeasure)
  const dynamic = clampDifficulty(
    adaptiveFactor(next, towerPower(strength), R().waves.expectedPowerMul) * flawless.multiplier
  )
  const hoard = hoardFactor(...hoardArgs())
  return planWave(next, difficultyFactor() * dynamic * hoard, isFirstSession(), waveOpts())
}

/**
 * Which hoarding band the player's reserve is currently in (0 = none).
 *
 * Read by the HUD so the surcharge is never a silent one. A wave that doubles
 * without explanation reads as the game cheating; a wave that doubles next to a
 * chip saying the war chest did it reads as a decision the player made.
 */
export const currentHoardTier = (): 0 | 1 | 2 | 3 => hoardTier(...hoardArgs())

// ─── Accessors for the renderer ─────────────────────────────────────────────

/** The OCCUPANCY index: one entry per covered cell. A merged block appears
 *  under every key it covers, so `.get`/`.has` answer "what is standing here?"
 *  — but never iterate this to visit the tower; use `getTowerBlocks`. */
export const getBlocks = (): Map<string, Block> => blocks

/** Each block once, whatever its footprint. */
export const getTowerBlocks = (): Map<number, Block> => blocksByUid
export const getEnemies = (): Enemy[] => enemies
export const getProjectiles = (): Projectile[] => projectiles
export const getDebris = (): Block[] => debris
export const getAllies = (): Ally[] => allies
export const nowMs = (): number => clock

// ─── Grid helpers ───────────────────────────────────────────────────────────

const key = (c: number, r: number): string => `${c},${r}`
const blockAt = (c: number, r: number): Block | undefined => blocks.get(key(c, r))

// ─── Footprints ─────────────────────────────────────────────────────────────
//
// A block covers `w × h` cells anchored at `(c, r)`, its LOW corner. Merging
// grows that rectangle instead of collapsing it, so `blocks` is an OCCUPANCY
// index — several keys can point at the same object — and `blocksByUid` is the
// authoritative collection. Anything that iterates the tower must go through
// `towerBlocks()`, or a two-cell block gets counted, fired, paid and damaged
// twice.

export const spanW = (b: { w?: number }): number => b.w ?? 1
export const spanH = (b: { h?: number }): number => b.h ?? 1

/** Every cell a block sits on. */
const cellsOf = (b: Block): Array<[number, number]> => {
  const out: Array<[number, number]> = []
  for (let dx = 0; dx < spanW(b); dx++) {
    for (let dy = 0; dy < spanH(b); dy++) out.push([b.c + dx, b.r + dy])
  }
  return out
}

const occupy = (b: Block): void => {
  for (const [c, r] of cellsOf(b)) blocks.set(key(c, r), b)
}

const release = (b: Block): void => {
  for (const [c, r] of cellsOf(b)) {
    if (blocks.get(key(c, r)) === b) blocks.delete(key(c, r))
  }
}

/** Centre of the footprint in world space — where a weapon sits and fires. */
export const centreX = (b: { c: number; w?: number }): number => b.c + (spanW(b) - 1) / 2
export const centreY = (b: { r: number; h?: number }): number => b.r + spanH(b) / 2

/** Highest row the block occupies. */
const topRow = (b: Block): number => b.r + spanH(b) - 1
const coversRow = (b: Block, r: number): boolean => r >= b.r && r < b.r + spanH(b)

/** Each distinct block in the tower, exactly once. */
const towerBlocks = (): Iterable<Block> => blocksByUid.values()

/**
 * Squared distance from a point to the nearest part of a block.
 *
 * Blasts have to measure against the FOOTPRINT, not the centre: a bomb landing
 * on the far end of a four-cell battery is sitting on the thing, and measuring
 * to its middle would have said it missed.
 */
/**
 * The cell of `b` an attacker at `(x, y)` is actually up against.
 *
 * Reach is measured to the NEAREST cell of the footprint. Measuring to the
 * anchor instead let a grunt walking in from the right march clean through a
 * four-cell battery to reach the column it happens to be anchored in.
 */
const nearestCellX = (b: Block, x: number): number =>
  Math.min(Math.max(x, b.c), b.c + spanW(b) - 1)

const nearestCellY = (b: Block, y: number): number =>
  Math.min(Math.max(y, b.r + 0.5), b.r + spanH(b) - 0.5)

const distSqToBlock = (b: Block, x: number, y: number): number => {
  const dx = Math.max(b.c - 0.5 - x, 0, x - (b.c + spanW(b) - 0.5))
  const dy = Math.max(b.r - y, 0, y - (b.r + spanH(b)))
  return dx * dx + dy * dy
}

/** Effective max HP for a block type, after tech. The Gate gets its own
 *  multiplier on top so investing in it is a distinct, legible choice. */
/**
 * Is this hit coming down on top of the block?
 *
 * A block spans `r` to `r + h`. Anything originating at or above its top face
 * is over it; a grunt swinging at the wall stands at the block's own height or
 * below and gets none of the roof's protection.
 */
const isTopSide = (b: Block, fromY: number | undefined): boolean =>
  fromY !== undefined && fromY >= b.r + spanH(b) - 0.15

export const maxHpFor = (
  typeId: string, enhanced = false, roof = false, level = 0, tier = 1, buffMul = 1
): number => {
  const def = blockDef(typeId)
  // A hull is timber on water, not masonry on rock: the tower's structural
  // tech does nothing for it, and the harbour's own line does everything.
  let base = def.hp * (def.waterOnly ? navalHpMul.value : blockHpMul.value)
  if (typeId === GATE_ID) base *= gateHpMul.value
  if (enhanced) base *= ENHANCED_HP_MUL
  if (roof) base *= ROOF_HP_MUL
  return Math.round(base * upgradeHpMul(level) * mergeHpMul(tier) * Math.max(1, buffMul))
}

/**
 * Everything a block PRODUCES, scaled for its merge tier.
 *
 * Damage, thorns, death blast and per-wave yield all go through here, so a
 * merged block is uniformly worth what its tier says rather than being
 * stronger in whichever stats someone remembered to multiply.
 *
 * The tech bonus rides on TOP of the tier curve and only applies above tier 1:
 * `forgeWelds` is a merge node, and paying it out to an unmerged tower would
 * make it a plain damage node with a misleading name.
 */
const mergeOutputMul = (b: { tier?: number }): number => {
  const tier = tierOf(b.tier)
  if (tier <= 1) return 1
  return mergePowerMul(tier) * mMergeDamage
}

const armorFor = (b: Block): number =>
  (blockDef(b.typeId).armor ?? 0) + mArmor + upgradeArmorBonus(b.level) + (b.buffArmor ?? 0)

// ─── Buffs ──────────────────────────────────────────────────────────────────

/**
 * Recompute every block's neighbour-buff cache.
 *
 * Buffs are POSITIONAL, and max HP is not: `maxHpFor` is a pure function of a
 * block's type and its own flags, computed once when the block is spawned. So
 * placing a banner beside a finished wall has to go back and re-derive the
 * ceiling of everything it now touches — and removing one has to put it back.
 *
 * The damage fraction is preserved across the change, not the absolute hit
 * points. A block at half health that gains a banner comes out at half of its
 * new, larger ceiling: buffing something is not a repair, and losing the banner
 * that was holding a block up must not kill it outright.
 *
 * Cheap enough to run on every structural change — towers are tens of blocks,
 * not thousands — and running it wholesale rather than incrementally means
 * merges, collapses, sales and restores all get it right for free.
 */
const refreshBuffs = (): void => {
  for (const b of towerBlocks()) {
    let mul = 1
    let armor = 0
    // Every distinct neighbour of the whole footprint. A buff counts ONCE per
    // block however many cells of it a wide neighbour is touching, or a merged
    // 2x2 next to one banner would collect it twice.
    const seen = new Set<number>()
    for (const [c, r] of cellsOf(b)) {
      for (const n of [blockAt(c - 1, r), blockAt(c + 1, r), blockAt(c, r - 1), blockAt(c, r + 1)]) {
        if (!n || n === b || seen.has(n.uid)) continue
        seen.add(n.uid)
        const spec = blockDef(n.typeId).buff
        if (!spec) continue
        // Multiplicative on purpose — see `BuffSpec`. Two banners are worth
        // more than twice one, which is what makes surrounding a gun a plan
        // rather than an accumulation.
        mul *= 1 + (spec.statMul - 1) * mBuffPower
        armor += spec.armor
      }
    }

    const prev = b.buffMul ?? 1
    b.buffArmor = armor
    if (Math.abs(mul - prev) < 1e-6) continue

    b.buffMul = mul
    const frac = b.maxHp > 0 ? b.hp / b.maxHp : 1
    b.maxHp = maxHpFor(b.typeId, b.enhanced, b.roof, b.level, b.tier, mul)
    b.hp = Math.max(1, Math.min(b.maxHp, Math.round(b.maxHp * frac)))
  }
}

/** Bounds of the standing tower — drives camera auto-fit and the run summary. */
export const towerBounds = (): { minC: number; maxC: number; maxR: number } => {
  let minC = 0, maxC = 0, maxR = 0
  for (const b of towerBlocks()) {
    if (b.c < minC) minC = b.c
    if (b.c + spanW(b) - 1 > maxC) maxC = b.c + spanW(b) - 1
    if (topRow(b) > maxR) maxR = topRow(b)
  }
  return { minC, maxC, maxR }
}

const syncTowerStats = (): void => {
  // Every structural change routes through here — placement, sale, collapse,
  // landing, merge, restore — which makes it the one honest place to settle
  // merges and re-derive the buff auras. Doing either at each call site meant
  // forgetting one, and forgetting one is exactly how a pair of guns ends up
  // touching with nothing happening.
  //
  // Merges first: fusing changes footprints, and the auras are computed from
  // what is adjacent to what.
  settleMerges()
  refreshBuffs()
  blockCount.value = blocksByUid.size
  towerHeight.value = towerBounds().maxR + 1
  towerVersion.value++
}

// ─── Placement ──────────────────────────────────────────────────────────────

/**
 * Is `(c, r)` a legal build slot right now? A cell qualifies when it is empty,
 * inside the buildable column range, at or above ground, and either sits ON the
 * ground (row 0 rests on solid earth) or touches an existing block orthogonally.
 *
 * Diagonal-only contact is deliberately NOT enough: it would let players draw
 * unsupported staircases into the sky, and the collapse rule would then fire
 * constantly on contact with reality.
 */
/**
 * Buildable half-width for a given row.
 *
 * ONLY the ground floor is capped — at `buildHalfWidth`, which starts at four
 * cells either side of the Gate and is widened a column per rank by the Wide /
 * Great Foundation tech. Every floor above it is free.
 *
 * The cap USED to be `min(4, buildHalfWidth)`, which pinned the foundation at
 * its starting width forever and made both foundation nodes buy nothing.
 *
 * That asymmetry is the whole point. Capping every row produced exactly one
 * shape, a rectangle that grew straight up, because there was never a reason to
 * build anything else. Capping the FOOTPRINT alone turns the interesting
 * question into what you do with the space above it: arms cantilevered out over
 * the approach to put archers where the enemies are, split towers, wings that
 * shelter the Gate from a bomb run.
 *
 * The risk that keeps this honest is `resolveOrphans`: anything the Gate can no
 * longer reach falls and takes damage on landing, so a clever overhang is a bet,
 * not free real estate.
 *
 * `UPPER_HALF_WIDTH` is a sanity bound rather than a design constraint — it
 * stops the legal-slot scan and the camera's auto-fit from walking off into
 * infinity if someone sets out to build a mile-wide shelf.
 */
export const halfWidthAt = (r: number): number => {
  const b = R().board
  // −1 makes every column illegal: `|c| > −1` holds for any c. That is how a
  // mode with no water row, or a ceiling, refuses a row without a special case
  // at each placement check.
  if (r === WATER_ROW) return b.waterRow ? Math.min(dockHalfWidth.value, b.upperHalfWidth) : -1
  if (r > b.maxRow) return -1
  if (r === 0) {
    const ground = b.groundHalfWidth === 'tech' ? buildHalfWidth.value : b.groundHalfWidth
    return Math.min(ground, b.upperHalfWidth)
  }
  return b.upperHalfWidth
}

/**
 * Is `(c, r)` a legal berth for a hull?
 *
 * Hulls obey none of the tower's structural rules — they float. No support, no
 * neighbour, nothing above or below: just an empty berth inside the dock's
 * width, on the one row that is water.
 */
export const canMoorAt = (c: number, r: number): boolean =>
  r === WATER_ROW && Math.abs(c) <= halfWidthAt(WATER_ROW) && !blocks.has(key(c, r))

export const canPlaceAt = (c: number, r: number, typeId?: string): boolean => {
  // A hull and a crate are placed by completely different rules, so the type
  // decides which set applies before anything else is checked.
  if (typeId !== undefined && isShip(typeId)) return canMoorAt(c, r)
  if (r < 0) return false
  if (Math.abs(c) > halfWidthAt(r)) return false
  if (blocks.has(key(c, r))) return false
  // A gable seals its column: nothing may sit on a roofed block. This is what
  // makes roofed shapes a real trade rather than a free upgrade.
  if (r > 0 && blockAt(c, r - 1)?.roof) return false
  if (r === 0) return true
  return (
    blocks.has(key(c - 1, r)) ||
    blocks.has(key(c + 1, r)) ||
    blocks.has(key(c, r - 1)) ||
    blocks.has(key(c, r + 1))
  )
}

/**
 * Can `shapeId` be dropped with its bottom-left cell at `(c, r)`?
 *
 * Every cell must be empty, in range, above ground and not sealed under a roof.
 * Support is evaluated for the shape AS A WHOLE: at least one of its cells must
 * rest on the ground or touch the existing tower. Requiring every cell to be
 * individually supported would make L-bends and overhangs — the entire reason
 * shapes are interesting — impossible to place.
 */
export const canPlaceShapeAt = (
  shapeId: string, c: number, r: number, rot = 0
): boolean => {
  const base = SHAPE_BY_ID[shapeId]
  if (!base) return false
  if (phase.value === 'defeat') return false
  const def = rotatedShape(shapeId, rot)

  // A naval piece is a single hull in a berth. It shares none of the tower's
  // placement rules, so it is answered here rather than threaded through them.
  if (def.cells.every(([, , typeId]) => isShip(typeId))) {
    return def.cells.every(([dx, dy]) => canMoorAt(c + dx, r + dy))
  }

  const own = new Set<string>()
  for (const [dx, dy] of def.cells) own.add(key(c + dx, r + dy))
  const roofs = new Set(def.roofs)

  let supported = false
  for (let i = 0; i < def.cells.length; i++) {
    const [dx, dy] = def.cells[i]!
    const cc = c + dx
    const rr = r + dy
    if (rr < 0) return false
    if (Math.abs(cc) > halfWidthAt(rr)) return false
    if (blocks.has(key(cc, rr))) return false
    if (rr > 0 && blockAt(cc, rr - 1)?.roof) return false
    // A gable needs open sky above it. The seal already stops anything being
    // built ON a roof; without this the same illegal stack could be made from
    // underneath, tucking a pitched roof inside the block above it.
    if (roofs.has(i) && (blocks.has(key(cc, rr + 1)) || own.has(key(cc, rr + 1)))) return false

    if (rr === 0) { supported = true; continue }
    // Neighbours that belong to the shape itself don't count as support.
    for (const nk of [key(cc - 1, rr), key(cc + 1, rr), key(cc, rr - 1), key(cc, rr + 1)]) {
      if (!own.has(nk) && blocks.has(nk)) { supported = true; break }
    }
  }
  return supported
}

/** Can the player pay for `shapeId` right now? */
export const canAffordShape = (shapeId: string): boolean => {
  const cost = priceOf(shapeCost(shapeId))
  return wood.value >= cost.wood && stone.value >= cost.stone && runCoins.value >= cost.coins
}

/**
 * Place the shape held in offer slot `slotIndex` with its bottom-left cell at
 * `(c, r)`. Charges the whole shape, then rerolls that slot so the hand is
 * always four live choices.
 */
export const placeShape = (
  slotIndex: number, c: number, r: number, rot = 0
): boolean => {
  const shapeId = offers.value[slotIndex]
  if (!shapeId) return false
  if (!canPlaceShapeAt(shapeId, c, r, rot) || !canAffordShape(shapeId)) return false

  // Rotation moves cells; it never changes WHICH blocks the piece is made of,
  // so the price is the unrotated one by construction.
  const def = rotatedShape(shapeId, rot)
  const cost = priceOf(shapeCost(shapeId))
  wood.value -= cost.wood
  stone.value -= cost.stone
  runCoins.value -= cost.coins

  const enhanced = offerEnhanced.value[slotIndex] === true
  const roofs = new Set(def.roofs)
  def.cells.forEach(([dx, dy, typeId], i) => {
    spawnBlock(typeId, c + dx, r + dy, roofs.has(i), undefined, enhanced)
  })

  // Merge AFTER the whole piece is down, not per cell: a domino of two cannons
  // dropped beside a third should settle once, into the arrangement the player
  // can see, rather than fusing its own halves mid-placement.
  for (const [dx, dy] of def.cells) mergeAt(c + dx, r + dy)

  blocksPlacedThisRun += def.cells.length
  syncTowerStats()
  rerollOffer(slotIndex)
  pushFx({ kind: 'place', x: c, y: r + 0.5, palette: blockDef(def.cells[0]![2]).palette })
  return true
}

/**
 * Guarantee the hand always holds a gun the player can pay for.
 *
 * The weapon lane already guarantees a gun is OFFERED; this guarantees it is
 * BUYABLE, which is the thing that actually matters. Without it a player can be
 * handed a wave with four pieces they cannot afford and no way to raise a
 * defence — a loss with no decision in it. Most acutely on wave 1, where a run
 * is decided before the player has done anything.
 *
 * Deliberately quiet: it only fires when NO offered gun is affordable, so a
 * hand the player can already act on is never rearranged under them.
 *
 * The swapped slot keeps whatever enhanced flag it had. If the reinforced piece
 * the rewarded ad dealt was the unaffordable one, the player paid for that
 * reinforcement and should keep it on the piece that replaces it.
 */
const ensureAffordableWeapon = (): void => {
  const armed = offers.value.some(
    (id) => SHAPE_BY_ID[id]?.lane === 'weapon' && canAffordShape(id)
  )
  if (armed) return
  const gun = pickAffordableWeapon(
    wave.value, availableBlocks.value, canAffordShape, Math.random, R().offers.pool
  )
  if (!gun) return
  const weaponSlot = R().offers.weaponSlot
  if (offers.value[weaponSlot] !== gun) {
    const next = offers.value.slice()
    next[weaponSlot] = gun
    offers.value = next
  }

  // ── The guarantee has to be real ──
  //
  // `pickAffordableWeapon` deals the CHEAPEST gun when nothing is payable — an
  // unaffordable card, which is not a guarantee of anything. The cheapest gun a
  // new player owns is 20 wood and wave-1 income is 17, so the promise failed
  // exactly where it was needed: at 17 wood / 12 stone, ~82 % of hands contain
  // nothing the player can buy at all, against a 15 s build phase and a 5 s
  // per-slot reroll.
  //
  // So: if the whole hand is unaffordable, floor the purse at the price of that
  // one gun. A FLOOR, not a stipend — it tops up to the price and no further,
  // it fires at most once per build phase, and it does nothing for a player who
  // can already afford anything at all.
  if (reliefGiven || offers.value.some((id) => canAffordShape(id))) return
  reliefGiven = true
  const cost = priceOf(shapeCost(gun))
  wood.value = Math.max(wood.value, cost.wood)
  stone.value = Math.max(stone.value, cost.stone)
  runCoins.value = Math.max(runCoins.value, cost.coins)
}

/**
 * Re-cut a freshly rolled piece into the best crate the player owns and can pay
 * for. A no-op for anything that is not a pure crate shape.
 *
 * Applied at every point a piece ENTERS the hand and nowhere else: a shape that
 * is already sitting on the table is a decision the player is in the middle of
 * making, and silently promoting it under them the moment a wave payout lands
 * would change the price of the thing they were about to tap.
 */
const dealt = (id: string): string =>
  upgradeCrateShape(id, availableBlocks.value, canAffordShape)

/** Reroll one offer slot, avoiding duplicates with the other three. */
export const rerollOffer = (slotIndex: number): void => {
  const next = offers.value.slice()
  const others = next.filter((_, i) => i !== slotIndex)
  const outgoing = next[slotIndex]
  // The outgoing piece is excluded BY ID and, through `avoid`, by what it is —
  // otherwise a weapon reroll could hand back the same gun on a different
  // plinth, which is the button appearing not to work.
  next[slotIndex] = dealt(rollOffer(
    slotIndex,
    wave.value,
    availableBlocks.value,
    // Compared by BASE geometry, so a reroll cannot hand back the same L in a
    // different crate and read as the button doing nothing.
    (outgoing ? [...others, outgoing] : others).map(crateBaseId),
    Math.random,
    outgoing ? crateBaseId(outgoing) : undefined,
    laneCfg()
  ))
  offers.value = next
  // A rerolled slot loses its enhanced status — the reinforcement came with the
  // specific piece the ad dealt, not with the slot.
  const flags = offerEnhanced.value.slice()
  flags[slotIndex] = false
  offerEnhanced.value = flags
  ensureAffordableWeapon()
}

/**
 * The player's own reroll: one independent five-second timer per slot.
 *
 * Without it a bad hand is a dead build phase — four structure pieces you can't
 * afford, or a fourth wooden domino when what you need is a gun. The cooldown
 * keeps it from becoming a slot machine you spin until the piece you wanted
 * comes up, but it is charged to the SLOT you spun, so fixing one dead offer no
 * longer freezes the three that were fine.
 */
export const canManualReroll = (slotIndex: number): boolean =>
  slotIndex >= 0 && slotIndex < R().offers.slots && (rerollTimers[slotIndex] ?? 0) <= 0

export const manualReroll = (slotIndex: number): boolean => {
  if (!canManualReroll(slotIndex)) return false
  rerollOffer(slotIndex)
  rerollTimers[slotIndex] = R().offers.rerollMs
  syncRerollClocks()
  return true
}

/** Replace the whole hand with four ENHANCED shapes (the rewarded-ad payout). */
export const dealEnhancedOffers = (): void => {
  offers.value = rollOffers(wave.value, availableBlocks.value, Math.random, laneCfg()).map(dealt)
  offerEnhanced.value = new Array(R().offers.slots).fill(true)
  ensureAffordableWeapon()
}

/** Deal a fresh hand. */
const dealOffers = (): void => {
  offers.value = rollOffers(wave.value, availableBlocks.value, Math.random, laneCfg()).map(dealt)
  offerEnhanced.value = new Array(R().offers.slots).fill(false)
  ensureAffordableWeapon()
}

/**
 * Buying a tech unlock should put the new piece in front of the player
 * immediately — waiting for the deck to cycle makes the purchase feel inert.
 * Only the two FREE lanes are rerolled; the structure and weapon lanes are left
 * alone so a deliberate pick is never yanked out from under the player.
 *
 * The watch source is a SORTED STRING, not the Set itself. `availableBlocks` is
 * a computed that rebuilds its Set whenever `tower_state` changes identity —
 * which is every persisted write, including the run snapshot saved after each
 * placement. Watching the Set by reference therefore rerolled two of the
 * player's offers on essentially every action; watching its contents fires only
 * when the unlocked set has genuinely changed.
 */
const unlockedKey = computed(() => [...availableBlocks.value].sort().join(','))

watch(unlockedKey, () => {
  if (offers.value.length !== R().offers.slots) return
  for (const slot of R().offers.unlockRerollSlots) rerollOffer(slot)
})

export const canAfford = (typeId: string): boolean => {
  const cost = priceOf(blockDef(typeId).cost)
  return wood.value >= cost.wood
    && stone.value >= cost.stone
    && runCoins.value >= cost.coins
}

/** Attempt to place `typeId` at `(c, r)`. Returns false (and changes nothing)
 *  if the slot is illegal or the player can't pay. */
/** Create a block in the grid. Shared by shape placement, the gate and the
 *  snapshot restore, so every path produces identically-shaped instances. */
const spawnBlock = (
  typeId: string, c: number, r: number, roof = false, hp?: number, enhanced = false,
  level = 0, tier = 1, w = 1, h = 1
): Block => {
  const maxHp = maxHpFor(typeId, enhanced, roof, level, tier)
  const block: Block = {
    uid: uidCounter++,
    c, r, w, h,
    typeId,
    roof,
    enhanced,
    level,
    tier,
    hp: hp ?? maxHp,
    maxHp,
    cd: 0,
    flash: 0,
    bornAt: clock,
    recoil: 0,
    aim: 0
  }
  occupy(block)
  blocksByUid.set(block.uid, block)
  return block
}

// ─── Merging ────────────────────────────────────────────────────────────────

/** Orthogonal neighbours, in the order a merge prefers them. */
const MERGE_DIRS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0], [1, 0], [0, -1], [0, 1]
]

/**
 * The rectangle two footprints would make, or null if they would not make one.
 *
 * Two rules, and both are about the SHAPE the player is aiming at:
 *
 *  - The union must still be a rectangle. An L or a staircase is refused,
 *    because a block that is not a rectangle has no honest footprint to
 *    occupy, draw, or be shot at.
 *  - An ALREADY-MERGED block may only fuse into a SQUARE. Two loose weapons go
 *    together in whichever direction the player put them — side by side into a
 *    2×1, stacked into a 1×2 — but the lengthy block that makes can only grow
 *    along its short axis.
 *
 * The second rule is what keeps the top tier a 2×2. Left free the shapes ran
 * away: four in a row gave a 4×1 strip with one gun stranded in the middle, and
 * a stacked column gave a 1×4 tower. It is the merged block that is fussy about
 * direction — a plain pair never is, and refusing those was just a bug wearing
 * a rule's clothes.
 */
const unionRect = (
  a: Block, b: Block
): { c: number; r: number; w: number; h: number } | null => {
  // Merged blocks stay stocky — no side more than twice the other; loose ones
  // go together either way.
  //
  // This used to demand an exact SQUARE, which was a second tier ceiling
  // hiding behind the first: two 2×2 bastions make a 4×2 and there is no way
  // to square them, so a tier-3 could never fuse at all. Lifting
  // `maxMergeTier` alone would have changed nothing. At 2:1 the progression is
  // the one the art already assumes — 2×1, 2×2, 4×2, 4×4, 8×4 — and it still
  // refuses the shape the square rule existed to refuse: a 4×1 strip with one
  // gun stranded in the middle of it.
  const merged = tierOf(a.tier) >= 2
  const take = (
    rect: { c: number; r: number; w: number; h: number }
  ): { c: number; r: number; w: number; h: number } | null =>
    !merged || Math.max(rect.w, rect.h) <= 2 * Math.min(rect.w, rect.h) ? rect : null

  // Side by side: same rows, touching columns.
  if (a.r === b.r && spanH(a) === spanH(b)) {
    const [l, right] = a.c <= b.c ? [a, b] : [b, a]
    if (l.c + spanW(l) === right.c) {
      const rect = take({ c: l.c, r: l.r, w: spanW(l) + spanW(right), h: spanH(l) })
      if (rect) return rect
    }
  }
  // Stacked: same columns, touching rows.
  if (a.c === b.c && spanW(a) === spanW(b)) {
    const [low, high] = a.r <= b.r ? [a, b] : [b, a]
    if (low.r + spanH(low) === high.r) {
      const rect = take({ c: low.c, r: low.r, w: spanW(low), h: spanH(low) + spanH(high) })
      if (rect) return rect
    }
  }
  return null
}

/**
 * Fuse the block at `(c, r)` with a neighbour, repeatedly, while it can.
 *
 * The result always lands on the cell the player just built in. That is the
 * point of intent, and a merge that jumped to the older block would move the
 * tower out from under the tap that made it.
 *
 * Cascading is deliberate: placing the fourth cannon of a square should give a
 * tier 3, not leave two tier 2s sitting next to each other waiting for a
 * placement that can never come. Horizontal neighbours are preferred because
 * "two next to each other" is what the player is looking at.
 *
 * The surviving block keeps the higher upgrade RANK of the two, so gold spent
 * from the inspector is never lost to a merge. Reinforcement is the exception
 * and needs all halves to carry it — see the note at the assignment. Hit points
 * add up and are capped at the new maximum: two wounded blocks make one wounded
 * block, not a free repair.
 */
const mergeAt = (c0: number, r0: number): boolean => {
  let c = c0
  let r = r0
  if (R().merge !== 'adjacency' || !mergeUnlocked.value) return false
  let fused = false

  for (;;) {
    const b = blockAt(c, r)
    if (!b || tierOf(b.tier) >= R().maxMergeTier) break

    // Scan every cell around the whole footprint, not just around one cell —
    // a 2×1 has six neighbours and any of them may be its next half.
    let other: Block | undefined
    let rect: { c: number; r: number; w: number; h: number } | null = null
    outer: for (const [cc, rr] of cellsOf(b)) {
      for (const [dx, dy] of MERGE_DIRS) {
        const n = blockAt(cc + dx, rr + dy)
        if (!n || n === b || !canMergeBlocks(b, n, R().mergeTypes, R().maxMergeTier)) continue
        const u = unionRect(b, n)
        if (u) { other = n; rect = u; break outer }
      }
    }
    if (!other || !rect) break

    release(b)
    release(other)
    blocksByUid.delete(other.uid)

    // The survivor takes the union: nothing the halves stood on is given up,
    // which is the whole point — a merge changes the SHAPE of the tower, it
    // does not shrink it.
    b.c = rect.c
    b.r = rect.r
    b.w = rect.w
    b.h = rect.h
    b.tier = tierOf(b.tier) + 1
    b.level = Math.max(b.level ?? 0, other.level ?? 0)
    // Reinforcement carries over only if EVERY half had it.
    //
    // Gold on the battlefield means one thing — reinforced — so a merged block
    // may only wear it if the whole thing was. Taking the better half instead
    // would have handed out the rewarded-video bonus for free the moment a
    // plain block was fused into a reinforced one, and the rim would have
    // stopped meaning anything.
    b.enhanced = b.enhanced === true && other.enhanced === true
    // A gable survives only if BOTH halves had one: the merged block occupies
    // one cell, and inheriting a seal the player did not buy on both sides
    // would close a column they were still building up.
    b.roof = b.roof === true && other.roof === true
    // Carry the WOUNDS across, not the raw hit points.
    //
    // Summing hp instead loses the rounding between two half-sized ceilings and
    // the merged one, so two untouched blocks fused into a block missing two
    // points — and every merged block in the game wore a health bar forever.
    // Damage taken is the thing that should survive a weld; full health going
    // in has to mean full health coming out.
    const missing = Math.max(0, b.maxHp - b.hp) + Math.max(0, other.maxHp - other.hp)
    b.maxHp = maxHpFor(b.typeId, b.enhanced, b.roof, b.level, b.tier)
    b.hp = Math.max(1, b.maxHp - missing)
    b.bornAt = clock
    occupy(b)

    pushFx({
      kind: 'place',
      x: centreX(b), y: centreY(b),
      palette: blockDef(b.typeId).palette
    })
    fused = true
    // The anchor may have moved to the other half's corner; keep scanning from
    // wherever the block actually is now.
    c = b.c
    r = b.r
  }

  return fused
}

/**
 * Fuse anything that has BECOME mergeable, wherever it is.
 *
 * `mergeAt` only ever ran from a placement, which quietly meant "two blocks
 * merge if and only if one of them was just built". Everything else that makes
 * two twins adjacent left them stuck side by side forever:
 *
 *  - the wall between them is destroyed mid-wave;
 *  - one of them falls and lands beside the other after a collapse;
 *  - the player buys Fusion with the pair already standing;
 *  - a run is restored from a snapshot written before Fusion was owned.
 *
 * All four read to the player as the merge system being broken, because from
 * where they are sitting two identical guns are touching and nothing happens.
 * Running a settle pass on every structural change makes the rule the one the
 * player actually believes: if they are adjacent, they fuse.
 *
 * Bounded rather than `while (fused)`: a cascade is at most two tiers deep, and
 * a loop that cannot terminate is a worse bug than the one being fixed.
 */
const settleMerges = (): void => {
  if (R().merge !== 'adjacency' || !mergeUnlocked.value) return
  for (let pass = 0; pass < 4; pass++) {
    let fused = false
    for (const b of [...towerBlocks()]) {
      // A block consumed earlier in this pass is gone from the index.
      if (!blocksByUid.has(b.uid)) continue
      if (mergeAt(b.c, b.r)) fused = true
    }
    if (!fused) return
  }
}

/** Place a SINGLE block. Retained for the gate, the snapshot restore and unit
 *  tests; the player always goes through `placeShape`. */
export const placeBlock = (typeId: string, c: number, r: number): boolean => {
  if (phase.value === 'defeat') return false
  if (!canPlaceAt(c, r, typeId) || !canAfford(typeId)) return false

  const def = blockDef(typeId)
  const cost = priceOf(def.cost)
  wood.value -= cost.wood
  stone.value -= cost.stone
  runCoins.value -= cost.coins
  spawnBlock(typeId, c, r)
  blocksPlacedThisRun++
  mergeAt(c, r)
  syncTowerStats()
  pushFx({ kind: 'place', x: c, y: r + 0.5, palette: def.palette })
  return true
}

/** Sell a placed block for half its cost. The Gate can never be sold.
 *  Returns the refund, or null when the sale is rejected. */
export const sellBlock = (c: number, r: number): { wood: number; stone: number; coins: number } | null => {
  const b = blockAt(c, r)
  if (!b || b.typeId === GATE_ID) return null
  const refund = priceOf(sellRefund(b.typeId, spanW(b) * spanH(b), b.level ?? 0))
  wood.value += refund.wood
  stone.value += refund.stone
  runCoins.value += refund.coins
  removeBlock(b, false)
  settleSupport()
  syncTowerStats()
  pushFx({ kind: 'sell', x: c, y: r + 0.5 })
  return refund
}

// ─── In-run block upgrades ──────────────────────────────────────────────────

// ─── Drops ──────────────────────────────────────────────────────────────────
//
// The mobile-fit board is built by DROPPING: the player picks a column and the
// offered piece falls into it, landing on whatever is there. Nothing is aimed
// at a cell, so nothing can be missed by a fingertip's width — the column is
// the target, and a column on a phone is forty-odd pixels wide and three
// hundred tall.

/**
 * Highest row taken in column `c`, or −1 for an empty column.
 *
 * Pieces still in the air have already claimed their landing rows, or two
 * quick drops into one column would both be sold the same cell and the second
 * would shatter on the first the moment it landed.
 */
export const columnTop = (c: number): number => {
  let top = -1
  for (const b of towerBlocks()) {
    if (c < b.c || c > b.c + spanW(b) - 1) continue
    if (topRow(b) > top) top = topRow(b)
  }
  for (const d of debris) {
    if (!d.falling?.gentle || d.c !== c) continue
    top = Math.max(top, landingRowFor(c, d.falling.fromRow ?? d.r, spanW(d)) + spanH(d) - 1)
  }
  return top
}

/** Can `cells` more blocks come to rest in column `c`? */
export const canDropAt = (c: number, cells = 1): boolean => {
  if (phase.value === 'defeat') return false
  const b = R().board
  const ground = b.groundHalfWidth === 'tech' ? buildHalfWidth.value : b.groundHalfWidth
  if (Math.abs(c) > Math.min(ground, b.upperHalfWidth)) return false
  return columnTop(c) + cells <= b.maxRow
}

/**
 * A block that starts life in the air.
 *
 * Built exactly as `spawnBlock` builds one, but it occupies nothing yet: it
 * joins the tower on landing, through the same path collapsing debris takes,
 * so a drop and a fall are one piece of physics rather than two.
 */
const spawnFallingBlock = (
  typeId: string, c: number, fromRow: number, enhanced = false
): Block => {
  const maxHp = maxHpFor(typeId, enhanced, false, 0, 1)
  const block: Block = {
    uid: uidCounter++,
    c, r: fromRow, w: 1, h: 1,
    typeId,
    roof: false,
    enhanced,
    level: 0,
    tier: 1,
    hp: maxHp,
    maxHp,
    cd: 0,
    flash: 0,
    bornAt: -9999,
    recoil: 0,
    aim: 0,
    falling: { dy: 0, vy: 0, rot: 0, vrot: 0, dx: 0, vx: 0, fromRow, gentle: true }
  }
  debris.push(block)
  return block
}

/**
 * Drop the piece in offer slot `slotIndex` into column `c`.
 *
 * Charges the piece and rerolls the slot the moment it is released — the
 * decision is made — but the tower only gains the blocks when they land, which
 * is also the first moment a snapshot can carry them (see `stepDebris`).
 * A two-tall piece is dropped bottom cell first, one row apart, so it stacks
 * in the order it was drawn.
 */
export const dropOffer = (slotIndex: number, c: number): boolean => {
  const shapeId = offers.value[slotIndex]
  if (!shapeId || phase.value === 'defeat') return false
  const def = SHAPE_BY_ID[shapeId]
  if (!def) return false
  const cells = [...def.cells].sort((a, b) => a[1] - b[1])
  // Drops are one column wide by construction; anything else is a shape for
  // the placement board, not for this one.
  if (cells.some(([dx]) => dx !== 0)) return false
  if (!canDropAt(c, cells.length) || !canAffordShape(shapeId)) return false

  const cost = priceOf(shapeCost(shapeId))
  wood.value -= cost.wood
  stone.value -= cost.stone
  runCoins.value -= cost.coins

  const enhanced = offerEnhanced.value[slotIndex] === true
  const from = Math.min(R().board.maxRow, 40) + 2
  cells.forEach(([, , typeId], i) => { spawnFallingBlock(typeId, c, from + i, enhanced) })
  blocksPlacedThisRun += cells.length
  rerollOffer(slotIndex)
  return true
}

/** Gold price of the next rank on the block at `(c, r)`, or `Infinity`. */
export const upgradeCostAt = (c: number, r: number): number => {
  const b = blockAt(c, r)
  return b ? blockUpgradeCost(b.typeId, b.level ?? 0) : Infinity
}

/** Is the next rank both available and affordable right now? */
export const canUpgradeBlock = (c: number, r: number): boolean => {
  const b = blockAt(c, r)
  if (!b || (b.level ?? 0) >= MAX_BLOCK_LEVEL) return false
  return runCoins.value >= blockUpgradeCost(b.typeId, b.level ?? 0)
}

/**
 * Spend run gold to add one rank to a placed block.
 *
 * The HP the rank buys is granted as CURRENT hit points too, not just ceiling.
 * An upgrade bought at half health that only raised `maxHp` would read to the
 * player as their block getting more damaged, which is the opposite of what
 * they just paid for.
 *
 * The Gate is upgradeable on purpose: it is the one block the player cannot
 * replace, and "spend gold on the thing you are defending" is the most obvious
 * use of the currency there is.
 */
export const upgradeBlock = (c: number, r: number): boolean => {
  const b = blockAt(c, r)
  if (!b) return false
  const level = b.level ?? 0
  if (level >= MAX_BLOCK_LEVEL) return false
  const cost = blockUpgradeCost(b.typeId, level)
  if (runCoins.value < cost) return false

  runCoins.value -= cost
  // Gold just left the purse, which can put the offered gun out of reach.
  ensureAffordableWeapon()
  b.level = level + 1
  const before = b.maxHp
  b.maxHp = maxHpFor(b.typeId, b.enhanced, b.roof, b.level, b.tier)
  b.hp = Math.min(b.maxHp, b.hp + Math.max(0, b.maxHp - before))
  if (b.uid === gateUid) syncGateRefs()
  // Bumped so the inspector — which holds a plain, non-reactive block — knows
  // its numbers just changed.
  towerVersion.value++
  pushFx({ kind: 'place', x: centreX(b), y: centreY(b), palette: blockDef(b.typeId).palette })
  if (phase.value === 'build') saveRunSnapshot()
  return true
}

// ─── Arrow Rain ─────────────────────────────────────────────────────────────
//
// The tower's one PLAYER-aimed attack.
//
// Everything else the player owns is a building that decides for itself what to
// shoot. That leaves two threats with no answer the player can actually reach
// for in the moment: a bomber cruising above every turret's arc, and a siege
// engine parked outside every turret's range. Cavalry answers the second for
// meta coins; nothing answered the first.
//
// It is deliberately not free of consequence. The volley comes down through
// whatever is underneath it, and the tower is underneath it, so calling it on
// enemies standing over your own wall costs you a tenth of that wall. Aiming it
// is the skill.

/** Half-width of the beaten zone, in cells. */
export const ARROW_RAIN_RADIUS = 4
/** What one volley does to a ground or naval enemy caught in it. */
export const ARROW_RAIN_DAMAGE = 150
/** Fraction of its OWN ceiling every tower block under the zone loses. */
export const ARROW_RAIN_SELF_PCT = 0.1
/** Cleared waves needed to refill an empty charge. */
export const ARROW_RAIN_WAVES = 3

/**
 * Cleared waves banked toward the next volley, 0..`ARROW_RAIN_WAVES`.
 *
 * Counted in WHOLE WAVES rather than as a 0..1 fraction, and that is not a
 * style choice: adding a third three times lands on 0.9999999999999999, so a
 * fractional charge leaves the player who has cleared exactly three waves
 * looking at a button that is still dark. The fraction the HUD draws is derived
 * from the count, never accumulated into.
 *
 * Starts FULL. A skill whose first use is three waves away is a skill the
 * player meets as a greyed-out button and never forms a habit around.
 */
export const arrowRainStock = ref(ARROW_RAIN_WAVES)
/** Readiness as 0..1, for the button's fill. */
export const arrowRainCharge = computed(() => arrowRainStock.value / ARROW_RAIN_WAVES)
export const arrowRainReady = computed(() => arrowRainStock.value >= ARROW_RAIN_WAVES)
/** Whole waves still owed before the next volley. */
export const arrowRainWavesLeft = computed(
  () => Math.max(0, ARROW_RAIN_WAVES - arrowRainStock.value)
)

/**
 * Call the volley down on the column centred at `x`.
 *
 * One arrow's life, and the whole design in three steps:
 *
 *   1. it falls through everything in the OPEN, wounding all of it. Enemies do
 *      not stop an arrow, so a bomber dying at cruise altitude still leaves the
 *      shaft to reach the siege engine parked underneath it;
 *   2. it stops at the first SOLID thing — the topmost block of the column it
 *      is falling down;
 *   3. and it goes no further, so everything sheltering under that block is
 *      untouched.
 *
 * Air enemies die outright — that is what the skill is for — while everything
 * else takes a flat wound. A trebuchet does not die to one volley, and should
 * not: the point is to reach it at all.
 */
export const callArrowRain = (x: number): boolean => {
  if (!arrowRainReady.value) return false
  if (phase.value === 'defeat') return false
  arrowRainStock.value = 0

  // 1. Everything in the open, at every height. An arrow PENETRATES what it
  //    hits: a bomber dying at cruise altitude does not stop the shaft that
  //    killed it, so the same volley reaches the siege engine standing under
  //    it. Order against the tower below is therefore immaterial — nothing
  //    here can consume an arrow — but it is resolved first because that is
  //    the order the volley physically arrives in.
  for (const e of [...enemies]) {
    if (e.dying > 0) continue
    if (Math.abs(e.x - x) > ARROW_RAIN_RADIUS) continue
    if (enemyDef(e.typeId).movement === 'air') killEnemy(e)
    else damageEnemy(e, ARROW_RAIN_DAMAGE, x, 'bolt')
  }

  // 2. The tower stops the volley. Solid is where an arrow ends, so each
  //    column gives up exactly ONE block — the topmost — and everything
  //    sheltering under it is untouched.
  //
  //    That is the whole cost model. Firing over your own crown is a tenth of
  //    the crown, not a tenth of the tower, so a tall wall is a roof for what
  //    it stands on and the price of a volley is something the player can read
  //    off the silhouette before they spend it.
  const spent = new Set<number>()
  const from = Math.ceil(x - ARROW_RAIN_RADIUS)
  const to = Math.floor(x + ARROW_RAIN_RADIUS)
  for (let c = from; c <= to; c++) {
    let top: Block | undefined
    for (const b of towerBlocks()) {
      if (c < b.c || c > b.c + spanW(b) - 1) continue
      if (!top || b.r + spanH(b) > top.r + spanH(top)) top = b
    }
    // A wide or merged block spanning several columns catches several arrows
    // and still pays once: the rule is a tenth per BLOCK, not per arrow.
    if (!top || spent.has(top.uid)) continue
    spent.add(top.uid)
    // Straight off the ceiling, bypassing `damageBlock`: armour is a shield
    // against things shooting AT the tower, and these are the tower's own
    // arrows falling on it. A stone wall shrugging off its own volley while a
    // crate is gutted would make the cost unreadable.
    top.hp = Math.max(1, top.hp - top.maxHp * ARROW_RAIN_SELF_PCT)
    top.flash = 1
  }

  syncTowerStats()
  pushFx({ kind: 'arrowRain', x, y: 0, radius: ARROW_RAIN_RADIUS })
  if (phase.value === 'build') saveRunSnapshot()
  return true
}

// ─── Field repair ───────────────────────────────────────────────────────────

/** Hit points one gold buys when patching a block. */
export const REPAIR_HP_PER_GOLD = 20
/** How long the same block must wait before it can be patched again, ms. */
export const REPAIR_COOLDOWN_MS = 20_000

/**
 * Gold price of patching the block at `(c, r)` back to full.
 *
 * Priced off the block's CEILING, not its wounds, and it always heals all the
 * way. That is what makes it a decision rather than a slider: topping up a
 * scratch is terrible value and hauling something back from the brink is
 * excellent, so the question the button asks is "is this one nearly dead", not
 * "can I afford another point".
 *
 * The ceiling is the LIVE one — ranks, reinforcement, merge tier and the
 * banners currently touching it are all already in `maxHp` — so a block that is
 * expensive to repair is expensive precisely because it is worth repairing.
 *
 * Before this the only ways to heal were a Repair Bay (a whole cell, and only
 * between waves) or a rank (gold priced for a permanent upgrade, not for first
 * aid). Neither is something a player can do to the one wall that is about to
 * go, in the ten seconds they have left.
 */
export const repairCostAt = (c: number, r: number): number => {
  const b = blockAt(c, r)
  if (!b) return Infinity
  return Math.max(1, Math.ceil(b.maxHp / REPAIR_HP_PER_GOLD))
}

/** Milliseconds until this block may be patched again. 0 = ready now. */
export const repairWaitAt = (c: number, r: number): number => {
  const b = blockAt(c, r)
  if (!b || b.repairedAt === undefined) return 0
  return Math.max(0, REPAIR_COOLDOWN_MS - (clock - b.repairedAt))
}

/** Is this block damaged, off cooldown, and affordable right now? */
export const canRepairBlock = (c: number, r: number): boolean => {
  const b = blockAt(c, r)
  if (!b || b.hp >= b.maxHp) return false
  if (repairWaitAt(c, r) > 0) return false
  return runCoins.value >= repairCostAt(c, r)
}

/** Total gold to patch every wounded block back to full. 0 when nothing is hurt. */
export const repairAllCost = (): number => {
  let gold = 0
  for (const b of towerBlocks()) {
    if (b.hp >= b.maxHp) continue
    gold += Math.max(1, Math.ceil((b.maxHp - b.hp) / REPAIR_HP_PER_GOLD))
  }
  return gold
}

/**
 * Patch the whole tower between waves, for run gold.
 *
 * The mobile-fit board has no per-block inspector — a five-column tower is
 * repaired as a whole. Priced on the WOUNDS rather than the ceilings, unlike
 * the inspector's per-block patch, because "fix everything" is a decision
 * about the purse, not about which block is nearly gone. Build phase only:
 * mid-wave it would be a "pay to undo the wave" button.
 */
export const repairAll = (): boolean => {
  if (phase.value !== 'build') return false
  const cost = repairAllCost()
  if (cost <= 0 || runCoins.value < cost) return false
  runCoins.value -= cost
  for (const b of towerBlocks()) {
    if (b.hp >= b.maxHp) continue
    // Same ledger as every other heal: what a repair puts back must not be
    // re-counted as strength the director prices the next wave against.
    repairedSinceMeasure += b.maxHp - b.hp
    b.hp = b.maxHp
    b.repairedAt = clock
    pushFx({ kind: 'repair', x: centreX(b), y: centreY(b) })
  }
  ensureAffordableWeapon()
  syncGateRefs()
  towerVersion.value++
  saveRunSnapshot()
  return true
}

/** Spend run gold to patch one block back to full. */
export const repairBlock = (c: number, r: number): boolean => {
  if (!canRepairBlock(c, r)) return false
  const b = blockAt(c, r)!
  runCoins.value -= repairCostAt(c, r)
  // Measured BEFORE the heal lands, or the ledger below books nothing.
  const healed = b.maxHp - b.hp
  b.hp = b.maxHp
  b.repairedAt = clock
  // Healing is not building: what a repair puts back must not be re-counted as
  // tower strength the director then prices the next wave against. This is the
  // same ledger the Repair Bay and Field Repairs pay into.
  repairedSinceMeasure += healed
  b.flash = 0
  // Gold just left the purse, which can put the offered gun out of reach.
  ensureAffordableWeapon()
  // The inspector holds a plain, non-reactive block — tell it the numbers moved.
  towerVersion.value++
  pushFx({ kind: 'repair', x: centreX(b), y: centreY(b) })
  if (phase.value === 'build') saveRunSnapshot()
  return true
}

// ─── Fortifying ─────────────────────────────────────────────────────────────

/**
 * Can this cell be turned into a spiked wall right now?
 *
 * Three gates, and each is a different kind of "no":
 *  - it has to be a plain WALL (`canFortifyType`), not the Gate or a gun;
 *  - the spiked wall has to be UNLOCKED, or this would be a side door around
 *    the tech node that sells it;
 *  - and it has to be affordable.
 */
export const fortifyCostAt = (
  c: number, r: number
): { wood: number; stone: number; coins: number } | null => {
  const b = blockAt(c, r)
  if (!b || !canFortifyType(b.typeId)) return null
  return fortifyCost(b.typeId, spanW(b) * spanH(b))
}

export const canFortifyBlock = (c: number, r: number): boolean => {
  const cost = fortifyCostAt(c, r)
  if (!cost || !availableBlocks.value.has(FORTIFY_TARGET)) return false
  return wood.value >= cost.wood && stone.value >= cost.stone && runCoins.value >= cost.coins
}

/**
 * Convert a standing wall into a spiked one, in place.
 *
 * The block keeps everything the player has already put into it — its ranks,
 * its gable, its reinforcement, its footprint and the cells it holds up. What
 * changes is its type, and with it every number the type decides.
 *
 * WOUNDS carry, not hit points. A spiked wall has three times a crate's
 * ceiling, so preserving the fraction would have made this a cheap heal; and
 * preserving the raw hit points would have left a fresh conversion looking
 * badly damaged. Carrying the damage is the same rule a merge uses, for the
 * same reason.
 */
export const fortifyBlock = (c: number, r: number): boolean => {
  if (!canFortifyBlock(c, r)) return false
  const b = blockAt(c, r)!
  const cost = fortifyCostAt(c, r)!

  wood.value -= cost.wood
  stone.value -= cost.stone
  runCoins.value -= cost.coins

  const missing = Math.max(0, b.maxHp - b.hp)
  b.typeId = FORTIFY_TARGET
  // Structure blocks never merge, so a converted wall is always tier 1 — but
  // say so rather than carrying a tier from a type that no longer applies.
  b.tier = 1
  b.maxHp = maxHpFor(b.typeId, b.enhanced, b.roof, b.level, b.tier, b.buffMul ?? 1)
  b.hp = Math.max(1, b.maxHp - missing)
  b.flash = 1
  b.bornAt = clock

  // Its armour changed, which changes what it is worth to its neighbours'
  // buff maths and to the difficulty director.
  syncTowerStats()
  ensureAffordableWeapon()
  pushFx({ kind: 'place', x: centreX(b), y: centreY(b), palette: blockDef(b.typeId).palette })
  if (phase.value === 'build') saveRunSnapshot()
  return true
}

/** Remove a block from the grid. `violent` routes it through the destruction
 *  VFX + TNT detonation; a sale is quiet. */
const removeBlock = (b: Block, violent: boolean): void => {
  release(b)
  blocksByUid.delete(b.uid)
  if (!violent) return

  const def = blockDef(b.typeId)
  pushFx({ kind: 'shatter', x: centreX(b), y: centreY(b), palette: def.palette })

  const boom = def.utility?.deathExplosion
  if (boom) {
    // TNT pays off here: a nearly-free block that converts its own death into
    // a large area denial. Damages enemies only — chaining through the player's
    // own tower would make it a trap rather than a tool.
    pushFx({ kind: 'explosion', x: centreX(b), y: centreY(b), radius: boom.radius })
    damageEnemiesInRadius(
      centreX(b), centreY(b), boom.radius,
      boom.damage * upgradePowerMul(b.level) * mergeOutputMul(b)
    )
  }
}

/**
 * Flood-fill support from the ground row and set anything unreachable falling.
 * Runs after every destruction. Cascades naturally: a collapsing block is
 * removed from `blocks`, and the NEXT call (fired when it lands) re-checks —
 * which is what produces the domino effect when a tower is undermined.
 */
const resolveOrphans = (): void => {
  if (blocksByUid.size === 0) return

  // Support is flood-filled from the GATE, orthogonally. Anything the Gate can
  // no longer reach through a chain of blocks is unsupported — that is what
  // makes undermining a tower a real tactic rather than a chip-damage race.
  //
  // Ground-row blocks are an exception: they are standing on the earth, so they
  // stay put even when the chain to the Gate is cut. They cannot fall anywhere.
  // Reachability is per BLOCK, not per cell: a merged block is one member of
  // the chain however many cells it spans, and it conducts support across its
  // whole footprint.
  const reachable = new Set<number>()
  const stack: Block[] = []

  const gate = blocksByUid.get(gateUid)
  if (gate) {
    reachable.add(gate.uid)
    stack.push(gate)
  }

  while (stack.length > 0) {
    const b = stack.pop()!
    for (const [c, r] of cellsOf(b)) {
      const neighbours = [
        blockAt(c - 1, r), blockAt(c + 1, r),
        blockAt(c, r - 1), blockAt(c, r + 1)
      ]
      for (const n of neighbours) {
        if (!n || n === b) continue
        // A moored hull is not structure. It must never conduct support up into
        // the tower, or a player could hold a cantilever together with a rowing
        // boat tied to the bottom of it.
        if (isShip(n.typeId)) continue
        if (reachable.has(n.uid)) continue
        reachable.add(n.uid)
        stack.push(n)
      }
    }
  }

  let collapsed = 0
  for (const b of [...towerBlocks()]) {
    if (b.r <= 0) continue // on the ground or afloat; nowhere to fall
    if (reachable.has(b.uid)) continue
    release(b)
    blocksByUid.delete(b.uid)
    b.falling = {
      dy: 0,
      vy: 0,
      rot: 0,
      // A little spin so a collapse reads as tumbling rubble rather than a
      // freight elevator. There is deliberately NO horizontal drift: these
      // blocks land back on the grid, and a block that drifted a third of a
      // cell sideways would land in a column it never fell down.
      vrot: (Math.random() - 0.5) * 3.2,
      dx: 0,
      vx: 0,
      fromRow: b.r
    }
    debris.push(b)
    collapsed++
  }

  if (collapsed > 0) {
    pushFx({ kind: 'collapse', x: 0, y: 0, count: collapsed })
  }
}

// ─── Column support ─────────────────────────────────────────────────────────
//
// The mobile-fit board has no flood fill: a block rests on the block below it
// or on the ground, and that is the whole rule. When something dies, whatever
// stood on it drops one landing — a cascade the player reads off the column
// alone, with nothing to learn about chains back to the Gate.

const settleColumns = (): void => {
  const gentle = R().fall.gentleSettle
  // Bottom-up, so a stack over a gap is released from its lowest block first
  // and every block above it finds the cell below already emptied.
  const standing = [...towerBlocks()].sort((a, b) => a.r - b.r)
  let dropped = 0
  for (const b of standing) {
    if (b.r <= 0 || b.typeId === GATE_ID) continue
    let supported = false
    for (let dx = 0; dx < spanW(b); dx++) {
      if (blocks.has(key(b.c + dx, b.r - 1))) { supported = true; break }
    }
    if (supported) continue
    release(b)
    blocksByUid.delete(b.uid)
    b.falling = { dy: 0, vy: 0, rot: 0, vrot: 0, dx: 0, vx: 0, fromRow: b.r, gentle }
    debris.push(b)
    dropped++
  }
  // A gentle settle is not a collapse — no rumble, no screen shake. The
  // landing thump is all the feedback a one-row drop needs.
  if (dropped > 0 && !gentle) pushFx({ kind: 'collapse', x: 0, y: 0, count: dropped })
}

/** Re-check support after the tower changed, by whichever rule is in force. */
const settleSupport = (): void => {
  if (R().support === 'column') settleColumns()
  else resolveOrphans()
}

/**
 * Fuse a block that has just come to rest with any twin it TOUCHES.
 *
 * The landing-merge rule of the mobile-fit board — `R().mergeDirs` says which
 * neighbours count, and there it is all four.
 *
 * The survivor is the LONGEST-LIVING of the pair, which is the lower `uid`:
 * uids are handed out in creation order and never reused. Downward that is
 * always the block below — a column-support board is built strictly bottom-up,
 * so within a column older is always lower — which is exactly what this rule
 * used to say outright, and why no existing behaviour moves. Sideways there is
 * no gravity to appeal to and "the one that was already there" is what a
 * player predicts: the piece just dropped slides into the tower, rather than
 * the tower sliding into it.
 *
 * The loop repeats from the survivor, so a weld that creates a new twin
 * resolves in the same tick and a run of them cascades. It terminates because
 * every pass deletes one block.
 *
 * A sideways weld vacates a cell that may have had blocks standing on it. The
 * caller settles: `stepDebris` runs `settleColumns` in the same tick as the
 * landings, and those settled blocks land and merge in their turn.
 *
 * The bookkeeping — wounds carried, the better rank kept, reinforcement only
 * if both halves had it — follows `mergeAt` exactly, so a merged block means
 * the same thing on both boards.
 */
const mergeOnLanding = (landed: Block): void => {
  let b = landed
  for (;;) {
    let other: Block | undefined
    for (const [dx, dy] of R().mergeDirs) {
      const n = blockAt(b.c + dx, b.r + dy)
      if (!n || n === b || n.typeId === GATE_ID || n.falling) continue
      if (!canMergeBlocks(b, n, R().mergeTypes, R().maxMergeTier)) continue
      other = n
      break
    }
    if (!other) return
    const keep = other.uid < b.uid ? other : b
    const gone = keep === other ? b : other
    const missing = Math.max(0, keep.maxHp - keep.hp) + Math.max(0, gone.maxHp - gone.hp)
    release(gone)
    blocksByUid.delete(gone.uid)
    keep.tier = tierOf(keep.tier) + 1
    keep.level = Math.max(keep.level ?? 0, gone.level ?? 0)
    keep.enhanced = keep.enhanced === true && gone.enhanced === true
    keep.maxHp = maxHpFor(keep.typeId, keep.enhanced, keep.roof, keep.level, keep.tier)
    keep.hp = Math.max(1, keep.maxHp - missing)
    keep.bornAt = clock
    pushFx({
      kind: 'merge',
      x: centreX(keep), y: centreY(keep),
      tier: tierOf(keep.tier),
      palette: blockDef(keep.typeId).palette
    })
    b = keep
  }
}

/**
 * Where a block falling down column `c` from `fromRow` comes to rest.
 *
 * Scans downward for the first occupied cell and returns the row above it, or
 * row 0 if the column is clear all the way to the ground. Other blocks that are
 * mid-fall in the same column are ignored: they are resolved in the same tick
 * from the bottom up, so by the time a higher one lands the one below it has
 * already occupied its cell.
 */
const landingRowFor = (c: number, fromRow: number, w = 1): number => {
  for (let r = fromRow - 1; r >= 0; r--) {
    // A wide block is stopped by the FIRST obstruction under any of its
    // columns — it comes to rest on the highest thing it straddles rather
    // than clipping through it on one side.
    for (let dx = 0; dx < w; dx++) if (blocks.has(key(c + dx, r))) return r + 1
  }
  return 0
}

// ─── Damage ─────────────────────────────────────────────────────────────────

const damageBlock = (b: Block, amount: number, fromY?: number): void => {
  // Armour is flat and floored at 1 damage, so a swarm of chip damage still
  // eventually eats a stone wall — armour buys time, never immunity. The roof's
  // divisor sits inside that same floor, for the same reason.
  let dealt = amount - armorFor(b)
  if (b.roof && isTopSide(b, fromY)) dealt /= ROOF_TOP_DEFENSE_DIV
  dealt = Math.max(1, dealt)
  b.hp -= dealt
  b.flash = 1
  pushFx({ kind: 'blockHit', x: centreX(b), y: centreY(b), amount: dealt })

  if (b.hp > 0) return

  const wasGate = b.typeId === GATE_ID
  // One crate is enough: the streak asks for an UNTOUCHED wave, because a tower
  // that never loses a block is one the current curve cannot threaten.
  lostBlockThisWave = true
  removeBlock(b, true)
  settleSupport()
  syncTowerStats()

  if (wasGate) endRun()
}

/**
 * Apply damage to an enemy.
 *
 * `source` is the projectile kind that carried the damage, when there was one.
 * Melee (cavalry lances, spiked walls) and falling debris pass nothing, so an
 * arrow-proof engine still dies to those — the immunity is a statement about
 * arrows, not about being invincible.
 */
/**
 * What this individual bleeds.
 *
 * Read from the DESIGN bound to it, not from its type: a grunt is a Grumpling
 * or a Rattlejack depending on its uid, and one of those is a skeleton.
 * Machines shed sparks and scrap; anything with no design falls back to blood.
 */
const goreOf = (e: Enemy): string => {
  const def = enemyDef(e.typeId)
  if (def.siege) return 'metal'
  const mid = pickMonster(def.monster, e.uid)
  return mid ? monsterGore(mid) : 'blood'
}

const damageEnemy = (e: Enemy, amount: number, fromX: number, source?: ProjectileKind): void => {
  if (e.dying > 0) return
  const def = enemyDef(e.typeId)

  // Plating, checked before armour: this is the round glancing off the hull
  // rather than the hull soaking it.
  //
  // Drawn as a deflect whenever most of the shot is turned aside — not only
  // when all of it is — because the lesson is the same either way and a player
  // who cannot see WHY their damage stopped just thinks the game is broken.
  // A total resist still ends here; anything less lands for what is left.
  const resist = source ? resistOf(e.typeId, source) : 0
  if (resist > 0) {
    pushFx({ kind: 'deflect', x: e.x, y: e.y })
    if (resist >= 1) return
  }

  let dealt = amount * (1 - resist)
  // Frontal armour: only the side the enemy is facing (its travel direction)
  // is protected, so flanking fire — or simply out-ranging it — bypasses this.
  if (def.frontArmorPct && Math.sign(fromX - e.x) === e.dir) {
    dealt *= 1 - def.frontArmorPct
  }
  e.hp -= dealt
  e.flash = 1
  pushFx({
    kind: 'enemyHit', x: e.x, y: e.y, amount: Math.round(dealt),
    gore: goreOf(e),
    // Spray AWAY from whatever landed the hit.
    dir: Math.sign(e.x - fromX) || 1
  })
  if (e.hp <= 0) killEnemy(e)
}

/**
 * Test seam: damage a block directly.
 *
 * The collapse rules are the hardest part of the simulation to get right and
 * the easiest to break silently, so they need to be exercisable without
 * routing damage through an enemy that has to walk there first.
 */
export const damageBlockForTest = (b: Block, amount: number, fromY?: number): void => {
  damageBlock(b, amount, fromY)
}

/** Test seam: a blast at a world point, for checking that a merged block is
 *  hit anywhere along its span rather than only near its centre. */
export const damageBlocksInRadiusForTest = (
  x: number, y: number, radius: number, amount: number
): void => {
  damageBlocksInRadius(x, y, radius, amount)
}

const damageEnemiesInRadius = (
  x: number, y: number, radius: number, amount: number, source?: ProjectileKind
): void => {
  const r2 = radius * radius
  for (const e of enemies) {
    if (e.dying > 0) continue
    const dx = e.x - x
    const dy = e.y - y
    const d2 = dx * dx + dy * dy
    if (d2 > r2) continue
    // Linear falloff — a direct hit is meaningfully better than a graze, which
    // makes aiming splash at the densest cluster the correct instinct.
    const falloff = 1 - Math.sqrt(d2) / radius
    damageEnemy(e, amount * (0.4 + 0.6 * falloff), x, source)
  }
}

const killEnemy = (e: Enemy): void => {
  const def = enemyDef(e.typeId)
  e.dying = 320
  e.hp = 0
  kills.value++
  killsByType.value[e.typeId] = (killsByType.value[e.typeId] ?? 0) + 1
  triggerRef(killsByType)

  const drop = Math.max(1, Math.round(def.coins * mCoinDrop))
  runCoins.value += drop
  runCoinsEarned.value += drop
  pushFx({ kind: 'enemyDie', x: e.x, y: e.y, palette: def.palette, coins: drop, boss: !!def.boss })
}

// ─── Enemy AI ───────────────────────────────────────────────────────────────

/**
 * The block a ground enemy will bump into: the first occupied ground-row cell
 * along its travel direction. The Gate at (0, 0) guarantees this exists for as
 * long as the run does, so callers never have to handle "nothing to attack".
 *
 * A RANGED attacker also sees moored hulls.
 *
 * Melee still cannot — a grunt with a club has no business hitting a boat on
 * open water, and "a harbour buys nothing against a wave that walks" is a real
 * and deliberate asymmetry. But a slinger, a ballista or a catapult plainly
 * can, and while they could not, the harbour was the strongest node in the
 * tree for a reason nobody designed: hulls shoot the ground lane and, for the
 * eleven waves before the sea opens, absolutely nothing shoots back.
 */
const groundFrontier = (e: Enemy): Block | undefined => {
  const ranged = enemyDef(e.typeId).reach > 2
  let best: Block | undefined
  for (const b of towerBlocks()) {
    if (!coversRow(b, 0) && !(ranged && coversRow(b, WATER_ROW))) continue
    // Compare against the block's own FACES, not its anchor: a merged block
    // reaches further than the cell it is anchored in, and an enemy standing
    // against its far edge must still be bumping into it.
    const left = b.c - 0.5
    const right = b.c + spanW(b) - 0.5
    if (e.dir === 1) {
      // Walking right: the leftmost block still ahead of us.
      if (right < e.x) continue
      if (!best || left < best.c - 0.5) best = b
    } else {
      if (left > e.x) continue
      if (!best || right > best.c + spanW(best) - 0.5) best = b
    }
  }
  return best
}

/**
 * A sea creature's target: the first HULL in its path, or the shore if there
 * is none.
 *
 * This is what makes a harbour a real commitment rather than a free turret
 * platform. Ships stand between the lake and the tower, so anything swimming
 * in meets them first — a fleet that out-damages the sea lane never gets
 * touched, and one that does not is eaten before the tower is.
 *
 * Ground infantry never see hulls at all (`groundFrontier` only looks at row
 * zero), so a harbour buys nothing against a wave that walks. That asymmetry
 * is deliberate: it is an answer to ONE lane, bought from its own tree.
 */
const seaTarget = (e: Enemy): Block | undefined => {
  let best: Block | undefined
  for (const b of towerBlocks()) {
    if (!coversRow(b, WATER_ROW)) continue
    const left = b.c - 0.5
    const right = b.c + spanW(b) - 0.5
    if (e.dir === 1) {
      if (right < e.x) continue
      if (!best || left < best.c - 0.5) best = b
    } else {
      if (left > e.x) continue
      if (!best || right > best.c + spanW(best) - 0.5) best = b
    }
  }
  return best ?? groundFrontier(e)
}

/**
 * Flyers pick the HIGHEST block they can reach, biased toward the side they
 * came from. That's their whole design purpose: a player who stacks all their
 * defence at ground level has nothing pointed at the roof.
 */
/**
 * A siege engine's target.
 *
 * `targetsGate` engines drive past the frontier and swing at the Gate itself.
 * No enemy currently carries it: the rams did, and the result was a machine
 * parked bodily inside the wall it was supposedly breaking. The flag is kept
 * because the behaviour is a legitimate one to give something later — but
 * anything that uses it needs art that can survive standing in a stone block.
 *
 * `ladderHeight` engines let their crew strike blocks several rows up, so
 * height alone stops being safety. The siege tower's archers are drawn in its
 * fighting top for exactly that reason.
 */
const siegeTarget = (e: Enemy): Block | undefined => {
  const def = enemyDef(e.typeId)
  const siege = def.siege
  if (siege?.targetsGate) {
    const gate = blocksByUid.get(gateUid)
    if (gate) return gate
  }
  if (siege?.ladderHeight) {
    // Reach up the frontier column: prefer the highest block it can climb to,
    // which is what makes a siege tower feel like it is scaling the wall.
    const front = groundFrontier(e)
    if (!front) return undefined
    let best = front
    for (let r = 1; r <= siege.ladderHeight; r++) {
      const b = blockAt(front.c, r)
      if (b) best = b
    }
    return best
  }
  return groundFrontier(e)
}

const airTarget = (e: Enemy): Block | undefined => {
  let best: Block | undefined
  let bestScore = -Infinity
  for (const b of towerBlocks()) {
    const score = topRow(b) * 2 - Math.abs(centreX(b) - e.x) * 0.35
    if (score > bestScore) { bestScore = score; best = b }
  }
  return best
}

/**
 * Highest occupied row in the tower, for a bomber's cruise altitude.
 *
 * A bomber holds station above the CROWN, not above its current target — using
 * the target's own row would let it drift down as it chews through the top of
 * the tower and end up inside anti-air range, which is exactly the thing this
 * enemy exists not to do.
 */
const crownRow = (): number => {
  let top = 0
  for (const b of towerBlocks()) if (topRow(b) > top) top = topRow(b)
  return top
}

/** Drop one round from a bomber onto the tower below it. */
const dropOrdnance = (e: Enemy, def: EnemyDef, target: Block): void => {
  const run = def.bombRun!
  // A short lead so the round lands where the target IS rather than trailing
  // behind the bomber's own motion.
  const flight = Math.max(0.5, Math.sqrt(Math.max(0.2, e.y - centreY(target)) * 2 / GRAVITY))
  const bomb = acquireProjectile()
  bomb.uid = uidCounter++
  bomb.kind = run.ordnance
  bomb.x = e.x
  bomb.y = e.y - 0.25
  bomb.vx = e.dir * def.speed * flight * 0.35
  bomb.vy = 0
  bomb.damage = def.damage
  bomb.splash = run.splash
  bomb.ballistic = true
  bomb.targetUid = -1
  bomb.life = 6000
  bomb.slowPct = 0
  bomb.slowMs = 0
  bomb.sourceUid = -1
  bomb.hostile = true
  bomb.burnMs = run.burnMs
  bomb.burnDps = run.burnDps
  projectiles.push(bomb)
  pushFx({ kind: 'bombDrop', x: e.x, y: e.y, fire: run.ordnance === 'fire' })
}

/**
 * Throw one stone from a standoff engine at the block it is bombarding.
 *
 * The counterpart to `dropOrdnance`, and deliberately the same machinery: a
 * hostile ballistic round that the tower cannot intercept, detonating on the
 * first thing it touches. What it replaces was a blast that simply appeared on
 * the target the frame the cooldown expired — twelve cells of nothing crossed,
 * and a trebuchet arm miming a throw on a clock unrelated to the shot.
 *
 * Launched from the ARM TIP rather than the machine's centre. At release a
 * trebuchet's sling is at the top of its sweep, roughly a body-height above the
 * frame, and a stone that appears at the axle looks dropped rather than thrown.
 *
 * The arc is lofted with distance so the stone clears the tower's own crown on
 * the way in: a flat line from twelve cells out would clip the outer wall every
 * time and the shot would never read as a lob.
 */
/**
 * The wave from which stone-throwing engines switch to incendiaries.
 *
 * Late enough that a player meets plain shot for a dozen waves first and learns
 * what a catapult does before it changes — a threat that arrives already at its
 * final form teaches nothing.
 */
export const PITCH_WAVE = 30
/** How long a pitch round leaves a block alight, ms. */
export const SIEGE_BURN_MS = 4600
/** Damage per second while it burns. */
export const SIEGE_BURN_DPS = 8

/** Is this engine, on this wave, throwing fire rather than rock? */
export const isFlamingSiege = (def: EnemyDef, atWave: number): boolean =>
  def.siege?.lobbed === true && def.id === 'catapult' && atWave >= PITCH_WAVE

/**
 * Loose one bolt from a direct-fire standoff engine.
 *
 * The ballista used to resolve its shot with `damageBlock` the instant the
 * cooldown expired: eight cells of nothing crossed, damage simply appearing on
 * the target. The muzzle smoke was the only cue, so from the player's side the
 * machine did not visibly shoot at all.
 *
 * A bolt is NOT a lob. It flies flat and fast — that is the whole difference
 * between this engine and the catapult next to it, and it is what makes a
 * ballista read as a sniper rather than as a smaller trebuchet.
 */
/**
 * Cells per second. The player's own archer bolt travels at 17.
 *
 * Fast enough to read as direct fire rather than a lob, slow enough to actually
 * be seen: at 26 it crossed the eight-cell standoff in three tenths of a second
 * and the shot was over before the eye found it.
 */
const SIEGE_BOLT_SPEED = 18

const shootSiegeBolt = (e: Enemy, def: EnemyDef, target: Block): void => {
  // From the embrasure in the pavise, not the axle.
  const sx = e.x + e.dir * def.scale * 0.42
  const sy = e.y + def.scale * 0.5
  const dx = centreX(target) - sx
  const dy = centreY(target) - sy
  const dist = Math.max(0.001, Math.hypot(dx, dy))

  const bolt = acquireProjectile()
  bolt.uid = uidCounter++
  // A machine's quarrel, not an archer's arrow — its own round and its own art.
  bolt.kind = 'quarrel'
  bolt.x = sx
  bolt.y = sy
  bolt.vx = (dx / dist) * SIEGE_BOLT_SPEED
  bolt.vy = (dy / dist) * SIEGE_BOLT_SPEED
  bolt.damage = def.damage
  bolt.splash = def.siege?.splash ?? 0
  // Flat: no arc, so it arrives while the machine is still recoiling.
  bolt.ballistic = false
  bolt.targetUid = -1
  bolt.life = (dist / SIEGE_BOLT_SPEED) * 1000 + 1500
  bolt.slowPct = 0
  bolt.slowMs = 0
  bolt.sourceUid = -1
  bolt.hostile = true
  bolt.burnMs = undefined
  bolt.burnDps = undefined
  projectiles.push(bolt)
}

const lobSiegeStone = (e: Enemy, def: EnemyDef, target: Block): void => {
  const sx = e.x + e.dir * def.scale * 0.3
  const sy = e.y + def.scale * 0.62
  const dx = centreX(target) - sx
  const dy = centreY(target) - sy
  // Long enough to read as a lob at every standoff, short enough that the
  // player is never watching a stone hang while the wave has gone quiet.
  const flight = Math.max(1.1, Math.min(2.3, Math.abs(dx) / 8 + 0.85))

  // Past `PITCH_WAVE` the crews are loading pitch-soaked shot, and a catapult
  // stops being a chunk of damage and starts being a fire that keeps burning
  // after the block it hit has already been paid for. Announced by the bowl
  // being visibly alight through the whole reload — see `drawCatapultArm` —
  // because a round that changes what it does has to change how it looks.
  const flaming = isFlamingSiege(def, wave.value)

  const stone = acquireProjectile()
  stone.uid = uidCounter++
  stone.kind = flaming ? 'fire' : 'ball'
  stone.x = sx
  stone.y = sy
  stone.vx = dx / flight
  stone.vy = dy / flight + 0.5 * GRAVITY * flight
  stone.damage = def.damage
  stone.splash = def.siege?.splash ?? 0
  stone.ballistic = true
  stone.targetUid = -1
  // A generous margin over the computed flight: the round is allowed to fall
  // short or long and still land, but never to leak if it somehow misses both
  // the tower and the ground.
  stone.life = flight * 1000 + 2500
  stone.slowPct = 0
  stone.slowMs = 0
  stone.sourceUid = -1
  stone.hostile = true
  stone.burnMs = flaming ? SIEGE_BURN_MS : undefined
  stone.burnDps = flaming ? SIEGE_BURN_DPS : undefined
  projectiles.push(stone)
}

const stepEnemies = (dt: number): void => {
  const dtSec = dt / 1000

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i]!
    const def = enemyDef(e.typeId)

    if (e.dying > 0) {
      e.dying -= dt
      if (e.dying <= 0) {
        enemies.splice(i, 1)
        enemiesByUid.delete(e.uid)
      }
      continue
    }

    if (e.flash > 0) e.flash = Math.max(0, e.flash - dt / 160)
    if (e.slowMs > 0) {
      e.slowMs -= dt
      if (e.slowMs <= 0) e.slowPct = 0
    }
    e.phase += dtSec * (2.5 + def.speed)

    // Pay off any owed shove before the AI gets a say, so a knocked-back boss
    // visibly slides out instead of teleporting — and cannot walk during it.
    if (e.knockback) {
      const stepCells = Math.sign(e.knockback) * Math.min(Math.abs(e.knockback), KNOCKBACK_SPEED * dtSec)
      e.x += stepCells
      e.knockback -= stepCells
      if (Math.abs(e.knockback) < 0.01) e.knockback = 0
      continue
    }

    if (def.siege) e.spin = (e.spin ?? 0) + dtSec * def.speed * 2.6

    const target = def.movement === 'sea'
      ? seaTarget(e)
      : def.movement === 'air'
        ? airTarget(e)
        : def.siege
          ? siegeTarget(e)
          : groundFrontier(e)
    if (!target) { e.targetUid = -1; continue }

    // ── Bombers ──
    // They never enter contact. A bomber flies to a station `altitude` cells
    // above the tower's CROWN and drops from there, so a player who answered
    // every previous flyer by putting the good blocks high up now has to point
    // something upward instead.
    if (def.bombRun) {
      const run = def.bombRun
      const stationY = crownRow() + 1 + run.altitude
      const toX = nearestCellX(target, e.x) - e.x
      const toY = stationY - e.y
      const speed = def.speed * (1 - e.slowPct)

      // Climb to station and close the horizontal gap independently, so a
      // bomber rising past the tower never clips through its crown.
      if (Math.abs(toY) > 0.05) {
        e.y += Math.sign(toY) * Math.min(Math.abs(toY), speed * dtSec * 1.4)
      }
      if (Math.abs(toX) > 0.06) {
        e.x += Math.sign(toX) * Math.min(Math.abs(toX), speed * dtSec)
      }
      e.y += Math.sin(e.phase * 1.3) * 0.006

      const overhead = Math.abs(nearestCellX(target, e.x) - e.x) < 0.55
        && Math.abs(stationY - e.y) < 0.9
      e.targetUid = overhead ? target.uid : -1
      if (overhead) {
        e.cd -= dt
        if (e.cd <= 0) {
          e.cd = def.attackCooldownMs
          dropOrdnance(e, def, target)
        }
      }
      continue
    }

    const tx = nearestCellX(target, e.x)
    const ty = def.movement === 'air' ? nearestCellY(target, e.y) : e.y
    const dx = tx - e.x
    const dy = ty - e.y
    const dist = def.movement === 'air'
      ? Math.hypot(dx, dy) - 0.5
      : Math.abs(dx) - 0.5

    // ── Sea creatures ──
    // Two states, driven by `surfaced` (0 = submerged, 1 = fully reared up).
    // Submerged they are untouchable (see `pickTarget`), which is the whole
    // threat: a tower with no low, fast coverage simply cannot answer them
    // until they are already in its face.
    if (def.movement === 'sea') {
      const inRange = dist <= def.reach
      const rate = dt / (def.surfaceMs ?? 500)
      e.surfaced = Math.max(0, Math.min(1, (e.surfaced ?? 0) + (inRange ? rate : -rate)))
      // Rise out of the water as `surfaced` climbs; sink back if they lose reach.
      e.y = SEA_SWIM_Y + (SEA_STRIKE_Y - SEA_SWIM_Y) * e.surfaced

      if (!inRange) {
        const speed = def.speed * (1 - e.slowPct)
        e.targetUid = -1
        e.x += Math.sign(dx || e.dir) * speed * dtSec
        continue
      }
      // Mid-rise: winding up, not yet biting.
      if (e.surfaced < 1) { e.targetUid = target.uid; continue }

      e.targetUid = target.uid
      e.cd -= dt
      if (e.cd <= 0) {
        e.cd = def.attackCooldownMs
        damageBlock(target, def.damage, e.y)
        pushFx({
          kind: 'enemyAttack',
          x: e.x, y: e.y,
          tx: centreX(target), ty: centreY(target),
          ranged: false,
          gore: goreOf(e)
        })
      }
      continue
    }

    // A standoff engine's "reach" IS its parking distance.
    const stopAt = def.siege?.standoff ?? def.reach

    if (dist > stopAt) {
      // Travel. `slowPct` is the frost tower's whole contribution, so it must
      // apply to the actual displacement, not just an animation speed.
      const speed = def.speed * (1 - e.slowPct)
      e.targetUid = -1
      if (def.movement === 'air') {
        const len = Math.hypot(dx, dy) || 1
        e.x += (dx / len) * speed * dtSec
        e.y += (dy / len) * speed * dtSec
        // Gentle bobbing so flight reads as flight.
        e.y += Math.sin(e.phase * 1.6) * 0.012
      } else {
        e.x += Math.sign(dx || e.dir) * speed * R().enemies.speedMul * dtSec
      }
      continue
    }

    // In contact.
    e.targetUid = target.uid

    // Standoff siege: parks at `standoff` cells and lobs. Its shot splashes,
    // and crucially NOTHING in the tower reaches a trebuchet at 20 cells — the
    // only answer is to ride out and kill it.
    if (def.siege?.standoff) {
      e.cd -= dt
      if (e.cd <= 0) {
        e.cd = def.attackCooldownMs
        const splash = def.siege.splash ?? 0
        // A LOBBED engine throws a round that has to travel; everything else
        // still resolves where it stands. The distinction is per-engine on
        // purpose — a ballista's bolt is direct fire and has no arc to draw.
        if (def.siege.lobbed) {
          lobSiegeStone(e, def, target)
        } else if (def.siege.direct) {
          shootSiegeBolt(e, def, target)
        } else if (splash > 0) {
          pushFx({ kind: 'explosion', x: centreX(target), y: centreY(target), radius: splash })
          damageBlocksInRadius(centreX(target), centreY(target), splash, def.damage)
        } else {
          damageBlock(target, def.damage, e.y)
        }
        pushFx({
          kind: 'siegeShot',
          x: e.x, y: e.y,
          tx: centreX(target), ty: centreY(target)
        })
      }
      continue
    }

    if (def.suicide) {
      pushFx({ kind: 'explosion', x: e.x, y: e.y, radius: def.suicide.radius })
      // Bombers hit EVERY block in the blast, which is what makes them the
      // answer to a wall of cheap wood — one of them opens a real hole.
      damageBlocksInRadius(e.x, e.y, def.suicide.radius, def.suicide.damage)
      killEnemy(e)
      continue
    }

    e.cd -= dt
    if (e.cd <= 0) {
      e.cd = def.attackCooldownMs
      damageBlock(target, def.damage, e.y)
      applyThorns(target, e)
      pushFx({
        kind: 'enemyAttack',
        x: e.x, y: e.y,
        tx: centreX(target), ty: centreY(target),
        ranged: def.reach > 2,
        gore: goreOf(e)
      })
    }
  }

  enemiesLeft.value = enemies.reduce((n, e) => n + (e.dying > 0 ? 0 : 1), 0)
    + Math.max(0, plan.orders.length - spawnCursor)
}

/**
 * Reflect a spiked wall's damage back at whatever just bit it.
 *
 * Deliberately NOT reduced by the attacker's armour: this is the wall, not a
 * weapon, so a Bulwark's frontal plating is irrelevant. Ranged attackers are
 * immune for the obvious reason — they never touched it.
 */
const applyThorns = (block: Block, attacker: Enemy): void => {
  const thorns = blockDef(block.typeId).utility?.thorns
  if (!thorns) return
  if (enemyDef(attacker.typeId).reach > 2) return
  damageEnemy(
    attacker,
    thorns * mThorns * upgradePowerMul(block.level) * mergeOutputMul(block) * (block.buffMul ?? 1),
    block.c
  )
  pushFx({ kind: 'thorns', x: attacker.x, y: attacker.y })
}

/**
 * Set blocks alight.
 *
 * Burn is deliberately additive in DURATION but not in rate: a second molotov
 * on the same block refreshes the timer and takes the higher tick rate rather
 * than stacking two fires, so a cluster of firebugs is dangerous without being
 * an instant delete.
 */
const igniteBlocksInRadius = (
  x: number, y: number, radius: number, burnMs: number, burnDps: number
): void => {
  const r2 = radius * radius
  for (const b of towerBlocks()) {
    if (distSqToBlock(b, x, y) > r2) continue
    b.burnMs = Math.max(b.burnMs ?? 0, burnMs)
    b.burnDps = Math.max(b.burnDps ?? 0, burnDps)
  }
}

/**
 * Tick every burning block.
 *
 * Damage is applied on a fixed 500 ms cadence rather than per frame: a burn
 * that chipped fractional HP sixty times a second would spam the hit FX into
 * mush and make the damage numbers unreadable.
 */
const BURN_TICK_MS = 500
let burnAccum = 0

const stepBurning = (dt: number): void => {
  burnAccum += dt
  const ticks = Math.floor(burnAccum / BURN_TICK_MS)
  if (ticks <= 0) {
    // Still run the clock down so a fire visibly expires between ticks.
    for (const b of towerBlocks()) {
      if (b.burnMs && b.burnMs > 0) b.burnMs = Math.max(0, b.burnMs - dt)
    }
    return
  }
  burnAccum -= ticks * BURN_TICK_MS

  // Snapshot: `damageBlock` can destroy blocks and trigger a collapse, which
  // mutates the map we would otherwise be iterating.
  const burning: Block[] = []
  for (const b of towerBlocks()) {
    if (b.burnMs && b.burnMs > 0) burning.push(b)
  }

  for (const b of burning) {
    if (!blocksByUid.has(b.uid)) continue
    const elapsed = Math.min(b.burnMs ?? 0, ticks * BURN_TICK_MS)
    b.burnMs = Math.max(0, (b.burnMs ?? 0) - ticks * BURN_TICK_MS)
    const dmg = (b.burnDps ?? 0) * (elapsed / 1000)
    if (dmg <= 0) continue
    damageBlock(b, dmg)
    if (b.burnMs <= 0) b.burnDps = 0
  }
}

/** `y` is both the centre of the blast and where it came from. */
const damageBlocksInRadius = (x: number, y: number, radius: number, amount: number): void => {
  const r2 = radius * radius
  // Snapshot first: `damageBlock` can mutate the map (destruction + collapse).
  const hits: Block[] = []
  for (const b of towerBlocks()) {
    if (distSqToBlock(b, x, y) <= r2) hits.push(b)
  }
  for (const b of hits) {
    if (!blocksByUid.has(b.uid)) continue // already destroyed by an earlier hit
    damageBlock(b, amount, y)
  }
}

// ─── Allies ─────────────────────────────────────────────────────────────────

/** Coin price of one sortie. */
export const cavalryCost = (): number => ALLY_DEFS.cavalry!.cost

/**
 * Send a squad of riders out of the Gate.
 *
 * They pick a side by threat: whichever side holds the most valuable standoff
 * engine, falling back to whichever side has more enemies. Riding out at the
 * wrong siege engine is a wasted 40 coins, and the player should not have to
 * micromanage that — the decision the game wants from them is *whether* to
 * spend, not which pixel to click.
 */
export const summonCavalry = (): boolean => {
  if (!R().abilities.cavalry) return false
  if (phase.value === 'defeat') return false

  // Score each side; standoff engines dominate because they are the reason
  // cavalry exists at all.
  let leftScore = 0
  let rightScore = 0
  for (const e of enemies) {
    if (e.dying > 0) continue
    const def = enemyDef(e.typeId)
    const weight = def.siege?.standoff ? 100 + def.siege.standoff * 5 : 1
    if (e.x < 0) leftScore += weight
    else rightScore += weight
  }
  const dir: 1 | -1 = rightScore >= leftScore ? 1 : -1

  const def = ALLY_DEFS.cavalry!
  const hp = Math.round(def.hp * mCavalry)
  for (let i = 0; i < CAVALRY_SQUAD; i++) {
    allies.push({
      uid: uidCounter++,
      typeId: def.id,
      // Fan out slightly so a squad reads as three riders, not one sprite.
      x: dir * (0.8 + i * 0.55),
      y: def.scale / 2,
      hp,
      maxHp: hp,
      dir,
      facing: dir,
      cd: 0,
      targetUid: -1,
      flash: 0,
      phase: Math.random() * 6.28,
      dying: 0,
      life: def.lifeMs
    })
  }
  allyCount.value = allies.length
  // A sortie is paid for in gold, which can put the offered gun out of reach.
  ensureAffordableWeapon()
  pushFx({ kind: 'cavalryOut', x: 0, y: 0.5, dir })
  return true
}

const stepAllies = (dt: number): void => {
  const dtSec = dt / 1000

  for (let i = allies.length - 1; i >= 0; i--) {
    const a = allies[i]!
    const def = allyDef(a.typeId)

    if (a.dying > 0) {
      a.dying -= dt
      if (a.dying <= 0) allies.splice(i, 1)
      continue
    }

    a.life -= dt
    if (a.life <= 0) {
      // The sortie is over; the riders withdraw rather than dying on the field.
      a.dying = 280
      pushFx({ kind: 'allyLeave', x: a.x, y: a.y })
      continue
    }

    if (a.flash > 0) a.flash = Math.max(0, a.flash - dt / 160)
    a.phase += dtSec * 5

    // Target the most valuable thing on their side: siege engines first, then
    // whatever is nearest.
    let target: Enemy | null = null
    let bestScore = -Infinity
    for (const e of enemies) {
      if (e.dying > 0) continue
      const ed = enemyDef(e.typeId)
      if (ed.movement === 'air') continue // horses cannot reach flyers
      if (ed.movement === 'sea') continue
      if (Math.sign(e.x) !== a.dir && Math.abs(e.x) > 1) continue
      const score = (ed.siege ? 1000 : 0) - Math.abs(e.x - a.x)
      if (score > bestScore) { bestScore = score; target = e }
    }

    if (!target) {
      // Nothing left on this flank — patrol outward rather than idling.
      a.targetUid = -1
      a.facing = a.dir
      a.x += a.dir * def.speed * 0.5 * dtSec
      continue
    }

    const dx = target.x - a.x
    // Point at whatever it is going for, not at the flank it was sent to.
    // These disagree the moment something gets past the rider: the chase is
    // then back toward the tower, and facing by `dir` gallops it tail-first.
    // The dead band keeps a rider that is level with its target from
    // flickering between the two on the sign of a rounding error.
    if (Math.abs(dx) > 0.05) a.facing = dx > 0 ? 1 : -1
    if (Math.abs(dx) - 0.5 > def.reach) {
      a.targetUid = -1
      a.x += Math.sign(dx) * def.speed * dtSec
      continue
    }

    a.targetUid = target.uid
    a.cd -= dt
    if (a.cd <= 0) {
      a.cd = def.attackCooldownMs
      damageEnemy(target, def.damage * mCavalry, a.x)
      pushFx({ kind: 'allyStrike', x: a.x, y: a.y, tx: target.x, ty: target.y })
    }
  }

  allyCount.value = allies.reduce((n, a) => n + (a.dying > 0 ? 0 : 1), 0)
}

/** Enemies fight back: any melee enemy in contact with a rider hits it. */
const stepAllyCombat = (dt: number): void => {
  if (allies.length === 0) return
  for (const e of enemies) {
    if (e.dying > 0) continue
    const def = enemyDef(e.typeId)
    if (def.movement !== 'ground') continue
    for (const a of allies) {
      if (a.dying > 0) continue
      if (Math.abs(a.x - e.x) > 0.9) continue
      // Reuse the enemy's own attack clock so a unit cannot hit the tower and
      // a rider in the same beat.
      e.cd -= dt * 0.5
      if (e.cd <= 0) {
        e.cd = def.attackCooldownMs
        a.hp -= def.damage
        a.flash = 1
        if (a.hp <= 0) {
          a.dying = 280
          pushFx({ kind: 'allyDown', x: a.x, y: a.y })
        }
      }
      break
    }
  }
}

// ─── Turrets ────────────────────────────────────────────────────────────────

/**
 * How far a shot has to travel to count as "in range".
 *
 * For a PLUNGING weapon (see `WeaponSpec.plunging`) height below the muzzle is
 * free: a round that falls reaches at least as far downhill as it does flat, so
 * only the horizontal gap is charged against the range. Above the muzzle — a
 * flyer higher than the mount — the honest radius still applies, because
 * nothing here lobs upward for free.
 *
 * Returned SQUARED, so the caller compares against `range * range` without a
 * root, and so the targeting modes can keep scoring off the same number.
 */
const reachSq = (dx: number, dy: number, plunging: boolean): number =>
  (plunging && dy <= 0 ? dx * dx : dx * dx + dy * dy)

const pickTarget = (
  b: Block, range: number, hitsAir: boolean, mode: string, kind?: ProjectileKind,
  hitsSubmerged = false, plunging = false
): Enemy | null => {
  const bx = centreX(b)
  const by = centreY(b)
  const r2 = range * range
  let best: Enemy | null = null
  let bestScore = -Infinity

  for (const e of enemies) {
    if (e.dying > 0) continue
    const def = enemyDef(e.typeId)
    if (!hitsAir && def.movement === 'air') continue
    // Never lock onto something this weapon cannot hurt. Without this an
    // Archery block would happily empty its quiver into an ironclad ram while
    // the rest of the wave walked past it.
    // Only an ABSOLUTE resist is worth retargeting away from. A round that
    // still lands for a quarter is a bad trade, not a wasted shot, and a turret
    // that refuses to take it leaves the player watching an idle tower.
    if (kind && isImmuneTo(def.id, kind)) continue
    // A submerged sea creature is under the water and cannot be shot. It only
    // becomes a target once it has broken the surface to strike.
    // Submerged sea creatures are under the water and cannot be shot — unless
    // the weapon is standing ON the water, which is the harbour's whole point.
    if (def.movement === 'sea' && (e.surfaced ?? 0) < 0.35 && !hitsSubmerged) continue
    const dx = e.x - bx
    const dy = e.y - by
    const d2 = reachSq(dx, dy, plunging)
    if (d2 > r2) continue

    let score: number
    if (mode === 'strongest') score = e.maxHp - Math.sqrt(d2) * 0.01
    else if (mode === 'lowest-hp') score = -e.hp
    else score = -d2 // nearest
    if (score > bestScore) { bestScore = score; best = e }
  }
  return best
}

const stepTurrets = (dt: number): void => {
  for (const b of towerBlocks()) {
    if (b.flash > 0) b.flash = Math.max(0, b.flash - dt / 160)
    if (b.recoil > 0) b.recoil = Math.max(0, b.recoil - dt / 120)

    const def = blockDef(b.typeId)
    const w = def.weapon
    if (!w) continue

    if (b.cd > 0) {
      b.cd -= dt
      continue
    }

    const range = w.range * mRange
    const target = pickTarget(
      b, range, w.hitsAir, w.targeting, w.projectile, w.hitsSubmerged === true,
      w.plunging === true
    )
    if (!target) continue

    const bx = centreX(b)
    const by = centreY(b)
    b.aim = Math.atan2(target.y - by, target.x - bx)
    b.cd = w.cooldownMs / mFireRate
    b.recoil = 1
    const damage = w.damage
      * (def.waterOnly ? mNavalDamage : mDamage)
      * (b.enhanced ? ENHANCED_DAMAGE_MUL : 1)
      * upgradePowerMul(b.level)
      * mergeOutputMul(b)
      * (b.buffMul ?? 1)

    if (w.projectile === 'zap') {
      fireLightning(b, target, damage, (w.chain ?? 0) + mChain, range)
    } else if (w.projectile === 'shell') {
      fireShell(b, target, damage, (w.splash ?? 0) * mSplash)
    } else {
      fireDirect(b, target, w.projectile, w.speed, damage,
        (w.splash ?? 0) * mSplash, w.slowPct ?? 0, w.slowMs ?? 0)
    }

    pushFx({ kind: 'muzzle', x: bx, y: by, angle: b.aim, palette: def.palette, weapon: b.typeId })
  }
}

const fireDirect = (
  b: Block, target: Enemy, kind: Projectile['kind'], speed: number,
  damage: number, splash: number, slowPct: number, slowMs: number
): void => {
  const bx = centreX(b)
  const by = centreY(b)
  // Lead the target by its travel over the projectile's flight time, so fast
  // runners aren't systematically missed by slow cannonballs.
  const flight = Math.hypot(target.x - bx, target.y - by) / speed
  const def = enemyDef(target.typeId)
  const leadX = target.x + def.speed * (1 - target.slowPct) * target.dir * flight * 0.6
  const ang = Math.atan2(target.y - by, leadX - bx)

  const shot = acquireProjectile()
  shot.uid = uidCounter++
  shot.kind = kind
  shot.x = bx + Math.cos(ang) * 0.45
  shot.y = by + Math.sin(ang) * 0.45
  shot.vx = Math.cos(ang) * speed
  shot.vy = Math.sin(ang) * speed
  shot.damage = damage
  shot.splash = splash
  shot.ballistic = false
  shot.targetUid = target.uid
  shot.life = 4000
  shot.slowPct = slowPct
  shot.slowMs = slowMs
  shot.sourceUid = b.uid
  projectiles.push(shot)
}

/**
 * Mortar: solve the ballistic arc that lands on the target's position.
 *
 * We fix the flight TIME rather than the muzzle speed — picking a time that
 * scales with distance gives a consistently readable, lazy arc at every range,
 * whereas a fixed speed produces a flat line up close and a silly lob far away.
 */
const fireShell = (b: Block, target: Enemy, damage: number, splash: number): void => {
  const bx = centreX(b)
  const by = centreY(b)
  const dx = target.x - bx
  const dy = target.y - by
  const flight = Math.max(0.75, Math.min(2.2, Math.abs(dx) / 7 + 0.7))
  const vx = dx / flight
  const vy = dy / flight + 0.5 * GRAVITY * flight

  const shell = acquireProjectile()
  shell.uid = uidCounter++
  shell.kind = 'shell'
  shell.x = bx
  shell.y = by
  shell.vx = vx
  shell.vy = vy
  shell.damage = damage
  shell.splash = splash
  shell.ballistic = true
  shell.targetUid = -1
  shell.life = flight * 1000 + 400
  shell.slowPct = 0
  shell.slowMs = 0
  shell.sourceUid = b.uid
  projectiles.push(shell)
}

/**
 * Tesla: hitscan with forking. Damage lands the same frame; the renderer draws
 * the polyline from the `lightning` FX payload. Each fork jumps to the nearest
 * not-yet-struck enemy within a shrinking radius and deals 70 % of the previous
 * link's damage.
 */
const fireLightning = (b: Block, first: Enemy, damage: number, forks: number, range: number): void => {
  const points: number[] = [centreX(b), centreY(b)]
  let current: Enemy | null = first
  let dmg = damage
  const struck = new Set<number>()

  for (let i = 0; i <= forks && current; i++) {
    points.push(current.x, current.y)
    struck.add(current.uid)
    damageEnemy(current, dmg, centreX(b))
    dmg *= 0.7

    const from = current
    let next: Enemy | null = null
    let bestD2 = (range * 0.55) * (range * 0.55)
    for (const e of enemies) {
      if (e.dying > 0 || struck.has(e.uid)) continue
      const dx = e.x - from.x
      const dy = e.y - from.y
      const d2 = dx * dx + dy * dy
      if (d2 < bestD2) { bestD2 = d2; next = e }
    }
    current = next
  }

  pushFx({ kind: 'lightning', x: centreX(b), y: centreY(b), points })
}

const stepProjectiles = (dt: number): void => {
  const dtSec = dt / 1000

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i]!
    p.life -= dt
    if (p.life <= 0) { dropProjectile(i); continue }

    if (p.ballistic) p.vy -= GRAVITY * dtSec

    p.x += p.vx * dtSec
    p.y += p.vy * dtSec

    // Ring buffer of trail samples, capped so a long-lived shell can't grow
    // an unbounded array in the hot path.
    p.trail.push(p.x, p.y)
    if (p.trail.length > 16) p.trail.splice(0, p.trail.length - 16)

    let detonate = false

    if (p.hostile) {
      // Dropped ordnance detonates on the first block it touches, or on the
      // ground if the player's tower has a hole in it. Checking the cell it is
      // passing through — rather than a radius sweep — keeps a bomb from
      // punching through the crown and exploding inside the tower.
      const cell = blockAt(Math.round(p.x), Math.floor(p.y))
      if (cell || p.y <= 0.3) detonate = true
    } else if (p.ballistic) {
      // Shells detonate on the ground, which is why they cannot touch flyers.
      if (p.y <= 0.25) detonate = true
    } else {
      const target = liveEnemy(p.targetUid)
      if (target) {
        const dx = target.x - p.x
        const dy = target.y - p.y
        if (dx * dx + dy * dy < 0.2) detonate = true
        // Re-home slightly so a projectile can't orbit a strafing target.
        const len = Math.hypot(p.vx, p.vy) || 1
        const ang = Math.atan2(dy, dx)
        p.vx += (Math.cos(ang) * len - p.vx) * Math.min(1, dtSec * 6)
        p.vy += (Math.sin(ang) * len - p.vy) * Math.min(1, dtSec * 6)
      } else if (p.y <= 0.15 || Math.abs(p.x) > 60) {
        // Target died mid-flight — the round still lands and can still splash.
        detonate = true
      }
    }

    if (!detonate) continue

    if (p.hostile) {
      // Enemy ordnance hurts the TOWER, never the wave that dropped it.
      const fire = p.kind === 'fire'
      pushFx({
        kind: fire ? 'firebomb' : 'explosion',
        x: p.x, y: p.y, radius: Math.max(0.6, p.splash), kindOf: p.kind
      })
      damageBlocksInRadius(p.x, p.y, Math.max(0.5, p.splash), p.damage)
      if (p.burnMs && p.burnDps) {
        igniteBlocksInRadius(p.x, p.y, Math.max(0.5, p.splash), p.burnMs, p.burnDps)
      }
      dropProjectile(i)
      continue
    }

    if (p.splash > 0) {
      pushFx({ kind: 'explosion', x: p.x, y: p.y, radius: p.splash, kindOf: p.kind })
      damageEnemiesInRadius(p.x, p.y, p.splash, p.damage, p.kind)
    } else {
      const target = liveEnemy(p.targetUid)
      if (target) damageEnemy(target, p.damage, p.x, p.kind)
      pushFx({
        kind: 'impact', x: p.x, y: p.y, kindOf: p.kind,
        // Debris throws along the round's own line of travel; a radial puff
        // reads as a decal stamped on the scene rather than as a hit.
        angle: Math.atan2(p.vy, p.vx)
      })
    }

    if (p.slowPct > 0) {
      const r = Math.max(p.splash, 0.6)
      for (const e of enemies) {
        if (e.dying > 0) continue
        if (Math.hypot(e.x - p.x, e.y - p.y) > r) continue
        e.slowPct = Math.max(e.slowPct, p.slowPct)
        e.slowMs = Math.max(e.slowMs, p.slowMs)
      }
    }

    dropProjectile(i)
  }
}

/**
 * Advance falling rubble, and settle whatever has landed.
 *
 * Orphaned blocks are NOT deleted: they fall until something stops them, take
 * damage in proportion to how far they fell, and rejoin the tower if they
 * survive. That turns a collapse from a pure loss into a consequence the player
 * can build around — a tall spire that loses its stem drops onto the mass below
 * and dents it, and a short one barely notices.
 *
 * `FALL_KILL_CELLS` is the whole scale: falling that far destroys a block
 * outright, and anything less costs a proportional slice of its max HP.
 */
const stepDebris = (dt: number): void => {
  const dtSec = dt / 1000

  // Settle from the BOTTOM up. A stack falling down one column has to land in
  // order, or the upper block resolves against a cell its neighbour has not
  // taken yet and the two end up inside each other.
  debris.sort((a, b) => (a.r + a.falling!.dy) - (b.r + b.falling!.dy))

  let landed = 0
  for (let i = 0; i < debris.length; i++) {
    const b = debris[i]!
    const f = b.falling!
    f.vy -= GRAVITY * dtSec
    f.dy += f.vy * dtSec
    f.rot += f.vrot * dtSec

    const fromRow = f.fromRow ?? b.r
    const landRow = landingRowFor(b.c, fromRow, spanW(b))
    const currentRow = b.r + f.dy
    if (currentRow > landRow) continue

    // ── Landed ──
    const fallCells = Math.max(0, fromRow - landRow)
    // A gentle fall — a drop, or a column settling — costs nothing on landing.
    const impact = f.gentle ? 0 : Math.min(1, fallCells / fallKillCells())

    crushEnemiesAt(centreX(b), landRow + spanH(b) / 2, impact)
    triggerImpactFx(b, landRow, impact)

    debris.splice(i, 1)
    i--

    const blocked = Array.from(
      { length: spanW(b) }, (_, dx) => blocks.has(key(b.c + dx, landRow))
    ).some(Boolean)
    if (impact >= 1 || blocked) {
      // Destroyed by the fall, or a cell was taken while it was in the air.
      pushFx({
        kind: 'shatter',
        x: centreX(b), y: landRow + spanH(b) / 2,
        palette: blockDef(b.typeId).palette
      })
      continue
    }

    // Survived — put it back in the tower at the row it came to rest on.
    const gentle = f.gentle === true
    b.r = landRow
    b.hp = Math.max(1, b.hp - b.maxHp * impact)
    b.flash = gentle ? 0 : 1
    b.falling = undefined
    occupy(b)
    blocksByUid.set(b.uid, b)
    // A landing merge fuses the piece down into the twin it came to rest on.
    if (gentle && R().merge === 'landing') mergeOnLanding(b)
    landed++
  }

  if (landed > 0 && R().support === 'column') {
    // What just came to rest may now hold up — or drop — its neighbours, and a
    // dropped piece is only in the tower once it has landed, so this is the
    // first moment a snapshot can carry it.
    settleColumns()
    syncTowerStats()
    if (phase.value === 'build') saveRunSnapshot()
    return
  }

  if (debris.length === 0) return
  // A landed block can support — or orphan — others, so the graph is re-checked
  // once per tick rather than once per landing.
  syncTowerStats()
}

/**
 * Resolve what a landing block does to whatever is standing under it.
 *
 * A falling wall is lethal. Anything short of a boss caught beneath it dies
 * outright, regardless of HP — a block dropping on you is not a damage roll,
 * and the tower losing that block is already the price. It turns a collapse
 * from a pure loss into a trade the player can aim: undermine your own overhang
 * over a packed lane and it pays for itself.
 *
 * A boss is too big to squash. It takes a share of its MAX hp — percentage, so
 * the mechanic stays relevant against a health pool that grows every ten waves —
 * and is SHOVED CLEAR of the tower rather than pinned. Killing a boss with
 * falling masonry would trivialise the one fight the run is built around;
 * knocking it back buys the player the seconds they actually needed, and it
 * walks straight back in.
 */
const crushEnemiesAt = (x: number, y: number, impact: number): void => {
  const r2 = CRUSH_RADIUS * CRUSH_RADIUS
  // Snapshot: `killEnemy` mutates kill tallies and FX, and `damageEnemy` can
  // remove an enemy outright.
  const caught: Enemy[] = []
  for (const e of enemies) {
    if (e.dying > 0) continue
    const dx = e.x - x
    const dy = e.y - y
    if (dx * dx + dy * dy > r2) continue
    caught.push(e)
  }

  for (const e of caught) {
    if (e.dying > 0) continue
    const def = enemyDef(e.typeId)

    if (!def.boss) {
      pushFx({ kind: 'crush', x: e.x, y: e.y, palette: def.palette, boss: false })
      killEnemy(e)
      continue
    }

    // Away from the tower's centre column, so the shove always opens ground
    // between the boss and the Gate. A boss standing exactly on the centre is
    // pushed back the way it came.
    const away: 1 | -1 = e.x > 0 ? 1 : e.x < 0 ? -1 : (-e.dir as 1 | -1)
    e.knockback = away * BOSS_KNOCKBACK_CELLS
    e.targetUid = -1
    pushFx({ kind: 'crush', x: e.x, y: e.y, palette: def.palette, boss: true })
    damageEnemy(e, e.maxHp * BOSS_CRUSH_PCT * (0.45 + 0.55 * impact), x)
  }
}

/** Dust and a thump proportional to how hard the block hit. */
const triggerImpactFx = (b: Block, landRow: number, impact: number): void => {
  pushFx({
    kind: 'blockLand',
    x: centreX(b),
    y: landRow + spanH(b) / 2,
    impact,
    palette: blockDef(b.typeId).palette
  })
}

// ─── Wave lifecycle ─────────────────────────────────────────────────────────

const cacheTechMultipliers = (): void => {
  mDamage = damageMul.value
  mFireRate = fireRateMul.value
  // Folded, not replaced: a mid-run tech purchase recaches every multiplier,
  // and reading the bare tech value here would silently cancel a spotter buff
  // the player just paid for.
  mRange = effectiveRangeMul.value
  mSplash = splashMul.value
  mChain = chainBonus.value
  mArmor = armorBonus.value
  mCoinDrop = coinDropMul.value
  mThorns = thornsMul.value
  mCavalry = cavalryMul.value
  mNavalDamage = navalDamageMul.value
  mMergeDamage = mergeDamageMul.value
  mBuffPower = buffPowerMul.value
  mEconomy = economyMul.value
  // Both of these are tech-driven, so a purchase mid-run leaves the tower out
  // of date until something else happens to touch it. Buying Fusion with a pair
  // of cannons already standing should fuse them, not wait for the next
  // placement — and buff strength changes every aura it produced.
  settleMerges()
  refreshBuffs()
}

/**
 * Is this player still in their very first session?
 *
 * `ts_onboarded` is written once the player has reached wave 2 — the point at
 * which they have seen everything the opening teaches. Until then the scripted
 * opening is on: a free starter fort (`seedScriptedOpening`) and a softened
 * first two waves (`firstRunBudgetScale`).
 *
 * Read live from the state blob rather than cached, so a cloud hydrate landing
 * mid-boot cannot hand a veteran on a second device the beginner's opening.
 */
export const isFirstSession = (): boolean =>
  getState<boolean>(R().save.onboardedKey, false) !== true

/** Start the next wave immediately. Called by the Call Wave button and by the
 *  build timer running out. */
export const callWave = (): void => {
  if (phase.value !== 'build') return
  cacheTechMultipliers()

  const next = wave.value + 1
  // Price the wave against what is actually standing, then apply the streak
  // penalty for coasting. Both are folded into the single `difficulty` scalar
  // the director already understands, so composition rules are untouched.
  // Measured minus whatever was HEALED since the last wave — see
  // `repairedSinceMeasure`. Everything the player BUILT still counts.
  const strength = measureTower()
  strength.hp = Math.max(0, strength.hp - repairedSinceMeasure)
  repairedSinceMeasure = 0
  const adaptive = adaptiveFactor(next, towerPower(strength), R().waves.expectedPowerMul)
  // Clamped as a PAIR. Bounding the adaptive term alone let the two multiply
  // out to 5.72 — see `clampDifficulty`.
  const dynamic = clampDifficulty(adaptive * flawless.multiplier)
  // Applied OUTSIDE `clampDifficulty`, deliberately. The clamp exists so a wave
  // stays recognisable from its number against terms the player cannot directly
  // see; the hoard surcharge is the opposite — it is announced on the HUD and
  // the player can clear it at any time by spending. Folding it inside the
  // clamp would let a tower already at the 2.6 ceiling hoard for free, which is
  // precisely the player it is meant to reach.
  const hoard = hoardFactor(...hoardArgs())
  const mul = difficultyFactor() * dynamic * hoard
  difficultyMul.value = Math.round(mul * 100) / 100
  // Toughness takes a SOFTENED share of the dynamic terms, not the whole of
  // them. `adaptive` and the flawless streak already multiply the wave's head
  // count; feeding them into per-enemy HP at full strength multiplies the same
  // response twice, and the curve goes vertical the moment a player has a good
  // run — which is exactly the player it should be rewarding.
  // The hoard term rides at FULL strength here while the adaptive terms are
  // softened, because "tougher monsters" is what the surcharge is for: a player
  // sitting on a war chest has the resources to answer more enemies, so head
  // count alone is a tax they can pay without changing anything.
  waveHpMul = difficultyFactor() * Math.pow(dynamic, 0.45) * hoard
  lostBlockThisWave = false
  reliefGiven = false
  // The first session's opening waves are priced under the curve. Threaded as
  // its own flag rather than folded into `mul`, so the discount never reaches
  // the spawn cadence or the difficulty read-out on the HUD.
  plan = planWave(next, mul, isFirstSession(), waveOpts())
  waveVersion.value++
  spawnCursor = 0
  waveClock = 0
  wave.value = next
  enemiesTotal.value = plan.total
  enemiesLeft.value = plan.total
  // The unused build time becomes a coin bonus, so an early call is a real
  // decision rather than a dead button.
  pendingBonus = earlyCallBonus(buildTimeLeft.value)
  phase.value = 'battle'
  lastWaveReward.value = null
  pushFx({ kind: 'waveStart', x: 0, y: 0, wave: next, boss: plan.boss })
}

let pendingBonus = 1

/** Has the build phase already floored the purse? See `ensureAffordableWeapon`. */
let reliefGiven = false

/**
 * Hit points restored between waves by repair effects, since the last measure.
 *
 * `measureTower` reads CURRENT hp, and the difficulty director reads
 * `measureTower` at `callWave` — which runs after `completeWave` has already
 * applied the forge and the tech heal. So repairing raised the difficulty of
 * the very wave it was meant to help you survive, and going into a build phase
 * damaged was a discount. Subtracting the healed amount at measure time leaves
 * BUILDING counted — which is the feedback loop the exponent is designed
 * around — while taking healing back out of it.
 */
let repairedSinceMeasure = 0

/**
 * This wave's ENEMY-TOUGHNESS scalar.
 *
 * Deliberately not the same number the wave director uses for composition —
 * see the derivation in `callWave`.
 */
let waveHpMul = 1

/** Put one enemy of `typeId` on the field, entering from `side`. */
const spawnEnemy = (typeId: string, side: 1 | -1): void => {
  const def = enemyDef(typeId)
  const bounds = towerBounds()
  // Enemies walk ON from off-screen. Materialising one inside the frame reads
  // as a spawn cheat rather than as an army arriving, and it robs the player of
  // the beat where they see what is coming and still have time to answer it.
  //
  // The tower-relative margin is the FLOOR, not the answer: zoomed in close,
  // six cells is already off-screen; zoomed out, it is in plain view.
  const nearL = bounds.minC - SPAWN_MARGIN
  const nearR = bounds.maxC + SPAWN_MARGIN
  // With no camera reporting in — headless tests, the first frame — the
  // tower-relative margin IS the answer, unchanged from before.
  const offL = viewLeft === undefined ? nearL : viewLeft - SPAWN_OFFSCREEN
  const offR = viewRight === undefined ? nearR : viewRight + SPAWN_OFFSCREEN
  const edge = side === 1
    ? Math.max(bounds.minC - SPAWN_MAX_REACH, Math.min(nearL, offL))
    : Math.min(bounds.maxC + SPAWN_MAX_REACH, Math.max(nearR, offR))
  // The FULL wave scalar, not just the user's difficulty setting. This line
  // used to read `difficultyFactor()` alone, which meant the adaptive
  // difficulty — the whole system that measures the player's tower and prices
  // the wave against it — moved enemy COUNTS and never enemy toughness.
  const hp = Math.max(1, Math.round(def.hp * waveHpMul * enemyHpScale(wave.value, R().waves.hpSlope)))
  // Bombers enter already at cruising height rather than climbing from the
  // dive lane — a bomber that spawned low would take its first pass THROUGH
  // the anti-air it exists to fly over.
  // A mode may pin the bombers' station: a board with a low ceiling has no sky
  // for the desktop's three-plus cells above the crown.
  const altitude = R().enemies.bomberAltitude ?? def.bombRun?.altitude ?? 0
  // Divers may enter from the TOP of the frame instead of the flanks — on the
  // portrait board the sky above the tower is the air lane.
  const fromTop = R().enemies.airSpawn === 'top' && def.movement === 'air' && !def.bombRun
  const spawnY = def.bombRun
    ? crownRow() + 1 + altitude
    : fromTop
      ? Math.min(R().board.maxRow, 40) + 3.5
      : def.movement === 'air'
        ? 2.4 + Math.random() * 2.2
        : def.movement === 'sea'
          ? SEA_SWIM_Y
          : def.scale / 2
  const spawnUid = uidCounter++
  const enemy: Enemy = {
    uid: spawnUid,
    typeId: def.id,
    x: fromTop ? side * (0.4 + Math.random() * 1.4) : edge,
    y: spawnY,
    hp,
    maxHp: hp,
    // A diver entering from above on the right half of the board faces LEFT,
    // toward the tower — `dir` is which way it is heading, not where it began.
    dir: fromTop ? (-side as 1 | -1) : side,
    cd: 0,
    targetUid: -1,
    slowMs: 0,
    slowPct: 0,
    flash: 0,
    phase: Math.random() * 6.28,
    dying: 0,
    surfaced: def.movement === 'sea' ? 0 : undefined
  }
  enemies.push(enemy)
  enemiesByUid.set(spawnUid, enemy)
}

const stepSpawns = (dt: number): void => {
  waveClock += dt
  // Past the flush point the remaining queue is released at once. A wave that
  // is still trickling in after a minute and a half has stopped asking the
  // player anything — they have made every decision it has, and are watching a
  // queue drain. Better to hand them the rest and let the fight end.
  const flush = waveClock >= R().waves.flushAtMs
  // A mode may cap what is on the field at once; the rest wait in the queue.
  // The flush respects the cap too — releasing everything onto a five-column
  // board at once is the exact pile-up the cap exists to prevent.
  const cap = R().enemies.maxOnField
  let live = cap === Infinity ? 0 : enemies.reduce((n, e) => n + (e.dying > 0 ? 0 : 1), 0)
  while (spawnCursor < plan.orders.length
    && live < cap
    && (flush || plan.orders[spawnCursor]!.atMs <= waveClock)) {
    const order = plan.orders[spawnCursor]!
    spawnCursor++
    spawnEnemy(order.typeId, order.side)
    live++
  }
}

/**
 * Put arbitrary enemies on the field, for development and review only.
 *
 * Reaching wave 24 by hand to look at one siege engine is not a reasonable ask,
 * and the alternative — poking `getEnemies()` from the console — silently fails
 * during development, because an HMR-versioned dynamic import hands back a
 * second, inert copy of this singleton. Going through an exported function on
 * the live module is the only way that reliably works.
 */
export const debugSpawn = (typeIds: string[]): void => {
  let side: 1 | -1 = 1
  for (const id of typeIds) {
    spawnEnemy(id, side)
    side = side === 1 ? -1 : 1
  }
  enemiesLeft.value = enemies.reduce((n, e) => n + (e.dying > 0 ? 0 : 1), 0)
}

/**
 * Jump the siege to wave `n` and hand the player a build phase to meet it in.
 *
 * DEV ONLY. Reaching wave 22 by hand to look at a trebuchet — or to check that
 * a boss wave still composes — is not a reasonable ask of anyone testing this,
 * and it is the reason the difficulty curve past wave 15 was historically the
 * least-exercised code in the project.
 *
 * What it does NOT do is fake a tower. `wave` is the only thing that moves: the
 * blocks, the purse and the tech are left exactly as they are, so what the
 * jump produces is an honest "wave 20 arrives against THIS defence" rather than
 * a simulated twenty waves of play. Pair it with the resource cheat to build
 * something worth testing against first.
 *
 * The field is cleared on the way through. Jumping mid-battle would otherwise
 * leave the old wave's horde walking into a director that has moved on without
 * them, and their kill drops would pay out against the new wave's economy.
 */
export const debugSetWave = (n: number): void => {
  const target = Math.max(1, Math.floor(n))

  enemies.length = 0
  enemiesByUid.clear()
  projectiles.length = 0
  debris.length = 0
  allies.length = 0
  allyCount.value = 0
  unreachableSiege.value = 0
  clearRangeBuff()
  enemiesLeft.value = 0
  enemiesTotal.value = 0
  spawnCursor = 0
  waveClock = 0
  plan = { wave: 0, orders: [], total: 0, boss: false }

  // `wave` holds the wave already SURVIVED, so the next call raises it to the
  // target — which is what makes the HUD, the incoming-threat warnings and the
  // boss banner all agree about what is about to arrive.
  wave.value = target - 1
  waveVersion.value++

  // A jump is not a clear: no reward, no flawless credit, and the streak is
  // reset rather than carried, because a run that teleported past twelve waves
  // has not earned whatever multiplier it was sitting on.
  flawless.reset()
  flawlessProgress.value = 0
  lostBlockThisWave = false
  repairedSinceMeasure = 0
  lastWaveReward.value = null
  pendingBonus = 1

  phase.value = 'build'
  buildTimeLeft.value = R().waves.buildMs
  buildDeadline = buildTimeLeft.value
  // The deck is wave-gated, so a jump has to re-deal or the player meets wave
  // 20 holding wave 1's hand.
  dealOffers()
  rerollTimers.fill(0)
  rerollReadyIn.value = new Array(R().offers.slots).fill(0)
  syncTowerStats()
  syncGateRefs()
  saveRunSnapshot()
}

const completeWave = (): void => {
  const base = waveReward(wave.value)
  const mul = waveRewardMul.value * pendingBonus
  // Materials scale with the mode; coins never do — the wallet is shared.
  const matMul = mul * R().waves.rewardMul

  let coins = Math.round(base.coins * mul)
  let gainedWood = Math.round(base.wood * matMul)
  let gainedStone = Math.round(base.stone * matMul)
  /** Run gold minted by coffers. Kill drops are added as they happen. */
  let gainedGold = 0

  // Economy blocks pay out, and repair blocks patch their neighbours. Both
  // happen at the wave boundary so their value is legible: you SEE the numbers
  // move the moment the field clears.
  for (const b of towerBlocks()) {
    const def = blockDef(b.typeId)
    // An upgraded producer produces more — the inspector advertises the raised
    // figure, so the payout has to match it.
    const power = upgradePowerMul(b.level) * mergeOutputMul(b)
    if (def.economy) {
      // `mEconomy` is the support tree's yield node. Buff auras are NOT applied
      // here: a banner raises hit points, damage and armour, and letting it
      // also print resources would make the buff block the answer to every
      // question instead of a combat decision.
      const yieldMul = power * mEconomy
      gainedWood += Math.round((def.economy.wood ?? 0) * yieldMul)
      gainedStone += Math.round((def.economy.stone ?? 0) * yieldMul)
      coins += Math.round((def.economy.coins ?? 0) * yieldMul)
      // RUN gold — the currency block ranks are bought with, and until the
      // coffer existed the only source of it was a kill drop.
      gainedGold += Math.round((def.economy.gold ?? 0) * yieldMul)
    }
    const repair = Math.round((def.utility?.repairPerWave ?? 0) * power)
    if (repair) {
      // Every distinct neighbour of the whole footprint, each healed once —
      // a wide forge touches more of the tower, but never heals the same
      // block twice for being adjacent along two cells.
      const healed = new Set<number>()
      for (const [c, r] of cellsOf(b)) {
        for (const n of [blockAt(c - 1, r), blockAt(c + 1, r), blockAt(c, r - 1), blockAt(c, r + 1)]) {
          if (!n || n === b || healed.has(n.uid)) continue
          healed.add(n.uid)
          const before = n.hp
          n.hp = Math.min(n.maxHp, n.hp + repair)
          repairedSinceMeasure += n.hp - before
        }
      }
    }
  }

  // Global between-wave repair from the tech tree, as a fraction of max HP.
  const globalRepair = waveRepairPct.value
  if (globalRepair > 0) {
    for (const b of towerBlocks()) {
      const before = b.hp
      b.hp = Math.min(b.maxHp, b.hp + b.maxHp * globalRepair)
      repairedSinceMeasure += b.hp - before
    }
  }

  // One wave of the three per wave cleared. Capped rather than allowed to run
  // over: this is an emergency button, not a resource to hoard.
  arrowRainStock.value = Math.min(ARROW_RAIN_WAVES, arrowRainStock.value + 1)

  // Spotters were bought for THIS wave's emergency and end with it. Carrying
  // them would turn one video into a permanent answer to the whole standoff
  // family, which is the tech tree's job.
  clearRangeBuff()
  unreachableSiege.value = 0

  // One materials pile where the mode folds stone into wood.
  const fold = R().blocks.foldStoneIntoWood
  if (fold !== null) {
    gainedWood += Math.round(gainedStone * fold)
    gainedStone = 0
  }

  runCoins.value += gainedGold
  runCoinsEarned.value += gainedGold
  wood.value += gainedWood
  stone.value += gainedStone
  wavesClearedThisRun++

  // Surviving a wave pays into the WALLET immediately, not into the run tally.
  //
  // Kill drops stay in `runCoins` and are banked at the end of the run (where
  // the 2× rewarded ad can double them), but the wave reward has to land now:
  // a player who clears four waves and then loses should not discover they
  // earned nothing. The coin badge ticking up mid-run is the feedback that
  // makes "survive one more wave" feel paid.
  if (coins > 0) {
    useTowerEconomy().addCoins(coins)
    pushFx({ kind: 'coinPayout', x: 0, y: 0, amount: coins })
  }

  flawless.recordWave(lostBlockThisWave)
  flawlessProgress.value = flawless.progress

  lastWaveReward.value = {
    wave: wave.value,
    coins,
    wood: gainedWood,
    stone: gainedStone,
    gold: gainedGold,
    bonusPct: Math.round((pendingBonus - 1) * 100),
    tally: { ...killsByType.value }
  }

  phase.value = 'build'
  buildTimeLeft.value = R().waves.buildMs
  buildDeadline = buildTimeLeft.value
  // Entering a build phase is the moment the guarantee matters most: whatever
  // the player does next, they must be able to put a gun on the tower.
  ensureAffordableWeapon()
  syncGateRefs()
  saveRunSnapshot()
  pushFx({ kind: 'waveClear', x: 0, y: 0, wave: wave.value })
}

const syncGateRefs = (): void => {
  const gate = blocksByUid.get(gateUid)
  gateHp.value = gate ? Math.max(0, gate.hp) : 0
  gateMaxHp.value = gate ? gate.maxHp : 1
}

/**
  * The tower as it stood at the START of the wave that killed it.
  *
  * `endRun` drops the resume snapshot from storage so the next boot does not
  * restore a run whose gate is already rubble — but that snapshot is exactly
  * what a continue needs, so it is kept in memory for the length of the defeat
  * screen and nowhere else. It deliberately does not survive a reload: a grace
  * chance is for the run you are looking at.
  */
let graceSnapshot: RunSnapshot | null = null
let graceUsed = false

/** Is a continue on the table? One per run, and only if there is a wave to go back to. */
export const graceAvailable = ref(false)

/**
 * Rebuild the tower as it was and re-enter the build phase for the wave that
 * killed it.
 *
 * Restores from the same snapshot the resume path uses, so it recovers the
 * exact layout, resources and wave — not an approximation of them.
 */
/**
 * Materials granted with a grace continue.
 *
 * Restoring the tower exactly as it stood is not, on its own, a continue: it
 * hands the player back the same wall that just failed, with the same empty
 * purse, against the same wave. The run ended because the defence was already
 * out-scaled, so without something to build WITH, the second attempt is the
 * first one replayed. A hundred of each is roughly two solid pieces plus a gun
 * — enough to answer the thing that broke through, not enough to skip a tier.
 */
export const CONTINUE_WOOD = 100
export const CONTINUE_STONE = 100

export const continueRun = (): boolean => {
  if (!graceSnapshot || graceUsed) return false
  setState(R().save.runKey, graceSnapshot)
  const ok = resumeRun()
  if (!ok) return false
  const grant = priceOf({ wood: CONTINUE_WOOD, stone: CONTINUE_STONE })
  wood.value += grant.wood
  stone.value += grant.stone
  // The purse just changed, so the hand may have become payable — and the very
  // next thing this player does is try to buy a gun with it.
  ensureAffordableWeapon()
  graceUsed = true
  graceAvailable.value = false
  graceSnapshot = null
  return true
}

const endRun = (): void => {
  phase.value = 'defeat'
  // Consolation floor. A run that ends on wave 1 with no kills would otherwise
  // pay literally nothing, which reads as the game being broken rather than as
  // a hard loss — and it is exactly the run a new player is most likely to have.
  const floor = 5 + wavesClearedThisRun * 4
  if (runCoins.value < floor) {
    runCoinsEarned.value += floor - runCoins.value
    runCoins.value = floor
  }
  // The run is over — drop the resume snapshot so the next boot starts fresh
  // rather than restoring a tower whose gate is already rubble. Hold it in
  // memory first, though: it is what a grace continue rebuilds from.
  graceSnapshot = getState<RunSnapshot | null>(R().save.runKey, null)
  graceAvailable.value = !graceUsed && !!graceSnapshot?.blocks?.length
  removeState(R().save.runKey)
  pushFx({ kind: 'gateFell', x: 0, y: 0 })
}

// ─── Persistence ────────────────────────────────────────────────────────────

/** Serialise the live siege into `ts_run`. Called at every build-phase entry
 *  (cheap: a few hundred 4-tuples) so a reload resumes the exact tower. */
export const saveRunSnapshot = (): void => {
  if (phase.value === 'defeat') return
  const snapshot: RunSnapshot = {
    wave: wave.value,
    wood: wood.value,
    stone: stone.value,
    runCoins: runCoins.value,
    kills: kills.value,
    killsByType: { ...killsByType.value },
    blocks: [...towerBlocks()].map(
      (b) => [
        b.c, b.r, b.typeId, Math.round(b.hp), b.roof ? 1 : 0, b.enhanced ? 1 : 0,
        b.level ?? 0, tierOf(b.tier), spanW(b), spanH(b)
      ] as [number, number, string, number, 0 | 1, 0 | 1, number, number, number, number]
    ),
    // Persisted so a reload can't be used to reroll a hand the player dislikes.
    offers: offers.value.slice(),
    // Same reason: without it, a reload is a free volley.
    arrowRain: arrowRainStock.value,
    rules: R().id,
    startedAt: Date.now()
  }
  setState(R().save.runKey, snapshot)
}

/**
 * A snapshot written under THESE rules.
 *
 * One from another mode — or a pre-seam save, which is a desktop one — is
 * never restored elsewhere: its board, pieces and keys mean different things.
 */
const snapshotFits = (snap: RunSnapshot | null): snap is RunSnapshot =>
  !!snap && Array.isArray(snap.blocks) && snap.blocks.length > 0
  && (snap.rules ?? 'desktop') === R().id

export const hasSavedRun = (): boolean =>
  snapshotFits(getState<RunSnapshot | null>(R().save.runKey, null))

// ─── Run lifecycle ──────────────────────────────────────────────────────────

const clearWorld = (): void => {
  blocks.clear()
  blocksByUid.clear()
  enemies.length = 0
  enemiesByUid.clear()
  projectiles.length = 0
  projectilePool.length = 0
  debris.length = 0
  allies.length = 0
  allyCount.value = 0
  spawnCursor = 0
  waveClock = 0
  plan = { wave: 0, orders: [], total: 0, boss: false }
  unreachableSiege.value = 0
  clearRangeBuff()
}

const spawnGate = (hp?: number, level = 0): void => {
  const gate = spawnBlock(GATE_ID, 0, 0, false, hp, false, level)
  gateUid = gate.uid
  syncGateRefs()
}

/** Begin a brand-new siege. */
export const startRun = (): void => {
  clock = 0
  accumulator = 0
  clearWorld()
  wave.value = 0
  const start = priceOf({ wood: startWood.value, stone: startStone.value })
  wood.value = start.wood
  stone.value = start.stone
  runCoins.value = 0
  runCoinsEarned.value = 0
  graceSnapshot = null
  graceUsed = false
  graceAvailable.value = false
  kills.value = 0
  killsByType.value = {}
  triggerRef(killsByType)
  blocksPlacedThisRun = 0
  wavesClearedThisRun = 0
  pendingBonus = 1
  // The streak penalty is earned within a run and dies with it — carrying a
  // trebled wave 1 into a fresh attempt would be indefensible.
  flawless.reset()
  flawlessProgress.value = 0
  difficultyMul.value = 1
  lostBlockThisWave = false
  lastWaveReward.value = null
  // A fresh siege starts with the volley in hand.
  arrowRainStock.value = ARROW_RAIN_WAVES
  cacheTechMultipliers()
  spawnGate()
  syncTowerStats()
  dealOffers()
  rerollTimers.fill(0)
  rerollReadyIn.value = new Array(R().offers.slots).fill(0)
  phase.value = 'build'
  buildTimeLeft.value = R().waves.buildMs
  buildDeadline = buildTimeLeft.value
  saveRunSnapshot()
}

/**
 * The scripted opening's free starter fort, as `[typeId, c, r]`.
 *
 * A wall either side of the Gate and a cannon on top of it: the smallest thing
 * that is recognisably a TOWER rather than a door on some grass. It shoots, it
 * has flanks, and it survives wave 1 untouched — which is the entire point.
 */
const OPENING_FORT: ReadonlyArray<readonly [string, number, number]> = [
  ['wood', -1, 0],
  ['wood', 1, 0],
  ['cannon', 0, 1]
]

/**
 * Seed the first-session scripted opening onto a fresh foundation.
 *
 * Wave 1 otherwise starts as an empty foundation under a fifteen-second timer,
 * facing a player who does not yet know that a cannon beats a crate. They are
 * asked to invent a tower before they have been shown one. So their first run
 * starts with one already standing — free — and their job is to EXTEND it,
 * which is a question they can answer.
 *
 * The blocks are spawned, not placed: they cost nothing, and they must not
 * count towards `blocksPlaced`, which feeds the daily missions and the lifetime
 * achievements. The player did not place them.
 *
 * Only legal on the lone Gate that `startRun` leaves behind — a resumed run
 * already has its fort in the snapshot, and handing it a second one would drop
 * blocks into cells the player has since built on. Returns false, changing
 * nothing, in that case.
 */
export const seedScriptedOpening = (): boolean => {
  if (blocksByUid.size !== 1 || !blocks.has(key(0, 0))) return false
  for (const [typeId, c, r] of OPENING_FORT) spawnBlock(typeId, c, r)
  syncTowerStats()
  saveRunSnapshot()
  return true
}

/** Restore the persisted siege. Returns false when there is nothing to resume,
 *  so the caller can fall back to `startRun()`. */
export const resumeRun = (): boolean => {
  const snap = getState<RunSnapshot | null>(R().save.runKey, null)
  if (!snapshotFits(snap)) return false

  clock = 0
  accumulator = 0
  clearWorld()
  cacheTechMultipliers()

  // A snapshot written before Arrow Rain existed has no charge on it; those
  // resume READY rather than empty, which is the forgiving direction and the
  // one that cannot strand a returning player without their emergency button.
  arrowRainStock.value = typeof snap.arrowRain === 'number'
    ? Math.min(ARROW_RAIN_WAVES, Math.max(0, Math.round(snap.arrowRain)))
    : ARROW_RAIN_WAVES

  wave.value = Math.max(0, Math.floor(snap.wave) || 0)
  wood.value = Math.max(0, Math.floor(snap.wood) || 0)
  stone.value = Math.max(0, Math.floor(snap.stone) || 0)
  runCoins.value = Math.max(0, Math.floor(snap.runCoins) || 0)
  // A resumed run has no record of what was already spent, so the best
  // available floor for the progression feed is the balance it resumes with.
  runCoinsEarned.value = runCoins.value
  kills.value = Math.max(0, Math.floor(snap.kills) || 0)
  killsByType.value = { ...(snap.killsByType ?? {}) }
  triggerRef(killsByType)
  blocksPlacedThisRun = 0
  // NOT reset: `wavesClearedThisRun` feeds the defeat consolation floor
  // (`5 + wavesCleared * 4`) and the battle-pass / mission wave credit. Zeroing
  // it here meant reloading mid-run silently cost the player that payout — the
  // snapshot knows the wave it stopped on, so restore the count from it.
  wavesClearedThisRun = Math.max(0, (Number(snap.wave) || 1) - 1)
  pendingBonus = 1

  let gateRestored = false
  for (const tuple of snap.blocks) {
    if (!Array.isArray(tuple) || tuple.length < 4) continue
    const [c, r, typeId, hp, roof, enhanced, level, tier, w, h] = tuple
    if (typeof c !== 'number' || typeof r !== 'number' || typeof typeId !== 'string') continue
    if (!BLOCK_DEFS[typeId]) continue
    // Older snapshots have no rank field at all, so an absent one is rank 0.
    const rank = Math.max(0, Math.min(MAX_BLOCK_LEVEL, Math.floor(Number(level) || 0)))
    // Older snapshots have no tier field; an absent one is a plain block.
    const mergeTier = Math.max(1, Math.min(
      Math.min(R().maxMergeTier, SAFE_MAX_TIER), Math.floor(Number(tier) || 1)
    ))
    // Footprints only appeared with multi-cell merging; a snapshot without one
    // describes single cells, and a tier-2 block from such a save simply comes
    // back as a 1×1 rather than corrupting the grid with a guessed shape.
    //
    // The span cap is a corruption guard, not a game rule: with no tier
    // ceiling a legitimate weld can be 8 or 16 cells along one axis (a tier-7
    // is an 8×8), and clamping those to the old 4 would have silently rewritten
    // real towers. Sixteen is past anything a board this size can grow.
    const fw = Math.max(1, Math.min(MAX_FOOTPRINT_SPAN, Math.floor(Number(w) || 1)))
    const fh = Math.max(1, Math.min(MAX_FOOTPRINT_SPAN, Math.floor(Number(h) || 1)))
    if (typeId === GATE_ID) {
      spawnGate(Math.max(1, Number(hp) || 1), rank)
      gateRestored = true
      continue
    }
    const isEnhanced = enhanced === 1
    const maxHp = maxHpFor(typeId, isEnhanced, roof === 1, rank, mergeTier)
    // Clamp HP to the CURRENT max: a tech purchase between sessions should
    // raise the ceiling, never leave a block sitting above it.
    const restored = spawnBlock(
      typeId, c, r, roof === 1,
      Math.max(1, Math.min(maxHp, Number(hp) || maxHp)),
      isEnhanced, rank, mergeTier, fw, fh
    )
    restored.bornAt = -9999 // skip the pop-in animation for restored blocks
  }

  // A snapshot without a gate is corrupt — rebuild one rather than booting an
  // unwinnable run.
  if (!gateRestored) spawnGate()
  // The restored layout may reference a narrower build width than the player
  // now has, or (after a corrupt write) contain floating blocks — settle it.
  settleSupport()
  syncTowerStats()

  // Restore the exact hand the player was looking at. Anything the snapshot
  // doesn't cover (an older save, a shape since removed from the catalogue) is
  // filled with a fresh roll rather than left blank.
  // Keep what the snapshot has and roll only what it is missing.
  //
  // Discarding the whole hand when the count did not match would mean every
  // save written before the support slot existed silently rerolled on load —
  // which is exactly the "refresh to fish for a better hand" this restore is
  // here to prevent. A short hand is a hand from an older build, not a corrupt
  // one: honour it and top it up.
  const saved = Array.isArray(snap.offers) ? snap.offers : []
  const slots = R().offers.slots
  const kept = saved.filter((id) => typeof id === 'string' && SHAPE_BY_ID[id]).slice(0, slots)
  const fresh = rollOffers(wave.value, availableBlocks.value, Math.random, laneCfg()).map(dealt)
  offers.value = Array.from({ length: slots }, (_, i) => kept[i] ?? fresh[i]!)
  offerEnhanced.value = new Array(slots).fill(false)
  ensureAffordableWeapon()

  phase.value = 'build'
  buildTimeLeft.value = R().waves.buildMs
  buildDeadline = buildTimeLeft.value
  return true
}

/** Stats for the run-summary screen. */
export const runSummary = () => ({
  wave: wave.value,
  wavesCleared: wavesClearedThisRun,
  kills: kills.value,
  /** Leaderboard score — see `runScore`. */
  score: runScore.value,
  killsByType: { ...killsByType.value },
  coins: runCoins.value,
  // What the run EARNED, before anything was spent on blocks. Progression
  // (daily missions, lifetime-coin achievements) has to read this rather than
  // the balance, or spending gold would look like the counter running
  // backwards — which the mission feed interprets as a brand-new run.
  coinsEarned: runCoinsEarned.value,
  height: towerHeight.value,
  blocks: blockCount.value,
  blocksPlaced: blocksPlacedThisRun
})

// ─── Fixed-step driver ──────────────────────────────────────────────────────

/**
 * Put a rule set in force before a run starts.
 *
 * Resizes the per-slot hand state to the new slot count; everything else reads
 * the rules live. A snapshot from the previous rules is left where it is — it
 * lives under that mode's own key and `hasSavedRun` will not see it. Calling
 * this mid-run is not supported: a run is played to one set of rules from its
 * first tick to its last.
 */
export const applyRules = (rules: RuleSet): void => {
  setActiveRules(rules)
  const slots = rules.offers.slots
  rerollTimers.length = 0
  for (let i = 0; i < slots; i++) rerollTimers.push(0)
  rerollReadyIn.value = new Array(slots).fill(0)
  offerEnhanced.value = new Array(slots).fill(false)
  offers.value = []
  cacheTechMultipliers()
}

const fixedStep = (dt: number): void => {
  clock += dt
  let cooling = false
  for (let i = 0; i < rerollTimers.length; i++) {
    if (rerollTimers[i]! <= 0) continue
    rerollTimers[i] = Math.max(0, rerollTimers[i]! - dt)
    cooling = true
  }
  if (cooling) syncRerollClocks()

  if (phase.value === 'build') {
    buildDeadline -= dt
    buildTimeLeft.value = Math.max(0, buildDeadline)
    if (buildDeadline <= 0) callWave()
    // Turrets still cool down and debris still settles between waves, so the
    // build phase never looks frozen.
    stepTurrets(dt)
    stepDebris(dt)
    stepAllies(dt)
    stepBurning(dt)
    return
  }

  if (phase.value === 'defeat') {
    // Let the collapse finish playing out under the defeat screen.
    stepDebris(dt)
    stepProjectiles(dt)
    return
  }

  stepSpawns(dt)
  stepEnemies(dt)
  stepAllies(dt)
  stepAllyCombat(dt)
  stepTurrets(dt)
  stepProjectiles(dt)
  stepDebris(dt)
  stepBurning(dt)
  syncGateRefs()
  scanUnreachable(dt)

  const allSpawned = spawnCursor >= plan.orders.length
  // `enemies.length`, not "every enemy is dying".
  //
  // A dying enemy is still on screen for the length of its death animation, so
  // completing the wave the instant the last one STARTED dying put the
  // wave-clear toast over a corpse that was still fading out. Waiting for the
  // array to drain costs a few hundred milliseconds and removes the overlap.
  const noneAlive = enemies.length === 0
  // Fires are deliberately NOT part of this check: a molotov is meant to keep
  // eating the crown into the build phase, and holding the wave open for it
  // would just deny the player their payout while they watch it burn.
  if (allSpawned && noneAlive && projectiles.length === 0) completeWave()
}

// ─── Fast-forward ───────────────────────────────────────────────────────────
//
// Speed is a TIMED BUFF bought with a rewarded video, not a free toggle. It is
// worth paying for because it compresses the part of a wave the player has
// already solved — once the tower is built and the shooting starts, the
// decisions are made and the rest is watching. Five minutes covers several
// waves, so one video is a real purchase rather than a per-wave tax.
//
// ONE purchase unlocks the whole ladder, and the player picks a rung whenever
// they like. 2x alone was not enough for the case this control exists for: a
// run that died at wave 20 has to replay twenty waves it has already solved,
// and at 2x that is still minutes of watching a tower you know will hold.
// Charging a second video for the third rung would be charging twice for the
// same thing — the video buys "fast-forward", and how fast is a preference.

/** How long one purchase lasts, ms. */
export const SPEED_BUFF_MS = 5 * 60 * 1000

/** The fastest rung. Bounded by `MAX_SUBSTEPS`: past this the clamp in `step`
 *  starts eating multiplier the player asked for. */
export const MAX_GAME_SPEED = 3

/** Every rung the switch offers, slowest first. 1x is always available. */
export const GAME_SPEEDS = [1, 2, 3] as const

/** Remaining buff time, ms. */
export const speedBuffLeft = ref(0)
export const isSpeedBuffed = computed(() => speedBuffLeft.value > 0)

/**
 * Grant (or extend) the buff, and jump straight to the rung that was asked for.
 *
 * `target` is the segment the player actually tapped. Landing them on 2x after
 * they pressed 3x would make the purchase feel like it half-worked.
 */
export const grantSpeedBuff = (target = 2): void => {
  // Extends rather than replaces: a player who watches a second video part-way
  // through the first buff must not lose the time they already paid for.
  speedBuffLeft.value = Math.min(SPEED_BUFF_MS * 2, speedBuffLeft.value + SPEED_BUFF_MS)
  gameSpeed.value = Math.min(
    Math.max(...R().abilities.speeds), MAX_GAME_SPEED, Math.max(1, Math.round(target))
  )
}

/**
 * Move to a specific rung.
 *
 * Anything above 1x needs the buff; 1x is always allowed, so the player can
 * always slow down — including before they have paid for anything. Returns
 * whether the speed actually changed, so a caller can tell "done" apart from
 * "that needs buying first".
 */
export const setGameSpeed = (n: number): boolean => {
  const next = Math.min(MAX_GAME_SPEED, Math.max(1, Math.round(n)))
  // A rung the mode does not offer cannot be selected, paid for or not.
  if (!R().abilities.speeds.includes(next)) return false
  if (next > 1 && !isSpeedBuffed.value) return false
  gameSpeed.value = next
  return true
}

/**
 * Tick the buff down.
 *
 * Uses REAL elapsed time, not simulated time — the buff is five minutes of the
 * player's life, and running it off the accelerated clock would make it expire
 * twice as fast precisely because they bought it.
 */
const stepSpeedBuff = (realDt: number): void => {
  if (speedBuffLeft.value <= 0) {
    if (gameSpeed.value !== 1) gameSpeed.value = 1
    return
  }
  speedBuffLeft.value = Math.max(0, speedBuffLeft.value - realDt)
  if (speedBuffLeft.value <= 0) gameSpeed.value = 1
}

/**
 * Cycle through the rungs — the keyboard shortcut and the cheat key.
 *
 * Wraps back to 1x off the top so one repeated key reaches every rung. The
 * on-screen control is a switch, so this is only the fast path for a player
 * whose hand is already on the keyboard.
 */
export const toggleSpeed = (): void => {
  if (!isSpeedBuffed.value) {
    gameSpeed.value = 1
    return
  }
  const ladder = R().abilities.speeds
  const at = ladder.indexOf(gameSpeed.value)
  gameSpeed.value = at < 0 || at >= ladder.length - 1 ? 1 : ladder[at + 1]!
}

/**
 * Advance the simulation by `dtMs` of real time. Accumulates into fixed 60 Hz
 * substeps (capped) so physics is deterministic regardless of display refresh
 * rate and a long stall can't teleport the siege forward.
 */
export const step = (dtMs: number): void => {
  if (dtMs <= 0) return
  // Real elapsed time, before the speed multiplier — the buff is five minutes
  // of the player's life, not five minutes of simulated siege.
  stepSpeedBuff(dtMs)
  const scaled = dtMs * (phase.value === 'battle' ? gameSpeed.value : 1)
  accumulator += Math.min(scaled, TICK_MS * MAX_SUBSTEPS)
  let steps = 0
  while (accumulator >= TICK_MS && steps < MAX_SUBSTEPS * 2) {
    fixedStep(TICK_MS)
    accumulator -= TICK_MS
    steps++
  }
}

export default function useTowerGame() {
  return {
    phase, wave, wood, stone, runCoins, kills, killsByType,
    enemiesLeft, enemiesTotal, gateHp, gateMaxHp, gateHpPct,
    buildTimeLeft, blockCount, towerHeight, gameSpeed, towerVersion,
    lastWaveReward, isBossIncoming, offers, offerEnhanced,
    rerollReadyIn, allyCount,
    startRun, resumeRun, hasSavedRun, saveRunSnapshot,
    isFirstSession, seedScriptedOpening,
    placeBlock, placeShape, sellBlock, canPlaceAt, canPlaceShapeAt,
    upgradeBlock, canUpgradeBlock, upgradeCostAt,
    canAfford, canAffordShape, rerollOffer, manualReroll, canManualReroll,
    dealEnhancedOffers, summonCavalry, cavalryCost,
    callWave, toggleSpeed, step, runSummary, towerBounds, blockAt, halfWidthAt
  }
}

export { blockAt, ENEMY_DEFS }
