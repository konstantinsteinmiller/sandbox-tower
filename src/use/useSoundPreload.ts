// Background SFX preload — fires AFTER first paint so it never competes
// with the critical path.
//
// Without this, every SFX pays its first-play decode cost the moment the
// game fires it — the first block placed lands silently, the first coin
// picked up arrives a beat late. The decode is cheap individually
// (1-5 ms per .ogg) but happens in a flurry of small bursts during the
// opening seconds of gameplay — exactly when the player is forming a
// first impression. Decoding everything once, on an idle callback,
// pushes that work off the rendering thread before it gets noticed.
//
// `loadAudioBuffer` is idempotent — repeat calls hit the cache or join
// the pending decode promise, so it's safe to call this preload more
// than once (e.g. on every GameScene mount). The visibility-hidden /
// ad-show suspend system in `useAssets.ts` doesn't affect decode — it
// only gates playback — so this works correctly even if the tab is
// backgrounded during preload.

import { prependBaseUrl } from '@/utils/function'
import { loadAudioBuffer, resourceCache } from '@/use/useAssets'
import { MUSIC_TRACK_FILES, DEFAULT_MUSIC_TRACK, type MusicTrack } from '@/use/useUser'
import { getState } from '@/use/useTowerState'
import { MUSIC_TRACK_KEY, MUSIC_KEY } from '@/keys'

// Every SFX the gameplay scene can actually fire, and nothing else. This list
// is the decode budget for the first idle slot after first paint, so a name
// that no call site plays costs a fetch + a decode + a resident AudioBuffer
// for a sound the player will never hear. Keep it in sync with the real call
// sites — `playSound(...)` literals plus `SAMPLE_CUES` in useTowerAudio.
//
// Ordered loudest-first-impression first: the cues a player hits within the
// opening seconds (placing a block, a hit landing, a coin) decode ahead of the
// end-of-wave celebrations they cannot reach for another minute.
// Adding a new SFX = add the basename here (no `.ogg`, no path prefix).
const GAMEPLAY_SFX: ReadonlyArray<string> = [
  // Fired constantly during a wave.
  'obstacle-hit',
  'barricade',
  'coin-pickup',
  'level-up',
  // UI chrome — a modal can open before the first wave does.
  'modal-open',
  'reward-continue',
  'happy',
  // End-of-wave / run-over stingers. Real, but minutes away.
  'celebration-1',
  'celebration-3',
  'lose'
]

let preloadStarted = false
let preloadDone: Promise<void> | null = null

/** Kick off background decode of every gameplay SFX. Idempotent; calling
 *  twice returns the SAME promise (resolves once every decode has settled), so
 *  callers can sequence work AFTER the sounds finish (e.g. warm the remaining
 *  ball skins only once audio is decoded). Off the critical path — the asset
 *  preloader runs it only after the hot-path art + first paint are done. */
export const preloadGameplaySounds = (): Promise<void> => {
  if (preloadDone) return preloadDone
  preloadStarted = true
  preloadDone = Promise.allSettled(
    GAMEPLAY_SFX.map((name) => loadAudioBuffer(prependBaseUrl(`audio/sfx/${name}.ogg`)))
  ).then(() => {
    // Music last, and only once the SFX are in. SFX are what the player hears
    // in the first ten seconds; the track has until the first wave starts.
    prefetchMusicTrack()
  })
  return preloadDone
}

/** Schedule `preloadGameplaySounds()` on the first available idle slot.
 *  Falls back to `setTimeout(0)` on browsers that don't expose
 *  `requestIdleCallback` (mostly Safari). Either path runs after the
 *  current animation frame so the first paint isn't delayed. */
export const schedulePreloadOnIdle = (): void => {
  if (preloadStarted) return
  if (typeof window === 'undefined') return
  const ric = (window as any).requestIdleCallback as
    | ((cb: () => void, opts?: { timeout: number }) => number)
    | undefined
  if (typeof ric === 'function') {
    ric(() => preloadGameplaySounds(), { timeout: 2000 })
  } else {
    setTimeout(() => preloadGameplaySounds(), 0)
  }
}

// ─── Background music: fetched on demand, AFTER the critical path ──────────
//
// The music track is the single biggest asset the game ships (~68 kB for the
// default cozy loop, ~150 kB for trance) and it is not needed to render a
// frame. It must therefore never be on the hot path — but it must also not be
// fetched cold at `startBattleMusic()`, because that lands the download in the one
// moment the player is watching: the first wave starting. The track then
// fades in a beat or two late, or not at all on a slow link.
//
// So: prefetch exactly ONE track — the one the player has selected — on the
// idle slot that opens once the SFX decode has settled, which is itself
// already behind first paint. The element lands in `resourceCache.audio`,
// which is precisely where `useSound.loadAndPlayTrack()` already looks
// first; on a hit it swaps the src in and fades immediately with no
// `canplaythrough` wait.
//
// Deliberately NOT decoded into an AudioBuffer: a 150 kB ogg decodes to
// several MB of PCM, and the music plays through an HTMLAudioElement anyway
// (it needs `loop`, `playbackRate` and the suspend registry). Letting the
// browser stream it from its own HTTP cache is both smaller and faster.

let musicPrefetchStarted = false

/** True when the player has silenced music. Prefetching a track they will
 *  never hear is pure waste — and on a metered connection, rude. */
const musicIsSilenced = (): boolean => {
  const v = getState<unknown>(MUSIC_KEY)
  if (v === undefined || v === null) return false
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isFinite(n) && n <= 0
}

/** Respect Data Saver and 2g-class links. The game is fully playable without
 *  music, so a constrained connection should spend its bytes on gameplay and
 *  let the track arrive lazily at `startBattleMusic()` instead. */
const connectionIsFrugal = (): boolean => {
  const c = (navigator as any).connection
  if (!c) return false
  if (c.saveData === true) return true
  return typeof c.effectiveType === 'string' && /(^|-)2g$/.test(c.effectiveType)
}

/**
 * Warm the selected background-music track into `resourceCache.audio` so the
 * first `startBattleMusic()` plays from cache instead of from the network.
 * Idempotent, never throws, and resolves as soon as the fetch is *started* —
 * nothing waits on the bytes.
 */
export const prefetchMusicTrack = (): void => {
  if (musicPrefetchStarted) return
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return
  musicPrefetchStarted = true
  if (musicIsSilenced() || connectionIsFrugal()) return

  const track = getState<MusicTrack>(MUSIC_TRACK_KEY) ?? DEFAULT_MUSIC_TRACK
  const file = MUSIC_TRACK_FILES[track] ?? MUSIC_TRACK_FILES[DEFAULT_MUSIC_TRACK]
  const src = prependBaseUrl(`audio/music/${file}`)
  if (resourceCache.audio.has(src)) return

  try {
    const el = new Audio()
    el.preload = 'auto'
    el.loop = true
    el.volume = 0
    el.src = src
    // Only publish it once it is genuinely usable. A half-arrived element in
    // the cache would make `loadAndPlayTrack` skip its own `canplaythrough`
    // wait and hand the player a silent first battle.
    el.addEventListener('canplaythrough', () => {
      resourceCache.audio.set(src, el)
    }, { once: true })
    // A 404 / decode failure must leave the cache empty so the on-demand path
    // in `loadAndPlayTrack` still runs normally.
    el.addEventListener('error', () => {
      resourceCache.audio.delete(src)
    }, { once: true })
    el.load()
  } catch {
    /* no media support — music falls back to the on-demand path */
  }
}
