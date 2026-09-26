<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import useTowerEconomy from '@/use/useTowerEconomy'
import useSounds from '@/use/useSound.ts'
import { spawnCoinExplosion } from '@/use/useCoinExplosion'
import IconCoin from '@/components/icons/IconCoin.vue'
// Persist through the unified `tower-siege_state` blob — getState/setState write
// the chest's collected-at key into the single in-memory record that the
// SaveManager mirrors to localStorage AND the active platform SDK's cloud save.
import { getState, setState } from '@/use/useTowerState'
import { CHEST_KEY, CHEST_DAY_KEY } from '@/keys'
import { spriteFor, onArtChanged } from '@/game/art'

interface Props {
  /** Element where the coin explosion VFX flies to (the coin badge). */
  targetEl?: HTMLElement | null
}

const props = withDefaults(defineProps<Props>(), {
  targetEl: null
})

const { addCoins } = useTowerEconomy()
const { playSound } = useSounds()

const SMALL_READY_AT_MS = 3 * 60 * 1000
const BIG_READY_AT_MS = 10 * 60 * 1000
const SMALL_REWARD = 25
const BIG_REWARD = 100

/**
 * Ceiling on what the chest may pay in one calendar day.
 *
 * Uncapped it paid 100 coins per ten idle minutes — 600 an hour, unattended and
 * without an ad — while a run that reaches wave 8 takes several minutes of real
 * play and pays around 250. The faucet out-earned the game. 300 keeps the chest
 * worth opening on a short session (three big claims, or a mix) without it
 * being the reason to leave the tab open.
 */
const DAILY_CAP = 300

const STORAGE_KEY = CHEST_KEY

/**
 * The calendar day the cap is measured in, in the PLAYER's timezone.
 *
 * This was `toISOString().slice(0, 10)` — UTC. A player in Berlin therefore had
 * their allowance reset at 02:00, and one in Los Angeles at 17:00 the afternoon
 * before, neither of which is a boundary anyone recognises as a new day. It also
 * has to agree with `msUntilReset`, or the chest counts down to a moment when
 * nothing happens.
 *
 * An old UTC key simply reads as "not today" and zeroes the ledger, which is
 * generous rather than harmful, so no migration is needed.
 */
