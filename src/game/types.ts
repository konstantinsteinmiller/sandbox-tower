// ─── Tower Siege — core domain types ────────────────────────────────────────
//
// Pure data. No Vue, no DOM, no side effects — so the simulation is unit
// testable in isolation and the renderer can consume snapshots without
// reaching back into reactive state.
//
// World space: a cell is 1×1 world unit. `(c, r)` with `r = 0` on the ground
// and `+r` pointing UP. `c = 0` is the tower's centre column (where the Gate
// sits). The renderer owns the world→screen transform; nothing in here knows
// about pixels.

// ─── Blocks ─────────────────────────────────────────────────────────────────

export type BlockKind =
  | 'core' | 'structure' | 'weapon' | 'economy' | 'utility' | 'ship' | 'buff'

/** `bomb` and `fire` are dropped BY enemies onto the tower, not fired at them. */
/**
 * `bolt` is an ARROW — the archer post's and the ships'. `quarrel` is the siege
 * ballista's: a short, heavy iron-headed shaft off a machine, not off a bow.
 * They were one kind and therefore one drawing, which made the engine's shot
 * look like a stray arrow at the exact moment it matters most.
 */
export type ProjectileKind =
  | 'bolt' | 'quarrel' | 'ball' | 'shell' | 'zap' | 'frost' | 'bomb' | 'fire'

export type TargetingMode = 'nearest' | 'strongest' | 'lowest-hp'

export interface WeaponSpec {
  /** Damage per shot (before tech multipliers). */
  damage: number
  /** Milliseconds between shots (before fire-rate tech). */
  cooldownMs: number
  /** Reach in CELLS, measured from the block's centre. */
  range: number
  projectile: ProjectileKind
  /** Muzzle velocity in cells/second. `shell` ignores this (ballistic arc). */
  speed: number
  /** Splash radius in cells. Omitted = single target. */
  splash?: number
  /** Lightning only: how many extra enemies the bolt forks to. */
  chain?: number
  /** Frost only: slow strength (0..1) and duration. */
  slowPct?: number
  slowMs?: number
  targeting: TargetingMode
  /** Can this weapon hit flying enemies? Mortars cannot (they arc to ground). */
  hitsAir: boolean
  /**
   * Can this weapon hit a sea creature that has NOT surfaced?
   *
   * Everything on land is refused a submerged target — that is the sea lane's
   * whole threat. A hull sitting on the water is the exception: it is the one
   * platform with anything pointed downward, which is the entire reason to buy
   * a harbour.
   */
  hitsSubmerged?: boolean
  /**
   * Does height BELOW the muzzle cost this weapon range?
   *
   * Reach used to be a plain radius, `dx² + dy² ≤ range²`, for everything.
   * That makes a tower's own height eat its guns' ground coverage, and the
   * numbers are brutal: at a mount ten cells up, a Mortar loses 3.4 cells of
   * horizontal reach and an Archery post, a Cannon and a Bombard cannot reach
   * the ground AT ALL. So every mount above the third floor was an anti-air
   * emplacement whether the player wanted one or not, and building upward —
   * the thing this game is named after — was a straight downgrade.
   *
   * A weapon that throws a physical round does not work that way. An arrow, a
   * cannonball and a shell all fall, so firing DOWN from a height reaches at
   * least as far as firing flat; the launch solver in `fireShell` already
   * handles any `dy` it is handed. For these, only horizontal distance counts
   * against range once the target is at or below the muzzle.
   *
   * Left off for the two weapons that throw nothing: the Lightning Coil is a
   * hitscan bolt and the Frost Spire a chilling burst, and neither has an arc
   * to fall along. They keep the honest radius.
   */
  plunging?: boolean
}

export interface EconomySpec {
  /** Yield granted at the END of each cleared wave. */
  wood?: number
  stone?: number
  /**
   * META wallet coins — the tech-tree currency, banked immediately.
   *
   * Distinct from `gold` on purpose. These two are the game's two balances and
   * a producer has to say which one it fills; `mint` prints wallet coins and
   * `coffer` mints run gold, and reading them off one field would make the
   * difference invisible at the only place it is authored.
   */
  coins?: number
  /** RUN gold — the in-run currency that pays for block ranks. */
  gold?: number
}

