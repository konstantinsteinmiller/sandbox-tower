import { spriteFor } from './art'

/**
 * ─── Drop-in art that only exists once somebody paints it ───────────────────
 *
 * Every other override slot in the game is a drawable that has ALREADY been
 * painted — the thirteen fixtures, the seventeen monster strips — so the
 * renderer can probe for it unconditionally. These are slots for art that does
 * not exist yet: the merged-tier weapons and the flying chest's wing. Probing
 * them unconditionally would be a guaranteed 404 per slot per session, and
 * CrazyGames' QA console reports every one of those as a broken build (see
 * `art-todo.md` → "The probe is OFF by default").
 *
 * So each slot is probed only once its id is LISTED here, which is the step
 * that turns "a file is on disk" into "the game asks for it".
 * `tests/game/paintedArt.test.ts` holds the two in step in both directions: a
 * painting sliced into `public/images/` that nobody listed fails the suite, and
 * so does a listed id with no file behind it.
 */

// ─── Merged-tier weapons ────────────────────────────────────────────────────
//
// A merged weapon is drawn as a twin (tier 2) or a triple battery (tier 3 and
// up), built out of copies of the plain gun — see `paintTieredFixture`. That
// works over painted art as well as drawn, but it is a composite: three pastes
// of one painting are not a painting of three guns. These slots let a real one
// replace it, one weapon and one tier at a time.

/** The weapons whose merged tiers can carry a painting of their own. */
export const TIER_ART_WEAPONS = ['cannon', 'archer', 'bombard', 'mortar', 'tesla', 'frost'] as const

/** The deepest tier with a painting of its own. Deeper welds reuse it: the
 *  procedural battery stops adding barrels at three, and so does the art. */
export const TOP_PAINTED_TIER = 3

/** The drop-in id for a weapon's merged tier: `cannon-t2`, `cannon-t3`. */
export const tierFixtureId = (type: string, tier: number): string =>
  `${type}-t${Math.min(TOP_PAINTED_TIER, Math.max(2, Math.floor(tier)))}`

/**
 * Tier paintings that are on disk, as `tierFixtureId` spells them.
 *
 * EMPTY until the first one is painted. Adding an id here is the whole of
 * adopting a painting — it lands in `public/images/fixtures/<id>.webp` through
 * `pnpm slice-sheets`, and the test above fails until it is listed.
 */
export const PAINTED_TIER_FIXTURES: ReadonlySet<string> = new Set<string>([])

/**
 * The painting for a weapon's merged tier, when there is one and it has
 * decoded — or null, and the procedural battery is drawn instead. Tier 1 is
 * the plain fixture and never comes through here.
 */
export const tierFixtureArt = (type: string, tier: number): HTMLImageElement | null => {
  if (tier < 2) return null
  const id = tierFixtureId(type, tier)
  return PAINTED_TIER_FIXTURES.has(id) ? spriteFor('fixture', id) : null
}

// ─── Props ──────────────────────────────────────────────────────────────────

/** The flying chest's wing — `public/images/props/chest-wing.webp`. */
export const CHEST_WING_ID = 'chest-wing'

/** Prop paintings that are on disk. Empty until painted; same test. */
export const PAINTED_PROPS: ReadonlySet<string> = new Set<string>([])

/** A painted prop, when there is one and it has decoded — or null. */
export const propArt = (id: string): HTMLImageElement | null =>
  PAINTED_PROPS.has(id) ? spriteFor('prop', id) : null

/**
 * How the chest wing is authored — the contract between the painting and the
 * component that flaps it.
 *
 * ONE wing, the chest's RIGHT one, spread out to the right and up, on a square
 * canvas. The component draws it as-is on the right, mirrors it about the
 * pivot for the left, and rotates it about the pivot to flap — so the pivot is
 * the one number that has to be right. It is the SHOULDER: the root of the
 * wing, where it would meet the chest's side.
 *
 * `pivotX` / `pivotY` are fractions of the canvas from its top-left. At rest
 * the leading edge rises from the shoulder at about `restDeg` above the
 * horizontal; a flap is a rotation about the pivot on top of that pose.
 *
 * `chestScale` is how big the chest is drawn against this canvas: a wing
 * canvas the same size as the chest's own (`images/icons/chest.webp`, 512 px)
 * at 1.0, which is the size the prompt paints it at. The component may scale
 * both together; it should not scale one without the other.
 */
export const CHEST_WING_BOX = {
  w: 512,
  h: 512,
  pivotX: 0.12,
  pivotY: 0.7,
  restDeg: 25,
  chestScale: 1
} as const