const todayKey = (): string => {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/** Milliseconds from `now` to the next local midnight, when the cap rolls over. */
const msUntilReset = (now: number): number => {
  const d = new Date(now)
  d.setHours(24, 0, 0, 0)
  return Math.max(0, d.getTime() - now)
}

interface DayLedger { day: string; coins: number }

const readLedger = (): DayLedger => {
  const v = getState<Partial<DayLedger>>(CHEST_DAY_KEY, {} as DayLedger)
  return v && v.day === todayKey()
    ? { day: v.day, coins: Math.max(0, Number(v.coins) || 0) }
    : { day: todayKey(), coins: 0 }
}

const ledger = ref<DayLedger>(readLedger())

/** What today has left in it. */
const dailyLeft = computed(() => Math.max(0, DAILY_CAP - ledger.value.coins))

const readStoredAt = () => {
  const v = getState<unknown>(STORAGE_KEY)
  if (typeof v === 'number' && Number.isFinite(v)) return v
  const n = parseInt(String(v ?? ''), 10)
  return Number.isFinite(n) ? n : 0
}

const lastCollectedAt = ref(readStoredAt())
const tickNow = ref(Date.now())
let tickIntervalId: number | null = null

const elapsedMs = computed(() => Math.max(0, tickNow.value - lastCollectedAt.value))

type Phase = 'cooldown' | 'small' | 'big'
const phase = computed<Phase>(() => {
  if (elapsedMs.value < SMALL_READY_AT_MS) return 'cooldown'
  if (elapsedMs.value < BIG_READY_AT_MS) return 'small'
  return 'big'
})

// Capped at whatever the day has left, so the chest visibly winds down rather
// than silently paying nothing.
const currentReward = computed(() =>
  Math.min(dailyLeft.value, phase.value === 'big' ? BIG_REWARD : SMALL_REWARD)
)

/**
 * The day's allowance is gone: the chest still fills, but it cannot pay.
 *
 * This is the state that made the chest look broken. `currentReward` floors at
 * the daily cap, so once 300 coins were claimed the chest went un-clickable —
 * while `remainingMs` returned 0 for the big phase, pinning the label to a dead
 * `00:00` for the rest of the day. A timer at zero next to a button that does
 * nothing reads as a bug, not as a limit.
 */
const isSpent = computed(() => dailyLeft.value === 0)

const isReady = computed(() => phase.value !== 'cooldown' && currentReward.value > 0)

const remainingMs = computed(() => {
  // Spent: what the player is waiting on is midnight, not the next fill.
  if (isSpent.value) return msUntilReset(tickNow.value)
  if (phase.value === 'cooldown') return SMALL_READY_AT_MS - elapsedMs.value
  if (phase.value === 'small') return BIG_READY_AT_MS - elapsedMs.value
  return 0
})

const timeDisplay = computed(() => {
  const totalSec = Math.ceil(remainingMs.value / 1000)
  const h = Math.floor(totalSec / 3600)
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
  const ss = String(totalSec % 60).padStart(2, '0')
  // Hours only ever show on the wait for midnight — a fill is under ten
  // minutes, so the common case keeps its compact MM:SS.
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
})

const cooldownRingPct = computed(() => {
  // A spent chest stays fully shuttered, so it reads as closed rather than as a
  // ready chest that refuses to open.
  if (isSpent.value) return 1
  if (phase.value !== 'cooldown') return 0
  return remainingMs.value / SMALL_READY_AT_MS
})

/**
 * The painted chest, once the art layer has one; the drawn SVG until then.
 *
 * Same contract as the HUD resource glyphs: a probe that is null with art
 * overrides off or the bitmap missing, and a subscription because the probe is
 * async — the first paint happens before the image decodes, and without it the
 * chest would keep the vector until something else forced a re-render.
 */
const painted = ref<string | null>(null)
const syncArt = (): void => { painted.value = spriteFor('icon', 'chest')?.src ?? null }

/**
 * The cooldown shade, as an overlay instead of a clipped SVG rect.
 *
 * The bitmap masks it to its own alpha, which is what `chestClip` does for the
 * vector — so the shade still drains INSIDE the chest's outline rather than
 * sitting over it as a rectangle. Same geometry as the rect: it covers the
 * whole icon at the start of a cooldown and shrinks away as the chest fills.
 */
const shadeMask = computed(() => (painted.value
  ? { maskImage: `url('${painted.value}')`, WebkitMaskImage: `url('${painted.value}')` }
  : {}))
const shadeRect = computed(() => ({
  top: `${(1 - cooldownRingPct.value) * 100}%`,
  height: `${cooldownRingPct.value * 100}%`
}))

const rootEl = ref<HTMLElement | null>(null)

const onClick = () => {
  if (!isReady.value) return
  const reward = currentReward.value
  addCoins(reward)
  playSound('reward-continue', 0.06)
  if (rootEl.value && props.targetEl) {
    spawnCoinExplosion({ sourceEl: rootEl.value, targetEl: props.targetEl })
  }
  lastCollectedAt.value = Date.now()
  setState(STORAGE_KEY, lastCollectedAt.value)
  const next: DayLedger = { day: todayKey(), coins: readLedger().coins + reward }
  ledger.value = next
  setState(CHEST_DAY_KEY, next)
}

let stopArt: (() => void) | null = null

onMounted(() => {
  syncArt()
  stopArt = onArtChanged(syncArt)
  tickIntervalId = window.setInterval(() => {
    tickNow.value = Date.now()
    const stored = readStoredAt()
    if (stored !== lastCollectedAt.value) lastCollectedAt.value = stored
    // Roll the ledger over at midnight without needing a reload.
    if (ledger.value.day !== todayKey()) ledger.value = readLedger()
  }, 1000)
})
onUnmounted(() => {
  if (tickIntervalId !== null) clearInterval(tickIntervalId)
  stopArt?.()
})
</script>

<template lang="pug">
  div.treasure-chest.pointer-events-auto.relative(
    ref="rootEl"
    :class="{ 'is-ready': isReady, 'is-big': phase === 'big' && !isSpent, 'is-spent': isSpent, 'cursor-pointer': isReady }"
    @click="onClick"
  )
    //- Painted chest, when the art layer has one. The shade is masked to the
    //- bitmap's own alpha, which is what the SVG gets from `chestClip` — so it
    //- drains inside the chest's outline either way.
    div.chest-art(
      v-if="painted"
      class="block w-12 h-12 sm:w-14 sm:h-14 chest-icon"
    )
      img.chest-art__img(:src="painted" alt="" aria-hidden="true" draggable="false")
      div.chest-art__clip(
        v-if="isSpent || phase === 'cooldown'"
        :style="shadeMask"
      )
        div.chest-art__shade(:style="shadeRect")

    //- Programmatic chest art (SVG). The cooldown overlay sits inside the
    //- same SVG so a clipPath built from the chest body + lid can mask it
    //- to the icon's silhouette — the overlay shrinks within the chest
    //- outline rather than as a separate ring around it.
    svg(
      v-else
      viewBox="0 0 64 64"
      class="block w-12 h-12 sm:w-14 sm:h-14 chest-icon"
    )
      defs
        linearGradient(id="chestBody" x1="0" y1="0" x2="0" y2="1")
          stop(offset="0" stop-color="#a05a2c")
          stop(offset="1" stop-color="#5a2e10")
        linearGradient(id="chestLid" x1="0" y1="0" x2="0" y2="1")
          stop(offset="0" stop-color="#c0732e")
          stop(offset="1" stop-color="#7d4017")
        clipPath(id="chestClip")
          rect(x="6" y="28" width="52" height="28" rx="3")
          path(d="M6 28 Q32 8 58 28 Z")
      rect(x="6" y="28" width="52" height="28" rx="3" fill="url(#chestBody)" stroke="#2a1607" stroke-width="2")
      path(d="M6 28 Q32 8 58 28 Z" fill="url(#chestLid)" stroke="#2a1607" stroke-width="2")
      rect(x="26" y="34" width="12" height="14" rx="2" fill="#fcd34d" stroke="#5a3408" stroke-width="1.5")
      circle(cx="32" cy="40" r="2" fill="#5a3408")
      rect(x="6" y="38" width="52" height="3" fill="#3a1d09" opacity="0.6")
      rect(x="6" y="50" width="52" height="3" fill="#3a1d09" opacity="0.6")

      //- Cooldown overlay: 0.5-opacity black, clipped to the chest outline
      //- via `chestClip`. The rect drains from the top down — at start it
      //- covers the whole chest, at full cooldown it's gone.
      rect(
        v-if="isSpent || phase === 'cooldown'"
        x="0"
        :y="64 * (1 - cooldownRingPct)"
        width="64"
        :height="64 * cooldownRingPct"
        fill="rgba(0,0,0,0.5)"
        clip-path="url(#chestClip)"
        style="transition: y 0.3s linear, height 0.3s linear"
      )

    //- Status label: a countdown while it fills, the payout once it is ready.
    //- Both sit in the same slot so the chest's footprint never jumps.
    div.chest-label
      span.chest-timer(v-if="!isReady") {{ timeDisplay }}
      span.chest-payout(v-else :class="{ 'is-big': phase === 'big' }")
        IconCoin(class="chest-payout__coin")
        span.chest-payout__value +{{ currentReward }}
</template>

<style scoped lang="sass">
.treasure-chest
  width: 3rem
  height: 3rem
  position: relative

@media (min-width: 640px)
  .treasure-chest
    width: 3.5rem
    height: 3.5rem

// Both arms of the icon — the painted bitmap and the drawn SVG — wear this, so
// the bob, the glow and the spent-day desaturation are written once and the
// caller never has to care which one it got.
.chest-icon
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6))

