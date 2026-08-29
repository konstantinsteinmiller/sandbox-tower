// ─── Portal locale ─────────────────────────────────────────────────────────
//
// The display language a portal asks the game to use, and the rules that decide
// when it beats the player's own choice.
//
// **Platform state is not player state.** The portal re-reports its language on
// every single load, so persisting it buys nothing — but it makes "the portal
// said so" indistinguishable from "the player chose this". One load that misses
// the portal's answer writes a fallback that then out-ranks every later correct
// answer, and on a build with a cloud save that poisoned row syncs to every
// device: the bug survives a QA re-test on the same account. That is how the
// same localisation ticket gets filed twice.
//
// So the portal answer lives in a ref for the life of the session and is NEVER
// written to `ts_user_language`. The only thing that writes that key is the
// Options modal, and when it does it stamps a provenance flag beside it.
//
// Three rules, and they only work together:
//
//   1. **Explicit choice wins while the portal is STEADY.** A player who picked
//      Spanish keeps Spanish across reloads of an English portal.
//   2. **A portal CHANGE outranks a stored choice.** Playgama's guided testing
//      switches the language mid-session and grades whether the game followed;
//      "player choice always wins" fails that flow by design. A change also
//      clears the stored choice, so it cannot fight back on the next load.
//   3. **A stored value with no provenance flag loses to the portal.** Earlier
//      builds seeded the portal locale straight into the player-choice key.
//      Removing that write fixes new sessions but leaves every already-written
//      cloud row holding a portal locale where it outranks the portal forever.
//      Unflagged legacy rows lose, and self-heal the moment the player either
//      picks a language or the portal answers.

import { ref } from 'vue'
import { LANGUAGES } from '@/utils/enums'
import { getState, setState, removeState } from '@/use/useTowerState'
import { LANGUAGE_KEY, LANGUAGE_EXPLICIT_KEY } from '@/keys'

/**
 * The language the portal is currently asking for, normalised to a code this
 * game ships, or `null` when it has asked for nothing we can honour.
 *
 * Live for the whole session — the Playgama plugin polls `platform.language`
 * and republishes here, because no portal emits a language-change event and the
 * QA harness switches language without reloading the frame.
 */
export const portalLocale = ref<string | null>(null)

/** The portal value we have already acted on. A DIFFERENT value arriving later
 *  is the "change" that outranks a stored choice. */
let appliedPortalLocale: string | null = null

const isShipped = (code: string | null | undefined): code is string =>
  !!code && LANGUAGES.includes(code)

/** True once the player has picked a language in the Options modal on any
 *  device. The flag, not the value, is what makes the value theirs. */
export const hasExplicitLanguageChoice = (): boolean =>
  getState<unknown>(LANGUAGE_EXPLICIT_KEY) === true

/** Stamp the provenance flag. Called from the ONE setter the Options modal
 *  reaches — never from a portal or boot path. */
export const markLanguageChosenByPlayer = (): void => {
  setState(LANGUAGE_EXPLICIT_KEY, true)
}

/** Drop the stored choice and its provenance so the portal is authoritative
 *  again. Used when the portal switches language mid-session. */
export const clearStoredLanguageChoice = (): void => {
  removeState(LANGUAGE_EXPLICIT_KEY)
  removeState(LANGUAGE_KEY)
}

/**
 * Which locale should be on screen right now?
 *
 * `stored` is the player-choice value (already hydrated from the cloud).
 * `fallback` is what to use when neither side has an opinion — `'en'` on a
 * portal build, where the portal is the only legitimate hint and Playgama's
 * rules say the default is English; the browser language on a plain web build,
 * where no portal contract applies.
 *
 * Calling this is what "consumes" a portal change, so call it once per decision
 * and act on the result.
 */
export const resolveActiveLocale = (
  stored: string | null | undefined,
  fallback: string
): string => {
  const portal = portalLocale.value
  const storedOk = isShipped(stored) ? stored : null

  if (portal) {
    const changed = appliedPortalLocale !== null && appliedPortalLocale !== portal
    appliedPortalLocale = portal
    if (changed) {
      // Rule 2. The portal moved under us; the stored choice is stale.
      clearStoredLanguageChoice()
      return portal
    }
    // Rule 1 / Rule 3.
    if (storedOk && hasExplicitLanguageChoice()) return storedOk
    return portal
  }

  // No portal answer (yet, or ever — a plain web build). A stored value is the
  // best hint we have, flagged or not: with nothing to outrank it, honouring a
  // legacy row is strictly better than ignoring it.
  return storedOk ?? fallback
}

/** Test seam: forget which portal value we have already acted on. */
export const __resetPortalLocale = (): void => {
  appliedPortalLocale = null
  portalLocale.value = null
}
