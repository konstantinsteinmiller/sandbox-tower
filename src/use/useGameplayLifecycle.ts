import { syncGameplayLifecycle as syncCrazyGameplay } from '@/use/useCrazyGames'
import { pokiGameplayStart, pokiGameplayStop } from '@/utils/pokiPlugin'

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
export const syncGameplayLifecycle = (live: boolean): void => {
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