.is-ready .chest-icon
  animation: chest-bob 1s ease-in-out infinite alternate

@keyframes chest-bob
  from
    transform: translateY(0)
  to
    transform: translateY(-3px)

.is-big .chest-icon
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 8px rgba(255, 160, 0, 0.8))

// Spent for the day — drained of colour so the chest reads as put away, and the
// countdown underneath is to midnight rather than to a fill that cannot pay.
.is-spent .chest-icon
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6)) grayscale(0.6)
  opacity: 0.7

// ─── Painted arm ────────────────────────────────────────────────────────────
//
// The clip is a full-size layer carrying the mask, and the shade is the moving
// rectangle inside it. The mask has to be sized to the whole ICON, not to the
// part of it currently shaded — put it on the shade itself and the silhouette
// would squash as the cooldown ran down.
//
// `contain` on both the image and the mask letterboxes them the same way, so
// the shade lands exactly on the chest whatever aspect the painting came at.
.chest-art
  position: relative

.chest-art__img
  display: block
  width: 100%
  height: 100%
  object-fit: contain

.chest-art__clip
  position: absolute
  inset: 0
  pointer-events: none
  -webkit-mask-size: contain
  -webkit-mask-repeat: no-repeat
  -webkit-mask-position: center
  mask-size: contain
  mask-repeat: no-repeat
  mask-position: center

