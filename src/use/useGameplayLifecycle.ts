import { syncGameplayLifecycle as syncCrazyGameplay } from '@/use/useCrazyGames'
import { pokiGameplayStart, pokiGameplayStop } from '@/utils/pokiPlugin'
import { awaitingFirstInteraction, onFirstInteraction } from '@/use/useFirstInteraction'

/**
 * ─── "Is the player actually playing?" ──────────────────────────────────────
 *
 * Several portals want to be told when gameplay runs and when it stops — they
 * use it to time their own ad breaks, measure session quality, and (on
 * Playgama) to pass certification. The game has exactly one notion of that
 * state, so it should be reported from exactly one place: this fan-out, driven
 * by the `isLiveGameplay` watcher in the game scene.
 *
 * Before this existed only CrazyGames was wired. Playgama's `gameplay_started`
 * / `gameplay_stopped` messages were implemented, idempotent, and never called
 * once — the same class of miss the plugin's own comment flags for
 * `game_ready` ("an explicit rejection reason on the Playgama QA Tool").
 *
 * The platform test is written as a literal `import.meta.env` comparison rather
 * than through the `isPlaygama` helper, and that is load-bearing: Vite inlines
 * the literal, so Rollup folds the whole branch away and the Playgama chunk
 * stays out of every other platform's bundle. Routed through the imported
 * const, it cannot prove the branch is dead — the first version of this file
 * pulled `playgamaPlugin` into the CrazyGames build, which the playbook warns
 * about in as many words ("don't touch another platform's SDK in a build").
 * `main.ts` gates its Playgama init the same way.
 */

/**
 * What the game last reported.
 *
 * The gate below can DEFER an opening edge, and a deferred start must never
 * fire after the game has gone quiet again — a start reported into a modal or
 * an ad is worse than a late one.
 */
let wanted = false
/** Is a deferred open already queued behind the gate? */
let queued = false

/**
 * Report whether gameplay is live.
 *
 * The OPENING edge is held until the player has actually touched the game.
 * Poki enforces this by hand in QA, but it is the right rule on every portal:
 * this game boots straight into a live stage, so a start reported at mount
 * counts every bounce as a session — conversion-to-play is measured on the
 * first start, and inflating it makes the number useless to us and wrong for
 * them. On the Drop & Merge board it matters most, because wave 1 is already
 * walking in by the time the loader clears.
 *
 * Only the opening edge waits. A stop is always safe to report: every plugin
 * below no-ops a stop for a bracket it never opened.
 */
export const syncGameplayLifecycle = (live: boolean): void => {
  wanted = live

  if (live && awaitingFirstInteraction.value) {
    if (!queued) {
      queued = true
      // Registered once, and re-checks `wanted` when it fires: the player may
      // well open a modal before their first gesture reaches the battlefield.
      onFirstInteraction(() => {
        queued = false
        if (wanted) emitGameplayLifecycle(true)
      })
    }
    return
  }

  emitGameplayLifecycle(live)
}

const emitGameplayLifecycle = (live: boolean): void => {
  // No-ops unless this is a full CrazyGames release build.
  syncCrazyGameplay(live)

  if (import.meta.env.VITE_APP_PLAYGAMA === 'true') {
    // Dynamic, to keep the bridge out of every other platform's bundle. Both
    // calls are idempotent and no-op until the SDK is active, so an event that
    // lands before init is simply dropped rather than queued or duplicated.
    void import('@/utils/playgamaPlugin').then(({ playgamaGameplayStart, playgamaGameplayStop }) => {
      if (live) playgamaGameplayStart()
      else playgamaGameplayStop()
    }).catch(() => { /* bridge missing — nothing to report to */ })
  }

  if (import.meta.env.VITE_APP_POKI === 'true') {
    // STATIC import (see the top of this file), unlike the Playgama branch
    // above. `pokiPlugin` is small and side-effect-free at module scope, and a
    // static import cannot be mangled by the obfuscator's `stringArray` pass
    // the way a dynamic-import path literal can — and this file is NOT in the
    // obfuscator's exclude list. The env-literal `if` still lets esbuild fold
    // the branch and Rollup drop the import on every other build (verified by the
    // non-Poki bundle grep in the release checklist).
    //
    // Both calls are idempotent AND rate-guarded. That second property is
    // load-bearing here: `isLiveGameplay` is a computed over four reactive
    // inputs, so a modal closing in the same tick an ad opens can produce a
    // stop-then-start pair only microseconds apart. Poki's SDK scores any
    // start within 50 ms of a stop as a 'bad event', and at ten of them it
    // silently disables gameplayStart, gameplayStop AND commercialBreak for
    // the rest of the session. The plugin defers such a start past the window.
    if (live) pokiGameplayStart()
    else pokiGameplayStop()
  }
}