/**
 * What a BUFF block does to the blocks around it.
 *
 * Applied to every orthogonal neighbour of the buff block's footprint, and
 * MULTIPLICATIVELY across however many of them a block is touching: two banners
 * either side of a cannon give 1.25² = 1.56, four give 2.44. That curve is the
 * whole point — it turns "where does this go" into the interesting question,
 * and rewards a tower built as a shape rather than as a pile.
 *
 * Armour is the exception and stacks ADDITIVELY, because armour is already a
 * flat subtraction with a 1-damage floor: multiplying it would either do
 * nothing or make a block immune, with very little in between.
 */
export interface BuffSpec {
  /** Multiplier applied to a neighbour's max HP and damage output. */
  statMul: number
  /** Flat armour added to a neighbour, summed across adjacent buffs. */
  armor: number
}

export interface UtilitySpec {
  /** Detonates when the block is destroyed. */
  deathExplosion?: { damage: number; radius: number }
  /** Heals every orthogonally adjacent block at the end of each wave. */
  repairPerWave?: number
  /** Reflects this much damage back at anything that melees the block. The
   *  spiked wall's entire identity — it does not shoot, it punishes contact. */
  thorns?: number
}

export interface BlockDef {
  id: string
  kind: BlockKind
  /**
    * Build cost. A missing resource means "free of that resource".
    *
    * `coins` is the RUN currency (kill drops), not the meta wallet. It is
    * carried only by the tech-gated blocks — see the note in `blocks.ts`.
    */
  cost: { wood?: number; stone?: number; coins?: number }
  hp: number
  /** Flat damage reduction applied to every incoming hit (min 1 damage). */
  armor?: number
  weapon?: WeaponSpec
  economy?: EconomySpec
  utility?: UtilitySpec
  buff?: BuffSpec
  /** Tech-tree node id that unlocks this block. Absent = available at start. */
  unlockNode?: string
  /**
   * Floats: may ONLY be placed on the water row, needs no support under it,
   * and holds nothing up. The tower's structural rules simply do not apply to
   * a hull, so it is flagged rather than special-cased at every call site.
   */
  waterOnly?: boolean
  /** Ordering weight in the build tray (lower = further left). */
  order: number
  /** Base palette key — the active theme remaps these. */
  palette: string
}

