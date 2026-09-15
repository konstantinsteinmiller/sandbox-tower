import { ref, type CSSProperties } from 'vue'

export type ShakeIntensity = 'small' | 'strong' | 'big'

/**
 * ─── Screen shake ───────────────────────────────────────────────────────────
 *
 * One translate on the battlefield canvas, decaying to nothing.
 *
 * "One" is the whole of the fix here. Every `triggerShake` used to start its
 * OWN `requestAnimationFrame` loop against a shared `shakeStyle`, and nothing
 * stopped the previous one — so during a wave, where hits, deaths and impacts
 * fire shakes several times a second, a dozen loops wrote a fresh random
 * offset to the same ref every frame and none of them ever reached the end of
 * its decay before the next arrived. The picture never settled. Worse, the
 * force curve carried a `+ 4` floor, so even a finished 'small' shake was
 * still displacing the canvas by up to ±2px: with loops overlapping, the
 * battlefield simply vibrated for the length of the battle.
 *
 * That is what "the screen keeps moving left and right on attacks" was — not
 * the portal's QA frame, and not one dramatic shake, but a constant low
 * jitter that never stopped.
 *
 * So: a single loop, and a new shake TAKES OVER rather than stacking. Taking
 * over is by force, not by recency — a boss dying mid-arrow-volley must not
 * have its shake downgraded by the next arrow landing — and the decay runs to
 * zero so the canvas is genuinely still between events.
 */

const REST: CSSProperties = {
  transform: 'translate(0px, 0px)',
  transition: 'transform 0.1s ease-out'
}

// Global, so every component and composable sees the same offset.
const shakeStyle = ref<CSSProperties>({
  transform: 'translate(0px, 0px)',
  // No transition DURING a shake: easing between two random points is what
  // makes a shake feel mushy rather than sharp.
  transition: 'none'
})

/** Peak displacement and how long it takes to reach zero, per intensity. */
const FORCE = { small: 5, strong: 14, big: 22 } as const
const DURATION = { small: 300, strong: 500, big: 700 } as const

/** The live shake, or null when the canvas is at rest. */
let active: { force: number; duration: number; start: number } | null = null
let frame = 0

const prefersReducedMotion = (): boolean => {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  } catch { return false }
}

const step = (now: number): void => {
  frame = 0
  const s = active
  if (!s) return

  const progress = (now - s.start) / s.duration
  if (progress >= 1) {
    active = null
    shakeStyle.value = REST
    return
  }

  // Linear decay to ZERO. The old curve added a constant 4px, which meant a
  // shake never actually finished — it just got quieter and stayed.
  const force = s.force * (1 - progress)
  const x = (Math.random() - 0.5) * force
  const y = (Math.random() - 0.5) * force
  shakeStyle.value = { transform: `translate(${x}px, ${y}px)`, transition: 'none' }
  frame = requestAnimationFrame(step)
}

export const useScreenshake = () => {
  const triggerShake = (intensity: ShakeIntensity = 'small'): void => {
    // A shaking viewport is a common migraine and nausea trigger, and this one
    // fires several times a second in a busy wave. The game reads identically
    // without it — every hit it punctuates has its own sound and its own
    // on-canvas effect.
    if (prefersReducedMotion()) return

    const force = FORCE[intensity]
    const duration = DURATION[intensity]
    const now = performance.now()

    // Take over only if this shake is at least as strong as what is left of the
    // one running. Otherwise the loudest moment in a fight — a boss dying — is
    // cut short by the next arrow that lands.
    if (active) {
      const remaining = active.force * Math.max(0, 1 - (now - active.start) / active.duration)
      if (force < remaining) return
    }

    active = { force, duration, start: now }
    if (!frame) frame = requestAnimationFrame(step)
  }

  return { shakeStyle, triggerShake }
}

export default useScreenshake
