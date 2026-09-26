import {
  drawHousefly, drawMosquito, drawHornet, drawBumblebee, drawFirefly,
  HOUSEFLY_SHADOW, MOSQUITO_SHADOW, HORNET_SHADOW, BUMBLEBEE_SHADOW, FIREFLY_SHADOW
} from '@/game/bugs/air'
import { drawWaterTiger, drawDivingBeetle, drawDragonflyNymph, drawToeBiter } from '@/game/bugs/sea'
import {
  drawBlackAnt, drawRedAnt, drawCockroach, drawRhinoBeetle,
  BLACK_ANT_SHADOW, RED_ANT_SHADOW, COCKROACH_SHADOW, RHINO_BEETLE_SHADOW
} from '@/game/bugs/groundA'
import {
  drawSpider, drawBombardier, drawRolyPoly, drawStagBeetle,
  SPIDER_SHADOW, BOMBARDIER_SHADOW, ROLY_POLY_SHADOW, STAG_BEETLE_SHADOW
} from '@/game/bugs/groundB'
import type { ShadowSpec } from '@/game/monsterKit'

/**
 * ─── Monster designs ────────────────────────────────────────────────────────
 *
 * Ten characters, drawn from the shared vocabulary in `monsterKit`. Each is
 * AUTHORED — silhouette, asymmetries and the placement of every shadow cut are
 * decisions, not derivations.
 *
 * Drawing convention: origin at the character's centre of mass, unit `S`, feet
 * at roughly `y = +1`, crown at roughly `y = -1.05`. The view scales and
 * positions; nothing here knows about pixels.
 *
 * Three rules hold across all ten, because they are what makes a cast read as
 * ONE cast:
 *
 *   * **Silhouette first.** Every monster is identifiable as a black shape, and
 *     no two share a footprint — round, tall, wide, floating, hunched, winged,
 *     lanky, domed, branching.
 *   * **Asymmetry everywhere.** Paired features differ: one ear droops lower,
 *     one eye is bigger, one horn is chipped. Perfect mirroring is the single
 *     loudest "this was generated" signal a character can send.
 *   * **Nothing re-decides the shared rules.** Light direction, tonal steps and
 *     line weights come from the kit. A character that picks its own drops out
 *     of the family immediately, however good it looks alone.
 *
 * Every character has a locomotion cycle, and every cycle obeys one constraint:
 * it MOVES parts, it never reshapes them. Contours are seeded on constants
 * only, so the body is bit-identical from frame to frame and the animation is
 * pure translation and joint angle. The moment `t` reaches a seed or a radius,
 * the silhouette boils and the character stops being the same character —
 * which reads far worse than any stiffness in the walk.
 */

/**
 * What a body sheds when struck. Drives the hit particles.
 *
 * `none` is for things with no substance to lose — a ghost takes the hit and
 * the tell is entirely in the flash.
 */
export type GoreKind = 'blood' | 'bone' | 'ooze' | 'sap' | 'ember' | 'spectral' | 'metal' | 'none'

export interface MonsterDef {
  id: string
  name: string
  /** One line of design intent, shown under the portrait. */
  tagline: string
  /** Card backdrop, so each character sits in its own light. */
  backdrop: [string, string]
  /**
   * Length of one locomotion cycle, ms.
   *
   * Only the bench plays these at their authored speed. In game the frames are
   * baked over exactly this window and then replayed at whatever rate the unit
   * is actually moving — so the loop has to close at `cycleMs`, or the sprite
   * pops every time it wraps.
   */
  cycleMs: number
  /**
   * What comes out of it when it is hit.
   *
   * A skeleton that sprays blood is the sort of detail nobody articulates and
   * everybody notices. This lives on the DESIGN rather than the enemy type
   * because one rank can field more than one body — a grunt is a Grumpling or a
   * Rattlejack depending on its uid, and those two should not bleed alike.
   */
  gore: GoreKind
  /**
   * Which way the character is drawn.
   *
   * The battlefield authors every unit facing RIGHT and mirrors by travel
   * direction, so anything drawn facing left needs one more flip or it walks
   * backwards into the tower.
   */
  faces: 'left' | 'right' | 'front'
  /**
   * Where the design hangs off its position on the battlefield.
   *
   * A walker is placed by its FEET, because the cast varies in how much
   * headroom it uses and centring them would leave the tall ones hovering and
   * the short ones sunk. A swimmer has no feet: it is placed by the middle of
   * its body, which is also the point the water line is measured against.
   * Defaults to `feet`.
   */
  anchor?: 'feet' | 'centre'
  draw: (ctx: CanvasRenderingContext2D, S: number, t: number) => void
  /**
   * The contact shadow `draw` lays under it, as numbers.
   *
   * The bake gets it from `draw` itself. A PAINTED strip replaces the whole
   * frame, shadow and all, and the painter is told not to paint one — so the
   * battlefield lays this under a painted strip instead (`paintedMonsterShadow`).
   * Absent for the swimmers, which have none.
   */
  shadow?: ShadowSpec
}