.chest-art__shade
  position: absolute
  left: 0
  right: 0
  background-color: rgba(0, 0, 0, 0.5)
  transition: top 0.3s linear, height 0.3s linear

// ─── Status label ───────────────────────────────────────────────────────────
//
// The countdown and the payout share one slot, centred under the chest, so the
// chest's footprint never jumps when it becomes ready.
//
// The payout chip is built in the same language as the rest of the HUD — dark
// outline, vertical gradient, drop shadow, outlined text. The previous version
// was a flat slab of raw `auraColor` with a stray `mr-4` on the value, which
// left a third of the chip empty and shoved the number off-centre.
.chest-label
  position: absolute
  top: calc(100% + 0.15rem)
  left: 50%
  translate: -50% 0
  display: flex
  justify-content: center
  // The chip is wider than the chest; letting it size itself and centre keeps
  // it from shunting the wallet column around.
  white-space: nowrap
  pointer-events: none

.chest-timer
  display: inline-block
  padding: 0.05em 0.4em
  border-radius: 999px
  background-color: rgba(23, 58, 102, 0.85)
  box-shadow: 0 0 0 1px var(--ui-rim-soft)
  color: #fff
  font-weight: 900
  font-size: clamp(0.5rem, 2.1vw, 0.66rem)
  line-height: 1.5
  letter-spacing: 0.04em
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.8)

.chest-payout
  display: inline-flex
  align-items: center
  justify-content: center
  gap: 0.2em
  padding: 0.1em 0.45em
  border: 2px solid var(--ui-line)
  border-radius: 999px
  background-image: linear-gradient(to bottom, #cfd9e6, #93a3b8)
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.45)
  line-height: 1

  // The 10-minute chest is the one worth waiting for, so it gets the gold
  // treatment and the aura; the 3-minute one stays quiet silver.
  &.is-big
    background-image: linear-gradient(to bottom, #ffd85c, #f0a01c)
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.45), 0 0 12px rgba(255, 170, 30, 0.75)

.chest-payout__coin
  flex: 0 0 auto
  width: clamp(0.5rem, 2.1vw, 0.7rem)
  height: clamp(0.5rem, 2.1vw, 0.7rem)
  color: #fff6d0
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.5))

.chest-payout__value
  color: #fff
  font-weight: 900
  font-size: clamp(0.5rem, 2.1vw, 0.68rem)
  line-height: 1.4
  text-shadow: 1.5px 1.5px 0 rgba(0, 0, 0, 0.75)
</style>
