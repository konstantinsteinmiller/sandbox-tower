<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { blockDef } from '@/game/blocks'
import { ENEMY_DEFS } from '@/game/enemies'
import { setArtOverrides, artOverridesEnabled, themedPalette } from '@/game/art'
import { stripFrame } from '@/game/spriteStrip'
import { drawSiegeMachine } from '@/game/siegeArt'
import { drawCavalry, cavalryCycle01 } from '@/game/cavalryArt'
import {
  monsterFrame, monsterFaces, monsterAnchor, primeMonsterSprites, allMonsterIds,
  SPRITE_FOOT_R, SPRITE_HEIGHT_R
} from '@/game/monsterSprites'
import {
  paintWorldBlock, paintLiveFixture, paintShipBlock,
  SIEGE_ART_BOX, ALLY_ART_BOX
} from '@/use/useTowerArt'

/**
 * ─── Playground ─────────────────────────────────────────────────────────────
 *
 * Every drawable the art pipeline can replace, on one screen, moving.
 *
 * It exists because the alternative was playing the game to look at the art:
 * a fixture that only appears on wave 11 needs eleven waves of clicking before
 * anyone can see whether it sits on its block, and a siege engine needs a run
 * that survives long enough to be besieged. Every scaling bug this pipeline has
 * produced — a cannon a block and a quarter long, a hull floating a fifth of a
 * cell above its own waterline, a bow the colour of the crate under it — was
 * visible in one frame once the thing was actually on screen. Getting it on
 * screen was the expensive part.
 *
 * TWO RULES, and they are what make it worth having:
 *
 *   1. It calls the BATTLEFIELD'S painters, not lookalikes. `paintLiveFixture`
 *      is the same cache the tower blits from, `monsterFrame` is the same strip
 *      lookup, `paintShipBlock` goes through `drawShip` and its own probe. A
 *      scene drawn from a private copy of the geometry would agree with itself
 *      and prove nothing.
 *   2. The art layer can be flipped live. A painted part is only wrong RELATIVE
 *      to the drawing it replaces, and A/B on one key is the whole diagnosis:
 *      the cannon looked fine until it sat beside the barrel it stands in for.
 *
 * Dev only, and out of every portal build — see the router.
 */

const canvas = ref<HTMLCanvasElement | null>(null)
const painted = ref(artOverridesEnabled())
const outlines = ref(true)
const running = ref(true)

/** One block, px. Big enough to judge a fixture, small enough to fit the cast. */
const CELL = 96
const PAD = 26
const LABEL = 15

/** The blocks whose fixture can be repainted, in the order they read best. */
const FIXTURES = [
  'cannon', 'archer', 'mortar', 'bombard', 'tesla', 'frost', 'spikes',
  'banner', 'obelisk', 'lumberHut', 'stonepit', 'coffer', 'repair'
]

const SIEGE = ['ballista', 'catapult', 'trebuchet', 'ram', 'ironRam', 'siegeTower']
const SHIPS = ['skiff', 'longship', 'galley']
const ARM_ENGINES = new Set(['ballista', 'catapult', 'trebuchet'])

let raf = 0
let t0 = 0