/** A placed block instance inside the live tower. */
export interface Block {
  /** Stable id, monotonically assigned. Used as a render/VFX correlation key. */
  uid: number
  c: number
  r: number
  typeId: string
  /** Capped with a gable — nothing may be placed in the cell directly above.
   *  Carried by the shape that placed it, not by the block type. */
  roof?: boolean
  /** Reinforced variant from the rewarded-ad hand: more HP, more damage, and a
   *  moving sheen so it is obvious which parts of the tower are the good ones. */
  enhanced?: boolean
  /** Ranks bought with run gold from the inspector. Raises HP, output and
   *  armour; dies with the run. Absent is the same as 0. */
  level?: number
  /**
   * Merge tier: 1 (a plain block), 2 or 3.
   *
   * Two adjacent blocks of the SAME type and SAME tier fuse into one of the
   * next tier. Absent is the same as 1.
   */
  tier?: number
  /**
   * Footprint in cells, anchored at `(c, r)` as the LOW corner.
   *
   * A merged block keeps every cell its halves occupied — it grows sideways or
   * upwards rather than collapsing into one square — so the tower never loses
   * frontage to a merge and WHERE the halves sat decides the shape you get.
   * Absent is the same as 1.
   */
  /**
   * Cached neighbour-buff multiplier and flat armour bonus.
   *
   * Derived, not authored: `refreshBuffs` recomputes both whenever the tower's
   * shape changes. Cached rather than queried per frame because the turret loop
   * and every damage calculation read them, and walking four neighbours per
   * block per hit is work the tower's shape has already decided.
   */
  buffMul?: number
  buffArmor?: number
  w?: number
  h?: number
  hp: number
  maxHp: number
  /** Weapon cooldown remaining, ms. */
  cd: number
  /** Set while the block is airborne after being orphaned by a collapse. */
  falling?: {
    /** Vertical offset from the grid position, in cells (negative = below). */
    dy: number
    vy: number
    /** Rotation for the tumble, radians. */
    rot: number
    vrot: number
    /** Horizontal drift. Kept at zero for orphan falls, which land back on the
     *  grid — a block that drifted sideways would settle in a column it never
     *  fell down. */
    dx: number
    vx: number
    /** Row the block fell FROM, so the landing damage knows the drop height. */
    fromRow?: number
    /**
     * A drop or a column-settle rather than a collapse: lands without damage,
     * without tumbling, and fuses into a twin it comes to rest on where the
     * active rules say so.
     */
    gentle?: boolean
  }
  /** 0..1 — 1 right after taking a hit, decays. Drives the white hit flash. */
  flash: number
  /** Remaining burn time in ms, set by a molotov. Ticks damage on its own. */
  burnMs?: number
  /** Burn damage per second while `burnMs` lasts. */
  burnDps?: number
  /** Placement animation clock in ms; drives the squash-stretch pop-in. */
  bornAt: number
  /**
   * Sim clock at which this block was last patched from the inspector, for the
   * per-block repair cooldown.
   *
   * Deliberately NOT in the run snapshot. It is a twenty-second lockout on one
   * block, and persisting it would mean a reload could hand back a cooldown
   * that has no wave left to matter in — while carrying it across the clock
   * reset a resume performs would be worse than not carrying it at all.
   */
  repairedAt?: number
  /** Recoil offset for weapons, in cells along the aim direction. Decays. */
  recoil: number
  /** Last aim angle in radians, kept so idle turrets don't snap back to 0. */
  aim: number
}

// ─── Enemies ────────────────────────────────────────────────────────────────

/** `sea` swims in the water in front of the tower and rears up to strike —
 *  it is neither walking on the ground nor flying, and weapons treat it as a
 *  surface target only while it is out of the water. */
export type EnemyMovement = 'ground' | 'air' | 'sea'

