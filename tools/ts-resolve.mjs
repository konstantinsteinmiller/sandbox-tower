/**
 * Run the game's own TypeScript modules under plain Node.
 *
 * Node strips types natively, but its ESM resolver wants explicit extensions
 * and knows nothing about Vite's `@/` alias. This hook fills both gaps for the
 * pure modules a tool needs — `src/game/artSheet.ts`, `art.ts`, `rules.ts` —
 * which have no Vue and no canvas at load time.
 *
 * The third gap is `import.meta.env`. Vite injects it; Node has none, so the
 * first module-level `import.meta.env.X` read throws — and the art manifest
 * reaches two of them (`art.ts`' flag default, `utils/function.ts`' base URL).
 * Rather than bend runtime code every portal build depends on, a module under
 * `src/` that mentions it gets Vite's own built-ins as the dev server sets them
 * (the bench runs there, and the two routes must render identical prompts);
 * every VITE_* reads as undefined, which is the right answer for a tool that
 * only wants the manifest's data and prompt text.
 *
 *   node --import ./tools/ts-resolve.mjs tools/art-prompts.mjs
 *
 * Used by `tools/art-prompts.mjs`, `tools/art-status.mjs` and
 * `tools/balance-replay.ts`. Not part of the app build.
 */
import { registerHooks } from 'node:module'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src')
const SRC_URL = pathToFileURL(SRC).href + '/'
const VITE_BUILTINS = JSON.stringify({ BASE_URL: '/', MODE: 'development', DEV: true, PROD: false, SSR: false })

const withTs = (specifier) => (/\.[cm]?[jt]s$/.test(specifier) ? specifier : `${specifier}.ts`)

registerHooks({
  resolve(specifier, context, next) {
    // `@/game/rules` → <repo>/src/game/rules.ts
    if (specifier.startsWith('@/')) {
      const file = resolve(SRC, withTs(specifier.slice(2)))
      if (existsSync(file)) return { url: pathToFileURL(file).href, shortCircuit: true }
    }
    try {
      return next(specifier, context)
    } catch (err) {
      // `./rules` → `./rules.ts`
      if (specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)) {
        return next(withTs(specifier), context)
      }
      throw err
    }
  },
  load(url, context, next) {
    const out = next(url, context)
    if (!url.startsWith(SRC_URL) || !/\.[cm]?ts$/.test(url) || out.source == null) return out
    const text = typeof out.source === 'string' ? out.source : Buffer.from(out.source).toString('utf-8')
    if (!text.includes('import.meta.env')) return out
    // Same line as the first line of the file, so stack traces keep their line numbers.
    return { ...out, source: `import.meta.env ??= ${VITE_BUILTINS};${text}` }
  }
})
