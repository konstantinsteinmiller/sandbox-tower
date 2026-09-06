import { ENEMY_DEFS } from '@/game/enemies'
import { previewsFor } from '@/game/waves'
import { pickMonster } from '@/game/monsterSprites'
import {
  artSettled, artOverridesEnabled, sceneArtWants, spriteFor,
  BLOCK_ART_BASES, type ArtWant
} from '@/game/art'

/**
 * ─── Staged art loading ─────────────────────────────────────────────────────
 *
 * With painted art on, the game used to fetch the whole set at once: every
 * block base, every background band and icon behind the splash, and then on
 * the first frame every monster strip, every siege chassis and arm, every hull,
 * the cavalry and every fixture — 60-odd files, most of them for things a
 * first-time player will not see for twenty minutes. A trebuchet debuts at
 * wave 22. A first-time player on a phone paid for it at wave 0.
 *
 * So the set is staged, and the stages are DERIVED from the enemy definitions
 * rather than listed: a design's tier is the first wave it can walk on, read
 * off `minWave` and the scripted previews. Balance changes move the art with
 * them, and nothing here goes stale when a wave is retuned.
 *
 *   tier 0 — behind the splash, `fetchPriority: high`. What wave 0 and wave 1
 *            put on screen: the two starting bases, the two starting weapons,
 *            the scenery (it IS the screen), the HUD icons, and every design
 *            that can appear on wave 1.
 *   tier 1 — right after the splash, normal priority, in debut order, one at a
 *            time so the wave-3 design lands before the wave-6 one. Everything
 *            that debuts inside the early game.
 *   tier 2 — on an idle slot after tier 1 has settled, `fetchPriority: low`.
 *            The late cast, the other bases and fixtures, siege engines and
 *            their arms, the hulls, the rider, the rounds. The browser fits
 *            these around whatever the player is actually doing.
 *
 * Nothing waits on tiers 1 or 2. A design whose strip has not arrived when it
 * first walks on simply draws its procedural body, exactly as it does with the
 * art switched off, and `stripFrame` probes it on first sight regardless.
 */

/** Waves at or before this are "the early game": fetched eagerly after the splash. */
const EARLY_WAVE = 6

/**
 * The wave the player is about to see, or 1 for a new player.
 *
 * Read straight out of the persisted blob rather than through
 * `useTowerState`, because this runs BEFORE the splash and must not drag the
 * state layer, its watchers and its persist timer onto the boot path for one
 * integer. Defensive to the point of paranoia: any parse failure, any shape
 * surprise, and a new player's tier is what we fetch, which is the right
 * answer to guess wrong with.
 *
 * A run SNAPSHOT is what matters, not the best wave ever reached. A player
 * who got to wave 30 and died starts again at wave 1 and needs the wave-1
 * cast; only a resumable run puts wave 30's enemies on screen first.
 *
 * On platform builds `localStorage.getItem` is the SaveManager proxy, so this
 * already sees cloud-hydrated data when the SDK got there first. When it did
 * not, a returning player is treated as new for one load and their real cast
 * arrives in tier 2 — a worse first minute than it could be, never a wrong
 * one, and far better than blocking the splash on a network round trip.
 */
export const resumeWave = (): number => {
  try {
    const raw = globalThis.localStorage?.getItem('tower_state')
    if (!raw) return 1
    const blob = JSON.parse(raw) as Record<string, unknown>
    const run = blob?.ts_run as { wave?: unknown } | undefined
    const wave = Math.floor(Number(run?.wave))
    return Number.isFinite(wave) && wave > 1 ? wave : 1
  } catch { return 1 }
}

/**
 * The first wave each monster design can appear on.
 *
 * `minWave` gates the wave director's random pool; the previews bypass it on
 * purpose (a bat at wave 4 teaches the player about air), so a design's real
 * debut is the earlier of the two. A design bound to several enemy types takes
 * the earliest of them.
 */