export interface EnemyDef {
  id: string
  hp: number
  /** Cells per second. */
  speed: number
  /** Damage per attack. */
  damage: number
  /** Milliseconds between attacks. */
  attackCooldownMs: number
  /** How close (in cells) the enemy must be to a block to attack it. */
  reach: number
  movement: EnemyMovement
  /** Coins dropped on death. */
  coins: number
  /** Wave-budget cost — the director spends its budget on these. */
  cost: number
  /** Earliest wave this enemy can appear in. */
  minWave: number
  /**
   * Which monster design draws this enemy.
   *
   * An array gives one type more than one body — the common ranks read as a
   * crowd rather than as a row of clones — picked deterministically from the
   * unit's uid so an individual never changes species mid-life.
   */
  monster?: string | string[]
  /** Suicide bomber: explodes on contact instead of attacking. */
  suicide?: { damage: number; radius: number }
  /** Fraction of incoming damage ignored when hit from the front. */
  frontArmorPct?: number
  /**
   * Fraction of a projectile's damage this enemy's plating turns aside, by
   * round type. `0.75` means arrows land for a quarter of their worth.
   *
   * Graded rather than binary, and that distinction is the whole design. A
   * blanket immunity invalidates a weapon outright: the tower retargets away
   * (see `pickTarget`), every archer the player owns becomes dead weight for
   * the duration, and any AREA attack aimed at the thing simply does nothing —
   * which reads as a bug, not as a rule. A heavy resist says the same thing
   * without lying: arrows still hit, they still chip, they are just a bad
   * answer, and the player is being pushed toward a better one rather than
   * locked out of acting.
   *
   * `1` is still available and still means absolute — `isImmuneTo` is defined
   * as exactly that — so the old behaviour is expressible where a unit really
   * should invalidate a weapon.
   */
  resist?: Partial<Record<ProjectileKind, number>>
  /**
   * Air bombardment.
   *
   * Ordinary flyers close to melee range, so a tall tower with anti-air on the
   * crown is safe from them. A bomber never descends: it cruises `altitude`
   * cells ABOVE the highest block and drops ordnance, which means height alone
   * stops being protection and the crown needs real coverage of its own.
   */
  bombRun?: {
    /** Cruising height above the target block, in cells. */
    altitude: number
    /** Splash radius of one dropped round. */
    splash: number
    /** Molotovs only: how long struck blocks burn, ms. */
    burnMs?: number
    /** Molotovs only: burn damage per second. */
    burnDps?: number
    /** Which projectile it drops. */
    ordnance: ProjectileKind
  }
  /** Draw scale relative to a 1-cell body. */
  scale: number
  palette: string
  /** Sea creatures only: how long the rear-up animation takes, ms. */
  surfaceMs?: number
  /**
   * Siege engine. These do not behave like infantry: they out-range the tower,
   * ignore the ground frontier, or carry other units up it — and each one has a
   * specific answer the player is expected to reach for.
   */
  siege?: {
    /** Stops this far out and bombards, instead of walking into contact. */
    standoff?: number
    /** Ignores the frontier and drives straight for the Gate. */
    targetsGate?: boolean
    /** Lets the units escorting it attack blocks this many rows up. */
    ladderHeight?: number
    /** Splash radius of its shot, in cells. */
    splash?: number
    /**
     * Throws a REAL round instead of applying its damage where it stands.
     *
     * A standoff engine used to hit by fiat: the blast bloomed on the target
     * the instant the cooldown elapsed, with nothing crossing the twelve cells
     * in between. The machine mimed a throw on its own unrelated clock and no
     * stone ever left it. Lobbed engines spawn a hostile ballistic round —
     * the same integrator the bombers already drop through — so the shot is a
     * thing that flies, arcs, and lands, and the arm that threw it is animated
     * from the same cooldown that spawned it.
     */
    lobbed?: boolean
    /**
     * Fires a flat, fast bolt that has to cross the gap.
     *
     * The alternative is damage resolving where the engine stands, which is
     * what the ballista did — and eight cells of nothing crossed reads as the
     * machine not shooting at all.
     */
    direct?: boolean
  }
  /** True for the every-10th-wave boss (drives the boss banner + music). */
  boss?: boolean
}

export interface Enemy {
  uid: number
  typeId: string
  /** World position — x in cells (can be fractional / off-grid), y in cells. */
  x: number
  y: number
  hp: number
  maxHp: number
  /** −1 = spawned on the right and walks left; +1 = spawned left, walks right. */
  dir: 1 | -1
  /** Attack cooldown remaining, ms. */
  cd: number
  /** uid of the block currently being attacked, or -1 while travelling. */
  targetUid: number
  /** Slow effect: remaining ms and strength (0..1). */
  slowMs: number
  slowPct: number
  /** 0..1 hit flash, decays. */
  flash: number
  /** Walk-cycle phase so legs/wings animate out of sync between individuals. */
  phase: number
  /** Death animation clock; > 0 means the enemy is dying and non-interactive. */
  dying: number
  /** Sea creatures only: 0 = fully submerged, 1 = fully reared up. Drives both
   *  the strike animation and whether land weapons can hit it. */
  surfaced?: number
  /** Wheel / arm rotation for siege engines, radians. */
  spin?: number
  /**
   * Horizontal displacement still owed from a shove, in cells (signed).
   *
   * Applied over a few frames rather than instantly: a boss that teleported two
   * cells sideways the moment a wall landed on it reads as a glitch, not as
   * being knocked back.
   */
  knockback?: number
  /**
   * Standing on the field, but not yet part of the fight.
   *
   * A dormant enemy does not move, does not attack, and — the part that matters
   * — cannot be TARGETED, so no gun picks it off while it waits. It is the
   * opening vanguard's whole mechanism (see `seedOpeningVanguard`): monsters
   * visible on the field from the first frame, held until the wave is called.
   *
   * Movement is already frozen during the build phase, because `fixedStep`
   * never reaches `stepEnemies` there. Targeting is NOT: turrets cool down and
   * fire between waves on purpose, so without this flag the tower would shoot
   * the vanguard away while a first-time player was still reading a coach mark.
   * `callWave` wakes every one of them.
   */
  dormant?: boolean
}

