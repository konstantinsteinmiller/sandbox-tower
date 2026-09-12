import { computed, ref, type ComputedRef } from 'vue'
import { flushPersist, getState, setState } from '@/use/useTowerState'
import { M2_TECH_KEY, TECH_FOUND_KEY, TECH_KEY, TECH_SPOTLIGHT_KEY } from '@/keys'
import { wave } from '@/use/useTowerGame'
import { totalWaves } from '@/use/useTowerProgress'
import { firstHpNodeId } from '@/game/tech'
import type { TechNode } from '@/game/types'

/**
 * ─── "There is a tech tree" ─────────────────────────────────────────────────
 *
 * Nothing in the game ever makes a player open the tech tree, and a player who
 * never opens it is playing a materially shallower game — the tree is where the
 * run stops being "stack blocks" and starts being a build. So once they have a
 * wave behind them, the button asks to be looked at: a gold aura and a bounce,
 * until they act on it.
 *
 * WHY IT IS NOT THE EXISTING SPOTLIGHT. `TECH_SPOTLIGHT_KEY` already drives a
 * "Spend!" flag on the same button, and reusing it was the obvious move and the
 * wrong one: that one waits for `affordableCount > 0`, i.e. for the player to
 * have banked enough to buy something. That can be several runs away, and for a
 * player who quits in the first session it never happens at all — which is
 * exactly the player this nudge is for. The two signals answer different
 * questions ("there IS a tree" vs "you can afford something in it") and so they
 * retire on different events.
 *
 * ONE FLAG FOR BOTH BOARDS. The desktop tower and the mobile Drop & Merge board
 * share a save, and the tree is the same idea on both (the phone calls it
 * Blueprints). A player who found it on the phone has found it.
 */

/** Does this tech-state blob record anything actually bought? */
const hasBoughtTech = (key: string): boolean => {
  const state = getState<{ levels?: unknown } | null>(key, null)
  const levels = state?.levels
  if (!levels || typeof levels !== 'object') return false
  return Object.values(levels as Record<string, unknown>)
    .some((n) => typeof n === 'number' && n > 0)
}

/**
 * Has the player already found the tree, one way or another?
 *
 * The explicit flag is only set from this feature onward, so on the update that
 * ships it EVERY existing player would otherwise be told about a screen they
 * have been using for weeks. The other three signals are how we recognise them:
 * they dismissed the older spotlight, or either board's tech state records a
 * purchase. Any one of those means "knows about the tree" beyond doubt.
 *
 * The reverse mistake — deciding a genuine first-timer already knows — is not
 * possible here: all three require an action only a player who opened the tree
 * could have taken.
 */
const alreadyKnows = (): boolean =>
  getState<boolean>(TECH_FOUND_KEY, false) === true
  || getState<boolean>(TECH_SPOTLIGHT_KEY, false) === true
  || hasBoughtTech(TECH_KEY)
  || hasBoughtTech(M2_TECH_KEY)

const found = ref(alreadyKnows())

/**
 * Re-read the save.
 *
 * Module scope runs before a platform build's cloud save has landed, so the
 * first answer can be "no" for a returning player whose blob is still in
 * flight. The scenes call this once the run is up, by which point a hydrate has
 * either arrived or is not coming. Costs one localStorage read; never un-finds
 * a tree that has been found in this session.
 */
export const refreshTechFound = (): void => {
  if (!found.value && alreadyKnows()) found.value = true
}

/**
 * Record that the player has opened the tree. Idempotent.
 *
 * Flushed rather than left to the state layer's 200 ms debounce. Opening the
 * tech tree is exactly the kind of moment a player follows with a tab close or
 * an app switch, and losing the write there costs them the whole nudge again
 * next session — a button bouncing at someone who is already an expert.
 */
export const markTechFound = (): void => {
  if (found.value) return
  found.value = true
  setState(TECH_FOUND_KEY, true)
  flushPersist()
}

/**
 * Should the path to the tech tree be pulling at the eye right now?
 *
 * "After wave 1 is FINISHED", and getting that from `wave` needs care: it holds
 * the wave being FOUGHT, not the count survived — `callWave` sets it to the
 * wave it is starting. So `wave >= 1` is true from the moment wave 1 BEGINS,
 * which on the phone board is a few seconds after boot, and the first version
 * of this lit the menu button while the player was still meeting their first
 * monster. `>= 2` is the honest reading of "one wave behind them".
 *
 * `totalWaves` is the second half, and it covers the player who cleared a wave
 * in an earlier run and then died: it is the lifetime count, banked at run end,
 * so they get the nudge from the start of their next run instead of having to
 * reach wave 2 all over again.
 *
 * Either way it stops the moment the tree is opened, and never returns.
 */
export const reachedStageTwo: ComputedRef<boolean> = computed(
  () => wave.value >= 2 || totalWaves.value >= 1
)

/**
 * The HUD nudge: stage 2 reached and the tree never opened. Drives the gold
 * aura, the hop and the pointing arrow on the tech button (desktop) and the
 * Blueprints button (phone bottom bar).
 */
export const techNudge: ComputedRef<boolean> = computed(
  () => !found.value && reachedStageTwo.value
)

/** For tests and debug overlays; the UI has no business reading this directly. */
export const techFound: ComputedRef<boolean> = computed(() => found.value)

/**
 * ─── "Buy this one first" ──────────────────────────────────────────────────
 *
 * The HUD nudge gets the player INTO the tree; this is what they meet there.
 * From stage 2 on, a tree nothing has been bought in points at its first HP
 * card with the same gold glow and arrow, until that card is bought once. Its
 * first rank is front-loaded (+50 % block HP, see `firstPct`), so the one
 * purchase the game asks for is one whose effect a player can see.
 *
 * "Nothing bought on this board" keeps it off anyone who has already chosen a
 * first upgrade — including a phone save from before the strip was re-ordered
 * that owns Sharp Bolts but not the card now in front of it.
 *
 * A function over the tree and a level reader rather than a computed, because
 * each board's modal reads its own tree; called inside a component's computed
 * it tracks `reachedStageTwo` and the levels like any other dependency.
 */
export const shouldSpotlightFirstUpgrade = (
  nodes: ReadonlyArray<TechNode>, levelOf: (id: string) => number
): boolean => {
  if (!reachedStageTwo.value) return false
  const id = firstHpNodeId(nodes)
  if (!id || levelOf(id) > 0) return false
  return !nodes.some((n) => levelOf(n.id) > 0)
}
