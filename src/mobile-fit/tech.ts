import type { TechNode } from '@/game/types'
import { UNCAPPED } from '@/game/tech'

// ─── Blueprints ─────────────────────────────────────────────────────────────
//
// The mobile-fit tree is a single track of ten cards bought in order. A DAG
// needs a pannable board; a phone needs one screen and one button.
//
// Rank cards repeat and unlocks are binary, exactly as on the desktop tree —
// the effects are the same `TechEffect` kinds, so every derived multiplier in
// `useTowerProgress` works unchanged. Ids are `m2_`-prefixed and the levels
// live under their own save key: the two trees never see each other's
// purchases. `tier` is the card's position; `col` is unused.
//
// The rank cards have NO ceiling. They stopped at five for a while, on the
// theory that a strip of ten cards had no room for an open-ended ladder — but
// a ceiling turns the last purchase into the end of the screen, and what
// actually paces a rank ladder is its price, not a number written here.
//
// `costGrowth` compounds, so the wall builds itself and lands wherever the
// player's wave rewards say it should. Sharp Bolts at 1.3:
//
//   rank   1     5      10     15      20      25       30
//   coins  20    114    424    1,570   5,850   21,710   80,620
//
// The steeper cards climb faster still — Gate Armour is 1.33, which is 33,830
// at rank 20 against Sharp Bolts' 5,850, because armour is the one that keeps
// paying on every wave. A mobile run pays out at `rewardMul 0.6`, so these are
// dearer in practice than the same numbers on the desktop tree.
//
// ── Foundations leads (2026-09-11) ──
//
// The strip used to open on Sharp Bolts, with the HP card third behind it and
// the brace. It opens on Foundations now, because that is the card the stage-2
// spotlight points a new player at, and its first rank is front-loaded to +50 %
// block HP — the upgrade whose effect a player can actually watch. Its first
// rank is priced at 20 (`firstCost`) rather than the half-price 25 so it lands
// with the wave-2 clear: waves pay the wallet 6 + 3·wave coins (the mode's
// `rewardMul` scales materials, never coins), so 9 + 12 = 21 is in hand the
// first build phase the spotlight is up. Ranks 2+ still come off `costBase`.
//
// A save from before the swap can own Sharp Bolts or the brace without this
// card. `isUnlocked` treats an owned card as open whatever its prerequisites,
// so nothing a player paid for turns into a padlock.

export const TECH_NODES_DROPMERGE: ReadonlyArray<TechNode> = [
  {
    id: 'm2_foundations',
    tier: 0, col: 0, maxLevel: UNCAPPED,
    costBase: 50, costGrowth: 1.28, firstCost: 20,
    requires: [],
    effect: { kind: 'blockHp', pct: 8, firstPct: 50 },
    icon: 'blockHp'
  },
  {
    id: 'm2_sharpBolts',
    tier: 1, col: 0, maxLevel: UNCAPPED,
    costBase: 40, costGrowth: 1.3,
    requires: ['m2_foundations'],
    effect: { kind: 'damage', pct: 8 },
    icon: 'damage'
  },
  {
    id: 'm2_brace',
    tier: 2, col: 0, maxLevel: 1,
    costBase: 60, costGrowth: 1,
    requires: ['m2_sharpBolts'],
    effect: { kind: 'unlock', blockId: 'brace' },
    icon: 'brace'
  },
  {
    id: 'm2_bombard',
    tier: 3, col: 0, maxLevel: 1,
    costBase: 170, costGrowth: 1,
    requires: ['m2_brace'],
    effect: { kind: 'unlock', blockId: 'bombard' },
    icon: 'bombard'
  },
  {
    id: 'm2_rapidFire',
    tier: 4, col: 0, maxLevel: UNCAPPED,
    costBase: 80, costGrowth: 1.32,
    requires: ['m2_bombard'],
    effect: { kind: 'fireRate', pct: 8 },
    icon: 'fireRate'
  },
  {
    id: 'm2_gateArmor',
    tier: 5, col: 0, maxLevel: UNCAPPED,
    costBase: 150, costGrowth: 1.33,
    requires: ['m2_rapidFire'],
    effect: { kind: 'gateHp', pct: 15 },
    icon: 'gate'
  },
  {
    id: 'm2_spikes',
    tier: 6, col: 0, maxLevel: 1,
    costBase: 90, costGrowth: 1,
    requires: ['m2_gateArmor'],
    effect: { kind: 'unlock', blockId: 'spikes' },
    icon: 'spikes'
  },
  {
    id: 'm2_lumberHut',
    tier: 7, col: 0, maxLevel: 1,
    costBase: 120, costGrowth: 1,
    requires: ['m2_spikes'],
    effect: { kind: 'unlock', blockId: 'lumberHut' },
    icon: 'sawmill'
  },
  {
    id: 'm2_tesla',
    tier: 8, col: 0, maxLevel: 1,
    costBase: 260, costGrowth: 1,
    requires: ['m2_lumberHut'],
    effect: { kind: 'unlock', blockId: 'tesla' },
    icon: 'tesla'
  },
  {
    id: 'm2_looting',
    tier: 9, col: 0, maxLevel: UNCAPPED,
    costBase: 240, costGrowth: 1.31,
    requires: ['m2_tesla'],
    effect: { kind: 'coinDrop', pct: 12 },
    icon: 'loot'
  }
]

/**
 * Which desktop node each card borrows its NAME and DESCRIPTION from.
 *
 * The effects are identical, so the copy is too — and it already ships in
 * every locale. Only the lumber hut card is new: on the desktop that block is
 * un-gated and has no node to borrow from.
 */
export const CARD_NAME_KEY: Readonly<Record<string, string>> = {
  m2_sharpBolts: 'sharpBolts',
  m2_brace: 'unlockBrace',
  m2_foundations: 'foundations',
  m2_bombard: 'unlockBombard',
  m2_rapidFire: 'rapidFire',
  m2_gateArmor: 'gateArmor',
  m2_spikes: 'unlockSpikes',
  m2_lumberHut: 'm2_lumberHut',
  m2_tesla: 'unlockTesla',
  m2_looting: 'looting'
}
