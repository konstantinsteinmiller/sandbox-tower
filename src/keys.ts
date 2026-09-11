// ─── Game-state field catalogue ─────────────────────────────────────────────
//
// Field names INSIDE the single `tower_state` blob (see `useTowerState.ts`).
// These are NOT separate localStorage keys — they are properties of the one
// persisted object — but they are still a contract with the player base:
// renaming any of them strands existing players' progress on the old field.
// Treat them as load-bearing constants.
//
// Everything is `ts_`-prefixed so `SaveMergePolicy.isPayloadKey` can allowlist
// the whole surface with a single prefix.

// ─── Meta progression ───────────────────────────────────────────────────────

/** Meta currency, banked at run end and spent in the tech tree. */
export const COINS_KEY = 'ts_coins'
/** Tech-tree node levels: `{ levels: Record<nodeId, number> }`. */
export const TECH_KEY = 'ts_tech'
/** Highest wave the player has ever survived (the headline progress number). */
export const BEST_WAVE_KEY = 'ts_best_wave'
/** Tallest tower ever built, in rows. */
export const BEST_HEIGHT_KEY = 'ts_best_height'
/** Most blocks ever standing in one tower. */
export const BEST_BLOCKS_KEY = 'ts_best_blocks'
/** Lifetime enemies killed. */
export const TOTAL_KILLS_KEY = 'ts_total_kills'
/** Lifetime waves cleared (across all runs). */
export const TOTAL_WAVES_KEY = 'ts_total_waves'
/** Lifetime runs started. */
export const RUNS_KEY = 'ts_runs'
/** Lifetime blocks placed. */
export const TOTAL_BLOCKS_KEY = 'ts_total_blocks'
/** Lifetime coins earned (achievement metric, never decremented by spending). */
export const TOTAL_COINS_KEY = 'ts_total_coins'
/** Best leaderboard score ever posted: kills in one run, bosses worth five. */
export const BEST_SCORE_KEY = 'ts_best_score'
/**
 * Display name submitted with a leaderboard score.
 *
 * Three slots, deliberately separate, because they have different lifetimes and
 * a strict precedence: a name the player CHOSE outranks one a portal SDK
 * supplies, which outranks the generated fallback. Collapsing them into one
 * field means an SDK name can never take over from the generated one — the
 * first thing written wins forever.
 */
/** Chosen by the player. Highest precedence, never overwritten by us. */
export const PLAYER_NAME_KEY = 'ts_player_name'
/** Last display name a portal SDK gave us; remembered so a momentary SDK
 *  outage doesn't drop the player back to their anonymous name. */
export const SDK_NAME_KEY = 'ts_sdk_name'
/** Generated once for players with no account and no SDK: "Anonymous123456". */
export const ANON_NAME_KEY = 'ts_anon_name'
/** The name the leaderboard row currently shows, so a better one can be sent
 *  up when it finally resolves. */
export const POSTED_NAME_KEY = 'ts_posted_name'
/** Stable anonymous id for this save, used as the leaderboard row key. */
export const PLAYER_ID_KEY = 'ts_player_id'
/** Highest score this device has successfully posted to the board. Lets a best
 *  raised by a cloud hydrate reach the board without re-posting every run. */
export const SUBMITTED_SCORE_KEY = 'ts_submitted_score'

// ─── The resumable run ──────────────────────────────────────────────────────

/**
 * Snapshot of the in-progress siege, written at every build-phase entry:
 * `{ wave, wood, stone, runCoins, kills, killsByType, blocks: [[c,r,type,hp]] }`.
 * A reload (or a cross-device cloud hydrate) resumes the exact tower instead of
 * dumping the player back to a fresh foundation.
 */
export const RUN_KEY = 'ts_run'

// ─── The mobile-fit game (Drop & Merge) ─────────────────────────────────────
//
// Its own run, tree, record and onboarding — a five-column drop board and the
// desktop's open tower are different games, and a save from one must never be
// restored into the other. The WALLET (`ts_coins`) and the lifetime counters
// are deliberately shared: progress follows the player across devices.

export const M2_RUN_KEY = 'ts_m2_run'
export const M2_TECH_KEY = 'ts_m2_tech'
export const M2_BEST_WAVE_KEY = 'ts_m2_best_wave'
export const M2_ONBOARDED_KEY = 'ts_m2_onboarded'
export const M2_TUTORIAL_KEY = 'ts_m2_tutorial'
export const M2_TECH_INTRO_KEY = 'ts_m2_tech_intro'

// ─── Retention systems ──────────────────────────────────────────────────────