const label = (
  ctx: CanvasRenderingContext2D, text: string, x: number, y: number
): void => {
  ctx.font = `${LABEL}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillStyle = '#8d9bb0'
  ctx.fillText(text, x, y)
}

/** The box a thing is allowed to occupy. Overflow is the commonest fault here,
 *  and it is invisible without something to overflow. */
const cellBox = (
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number
): void => {
  if (!outlines.value) return
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.setLineDash([4, 4])
  ctx.lineWidth = 1
  ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h))
  ctx.restore()
}

const heading = (
  ctx: CanvasRenderingContext2D, text: string, x: number, y: number
): void => {
  ctx.font = '600 13px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#5f6b7e'
  ctx.fillText(text.toUpperCase(), x, y)
}

const paint = (now: number): void => {
  const cv = canvas.value
  if (!cv) return
  const ctx = cv.getContext('2d')
  if (!ctx) return
  if (!t0) t0 = now
  const t = running.value ? now - t0 : 0

  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const W = cv.clientWidth, H = cv.clientHeight
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
    cv.width = Math.round(W * dpr)
    cv.height = Math.round(H * dpr)
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#141922'
  ctx.fillRect(0, 0, W, H)

  const perRow = Math.max(6, Math.floor((W - PAD * 2) / (CELL + PAD)))
  let y = 34

  // ── Fixtures, on their own blocks, sweeping through their firing arc ──
  //
  // The aim sweep is the point: a barrel that fits at rest can still swing out
  // over the neighbouring column, and that only shows at the extremes.
  heading(ctx, `fixtures — aim sweeping · ${painted.value ? 'PAINTED' : 'drawn'}`, PAD, y)
  y += 16
  const aim = Math.sin(t / 1400) * 0.9
  FIXTURES.forEach((id, i) => {
    const col = i % perRow, row = Math.floor(i / perRow)
    const x = PAD + col * (CELL + PAD)
    const cy = y + row * (CELL + PAD + LABEL + 12) + CELL / 2
    // The world's own block face — the painted base once it has decoded —
    // not the bench's tray tile, which is a different drawing with a
    // coloured rim and does not stand in any tower.
    paintWorldBlock(ctx, id, x, cy - CELL / 2, CELL)
    cellBox(ctx, x, cy - CELL / 2, CELL, CELL)
    paintLiveFixture(ctx, id, x + CELL / 2, cy, CELL, {
      aim, t, uid: i, col: i % 2 === 0 ? 1 : -1
    })
    label(ctx, id, x + CELL / 2, cy + CELL / 2 + LABEL + 2)
  })
  y += Math.ceil(FIXTURES.length / perRow) * (CELL + PAD + LABEL + 12) + 10

  // ── Monsters, walking ──
  //
  // Blitted by the same arithmetic `drawEnemy` uses — scaled off the frame the
  // strip handed back rather than off the bake's pixel constants, and lined up
  // by the FEET — so a design that hovers here hovers in the game.
  heading(ctx, 'monsters — one walk cycle', PAD, y)
  y += 16
  const ids = allMonsterIds()
  const mS = CELL
  ids.forEach((id, i) => {
    const col = i % perRow, row = Math.floor(i / perRow)
    const x = PAD + col * (CELL + PAD) + CELL / 2
    const cy = y + row * (CELL + PAD + LABEL + 12) + CELL / 2
    const frame = monsterFrame(id, t / 900)
    cellBox(ctx, x - CELL / 2, cy - CELL / 2, CELL, CELL)
    if (frame) {
      ctx.save()
      ctx.translate(x, cy)
      if (monsterFaces(id) === 'left') ctx.scale(-1, 1)
      const k = (mS * 1.3) / (frame.height * SPRITE_HEIGHT_R)
      const w = frame.width * k, h = frame.height * k
      const top = monsterAnchor(id) === 'centre'
        ? -h * 0.5
        : mS * 0.5 - frame.height * SPRITE_FOOT_R * k
      ctx.drawImage(frame, -w * 0.5, top, w, h)
      ctx.restore()
    }
    label(ctx, id, x, cy + CELL / 2 + LABEL + 2)
  })
  y += Math.ceil(ids.length / perRow) * (CELL + PAD + LABEL + 12) + 10

  // ── Siege engines: chassis and arm, on their own clocks ──
  //
  // The two layers are the whole reason these are worth watching move: the
  // chassis is keyed to distance travelled and the arm to the machine's reload,
  // so a painted arm that has drifted off the chassis shows up as a beam that
  // swings out of its own frame.
  heading(ctx, 'siege — chassis + arm', PAD, y)
  y += 16
  const sBox = CELL * 1.35
  SIEGE.forEach((id, i) => {
    const x = PAD + i * (sBox + PAD) + sBox / 2
    const cy = y + sBox / 2
    const def = ENEMY_DEFS[id]
    if (!def) return
    const s = sBox / SIEGE_ART_BOX
    const cycle = (t / 2000) % 1
    const spin = t / 900
    cellBox(ctx, x - sBox / 2, cy - sBox / 2, sBox, sBox)
    const chassis = stripFrame('siege', id, 1, spin / (Math.PI * 2))
    ctx.save()
    ctx.translate(x, cy)
    if (chassis) {
      ctx.drawImage(chassis, -sBox / 2, -sBox / 2, sBox, sBox)
      const arm = ARM_ENGINES.has(id) ? stripFrame('siegeArm', id, 1, cycle) : null
      if (arm) ctx.drawImage(arm, -sBox / 2, -sBox / 2, sBox, sBox)
      else {
        drawSiegeMachine(ctx, id, s, themedPalette(def.palette), {
          spin, engaged: true, t, cycle, layer: 'moving'
        })
      }
    } else {
      drawSiegeMachine(ctx, id, s, themedPalette(def.palette), {
        spin, engaged: true, t, cycle
      })
    }
    ctx.restore()
    label(ctx, id, x, cy + sBox / 2 + LABEL + 2)
  })
  y += sBox + PAD + LABEL + 12

  // ── Ships and the rider ──
  //
  // A hull carries its deck weapon live, so this is also where a gun that has
  // come adrift from the boat under it shows.
  heading(ctx, 'ships — hull + live deck gun · cavalry — gallop', PAD, y)
  y += 16
  const shipBox = CELL * 1.6
  SHIPS.forEach((id, i) => {
    const x = PAD + i * (shipBox + PAD) + shipBox / 2
    const cy = y + shipBox * 0.62
    cellBox(ctx, x - shipBox / 2, cy - shipBox * 0.62, shipBox, shipBox)
    ctx.save()
    ctx.translate(x, cy)
    paintShipBlock(ctx, id, shipBox * 0.5, { aim, t, seed: i + 1 })
    ctx.restore()
    label(ctx, id, x, cy + shipBox * 0.38 + LABEL + 2)
  })

  // Both facings, because the rider is mirrored by travel and a strip that is
  // subtly off-centre only shows when the two are side by side.
  const cavX = PAD + SHIPS.length * (shipBox + PAD)
  const cavBox = CELL * 1.5
  ;[1, -1].forEach((dir, i) => {
    const x = cavX + i * (cavBox + PAD) + cavBox / 2
    const cy = y + cavBox / 2
    const s = cavBox / ALLY_ART_BOX
    cellBox(ctx, x - cavBox / 2, cy - cavBox / 2, cavBox, cavBox)
    ctx.save()
    ctx.translate(x, cy)
    ctx.scale(dir, 1)
    const frame = stripFrame('ally', 'cavalry', 1, cavalryCycle01(t, 0))
    if (frame) ctx.drawImage(frame, -cavBox / 2, -cavBox / 2, cavBox, cavBox)
    else drawCavalry(ctx, s, themedPalette('cavalry'), { phase: 0, striking: false, t })
    ctx.restore()
    label(ctx, dir > 0 ? 'cavalry →' : 'cavalry ←', x, cy + cavBox / 2 + LABEL + 2)
  })

  // Grow the canvas to exactly what was drawn. A fixed height either clips the
  // last row — which is how the ships spent their first render below the
  // fold — or leaves a screen of empty dark under a short cast.
  const need = Math.ceil(y + Math.max(shipBox, cavBox) + LABEL + 40)
  if (Math.abs(cv.clientHeight - need) > 4) cv.style.height = `${need}px`

  raf = requestAnimationFrame(paint)
}

const toggleArt = (): void => {
  painted.value = setArtOverrides(!painted.value, false)
}

onMounted(() => {
  primeMonsterSprites(allMonsterIds())
  raf = requestAnimationFrame(paint)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template lang="pug">
  .playground
    header.playground__bar
      strong Playground
      button(:class="{ on: painted }" @click="toggleArt")
        | {{ painted ? 'painted art' : 'drawn art' }}
      button(:class="{ on: outlines }" @click="outlines = !outlines") boxes
      button(:class="{ on: running }" @click="running = !running")
        | {{ running ? 'running' : 'paused' }}
      span.playground__hint
        | Every drawable the pipeline can replace, through the game's own painters.
    canvas.playground__canvas(ref="canvas")
</template>

<style lang="sass">
.playground
  // The app shell is a fixed-height, overflow-hidden game screen, so this
  // has to do its own scrolling or the last row is simply unreachable.
  height: 100vh
  overflow-y: auto
  background: #141922
  color: #c7d0dd

  &__bar
    position: sticky
    top: 0
    z-index: 2
    display: flex
    gap: 10px
    align-items: center
    padding: 10px 26px
    background: #10141b
    border-bottom: 1px solid #222a36
    font: 13px system-ui, sans-serif

    button
      padding: 4px 10px
      border: 1px solid #2b3442
      border-radius: 6px
      background: #1a212b
      color: #8d9bb0
      cursor: pointer

      &.on
        border-color: #3f7fbf
        color: #cfe4ff

  &__hint
    margin-left: auto
    color: #5f6b7e

  &__canvas
    display: block
    width: 100%
    // Replaced on the first frame by the height the scene actually needs.
    height: 1200px
</style>