// ─── Registry ───────────────────────────────────────────────────────────────

export const MONSTERS: MonsterDef[] = [
  {
    id: 'grumpling',
    gore: 'ooze',
    cycleMs: 880,
    // Side-on, facing left: the battlefield's extra flip turns it to the tower.
    faces: 'left',
    name: 'Black Ant',
    tagline: 'The baseline. Big head, six busy legs, and a frown that means business.',
    backdrop: ['#fff1c9', '#e8c47e'],
    draw: drawBlackAnt,
    shadow: BLACK_ANT_SHADOW
  },
  {
    id: 'bonecap',
    gore: 'ooze',
    cycleMs: 1300,
    faces: 'front',
    name: 'Spitting Spider',
    tagline: 'Jumping spider. Eight fuzzy legs, two enormous eyes, and a web ball with your name on it.',
    backdrop: ['#fff4d6', '#e9c88a'],
    draw: drawSpider,
    shadow: SPIDER_SHADOW
  },
  {
    id: 'snaggletusk',
    gore: 'bone',
    cycleMs: 1350,
    faces: 'left',
    name: 'Rhino Beetle',
    tagline: 'Low, heavy, forward, one big horn — built to hit a wall and keep going.',
    backdrop: ['#fbe7b8', '#d9a86a'],
    draw: drawRhinoBeetle,
    shadow: RHINO_BEETLE_SHADOW
  },
  {
    id: 'wispling',
    gore: 'ooze',
    cycleMs: 2600,
    faces: 'front',
    name: 'Mosquito',
    tagline: 'All legs and one long straw. Heavy-lidded, striped, and it has already picked you.',
    backdrop: ['#e4f1ff', '#8fbde6'],
    draw: drawMosquito,
    shadow: MOSQUITO_SHADOW
  },
  {
    id: 'marrowknight',
    gore: 'bone',
    cycleMs: 1700,
    faces: 'front',
    name: 'Roly-Poly',
    tagline: 'Pill bug in seven plates of armour, and a bottle cap held out front like it means it.',
    backdrop: ['#eef8dc', '#9fcf74'],
    draw: drawRolyPoly,
    shadow: ROLY_POLY_SHADOW
  },
  {
    id: 'nibbler',
    gore: 'ooze',
    cycleMs: 860,
    faces: 'front',
    name: 'Housefly',
    tagline: 'Two cherry-red eyes, a buzz, and absolutely no manners. It has seen your sandwich.',
    backdrop: ['#e2f5ff', '#7cc4ef'],
    draw: drawHousefly,
    shadow: HOUSEFLY_SHADOW
  },
  {
    id: 'cinderhound',
    gore: 'ooze',
    cycleMs: 620,
    faces: 'left',
    name: 'Cockroach',
    tagline: 'Low, long and glossy. Antennae longer than it is — the fast one.',
    backdrop: ['#fdf0cf', '#e2b877'],
    draw: drawCockroach,
    shadow: COCKROACH_SHADOW
  },
  {
    id: 'blorp',
    gore: 'bone',
    cycleMs: 1250,
    faces: 'front',
    name: 'Bombardier Beetle',
    tagline: 'Grinning through its teeth like it knows something. It does: its backside is about to pop.',
    backdrop: ['#e6f6ff', '#94cdf2'],
    draw: drawBombardier,
    shadow: BOMBARDIER_SHADOW
  },
  {
    id: 'thornwick',
    gore: 'bone',
    cycleMs: 3200,
    faces: 'front',
    name: 'Stag Beetle',
    tagline: 'The garden heavyweight. Antlers first, everything else very slowly after.',
    backdrop: ['#fff0c8', '#eaa75a'],
    draw: drawStagBeetle,
    shadow: STAG_BEETLE_SHADOW
  },
  {
    id: 'rattlejack',
    gore: 'ooze',
    cycleMs: 760,
    faces: 'left',
    name: 'Red Ant',
    tagline: 'The fire ant. Leaner, hotter-headed, and it brought a rock.',
    backdrop: ['#ffeec4', '#f0b27a'],
    draw: drawRedAnt,
    shadow: RED_ANT_SHADOW
  },
  {
    id: 'dustmoth',
    gore: 'ember',
    cycleMs: 1500,
    faces: 'front',
    name: 'Firefly',
    tagline: 'Wears its lantern on its tail and a little red hood. The ember is for your castle.',
    backdrop: ['#9c98d8', '#44427e'],
    draw: drawFirefly,
    shadow: FIREFLY_SHADOW
  },
  {
    id: 'skewer',
    gore: 'bone',
    cycleMs: 480,
    faces: 'left',
    name: 'Hornet',
    tagline: 'The late air threat. Striped, furious, and the pointy end is the whole point.',
    backdrop: ['#fff0c2', '#f0a24a'],
    draw: drawHornet,
    shadow: HORNET_SHADOW
  },
  {
    id: 'gloomcrow',
    gore: 'ooze',
    cycleMs: 780,
    faces: 'front',
    name: 'Bumblebee',
    tagline: 'Round, fuzzy, wings going flat out — all of it spent hauling one sticky honey bomb.',
    backdrop: ['#f1fbd6', '#9ccf72'],
    draw: drawBumblebee,
    shadow: BUMBLEBEE_SHADOW
  },

  // ── Swimmers ─────────────────────────────────────────────────────────────
  // Authored side-on and centred, and animated by a travelling wave or a rowing
  // stroke rather than a gait. See the header of `bugs/sea.ts`.
  {
    id: 'sliverfin',
    gore: 'ooze',
    cycleMs: 700,
    faces: 'right',
    anchor: 'centre',
    name: 'Water Tiger',
    tagline: 'Diving-beetle larva. A ringed ribbon with two sickle jaws on the front, and they never close.',
    backdrop: ['#2f8fa0', '#12465a'],
    draw: drawWaterTiger
  },
  {
    id: 'gnashfin',
    gore: 'bone',
    cycleMs: 900,
    faces: 'right',
    anchor: 'centre',
    name: 'Diving Beetle',
    tagline: 'Glossy shell, yellow rim, two big oars. Stiff as a pebble and rows like it means it.',
    backdrop: ['#3aa0b8', '#15506a'],
    draw: drawDivingBeetle
  },
  {
    id: 'tidewyrm',
    gore: 'ooze',
    cycleMs: 1500,
    faces: 'right',
    anchor: 'centre',
    name: 'Dragonfly Nymph',
    tagline: 'Fat, ringed and goggle-eyed. Its hands are on its chin, and the chin shoots out.',
    backdrop: ['#4c9a8a', '#1a4a44'],
    draw: drawDragonflyNymph
  },
  {
    id: 'brinemaw',
    gore: 'bone',
    cycleMs: 1800,
    faces: 'right',
    anchor: 'centre',
    name: 'Toe-Biter',
    tagline: 'Giant water bug. Arms up, snorkel out, and a little green light hung out for company.',
    backdrop: ['#2e7d94', '#0f3246'],
    draw: drawToeBiter
  }
]

/**
 * What a design bleeds. `none` for anything with no design bound to it.
 *
 * Deliberately here rather than in `monsterSprites`: the simulation needs the
 * answer, and it has no business importing a module that bakes canvases.
 */
export const monsterGore = (id: string | null): GoreKind =>
  (id ? MONSTERS.find((m) => m.id === id)?.gore : undefined) ?? 'none'
