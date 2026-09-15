import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * ─── The interstitial chord ─────────────────────────────────────────────────
 *
 * Thirty consecutive taps on the coin badge force an interstitial, so an ad
 * integration can be checked on a real device inside a real portal shell
 * without waiting out the 121 s pacing gate.
 *
 * Every number below is a number somebody has to reproduce with a finger, which
 * is exactly why they are pinned here: a chord that trips at fifteen taps
 * because one press fires two events, or that never trips because the taps are
 * being counted against a stale timestamp, is indistinguishable from an ad
 * integration that does not work — and that is the thing it exists to test.
 */

const load = async () => {
  vi.resetModules()
  const m = await import('@/use/useAdChord')
  const shown = { n: 0 }
  m.__setAdChordShow(async () => { shown.n++ })
  m.resetAdChord()
  return { m, shown }
}

/** One PHYSICAL tap: pointerdown + click, as the badge sends them. */
const tap = (m: Awaited<ReturnType<typeof load>>['m']): boolean => {
  const a = m.registerAdChordTap('down')
  const b = m.registerAdChordTap('click')
  return a || b
}

/** One physical tap in a shell that swallows `pointerdown` and sends only the
 *  click — the reason the badge listens on both in the first place. */
const clickOnly = (m: Awaited<ReturnType<typeof load>>['m']): boolean =>
  m.registerAdChordTap('click')

describe('the coin-badge interstitial chord', () => {
  beforeEach(() => { vi.useRealTimers() })

  it('counts one physical tap as one tap, not as two', async () => {
    const { m } = await load()
    for (let i = 0; i < 5; i++) tap(m)
    expect(m.adChordTaps.value).toBe(5)
  })

  it('fires the interstitial on the thirtieth tap and not before', async () => {
    const { m, shown } = await load()
    for (let i = 0; i < m.AD_CHORD_TAPS - 1; i++) {
      expect(tap(m), `tap ${i + 1}`).toBe(false)
    }
    expect(shown.n).toBe(0)
    expect(tap(m)).toBe(true)
    await Promise.resolve()
    expect(shown.n).toBe(1)
  })

  it('starts over after a pause, so a run has to be consecutive', async () => {
    vi.useFakeTimers()
    const { m, shown } = await load()
    for (let i = 0; i < 25; i++) {
      tap(m)
      vi.advanceTimersByTime(100)
    }
    expect(m.adChordTaps.value).toBe(25)
    // The player put the phone down mid-run. That is not a chord.
    vi.advanceTimersByTime(3_000)
    tap(m)
    expect(m.adChordTaps.value).toBe(1)
    for (let i = 0; i < 25; i++) {
      tap(m)
      vi.advanceTimersByTime(100)
    }
    expect(shown.n).toBe(0)
  })

  it('still counts taps in a shell that only sends the click', async () => {
    const { m, shown } = await load()
    for (let i = 0; i < m.AD_CHORD_TAPS - 1; i++) expect(clickOnly(m)).toBe(false)
    expect(clickOnly(m)).toBe(true)
    await Promise.resolve()
    expect(shown.n).toBe(1)
  })

  it('keeps up with a fast tapper, who is the only one entering this', async () => {
    vi.useFakeTimers()
    const { m, shown } = await load()
    // Sixteen taps a second, with the click landing 35 ms behind its own
    // pointerdown. Every physical tap must count exactly once.
    for (let i = 0; i < m.AD_CHORD_TAPS; i++) {
      m.registerAdChordTap('down')
      vi.advanceTimersByTime(35)
      m.registerAdChordTap('click')
      vi.advanceTimersByTime(25)
    }
    await Promise.resolve()
    expect(shown.n).toBe(1)
  })

  it('does not queue a second ad behind the one it just asked for', async () => {
    const { m, shown } = await load()
    let release = (): void => {}
    m.__setAdChordShow(() => new Promise<void>((r) => { shown.n++; release = r }))
    for (let i = 0; i < m.AD_CHORD_TAPS; i++) tap(m)
    await Promise.resolve()
    expect(shown.n).toBe(1)
    // The burst does not stop dead the instant the ad is requested.
    for (let i = 0; i < m.AD_CHORD_TAPS * 2; i++) tap(m)
    expect(shown.n).toBe(1)
    release()
  })

  it('survives a provider that throws, because that is what it is for', async () => {
    const { m } = await load()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    m.__setAdChordShow(async () => { throw new Error('no SDK') })
    for (let i = 0; i < m.AD_CHORD_TAPS; i++) tap(m)
    await Promise.resolve()
    await Promise.resolve()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('is wired to the coin badge on both events', async () => {
    const source = await import('node:fs').then((fs) =>
      fs.readFileSync('src/components/organisms/CoinBadge.vue', 'utf8'))
    // Both, because portal shells swallow one or the other — and the module
    // coalesces the pair, which is the test above.
    expect(source).toContain("@pointerdown=\"registerAdChordTap('down')\"")
    expect(source).toContain("@click=\"registerAdChordTap('click')\"")
    // The HUD row around it is inert on the tower board; without this the taps
    // never arrive at all.
    expect(source).toContain('pointer-events: auto')
  })
})