export const monsterDebuts = (): Map<string, number> => {
  const debut = new Map<string, number>()
  const note = (binding: string | string[] | undefined, wave: number): void => {
    const ids = typeof binding === 'string' ? [binding] : binding ?? []
    for (const id of ids) {
      if (!pickMonster(id, 0)) continue
      debut.set(id, Math.min(debut.get(id) ?? Infinity, wave))
    }
  }
  for (const def of Object.values(ENEMY_DEFS)) {
    note(def.monster, def.minWave ?? Infinity)
  }
  // The scripted previews, which reach well below `minWave`.
  for (let wave = 1; wave <= 30; wave++) {
    for (const [typeId] of previewsFor(wave)) note(ENEMY_DEFS[typeId]?.monster, wave)
  }
  return debut
}

/** Designs sorted by debut, optionally only those inside a wave range. */
const designsDebuting = (from: number, to: number): string[] =>
  [...monsterDebuts()]
    .filter(([, wave]) => wave >= from && wave <= to)
    .sort((a, b) => a[1] - b[1])
    .map(([id]) => id)

/**
 * Tier 0: what the splash holds for.
 *
 * `wood` and `stone` resolve to the shared timber and masonry bases inside
 * `spriteFor`, which is every block a fresh player can place. The archer and
 * the cannon are the two weapons the game starts with.
 */
export const criticalArtWants = (): ArtWant[] => {
  // A resuming player's first screen is their own wave, not wave 1. Fetching
  // the starting cast for someone mid-run means the enemies they are actually
  // about to meet pop in during the fight, which is the one moment the swap
  // is most visible.
  const wave = resumeWave()
  const from = wave > 1 ? Math.max(1, wave - 1) : 0
  const to = wave > 1 ? wave + 1 : 1
  return [
    ['block', 'wood'],
    ['block', 'stone'],
    ['fixture', 'archer'],
    ['fixture', 'cannon'],
    ...sceneArtWants(),
    ...designsDebuting(from, to).map((id): ArtWant => ['monster', id])
  ]
}

/** Fixtures that exist but are not on a starting block. */
const LATER_FIXTURES = [
  'mortar', 'bombard', 'tesla', 'frost', 'spikes',
  'banner', 'obelisk', 'lumberHut', 'stonepit', 'coffer', 'repair'
]
const SIEGE = ['ballista', 'catapult', 'trebuchet', 'ram', 'ironRam', 'siegeTower']
const SIEGE_ARMS = ['ballista', 'catapult', 'trebuchet']
const SHIPS = ['skiff', 'longship', 'galley']
const ROUNDS = ['bolt', 'quarrel']

let started = false

/**
 * Tiers 1 and 2. Idempotent; call it once the splash is down.
 *
 * Tier 1 is awaited one design at a time so that a slow connection still gets
 * the wave-3 design before the wave-6 one — a parallel burst would let the
 * biggest file win. Tier 2 goes out in one low-priority batch on an idle
 * callback, because by then order no longer matters and the browser's own
 * scheduler does a better job of fitting it around play than a chain would.
 */
export const preloadRemainingArt = async (): Promise<void> => {
  if (started || !artOverridesEnabled()) return
  started = true

  // Tier 1 runs outward from wherever the player actually is: a resuming
  // player gets the next few waves' designs, a new one gets the early game.
  // Either way tier 2 sweeps up whatever is left, so nothing is orphaned.
  const wave = resumeWave()
  const tier1 = wave > 1
    ? designsDebuting(wave + 2, wave + 8)
    : designsDebuting(2, EARLY_WAVE)
  for (const id of tier1) await artSettled('monster', id)

  const late = (): void => {
    for (const id of monsterDebuts().keys()) spriteFor('monster', id, 'low')
    for (const id of BLOCK_ART_BASES) spriteFor('block', id, 'low')
    for (const id of LATER_FIXTURES) spriteFor('fixture', id, 'low')
    for (const id of SIEGE) spriteFor('siege', id, 'low')
    for (const id of SIEGE_ARMS) spriteFor('siegeArm', id, 'low')
    for (const id of SHIPS) spriteFor('ship', id, 'low')
    for (const id of ROUNDS) spriteFor('round', id, 'low')
    spriteFor('ally', 'cavalry', 'low')
  }
  const idle = (globalThis as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
    .requestIdleCallback
  if (typeof idle === 'function') idle(late, { timeout: 8000 })
  else setTimeout(late, 1500)
}