// ─── Allies ─────────────────────────────────────────────────────────────────

/**
 * A friendly unit bought with coins and sent out of the Gate.
 *
 * Cavalry exist because siege engines stand off beyond every turret's reach —
 * a purely static defence has no answer to a trebuchet parked at 20 cells. The
 * counter has to be something that LEAVES the tower.
 */
export interface Ally {
  uid: number
  typeId: string
  x: number
  y: number
  hp: number
  maxHp: number
  /** The FLANK this rider was sent to: +1 right, -1 left. Never changes.
   *  It decides which side's enemies the rider is allowed to target, so it
   *  cannot double as which way the horse is pointed. */
  dir: 1 | -1
  /**
   * Which way the rider is POINTED: +1 right, -1 left.
   *
   * Separate from `dir` because a rider does not only ride outward. An enemy
   * that gets past it is now between it and the tower, and the rider turns
   * round and chases back inward — while `dir` still says which flank it
   * belongs to. Mirroring the sprite by `dir` drew that retreat as a horse
   * galloping backwards, tail first, at whatever it was fighting.
   */
  facing: 1 | -1
  cd: number
  /** uid of the enemy being engaged, or -1 while riding out. */
  targetUid: number
  flash: number
  phase: number
  dying: number
  /** Remaining lifetime in ms — cavalry are a sortie, not a permanent army. */
  life: number
}

export interface AllyDef {
  id: string
  hp: number
  speed: number
  damage: number
  attackCooldownMs: number
  reach: number
  /** Coin price. */
  cost: number
  /** How long the sortie lasts before the riders return, ms. */
  lifeMs: number
  scale: number
  palette: string
}

// ─── Projectiles ────────────────────────────────────────────────────────────

export interface Projectile {
  uid: number
  kind: ProjectileKind
  x: number
  y: number
  vx: number
  vy: number
  damage: number
  splash: number
  /** Ballistic shells integrate gravity; direct-fire rounds do not. */
  ballistic: boolean
  /** Homing target uid for direct fire (-1 = dumb-fire toward last position). */
  targetUid: number
  /** Remaining lifetime in ms — a safety net so strays never leak. */
  life: number
  slowPct: number
  slowMs: number
  /** Source block, for attributing kills to the right turret (VFX + stats). */
  sourceUid: number
  /**
   * Merge tier of the gun that fired it, 1 for anything unmerged (and for
   * everything hostile). Read only by the renderer: a merged gun's round is
   * drawn bigger and haloed in the tier's colour, so the extra damage is
   * visible in flight rather than only on the target's health bar.
   */
  tier?: number
  /**
   * Dropped BY an enemy at the tower, rather than fired at one.
   *
   * A hostile round damages blocks and is ignored by the tower's own collision
   * checks — it is the same integrator running in the opposite direction, which
   * is why bomber ordnance gets a real falling arc instead of teleporting
   * damage onto the crown.
   */
  hostile?: boolean
  /** Hostile rounds only: burn to apply to whatever the blast catches. */
  burnMs?: number
  burnDps?: number
  /**
   * Hostile rounds only: uid of the enemy that threw it, -1 otherwise. Read
   * when the round lands on the Gate — if that blow ends the run, the thrower
   * is the one the defeat's spotlight crowns (see `killingBlow`).
   */
  byEnemy?: number
  /** Trail sample ring for the renderer (x,y pairs). */
  trail: number[]
}

// ─── Waves ──────────────────────────────────────────────────────────────────

