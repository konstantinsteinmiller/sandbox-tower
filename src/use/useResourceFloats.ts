import { ref } from 'vue'

/**
 * ─── Resource payout floats ─────────────────────────────────────────────────
 *
 * "+12" rising from just under the resource bar into the figure it belongs to.
 *
 * This replaces the payout row that used to live inside the wave-clear toast.
 * That card sat in the middle of the screen for three and a half seconds with a
 * kill tally, a payout table and a caption on it — over the tower, at exactly
 * the moment the player wants to look at the tower and decide what to build.
 * The information it carried was mostly not wanted (nobody is counting how many
 * grunts died) and the part that was wanted — what the wave paid — is better
 * said AT the number it changed than in a table somewhere else.
 *
 * A leaf module with no game imports, so the HUD can read it without dragging
 * the simulation into the app shell's chunk.
 */

export type ResourceFloatId = 'wood' | 'stone' | 'gold'

export interface ResourceFloat {
  uid: number
  id: ResourceFloatId
  amount: number
}

/**
 * How long one float lives, ms.
 *
 * 2500, up from 1250. At the shorter life the payout was gone before the eye
 * had finished travelling from the battlefield — where the player is looking
 * when a wave ends — up to the bar. A number nobody reads is not feedback, it
 * is decoration, and the whole reason this replaced the toast's payout table
 * was to make the reward legible.
 *
 * `ResourceBar` drives its CSS animation from this value rather than repeating
 * it, so the two cannot drift: the element is removed when this elapses, and a
 * shorter timer would cut the fade off mid-flight while a longer one leaves an
 * invisible node in the DOM.
 */
export const FLOAT_LIFE_MS = 2500

/**
 * A ceiling on how many can be in the air at once.
 *
 * Three resources per wave is the normal case, but a player who sells a row of
 * blocks fires one per sale, and an unbounded list would stack them into an
 * illegible column over the bar.
 */
const MAX_FLOATS = 8

let uid = 0

export const resourceFloats = ref<ResourceFloat[]>([])

/** Send one "+n" up into the bar. Zero and negative amounts are dropped: a
 *  "+0 stone" float teaches the player that the animation is noise. */
export const pushResourceFloat = (id: ResourceFloatId, amount: number): void => {
  if (!Number.isFinite(amount) || amount <= 0) return
  const f: ResourceFloat = { uid: ++uid, id, amount: Math.round(amount) }
  const next = [...resourceFloats.value, f]
  resourceFloats.value = next.length > MAX_FLOATS ? next.slice(next.length - MAX_FLOATS) : next
  setTimeout(() => {
    resourceFloats.value = resourceFloats.value.filter((x) => x.uid !== f.uid)
  }, FLOAT_LIFE_MS)
}

/** Drop everything in flight — a run reset must not leave last run's payout
 *  drifting over a fresh bar. */
export const clearResourceFloats = (): void => {
  resourceFloats.value = []
}
