/**
 * Reusable coin-explosion VFX.
 *
 * Coins burst outward from a source element, then fly toward a target
 * element (typically the CoinBadge in the HUD).
 */

import { prependBaseUrl } from '@/utils/function'
import useSounds from '@/use/useSound'

const { playSound } = useSounds()

// Bitmap coin sprite — same 20×20 footprint as the previous SVG so the
// burst geometry and badge fly-in math don't change. `prependBaseUrl`
// keeps the src valid on builds shipped under a non-root base path
// (wavedash CDN, itch-zip, …).
const COIN_HTML =
  `<img src="${prependBaseUrl('images/props/coin_128x128.webp')}" alt="" draggable="false" ` +
  'style="width:20px;height:20px;display:block;user-select:none;" />'

/**
 * Anything a template ref can hand back and still mean "this thing on screen".
 *
 * `ref="x"` on a COMPONENT gives Vue's public instance, not the element — the
 * two are indistinguishable at the call site and the difference only shows up
 * as `getBoundingClientRect is not a function`, inside a click handler, after
 * the reward has already been granted. Every entry point here takes the loose
 * type and resolves it, so a caller cannot get this wrong.
 */
export type CoinExplosionAnchor =
  | HTMLElement
  | { $el?: unknown }
  | null
  | undefined

/** The DOM element behind a template ref, or null if there isn't one. */
export const resolveAnchor = (a: CoinExplosionAnchor): HTMLElement | null => {
  if (!a) return null
  if (a instanceof HTMLElement) return a
  const el = (a as { $el?: unknown }).$el
  return el instanceof HTMLElement ? el : null
}

export interface CoinExplosionOptions {
  /** Element the coins burst out of. */
  sourceEl: CoinExplosionAnchor
  /** Element the coins fly toward (e.g. CoinBadge). */
  targetEl: CoinExplosionAnchor
  /** Number of coins to spawn (default 20). */
  count?: number
  /** Max burst radius in px (default 120). */
  burstRadius?: number
}

export function spawnCoinExplosion(opts: CoinExplosionOptions) {
  const { count = 20, burstRadius = 120 } = opts
  const sourceEl = resolveAnchor(opts.sourceEl)
  const targetEl = resolveAnchor(opts.targetEl)
  // Decoration is never worth a thrown exception: the coins have already been
  // banked by the time this runs, so a missing anchor drops the animation and
  // leaves the claim intact.
  if (!sourceEl || !targetEl) return

  playSound('happy', 0.08)

  const sourceRect = sourceEl.getBoundingClientRect()
  const cx = sourceRect.left + sourceRect.width / 2
  const cy = sourceRect.top + sourceRect.height / 2

  const els: HTMLDivElement[] = []
  const angles: number[] = []
  const distances: number[] = []
  const staggerDelays: number[] = []

  const container = document.getElementById('app') || document.body

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    el.innerHTML = COIN_HTML
    el.style.cssText =
      'position:absolute;left:0;top:0;pointer-events:none;z-index:100;will-change:transform,opacity;'
    el.style.transform = `translate(${cx - 10}px,${cy - 10}px)`
    container.appendChild(el)
    els.push(el)
    angles.push(Math.random() * Math.PI * 2)
    distances.push(40 + Math.random() * (burstRadius - 40))
    staggerDelays.push(Math.random() * 300)
  }

  const startTime = performance.now()
  const explodeDuration = 600
  const flyDuration = 500

  let flyStartPositions: { x: number; y: number }[] | null = null
  let tx = 0
  let ty = 0

  const animate = (now: number) => {
    const elapsed = now - startTime

    if (elapsed < explodeDuration) {
      const progress = elapsed / explodeDuration
      for (let i = 0; i < count; i++) {
        const x = cx - 10 + Math.cos(angles[i]!) * distances[i]! * progress
        const y = cy - 10 + Math.sin(angles[i]!) * distances[i]! * progress
        els[i]!.style.transform = `translate(${x}px,${y}px)`
      }
      requestAnimationFrame(animate)
    } else {
      if (!flyStartPositions) {
        const badgeRect = targetEl.getBoundingClientRect()
        flyStartPositions = els.map((_, i) => ({
          x: cx - 10 + Math.cos(angles[i]!) * distances[i]!,
          y: cy - 10 + Math.sin(angles[i]!) * distances[i]!
        }))
        tx = badgeRect.left + badgeRect.width / 2 - 10
        ty = badgeRect.top + badgeRect.height / 2 - 10
      }

      const flyElapsed = elapsed - explodeDuration
      let allDone = true

      for (let i = 0; i < count; i++) {
        const localElapsed = flyElapsed - staggerDelays[i]!
        if (localElapsed < 0) {
          allDone = false
          continue
        }
        const t = Math.min(1, localElapsed / flyDuration)
        const ease = t * t
        const sx = flyStartPositions[i]!.x
        const sy = flyStartPositions[i]!.y
        const x = sx + (tx - sx) * ease
        const y = sy + (ty - sy) * ease
        els[i]!.style.transform = `translate(${x}px,${y}px)`
        els[i]!.style.opacity = String(1 - ease)
        if (t < 1) allDone = false
      }

      if (!allDone) {
        requestAnimationFrame(animate)
      } else {
        for (const el of els) el.remove()
      }
    }
  }
  requestAnimationFrame(animate)
}
