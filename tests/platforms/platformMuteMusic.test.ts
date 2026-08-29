import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Playgama QA, "System Events":
 *
 *   > Platform audio state is not read on startup. After the reload the game
 *   > plays sound although the platform is still muted. Read the platform audio
 *   > state during initialization and apply it before the first sound is played.
 *
 * There were two halves to that, and fixing only the obvious one leaves the
 * ticket alive:
 *
 *   1. READ IT. The change event only fires on SUBSEQUENT changes, so a player
 *      arriving at an already-muted portal is handled by the startup read and
 *      nothing else. Covered by the plugin wiring.
 *   2. APPLY IT TO SOUND THAT HAS NOT STARTED YET. `suspendAllAudio()` pauses
 *      the audio elements that exist when it runs — it cannot stop
 *      `bgMusic.play()` from being called a second later. The mute lands during
 *      boot, BEFORE the music element is created, so there was nothing to pause
 *      and nothing to stop the music starting behind it.
 *
 * This file pins half 2: the music start must consult the platform mute, and
 * must re-fire when the portal unmutes (or the game stays silent forever,
 * because `shouldPlay` was already true and nothing would call it again).
 */

const load = async () => {
  vi.resetModules()
  const suspendAllAudio = vi.fn()
  const resumeAllAudio = vi.fn()
  const killOneShotSfx = vi.fn()
  vi.doMock('@/use/useAssets', () => ({
    suspendAllAudio,
    resumeAllAudio,
    killOneShotSfx,
    isAudioSuspended: () => false,
    getAudioContext: () => null,
    loadAudioBuffer: async () => null,
    registerHtmlAudio: () => {},
    unregisterHtmlAudio: () => {},
    registerOneShotSource: () => {},
    resourceCache: { images: new Map(), audio: new Map(), audioBuffers: new Map() }
  }))
  const mod = await import('@/use/useGamePauseAudio')
  return { ...mod, suspendAllAudio, resumeAllAudio, killOneShotSfx }
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('platform audio mute', () => {
  it('exposes a REACTIVE flag, not just an edge callback', async () => {
    // A plain boolean could only pause what already existed. The music start
    // has to be able to *read* the state, which means it has to be a ref.
    const m = await load()
    expect(m.isPlatformAudioMuted.value).toBe(false)

    m.setPlatformAudioMuted(true)
    expect(m.isPlatformAudioMuted.value).toBe(true)

    m.setPlatformAudioMuted(false)
    expect(m.isPlatformAudioMuted.value).toBe(false)
  })

  it('hard-stops in-flight one-shots so nothing thaws on unmute', async () => {
    // Suspending the context only FREEZES a Web Audio source; without the kill
    // it resumes and tails audibly, seconds after the sound that spawned it.
    const m = await load()
    m.setPlatformAudioMuted(true)
    expect(m.killOneShotSfx).toHaveBeenCalledTimes(1)
  })

  it('stays edge-triggered so a duplicate SDK emission cannot strand it silent', async () => {
    const m = await load()
    m.setPlatformAudioMuted(true)
    m.setPlatformAudioMuted(true)
    expect(m.suspendAllAudio).toHaveBeenCalledTimes(1)

    m.setPlatformAudioMuted(false)
    m.setPlatformAudioMuted(false)
    expect(m.resumeAllAudio).toHaveBeenCalledTimes(1)
    expect(m.isPlatformAudioMuted.value).toBe(false)
  })
})

describe('music start under a platform mute', () => {
  /**
   * `playWithFade` is a closure inside `useMusic`, so it is driven the way the
   * game drives it: mount a component that calls `initMusic()` (which creates
   * the element in `onMounted`), then `startBattleMusic()`. The assertion is on
   * the element — muted means `play()` was never called on it at all.
   */
  const mountMusic = async () => {
    const played: string[] = []
    class FakeAudio {
      paused = true
      volume = 0
      loop = false
      preload = ''
      src = ''
      play() { played.push(this.src); this.paused = false; return Promise.resolve() }
      pause() { this.paused = true }
      load() {}
      addEventListener(name: string, cb: () => void) {
        // `loadAndPlayTrack` waits for `canplaythrough` before playing.
        if (name === 'canplaythrough') setTimeout(cb, 0)
      }
      removeAttribute() {}
    }
    ;(globalThis as any).Audio = FakeAudio

    const m = await load()
    const { useMusic } = await import('@/use/useSound')
    const { mount } = await import('@vue/test-utils')
    const { defineComponent, h } = await import('vue')

    let api: ReturnType<typeof useMusic> | null = null
    const Host = defineComponent({
      setup() {
        api = useMusic()
        api.initMusic()
        return () => h('div')
      }
    })
    mount(Host)
    return { ...m, music: api!, played }
  }

  /** `canplaythrough` is dispatched on a macrotask. */
  const settle = (): Promise<void> => new Promise((r) => setTimeout(r, 10))

  it('never starts the track while the portal says muted', async () => {
    const { music, setPlatformAudioMuted, played } = await mountMusic()
    setPlatformAudioMuted(true)

    music.startBattleMusic()
    await settle()

    // The exact QA symptom: sound playing under a portal mute.
    expect(played).toHaveLength(0)
  })

  it('starts it once the portal unmutes, without a second startBattleMusic', async () => {
    // The re-fire watcher. `startBattleMusic()` already set `shouldPlay=true`,
    // so without it nothing would ever call `playWithFade` again and the game
    // would stay silent for the rest of the session.
    const { music, setPlatformAudioMuted, played } = await mountMusic()
    setPlatformAudioMuted(true)
    music.startBattleMusic()
    await settle()
    expect(played).toHaveLength(0)

    setPlatformAudioMuted(false)
    await settle()

    expect(played.length).toBeGreaterThan(0)
  })

  it('plays normally when the portal has not muted anything', async () => {
    // The control. Without it the two tests above would also pass on a game
    // that simply never plays music.
    const { music, played } = await mountMusic()
    music.startBattleMusic()
    await settle()

    expect(played.length).toBeGreaterThan(0)
  })
})
