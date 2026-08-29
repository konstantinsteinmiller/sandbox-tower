// ─── Interstitial pacing clock ─────────────────────────────────────────────
//
// ONE clock for every interstitial the game can show — the wave-clear break,
// the one in front of the defeat screen, and the first-play placement some
// networks require at boot. Portals reject builds that stack breaks back to
// back, and "at least N seconds since the last one" is only a rule if every
// placement is measured against the same instant.
//
// **Zero-dependency leaf module on purpose.** The natural home for this was
// `useAdGate`, but `useAdGate` imports `useAds` — so `useAds` could not mark
// the clock itself without an import cycle, and every placement had to
// remember to do it by hand. Here, `useAds.showMidgameAd` stamps the clock for
// every interstitial that is ever requested, from any call site, and the gate
// in `useAdGate` reads the same value. Keep this file importing nothing.

/**
 * Minimum gap between interstitials, ms.
 *
 * 121 s, not 120: the Playgama bridge ships with
 * `minimumDelayBetweenInterstitial: 120`, and a request that lands exactly on
 * its boundary is a coin toss between "shown" and "refused for pacing". A
 * second of headroom means every request we make is one the network has
 * already agreed to serve.
 */
export const INTERSTITIAL_MIN_GAP_MS = 121_000

/**
 * When the pacing clock last restarted.
 *
 * Seeded at module load — i.e. at session start — rather than left at 0 and
 * lazily started on the first *opportunity*. Two reasons. The gap portals
 * grade is "time since the last break", and the start of a session is a break
 * boundary in exactly that sense, so the opening 121 s are protected without a
 * special case. And the old lazy start meant the first opportunity was always
 * refused however late it came: a player who reached wave 12 before their first
 * wave clear got a whole ad-free run nobody chose to give them.
 */
let lastInterstitialAt = Date.now()

/** Has any interstitial been requested yet in this session? */
let shownThisSession = false

/**
 * True when an interstitial may be shown right now.
 *
 * `firstIsExempt` opts a placement into taking the session's OPENING break
 * regardless of the clock. Only the defeat screen passes it, and the reasoning
 * is about what the gap is protecting. The floor exists so breaks do not stack;
 * before the first one there is nothing to stack against, and the end of a
 * player's first run is the moment they are least likely to resent one — they
 * have finished something, and the screen behind the ad is a results screen
 * they will read for a while anyway.
 *
 * Making the wave-clear break wait, and only the defeat break exempt, is
 * deliberate: otherwise a fast first wave spends the opening break 40 seconds
 * in, on a player who has not yet finished anything.
 *
 * The exemption is spent by the first interstitial from ANY placement, so
 * "the first one is free" can never mean two ads close together — once one has
 * gone out, everything is back on the clock.
 */
export const canShowInterstitial = (
  opts: { firstIsExempt?: boolean } = {}
): boolean => {
  if (opts.firstIsExempt && !shownThisSession) return true
  return Date.now() - lastInterstitialAt >= INTERSTITIAL_MIN_GAP_MS
}

/**
 * Restart the clock, and spend the session's opening exemption. Called by
 * `useAds.showMidgameAd` for every interstitial request, so a placement that
 * never consults `canShowInterstitial` (the boot-time first-play ad) still
 * resets "time since the last break" for the ones that do — and still counts
 * as the session's first break.
 *
 * A no-fill counts. The network was asked, the pacing budget was spent, and a
 * game that retries a refused request every few seconds is exactly the
 * behaviour portals reject builds for.
 */
export const markInterstitialShown = (): void => {
  shownThisSession = true
  lastInterstitialAt = Date.now()
}

/** Seconds until the next interstitial is allowed — debug/telemetry only. */
export const interstitialCooldownLeft = (): number =>
  Math.max(0, INTERSTITIAL_MIN_GAP_MS - (Date.now() - lastInterstitialAt)) / 1000

/** Test seam: restart the pacing clock as if the session had just begun —
 *  opening exemption included. */
export const __resetInterstitialClock = (): void => {
  shownThisSession = false
  lastInterstitialAt = Date.now()
}