/** One scheduled spawn: enemy type, which side, and when (ms into the wave). */
export interface SpawnOrder {
  typeId: string
  side: 1 | -1
  atMs: number
}

export interface WavePlan {
  wave: number
  orders: SpawnOrder[]
  /** Total enemies in the wave — drives the "ENEMIES: n" HUD counter. */
  total: number
  boss: boolean
}

// ─── Run / phase ────────────────────────────────────────────────────────────

export type Phase = 'build' | 'battle' | 'defeat'

/** Per-enemy-type kill tallies, shown on the wave-clear toast and the run
 *  summary (reference images 2 and 7). */
export type KillTally = Record<string, number>

/** The serialisable snapshot persisted under `ts_run`, so a reload (or a
 *  cross-device cloud hydrate) resumes the exact siege in progress. */
export interface RunSnapshot {
  wave: number
  wood: number
  stone: number
  runCoins: number
  kills: number
  killsByType: KillTally
  /** Compact tuples keep the blob small:
   *  `[c, r, typeId, hp, roof, enhanced, level, tier, w, h]`.
   *  The trailing fields are optional so older snapshots still load. */
  blocks: Array<[
    number, number, string, number,
    (0 | 1)?, (0 | 1)?, number?, number?, number?, number?
  ]>
  /** The four shape ids currently on offer. Persisted so a reload cannot be
   *  used to reroll a hand the player doesn't like. */
  offers: string[]
  /** Cleared waves banked toward the next Arrow Rain, as a whole count.
   *  Optional so older snapshots still load — they restore to a full charge,
   *  which is the forgiving direction. */
  arrowRain?: number
  /** Which rule set the run was played under. A snapshot from another mode is
   *  never restored; absent means the desktop rules. */
  rules?: string
  startedAt: number
}

// ─── Tech tree ──────────────────────────────────────────────────────────────

export type TechEffect =
  | { kind: 'unlock'; blockId: string }
  | { kind: 'damage'; pct: number }
  | { kind: 'fireRate'; pct: number }
  | { kind: 'range'; pct: number }
  | { kind: 'splash'; pct: number }
  | { kind: 'chain'; add: number }
  /** `firstPct`, when set, is what the FIRST rank grants on its own; every rank
   *  after it adds `pct` as usual. See `effectTotal` in `@/game/tech`. */
  | { kind: 'blockHp'; pct: number; firstPct?: number }
  | { kind: 'armor'; add: number }
  | { kind: 'gateHp'; pct: number }
  | { kind: 'startWood'; add: number }
  | { kind: 'startStone'; add: number }
  | { kind: 'waveReward'; pct: number }
  | { kind: 'coinDrop'; pct: number }
  | { kind: 'buildWidth'; add: number }
  | { kind: 'waveRepair'; pct: number }
  | { kind: 'thorns'; pct: number }
  | { kind: 'cavalryPower'; pct: number }
  | { kind: 'navalDamage'; pct: number }
  | { kind: 'navalHp'; pct: number }
  | { kind: 'dockWidth'; add: number }
  /** Extra damage for MERGED blocks only (tier 2 and 3). */
  | { kind: 'mergePower'; pct: number }
  /** Strengthens what a BUFF block's aura is worth, not how many it reaches. */
  | { kind: 'buffPower'; pct: number }
  /** Raises every economy block's end-of-wave yield. */
  | { kind: 'economyYield'; pct: number }

export interface TechNode {
  id: string
  /** Tier drives the vertical position in the tree layout. */
  tier: number
  /** Column within the tier — the layout is a hand-authored grid. */
  col: number
  maxLevel: number
  costBase: number
  costGrowth: number
  /** Price of rank 1, overriding the half-price rule in `techCost`. Later
   *  ranks still come off `costBase` × `costGrowth`. */
  firstCost?: number
  /** Node ids that must have at least level 1 before this one can be bought. */
  requires: string[]
  effect: TechEffect
  /** Glyph key the renderer maps to an inline SVG path. */
  icon: string
}
