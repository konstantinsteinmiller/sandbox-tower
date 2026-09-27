/**
 * ─── The generation ledger ──────────────────────────────────────────────────
 *
 * How many images have been asked of one Google account, kept in the file
 * `config.mjs` resolves as `gemini.usageFile` — the shared `~/.art-desk/
 * usage.json` for the default profile, or the profile's own
 * `art-desk-usage.json` when a project signs in an account of its own.
 *
 * Lifted out of `server.mjs` when `tools/art-promotion.mjs` became a second
 * thing that paints: two counters over one quota drift apart silently, and the
 * symptom is a run walking into the refusal the counter exists to avoid.
 * `server.mjs` still keeps its own copy of the same three lines, reading and
 * writing the same file in the same shape, so the two agree.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

export const today = () => new Date().toISOString().slice(0, 10)

export const ledger = (file) => {
  const read = () => { try { return JSON.parse(readFileSync(file, 'utf-8')) } catch { return {} } }
  return {
    usedToday: () => read()[today()] ?? 0,
    countGeneration: () => {
      const u = read()
      u[today()] = (u[today()] ?? 0) + 1
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, JSON.stringify(u, null, 2))
    }
  }
}
