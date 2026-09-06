import { describe, expect, it } from 'vitest'
import { resolveFitMode } from '@/use/useMobileFit'
import { resolveDeviceTier } from '@/use/useDeviceTier'

const base = {
  query: '', pokiCategory: null, coarsePointer: false, mobileUa: false, shortSide: 1080, enabled: true
} as const

describe('resolveFitMode', () => {
  it('is desktop on a desktop', () => {
    expect(resolveFitMode({ ...base })).toBe('desktop')
  })

  it('is the drop board on a phone (touch + a phone-sized short side)', () => {
    expect(resolveFitMode({ ...base, coarsePointer: true, shortSide: 390 })).toBe('dropmerge')
    expect(resolveFitMode({ ...base, mobileUa: true, shortSide: 360 })).toBe('dropmerge')
  })

  it('keeps the desktop game on a touch laptop and a large tablet', () => {
    expect(resolveFitMode({ ...base, coarsePointer: true, shortSide: 800 })).toBe('desktop')
  })

  it("trusts Poki's device category over the guess, tablets included", () => {
    expect(resolveFitMode({ ...base, pokiCategory: 'tablet', shortSide: 800 })).toBe('dropmerge')
    expect(resolveFitMode({ ...base, pokiCategory: 'mobile' })).toBe('dropmerge')
    expect(resolveFitMode({ ...base, pokiCategory: 'desktop', coarsePointer: true, shortSide: 390 })).toBe('desktop')
  })

  it('honours the ?fit= override above everything', () => {
    expect(resolveFitMode({ ...base, query: 'fit=dropmerge' })).toBe('dropmerge')
    expect(resolveFitMode({ ...base, query: 'fit=mobile' })).toBe('dropmerge')
    expect(resolveFitMode({ ...base, query: 'x=1&fit=desktop', pokiCategory: 'mobile' })).toBe('desktop')
  })

  it('is desktop everywhere when the feature flag is off', () => {
    expect(resolveFitMode({ ...base, enabled: false, pokiCategory: 'mobile', query: 'fit=dropmerge' })).toBe('desktop')
  })
})

describe('resolveDeviceTier', () => {
  const desk = { query: '', cores: 8, memoryGb: 16, dpr: 1, androidMajor: null, mobile: false, pokiCategory: null } as const

  it('a desktop is high', () => {
    expect(resolveDeviceTier({ ...desk })).toBe('high')
  })

  it('a modern phone is mid', () => {
    expect(resolveDeviceTier({ ...desk, cores: 6, memoryGb: null, dpr: 3, mobile: true })).toBe('mid')
  })

  it('a budget Android is low', () => {
    expect(resolveDeviceTier({ ...desk, cores: 8, memoryGb: 3, dpr: 2, androidMajor: 11, mobile: true })).toBe('low')
    expect(resolveDeviceTier({ ...desk, cores: 4, memoryGb: null, androidMajor: 9, mobile: true })).toBe('low')
  })

  it('a Poki tablet counts as mobile', () => {
    expect(resolveDeviceTier({ ...desk, cores: 8, memoryGb: null, pokiCategory: 'tablet' })).toBe('mid')
  })

  it('honours the ?tier= override', () => {
    expect(resolveDeviceTier({ ...desk, query: '?tier=low' })).toBe('low')
    expect(resolveDeviceTier({ ...desk, query: '#/?tier=high', cores: 2, memoryGb: 1, mobile: true })).toBe('high')
  })
})
