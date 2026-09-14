import { describe, expect, it } from 'vitest'
import { gpuClass } from '@/use/useDeviceTier'

/**
 * The GPU match list.
 *
 * Worth a test because it is the one signal in the profile that can see the
 * machines PERF-LEDGER.md keeps collecting playtests from, and because the
 * failure mode of getting it wrong is silent in both directions: too loose and
 * a capable desktop quietly loses fidelity it paid for, too tight and a machine
 * at 3 fps waits out the audition before anything helps it.
 *
 * Every string below is a real `UNMASKED_RENDERER_WEBGL` value, and the two
 * marked with dates are the ones the playtests actually reported.
 */
describe('gpuClass — the machines that produced the playtests', () => {
  it('reads the 2026-09-14 report: Intel UHD 630 at 2-5 fps', () => {
    expect(gpuClass(
      'ANGLE (Intel, Intel(R) UHD Graphics (0x00009B41) Direct3D11 vs_5_0 ps_5_0, D3D11)'
    )).toBe('weak')
  })

  it('reads the 2026-09-10 report: AMD Radeon 610M at 18 fps', () => {
    expect(gpuClass(
      'ANGLE (AMD, AMD Radeon(TM) 610M (0x000015BF) Direct3D11 vs_5_0 ps_5_0, D3D11)'
    )).toBe('weak')
  })
})

describe('gpuClass — weak', () => {
  it.each([
    'ANGLE (Intel, Intel(R) HD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'Intel(R) HD Graphics 4000',
    'Mobile Intel(R) 4 Series Express Chipset Family (Intel GMA X4500)',
    'ANGLE (AMD, AMD Radeon(TM) Vega 8 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'ANGLE (AMD, AMD Radeon(TM) Vega 3 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'ANGLE (AMD, AMD Radeon(TM) R5 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'Mali-T880',
    'Mali-G51',
    'Adreno (TM) 506',
    'PowerVR Rogue GE8320'
  ])('%s', (r) => expect(gpuClass(r)).toBe('weak'))
})

describe('gpuClass — software, where every fill is on the CPU', () => {
  it.each([
    'Google SwiftShader',
    'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)',
    'Mesa/X.org, llvmpipe (LLVM 15.0.7, 256 bits)',
    'Microsoft Basic Render Driver',
    'Software Rasterizer'
  ])('%s', (r) => expect(gpuClass(r)).toBe('software'))
})

/**
 * The false positives that would cost a capable machine its fidelity.
 *
 * Intel Iris Xe and Arc share the vendor with the UHD line and nothing else;
 * the 660M/680M share "Radeon" and a naming scheme with the 610M and are a
 * different architecture at several times the throughput. A pattern anchored on
 * the vendor rather than the part would take all four down a tier.
 */
describe('gpuClass — must NOT match', () => {
  it.each([
    'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics (0x000046A6) Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'ANGLE (Intel, Intel(R) Arc(TM) A770 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'ANGLE (AMD, AMD Radeon RX 6700 XT Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'ANGLE (AMD, AMD Radeon(TM) 680M Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'ANGLE (AMD, AMD Radeon(TM) 660M Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'ANGLE (Apple, ANGLE Metal Renderer: Apple M1, Unspecified Version)',
    'Apple GPU',
    'Adreno (TM) 740',
    'Mali-G715'
  ])('%s', (r) => expect(gpuClass(r)).toBe('unknown'))

  it('keeps fidelity when the browser will not say', () => {
    // Firefox `resistFingerprinting`, Safari masking, WebGL disabled outright.
    expect(gpuClass(null)).toBe('unknown')
    expect(gpuClass('')).toBe('unknown')
  })
})