/** Daily missions: `{ day: 'YYYY-MM-DD', missions: Mission[] }` (regen per day). */
export const MISSIONS_KEY = 'ts_missions'
/** Achievements: `{ claimed: string[], stats: {...} }`. */
export const ACHIEVEMENTS_KEY = 'ts_achievements'
/** First-run-of-day 2× bonus bookkeeping: the local day it was last consumed. */
export const DAILY_BONUS_DAY_KEY = 'ts_daily_bonus_day'
/** Battle pass: `{ xp, claimed: number[], seasonStart }`. */
export const BATTLE_PASS_KEY = 'ts_battle_pass'
/** Daily login rewards: `{ streak, lastClaimDay }`. */
export const DAILY_REWARDS_KEY = 'ts_daily_rewards'
/** Idle treasure chest: `{ readyAt }`. */
export const CHEST_KEY = 'ts_chest'
/** `{ day, coins }` — how much the chest has paid out today. See its daily cap. */
export const CHEST_DAY_KEY = 'ts_chest_day'
/** Rewarded-ad button cooldown timestamp. */
export const AD_COOLDOWN_KEY = 'ts_ad_cooldown'
/** How many of the house's free rewarded grants this player has spent. */
export const FREE_REWARDS_KEY = 'ts_free_rewards'

// ─── Gift pieces (the flying chest, the first-clear present) ────────────────
//
// One of each per board, like the run itself: a gift is a piece for THIS
// siege, and a tier-2 mortar won on the phone has no business turning up in
// the tower game. See `src/use/useGifts.ts`.

/** Gifts won but not yet placed in the run in progress: `Gift[]`. */
export const GIFTS_KEY = 'ts_gifts'
export const M2_GIFTS_KEY = 'ts_m2_gifts'
/** The one-time present for clearing wave 3 has been given. */
export const FIRST_CLEAR_GIFT_KEY = 'ts_first_clear_gift'
export const M2_FIRST_CLEAR_GIFT_KEY = 'ts_m2_first_clear_gift'

// ─── Onboarding / one-shot UI nudges ────────────────────────────────────────

/** First-run onboarding consumed flag (true once the first run finishes). */
export const ONBOARDED_KEY = 'ts_onboarded'
/** First-stage tutorial seen. Separate from ONBOARDED so the coach marks and
 *  the control hints can retire independently. */
export const TUTORIAL_KEY = 'ts_tutorial'
/** One-time "you can afford a tech node" spotlight on the Tech button. */
export const TECH_SPOTLIGHT_KEY = 'ts_tech_spotlight_seen'
/**
 * Has the player ever opened the tech tree at all?
 *
 * Distinct from `TECH_SPOTLIGHT_KEY`, which fires only once there is something
 * AFFORDABLE to spend on — a moment that can arrive many runs in, or never.
 * This one drives the "there is a tech tree, go and look at it" nudge that
 * starts after wave 1, and it is shared by both boards: a player who found the
 * tree on the phone must not be nagged about it again on the desktop.
 */
export const TECH_FOUND_KEY = 'ts_tech_found'
/** Rotating cursor into the defeat-screen tip pool, so two deaths in a row
 *  never teach the same thing twice. */
export const TIP_CURSOR_KEY = 'ts_tip_cursor'
/** One-time tech-tree intro, shown when the tree is first opened from a defeat.
 *  Separate from the spotlight: the spotlight says "there is a button", the
 *  intro says what the screen behind it is FOR. */
export const TECH_INTRO_KEY = 'ts_tech_intro'
/** Which control hints the player has already followed (bitmask-ish string[]). */
export const HINTS_SEEN_KEY = 'ts_hints_seen'
/**
 * The collapse-trap demonstration has been shown.
 *
 * Separate from `TUTORIAL_KEY` because it is taught at a different MOMENT and
 * for a different reason: the coach marks run before the first wave and teach
 * the controls, this one runs after the first DEATH and teaches the trick that
 * makes the physics worth exploiting. Folding them into one flag meant a player
 * who finished the coach marks was counted as having been shown the trap, and
 * the best thing in the game stayed undiscovered for hours of play.
 */
export const TRAP_TUTORIAL_KEY = 'ts_trap_tutorial'
/**
 * The merge-ladder pictogram has been shown.
 *
 * Its own flag rather than a tutorial index, because the beat is CONDITIONAL —
 * a board that offered the first cannon no fusing neighbour never reaches it —
 * and a player who was skipped past it on their first run should still meet it
 * the first time they actually fuse something.
 */
export const MERGE_GUIDE_KEY = 'ts_merge_guide'

// ─── User settings ──────────────────────────────────────────────────────────

export const SOUND_KEY = 'ts_user_sound_volume'
export const MUSIC_KEY = 'ts_user_music_volume'
export const LANGUAGE_KEY = 'ts_user_language'
/** Provenance for LANGUAGE_KEY: `true` only when the PLAYER picked a language
 *  in the Options modal. Portals re-report their language on every load, so a
 *  value with no flag beside it is assumed to be a portal seed written by an
 *  older build and loses to the live portal answer. Without this, one poisoned
 *  cloud row outranks the portal forever — the localisation ticket that keeps
 *  coming back. See `usePortalLocale`. */
export const LANGUAGE_EXPLICIT_KEY = 'ts_user_language_explicit'
export const DIFFICULTY_KEY = 'ts_user_difficulty'
export const MUSIC_TRACK_KEY = 'ts_user_music_track'
/** Mobile-only hard audio mute (boolean). On phones the OS volume rocker owns
 *  the device level and the Web Audio gain has no effect, so the on-screen mute
 *  is a silence toggle instead: suspend all audio + block new music/SFX. */
export const MOBILE_MUTE_KEY = 'ts_mobile_mute'
