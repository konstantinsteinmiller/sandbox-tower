<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { ENEMY_DEFS } from '@/game/enemies'
import {
  monsterAnchor, monsterFaces, monsterFrame, pickMonster, primeMonsterSprites,
  SPRITE_FOOT_R, SPRITE_HEIGHT_R
} from '@/game/monsterSprites'

/**
 * One monster, walking on the spot, in a square tile.
 *
 * The same frames the battlefield blits (`monsterFrame`), so the creature in a
 * pictogram is the creature that is about to walk in — never a stand-in icon
 * the player has to translate. Primed through the shared bake cache: on a board
 * that has already met this monster it costs nothing.
 *
 * The strip bakes asynchronously, so the first frames paint nothing; the loop
 * simply keeps asking until a frame exists. Under reduced motion it stops at
 * the first frame it can draw.
 */

interface Props {
  /** Enemy type whose design to show (its binding picks the body). */
  enemy?: string
  /** CSS px of the backing square; the stylesheet decides the shown size. */
  size?: number
  /** Which way it walks. The battlefield mirrors by travel; so does this. */
  facing?: 'left' | 'right'
  /** Offset into the walk cycle, so two tiles side by side do not march in step. */
  phase?: number
}

const props = withDefaults(defineProps<Props>(), {
  enemy: 'grunt',
  size: 64,
  facing: 'right',
  phase: 0
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0
let startMs = 0
const monsterId = pickMonster(ENEMY_DEFS[props.enemy]?.monster, 0)

const reducedMotion = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Draw one frame; true when a frame was actually available to draw. */
const paint = (ms: number): boolean => {
  const canvas = canvasRef.value
  if (!canvas || !monsterId) return false
  const frame = monsterFrame(monsterId, props.phase + ms / 900)
  if (!frame) return false
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const px = Math.round(props.size * dpr)
  if (canvas.width !== px) { canvas.width = px; canvas.height = px }
  const ctx = canvas.getContext('2d')
  if (!ctx) return false
  ctx.clearRect(0, 0, px, px)
  // The body fills ~80 % of the tile's height, feet on the floor of the tile.
  const k = (px * 0.8) / (frame.height * SPRITE_HEIGHT_R)
  const w = frame.width * k
  const h = frame.height * k
  const top = monsterAnchor(monsterId) === 'centre'
    ? px * 0.5 - h * 0.5
    : px * 0.94 - frame.height * SPRITE_FOOT_R * k
  ctx.save()
  ctx.translate(px * 0.5, 0)
  // Designs are authored facing right unless their def says otherwise.
  const facesLeft = monsterFaces(monsterId) === 'left'
  if ((props.facing === 'right') === facesLeft) ctx.scale(-1, 1)
  ctx.drawImage(frame, -w * 0.5, top, w, h)
  ctx.restore()
  return true
}

const loop = (now: number): void => {
  if (!startMs) startMs = now
  const drawn = paint(now - startMs)
  if (drawn && reducedMotion()) return
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  if (monsterId) primeMonsterSprites([monsterId])
  raf = requestAnimationFrame(loop)
})

onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template lang="pug">
  canvas.monster-tile(
    ref="canvasRef"
    :style="{ width: size + 'px', height: size + 'px' }"
    aria-hidden="true"
  )
</template>

<style scoped lang="sass">
.monster-tile
  display: block
  pointer-events: none
</style>
