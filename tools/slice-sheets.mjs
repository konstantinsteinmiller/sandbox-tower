#!/usr/bin/env node
/**
 * ─── Sheet slicer ───────────────────────────────────────────────────────────
 *
 * The return half of the art pipeline. `/art-sheets` bakes the procedural cast
 * onto a 128 px lattice and out to an image model; this takes the repainted
 * sheet and cuts it back into the drop-in bitmaps `spriteFor()` probes for.
 *
 *   node tools/slice-sheets.mjs art-sheets/painted/sheet-blocks.png
 *   pnpm slice-sheets                      # every PNG in art-sheets/painted/
 *   pnpm slice-sheets --dry                # print the plan, write nothing
 *
 * WHY IT DRIVES A BROWSER
 *
 * The renderer only ever probes for `.webp`, and Node has no image encoder in
 * the standard library. The choice was a native dependency (`sharp`) in a
 * project that ships to eight portals, or the encoder that is already installed
 * on this machine. Chrome decodes the PNG, crops on a canvas and encodes WebP
 * in three lines — so the pipeline stays dependency-free, and it is the same
 * isolated-profile harness the export bench is driven with.
 *
 * WHAT IT REFUSES TO DO
 *
 * The whole contract is that cell N comes back at the pixels cell N went out
 * at. An image model that re-composed the grid produces a file that still looks
 * fine and slices into garbage — every sprite a few pixels off centre, which
 * nobody notices until the tower looks subtly wrong in motion. So a sheet whose
 * aspect ratio does not match the index is REJECTED rather than best-guessed.
 */
import { spawn } from 'node:child_process'
import {
  mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync,
  existsSync, readdirSync, statSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname, basename, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const INDEX = join(ROOT, 'art-sheets', 'sheet-index.json')
const PAINTED = join(ROOT, 'art-sheets', 'painted')
const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
]

// ─── Arguments ──────────────────────────────────────────────────────────────

// Options that consume the next argument. Everything else that is not a flag
// is an input path — walked in order rather than filtered, so `--out public`
// cannot leave "public" behind looking like a file to slice.
const VALUED = new Set(['--sheet', '--out', '--size', '--quality', '--fit', '--frames'])
const argv = process.argv.slice(2)
const opts = {}
const files = []
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (VALUED.has(a)) {
    if (i + 1 >= argv.length) { console.error(`${a} needs a value`); process.exit(1) }
    opts[a] = argv[++i]
  } else if (a.startsWith('-')) {
    opts[a] = true
  } else {
    files.push(a)
  }
}

const flag = (name) => opts[name] === true
const num = (name, fallback) => {
  if (opts[name] === undefined) return fallback
  const v = Number(opts[name])
  if (!Number.isFinite(v)) { console.error(`${name} must be a number`); process.exit(1) }
  return v
}

const DRY = flag('--dry')
const OUT_ROOT = resolve(ROOT, opts['--out'] ?? 'public')
const QUALITY = num('--quality', 0.92)
const FORCE_SHEET = opts['--sheet'] ?? null
const FORCE_SIZE = num('--size', null)
// Accept a walk sheet whose grid came back with a different number of panels,
// treating what arrived as one cycle. Only honoured when it matches what the
// detector actually measured, so it cannot be used to force a bad cut.
const FRAMES_OVERRIDE = num('--frames', null)
const NO_CHROMA = flag('--no-chroma')
const NO_TRIM = flag('--no-trim')
const NO_AUTO_BG = flag('--no-auto-bg')
// How to square up a single-cell image that did not come back square.
const FIT = opts['--fit'] ?? 'squash'
if (!['squash', 'crop'].includes(FIT)) {
  console.error("--fit must be 'squash' or 'crop'")
  process.exit(1)
}

if (flag('--help') || flag('-h')) {
  console.log(`
Slice repainted contact sheets back into drop-in bitmaps.

  node tools/slice-sheets.mjs [files…] [options]

  files            One or more PNGs, or a directory. Defaults to art-sheets/painted/.
  --sheet <id>     Force the target: a whole sheet (blocks, merged, enemies, siege,
                   allies, props) or a row strip (blocks-r1, enemies-r0, …).
                   Otherwise inferred from the filename, then from the aspect ratio.
  --out <dir>      Where targets are written, relative to the repo. Default: public
  --size <px>      Force the output edge, in px. Default: the painted cell size.
  --quality <0-1>  WebP quality. Default: 0.92
  --no-chroma      Keep a magenta background instead of keying it out.
  --no-auto-bg     Do not flood-fill a uniform background away. Auto-removal
                   handles white, cream and painted-in checkerboards; it is
                   skipped on blocks, whose borders are artwork.
  --no-trim        Keep a block's margin instead of cropping it back to its own
                   edges. Blocks must reach all four sides or they tile with a
                   seam, so this is on by default for images/blocks/ targets.
  --fit squash|crop  How to square up a single-cell image that came back
                   non-square. squash (default) keeps every feature and
                   distorts; crop keeps proportions and loses the edges.
  --frames <n>     Accept a walk sheet that came back with n panels instead of
                   the 8 it was asked for, and play them as one cycle. Must
                   match the grid the slicer measured.
  --dry            Print the plan and write nothing.
`)
  process.exit(0)
}

// ─── Inputs ─────────────────────────────────────────────────────────────────

if (!existsSync(INDEX)) {
  console.error(`No ${relative(ROOT, INDEX)}. Run the /art-sheets bench first.`)
  process.exit(1)
}
const index = JSON.parse(readFileSync(INDEX, 'utf-8'))

const collect = (p) => {
  const full = resolve(ROOT, p)
  if (!existsSync(full)) { console.error(`not found: ${p}`); process.exit(1) }
  if (statSync(full).isDirectory()) {
    return readdirSync(full).filter((f) => /\.(png|webp|jpe?g)$/i.test(f)).map((f) => join(full, f))
  }
  return [full]
}

const inputs = (files.length ? files : [PAINTED]).flatMap((p) => {
  if (!files.length && !existsSync(PAINTED)) {
    console.error(`No input given and ${relative(ROOT, PAINTED)}/ does not exist.`)
    console.error('Put the repainted sheets there, or pass a path.')
    process.exit(1)
  }
  return collect(p)
})

if (!inputs.length) { console.error('nothing to slice'); process.exit(1) }

/**
 * Which sheet is this file?
 *
 * The filename first, because it survives round-tripping through a chat window
 * far more often than anything else. Aspect ratio is the fallback, and it is
 * only trusted when exactly one sheet matches — two sheets with the same shape
 * would make a wrong guess silently destructive.
 */
// Sheets and strips are the same thing to the slicer: a name, a size, and a
// list of rects. Flattening them into one list means strips need no second
// code path — identification, the aspect guard and the cutting are shared.
const TARGETS = [
  ...index.sheets.map((s) => ({
    id: s.id, kind: 'sheet',
    stems: [s.files.clean.replace(/\.png$/, '')],
    width: s.width, height: s.height, cells: s.cells
  })),
  ...index.sheets.flatMap((s) => (s.strips ?? []).map((t) => ({
    id: t.id, kind: 'strip',
    stems: [t.file.replace(/\.png$/, '')],
    width: t.width, height: t.height, cells: t.cells
  }))),
  ...index.sheets.flatMap((s) => (s.singles ?? []).map((t) => ({
    id: t.id, kind: 'cell',
    stems: [t.file.replace(/\.png$/, '')],
    width: t.width, height: t.height, cells: t.cells
  }))),
  // Landscape assets. Not lattice cells and not square: a mountain range is a
  // wide repeating band, so the whole image IS the asset and its declared shape
  // is the shape it must be written at.
  ...(index.scenery ?? []).map((a) => ({
    id: a.id, kind: 'scenery',
    // Both `bg-mountains-far` and a plain `mountains-far` are accepted: the
    // prefix is a convenience of the export, not something a painter should
    // have to preserve through a chat window and a download folder.
    stems: [a.file.replace(/\.png$/, ''), a.id],
    width: a.width, height: a.height,
    tileable: a.tileable,
    bg: a.bg ?? 'magenta',
    cells: [{
      id: a.id, label: a.id, variant: 'scenery',
      x: 0, y: 0, w: a.width, h: a.height, target: a.target
    }]
  })),
  // Walk cycles. A grid of panels in, ONE horizontal strip out — the panels are
  // frames of a single animation, so they are cut, keyed and de-fringed
  // separately and then composed into the file the game loads.
  //
  // Nothing here is trimmed. Every other sprite is trimmed to its own content;
  // doing that per frame would re-centre each pose independently and the
  // character would jitter around its own feet for the entire walk.
  ...(index.walks ?? []).map((a) => ({
    id: a.id, kind: 'walk',
    // `walk-grumpling` and a bare `grumpling` both land; longest stem wins, so
    // the prefixed form is never mistaken for anything else.
    stems: [a.file.replace(/\.png$/, ''), a.id],
    width: a.width, height: a.height,
    frames: a.frames, cols: a.cols, rows: a.rows,
    target: a.target,
    cells: Array.from({ length: a.frames }, (_, i) => ({
      id: `${a.id}#${i}`,
      label: a.id,
      variant: `frame ${i + 1}/${a.frames}`,
      x: (i % a.cols) * a.panel.w,
      y: Math.floor(i / a.cols) * a.panel.h,
      w: a.panel.w, h: a.panel.h,
      target: a.target,
      frame: i
    }))
  }))
]

const identify = (file, w, h) => {
  if (FORCE_SHEET) {
    const t = TARGETS.find((x) => x.id === FORCE_SHEET)
    if (!t) {
      throw new Error(`--sheet ${FORCE_SHEET} is unknown. Try one of:\n  `
        + TARGETS.map((x) => x.id).join(', '))
    }
    return t
  }
  const name = basename(file).toLowerCase()
  // Longest stem wins, so "strip-blocks-r1" beats "blocks", and
  // "mountains-near" beats a bare "mountains".
  const byName = TARGETS
    .map((t) => ({ t, hit: t.stems.filter((st) => name.includes(st.toLowerCase()))
      .sort((a, b) => b.length - a.length)[0] }))
    .filter((x) => x.hit)
    .sort((a, b) => b.hit.length - a.hit.length)
  if (byName.length) return byName[0].t

  const ratio = w / h
  const byShape = TARGETS.filter((t) => Math.abs(t.width / t.height - ratio) < 0.01)
  if (byShape.length === 1) return byShape[0]
  throw new Error(byShape.length
    ? `${w}x${h} matches ${byShape.length} targets (${byShape.map((t) => t.id).join(', ')}) — pass --sheet <id>`
    : `${w}x${h} matches nothing in the index — pass --sheet <id>`)
}

// ─── Chrome, for decode / crop / WebP encode ────────────────────────────────

const chromePath = CHROME_CANDIDATES.find((p) => existsSync(p))
if (!chromePath) {
  console.error('No Chrome found. Tried:\n  ' + CHROME_CANDIDATES.join('\n  '))
  process.exit(1)
}

const PORT = 9336 + (process.pid % 200)
// An isolated profile, always. The shared one is held by the user's own browser
// and two clients on one profile deadlock with no recovery.
const profile = mkdtempSync(join(tmpdir(), 'ts-slice-'))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const chrome = spawn(chromePath, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-extensions',
  '--disable-gpu', 'about:blank'
], { stdio: 'ignore' })

let ws
let msgId = 0
const pending = new Map()
const send = (method, params = {}) => new Promise((res, rej) => {
  const m = { id: ++msgId, method, params }
  pending.set(m.id, { res, rej })
  ws.send(JSON.stringify(m))
})

const shutdown = (code) => {
  try { ws?.close() } catch {}
  try { chrome.kill() } catch {}
  setTimeout(() => {
    try { rmSync(profile, { recursive: true, force: true }) } catch {}
    process.exit(code)
  }, 300)
}

/** Guard against a target that would escape the output root. */
const safeTarget = (target) => {
  const full = resolve(OUT_ROOT, target)
  const rel = relative(OUT_ROOT, full)
  return rel && !rel.startsWith('..') && !rel.startsWith(sep) ? full : null
}

let written = 0
let skipped = 0
let failed = 0

try {
  let page = null
  for (let i = 0; i < 60 && !page; i++) {
    try {
      page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json())
        .find((t) => t.type === 'page')
    } catch {}
    if (!page) await sleep(250)
  }
  if (!page) throw new Error('Chrome did not expose a debugging target')

  ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true })
    ws.addEventListener('error', () => rej(new Error('could not attach to Chrome')), { once: true })
  })
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data)
    const p = pending.get(m.id)
    if (!p) return
    pending.delete(m.id)
    m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result)
  })
  await send('Runtime.enable')

  for (const file of inputs) {
    const b64 = readFileSync(file).toString('base64')
    const mime = /\.png$/i.test(file) ? 'image/png'
      : /\.webp$/i.test(file) ? 'image/webp' : 'image/jpeg'
    if (mime === 'image/jpeg') {
      console.warn(`
  ! ${basename(file)} is a JPEG. JPEG cannot carry`
        + ' transparency, and its lossy chroma smears the magenta into the'
        + ' artwork at every edge, which leaves a pink fringe the key cannot'
        + ' fully remove. Ask for PNG.')
    }

    const probe = await send('Runtime.evaluate', {
      expression: `(async () => {
        const img = new Image();
        img.src = 'data:${mime};base64,${b64}';
        await img.decode();
        globalThis.__sheet = img;
        return JSON.stringify({ w: img.naturalWidth, h: img.naturalHeight });
      })()`,
      awaitPromise: true, returnByValue: true
    })
    if (probe.exceptionDetails) throw new Error(`could not decode ${basename(file)}`)
    const { w, h } = JSON.parse(probe.result.value)

    let sheet
    try {
      sheet = identify(file, w, h)
    } catch (e) {
      console.error(`\n✗ ${basename(file)} — ${e.message}`)
      failed++
      continue
    }

    // The sheet may come back at a different resolution than it left at, which
    // is fine and expected. What is NOT fine is a different SHAPE: that means
    // the grid was re-composed, and every rect in the index is then a lie.
    const sx = w / sheet.width
    const sy = h / sheet.height
    console.log(`\n${basename(file)} → ${sheet.kind} "${sheet.id}"  ${w}x${h} (${sx.toFixed(3)}x)`)

    // A STRIP is one row, so a uniform vertical squash is recoverable: the
    // cells still divide the width evenly, every cell is distorted by the same
    // factor, and stretching each one back to square restores the intent. An
    // image model that returns 1024x123 instead of 2048x256 has not re-composed
    // anything, it has just let the proportions drift, and refusing that would
    // throw away a good generation over arithmetic we can do ourselves.
    //
    // A multi-row SHEET gets no such benefit: there, a vertical mismatch means
    // the rows no longer land where the index says, and every rect is wrong.
    // A single-cell image has no lattice at all: the rect IS the image. Any
    // proportion it comes back at is simply resized to the target square, which
    // is why one object per file is the sturdiest way through — there is
    // nothing left for a repaint to knock out of alignment.
    if (sheet.kind === 'scenery' && Math.abs((w / h) / (sheet.width / sheet.height) - 1) > 0.06) {
      console.warn(`  ! aspect is ${(w / h).toFixed(2)}:1, wanted`
        + ` ${(sheet.width / sheet.height).toFixed(2)}:1 — it will be squeezed to fit.`)
    }
    if (sheet.tileable) {
      console.log('  · tileable band — checking the seam after slicing')
    }
    if (sheet.kind === 'cell' && Math.abs(w / h - 1) > 0.05) {
      console.warn(`  ! not square (${w}x${h}, ${(w / h).toFixed(2)}:1).`
        + ` Squaring by --fit ${FIT}${FIT === 'squash' ? ' (distorts)' : ' (crops the edges)'}.`)
      console.warn('    Set the aspect ratio in your image tool to 1:1 to avoid this.')
    }
    const drift = sheet.kind === 'cell' || sheet.kind === 'scenery'
      ? 0
      : Math.abs(sx - sy) / Math.max(sx, sy)
    if (drift > 0.01) {
      if (sheet.kind !== 'strip' || drift > 0.15) {
        console.error(`  ✗ aspect ratio changed (${sx.toFixed(3)} vs ${sy.toFixed(3)}).`)
        console.error(sheet.kind === 'strip'
          ? '    Too far off to correct — ask for it again at the stated size.'
          : '    The model re-composed the grid; the cell rects no longer apply.')
        failed++
        continue
      }
      console.warn(`  ! proportions drifted ${(drift * 100).toFixed(1)}%`
        + ` — squares came back ${sy < sx ? 'squashed' : 'stretched'}; correcting to square.`)
    }

    // Chroma is simply ON unless refused.
    //
    // Two heuristics were tried for "does this image have a magenta ground" and
    // both were wrong for the same reason: a block fills its cell edge to edge
    // by contract, so on a block strip there is barely any background to find —
    // magenta shows only in the rounded corners. Border sampling saw artwork,
    // and a whole-image fraction came in under any sane threshold.
    //
    // The keyer's channel test (G under 70 with R and B both over 190) matches
    // nothing in `PALETTES` — the closest is the bat's #ff5ad0, clear by twenty
    // points of green — so running it on an image with no magenta in it is a
    // no-op rather than a risk. No detection needed.
    const chroma = !NO_CHROMA

    // ── What grid did we ACTUALLY get back? ──
    //
    // A walk sheet is the one thing here that cannot survive a re-composed
    // grid. Every other target is either a single object or a row whose cells
    // are square by contract; a walk is N panels of one animation, and cutting
    // 4x2 out of a sheet that came back 4x6 does not produce a wrong-looking
    // frame, it produces three-sixths of a frame, eight times.
    //
    // Two real returns forced this. One came back with the panel dividers drawn
    // in as magenta LINES on a dusty-pink ground — the background rule read as
    // an instruction to decorate with magenta rather than to fill with it. The
    // other silently grew from two rows to six.
    //
    // So the layout is measured off the pixels: bands of content separated by
    // runs of background. Only the COUNT is taken from the measurement. The cut
    // itself stays a uniform grid, because panels of unequal width resampled to
    // one output size would shift the creature between frames — the exact
    // jitter the no-trim rule exists to prevent.
    if (sheet.kind === 'walk') {
      const seen = await send('Runtime.evaluate', {
        expression: `(() => {
          const img = globalThis.__sheet;
          const W = img.naturalWidth, H = img.naturalHeight;
          const cv = document.createElement('canvas');
          cv.width = W; cv.height = H;
          const c2 = cv.getContext('2d');
          c2.drawImage(img, 0, 0);
          const d = c2.getImageData(0, 0, W, H).data;

          // The background is whatever the outer ring is made of. Up to four
          // colours, because a drawn divider that reaches the edge is part of
          // the furniture even though it is not the ground.
          const q = (i) => ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4);
          const counts = new Map();
          const ring = [];
          for (let x = 0; x < W; x++) { ring.push(x); ring.push((H - 1) * W + x); }
          for (let y = 0; y < H; y++) { ring.push(y * W); ring.push(y * W + W - 1); }
          for (const k of ring) {
            const key = q(k * 4);
            counts.set(key, (counts.get(key) ?? 0) + 1);
          }
          const centre = (k) => [((k >> 8) & 15) * 16 + 8, ((k >> 4) & 15) * 16 + 8, (k & 15) * 16 + 8];
          const near = (a, b, tol) =>
            Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) <= tol;
          const refs = [];
          for (const [key] of [...counts].sort((a, b) => b[1] - a[1])) {
            const c3 = centre(key);
            if (refs.some((r) => near(r, c3, 64))) continue;
            if (refs.length < 4) refs.push(c3);
          }
          // Magenta counts as background wherever it turns up, drawn on purpose
          // or not: nothing in the palette is within twenty points of it.
          const isBg = (k) => {
            const i = k * 4;
            if (d[i + 3] < 8) return true;
            if (d[i + 1] < 70 && d[i] > 190 && d[i + 2] > 190) return true;
            return refs.some((r) => near(r, [d[i], d[i + 1], d[i + 2]], 60));
          };

          // How much of one line, across the whole axis, is background.
          const bgLine = (a, m, at) => {
            let bg = 0;
            for (let b = 0; b < m; b++) if (isBg(at(a, b))) bg++;
            return bg / m;
          };

          // ── Snap to a uniform grid, do not trust raw content bands ──
          //
          // Bands alone are wrong, and a real return proved it: a shark whose
          // tail fin is drawn detached from its body has a full-height column
          // of background running down the middle of its own panel, so four
          // panels measured as six bands. What is actually being looked for is
          // a REPEATING cut, and the cut is uniform by construction.
          //
          // So each candidate count is tested directly: are all of its interior
          // cut lines clean, and does every panel it produces contain something?
          // The largest count that passes wins — the cuts of a 4-grid are a
          // subset of an 8-grid's, so asking "is it clean" alone would always
          // answer 1.
          const fit = (n, m, at) => {
            const best = { n: 1 };
            for (let k = 2; k <= 12; k++) {
              if (n / k < 32) break;
              let clean = true;
              for (let i = 1; i < k && clean; i++) {
                // A drawn divider has width, and a cut can land a pixel either
                // side of it, so the neighbourhood is what is tested.
                const at0 = Math.round((n * i) / k);
                let bestLine = 0;
                for (let o = -2; o <= 2; o++) {
                  const a = at0 + o;
                  if (a < 0 || a >= n) continue;
                  bestLine = Math.max(bestLine, bgLine(a, m, at));
                }
                if (bestLine < 0.985) clean = false;
              }
              if (!clean) continue;
              // Every panel has to hold a creature. Without this an empty
              // margin would happily split into more, smaller empty panels.
              const content = [];
              for (let i = 0; i < k; i++) {
                const s0 = Math.round((n * i) / k), e0 = Math.round((n * (i + 1)) / k);
                let on = 0;
                for (let a = s0; a < e0; a++) if (bgLine(a, m, at) < 0.98) on++;
                content.push(on / Math.max(1, e0 - s0));
              }
              const top = Math.max(...content);
              if (top <= 0 || Math.min(...content) < top * 0.3) continue;
              best.n = k;
            }
            return best.n;
          };

          const colsN = fit(W, H, (x, y) => y * W + x);
          const rowsN = fit(H, W, (y, x) => y * W + x);
          // The commonest colour on the outer ring IS the ground the painter
          // used, whatever they were asked for. Reported so a background that
          // is merely magenta-ish can be named rather than guessed at.
          const top = refs[0] ?? [0, 0, 0];
          const hex = '#' + top.map((v) => v.toString(16).padStart(2, '0')).join('');
          const isMagenta = top[1] < 70 && top[0] > 190 && top[2] > 190;
          return JSON.stringify({ cols: colsN, rows: rowsN, W, H, hex, isMagenta });
        })()`,
        returnByValue: true
      })
      const got = seen.exceptionDetails ? null : JSON.parse(seen.result.value)
      const wantCols = sheet.cols
      const wantRows = sheet.rows

      if (!got || got.cols < 1 || got.rows < 1) {
        console.warn('  ! could not read the panel grid — cutting the nominal'
          + ` ${wantCols}x${wantRows}. Check the result before shipping it.`)
      } else if (got.cols === wantCols && got.rows === wantRows) {
        console.log(`  · grid reads ${got.cols}x${got.rows}, as asked`)
      } else if (FRAMES_OVERRIDE && FRAMES_OVERRIDE === got.cols * got.rows) {
        console.warn(`  ! grid reads ${got.cols}x${got.rows} = ${got.cols * got.rows} panels,`
          + ` not ${wantCols}x${wantRows} — taking it as a ${FRAMES_OVERRIDE}-frame cycle.`)
        sheet = { ...sheet, cols: got.cols, rows: got.rows, frames: got.cols * got.rows }
      } else if (got.cols === 1 && got.rows === 1) {
        console.warn('  ! the whole sheet reads as ONE panel. Either the creatures'
          + ' touch each other or the background is not one flat colour.')
        console.warn(`    Cutting the nominal ${wantCols}x${wantRows} anyway.`)
      } else {
        const n = got.cols * got.rows
        console.error(`  ✗ grid came back ${got.cols}x${got.rows} = ${n} panels,`
          + ` asked for ${wantCols}x${wantRows} = ${sheet.frames}.`)
        console.error('    The panels are not where the cut expects them, so slicing'
          + ' this would shred every frame.')
        console.error(`    Re-generate it, or run again with --frames ${n} to accept`
          + ` it as a ${n}-frame cycle.`)
        failed++
        continue
      }

      // A ground that is only ROUGHLY magenta is the difference between a hard
      // key, which can never touch the artwork, and the flood fallback, which
      // eats any pale paint it can reach. One return came back on dusty pink and
      // lost three of its eight fish to exactly that.
      if (got && got.isMagenta === false) {
        console.warn(`  ! the background is ${got.hex}, not #ff00ff.`)
        console.warn('    Only true magenta can be keyed safely. Anything else falls')
        console.warn('    back to a flood fill, which eats pale artwork it can reach —')
        console.warn('    check every frame before shipping this.')
      }

      // Rebuild the cells on whatever grid we settled on. The index's rects
      // describe the sheet that went OUT; this describes the one that came in.
      const pw = sheet.width / sheet.cols
      const ph = sheet.height / sheet.rows
      sheet = {
        ...sheet,
        cells: Array.from({ length: sheet.frames }, (_, i) => ({
          id: `${sheet.id}#${i}`,
          label: sheet.id,
          variant: `frame ${i + 1}/${sheet.frames}`,
          x: (i % sheet.cols) * pw,
          y: Math.floor(i / sheet.cols) * ph,
          w: pw, h: ph,
          target: sheet.target,
          frame: i
        }))
      }
    }

    const slices = sheet.cells.filter((c) => c.target)
    if (!slices.length) {
      console.log(`  (no cell on this ${sheet.kind} has a drop-in target — reference only)`)
      continue
    }

    const plan = slices.map((c) => ({
      id: c.id,
      target: c.target,
      letterboxed: c.letterboxed ?? null,
      sx: Math.round(c.x * sx), sy: Math.round(c.y * sy),
      sw: Math.round(c.w * sx), sh: Math.round(c.h * sy),
      // Square again. When the proportions drifted this is what undoes it;
      // when they did not, source and output are equal and nothing resamples.
      // A single-cell image is capped: a model handed back 1536x1536 would
      // otherwise become a 1536 px block sprite, which is six times the size
      // `art-todo.md` asks for and pure payload for no visible gain.
      fit: sheet.kind === 'cell' ? FIT : 'squash',
      isBlock: (c.target ?? '').startsWith('images/blocks/'),
      trim: !NO_TRIM && sheet.kind !== 'scenery',
      // Never on a block: a block fills its cell by contract, so its border IS
      // artwork and a flood fill would eat straight into it.
      // An OPAQUE band is all artwork, edge to edge. Keying it removed 90% of
      // the meadow and 96% of the lake, because their flat green and blue
      // grounds look exactly like a background to a flood fill.
      autoBg: !NO_AUTO_BG && !(c.target ?? '').startsWith('images/blocks/')
        && sheet.bg !== 'opaque',
      // Which frame edges may SEED the flood.
      //
      // A band whose sky is at the top has artwork touching the other three
      // edges: the mountain range's base runs along the bottom, and its uniform
      // pale wash was picked up as "the background", so the flood started there
      // and ate the entire range but one peak. The sky is contiguous from the
      // top, so seeding from that edge alone reaches all of it and can never
      // start inside the mountain.
      seedTopOnly: sheet.bg === 'magenta-sky',
      // Enclosed-pocket removal is for a checkerboard square walled in by
      // artwork. On a JPEG it does the opposite: lossy chroma sprays magenta
      // INTO pale artwork, those specks look like tiny gaps, and removing them
      // punched holes right through the logo's lettering. Lossless only.
      pockets: mime !== 'image/jpeg',
      // Which frame of a walk cycle this panel is, or undefined for everything
      // else. Its presence is what routes the panel into the strip composer
      // instead of straight to a file of its own.
      frame: c.frame,
      outW: sheet.kind === 'scenery'
        ? c.w
        : sheet.kind === 'walk'
          // Panels keep their proportions and are capped by height. A sheet
          // returned at 4K would otherwise compose into an 8192 px strip, which
          // is pure payload: the frame box is ~156 px in game and the bake is
          // already downsampling at maximum zoom on a 3x screen.
          ? Math.round(Math.min(384, Math.round(c.h * sy)) * (c.w * sx) / (c.h * sy))
          : undefined,
      outH: sheet.kind === 'scenery'
        ? c.h
        : sheet.kind === 'walk' ? Math.min(384, Math.round(c.h * sy)) : undefined,
      out: FORCE_SIZE ?? (sheet.kind === 'cell'
        ? Math.min(512, Math.round(Math.max(c.w * sx, c.h * sy)))
        : Math.round(c.w * sx))
    }))

    const cut = await send('Runtime.evaluate', {
      expression: `(() => {
        const img = globalThis.__sheet;
        const plan = ${JSON.stringify(plan)};
        const q = ${QUALITY};
        const CHROMA = ${chroma && sheet.bg !== 'opaque'};
        const out = [];
        // Walk-cycle panels, held back so they can be composed into one strip.
        const strip = [];
        for (const p of plan) {
          // Crop the cell 1:1 first, so measuring happens on real pixels.
          const cell = document.createElement('canvas');
          cell.width = p.sw; cell.height = p.sh;
          const cc = cell.getContext('2d');
          cc.drawImage(img, p.sx, p.sy, p.sw, p.sh, 0, 0, p.sw, p.sh);

          const id = cc.getImageData(0, 0, p.sw, p.sh);
          const d = id.data;
          const N_PIX = p.sw * p.sh;
          let keyed = 0;

          // Chroma key. Asking an image model for a transparent background is
          // unreliable — one attempt came back fully opaque, and it painted the
          // grey-and-white transparency checkerboard in as if it were art. A
          // flat magenta ground is something it can actually draw, and this
          // removes it. The band between the two thresholds is the anti-aliased
          // edge: it gets partial alpha, and the magenta pulled back out of the
          // surviving colour so sprites do not wear a pink halo.
          if (CHROMA) {
            // A CHANNEL test, not a distance-to-magenta one. Distance banding
            // ate legitimate colour: the bat's accent is #ff5ad0, which sits
            // close enough to pure magenta that a soft distance key knocked it
            // to 39% alpha. Pure magenta is the only thing with G near zero AND
            // both R and B near full, and no palette in the game has that.
            const W = p.sw, H = p.sh, N = W * H;
            const bg = new Uint8Array(N);
            for (let k = 0; k < N; k++) {
              const i = k * 4;
              if (d[i + 1] < 70 && d[i] > 190 && d[i + 2] > 190) { bg[k] = 1; d[i + 3] = 0; keyed++; }
            }
            // De-fringe ONLY where art meets keyed background. Anti-aliasing
            // leaves a pink rim there; running this over the whole cell instead
            // would desaturate every warm highlight in the sprite.
            for (let y = 0; y < H; y++) {
              for (let x = 0; x < W; x++) {
                const k = y * W + x;
                if (bg[k]) continue;
                const touches = (x > 0 && bg[k - 1]) || (x < W - 1 && bg[k + 1])
                  || (y > 0 && bg[k - W]) || (y < H - 1 && bg[k + W]);
                if (!touches) continue;
                const i = k * 4, r = d[i], g = d[i + 1], b = d[i + 2];
                if (r > g + 30 && b > g + 30) {
                  const spill = Math.min(r - g, b - g);
                  d[i] = r - spill;
                  d[i + 2] = b - spill;
                  d[i + 3] = Math.max(0, d[i + 3] - Math.round(spill * 0.8));
                }
              }
            }
            // ── Unmix the soft edge from the magenta ──
            //
            // A hard key only removes what IS the ground. The moon is painted
            // with a wide luminous halo, and where that halo lay over the
            // magenta the two MIXED: those pixels are not background, and they
            // are nowhere near an edge, so both the flood and the erode leave
            // them. The moon shipped wearing a thick pink ring.
            //
            // Its background colour is known exactly, so the mix can be undone.
            // Distance from magenta gives the coverage, and magenta's share is
            // then subtracted back out of the colour that remains.
            //
            // Gated on the hard key having found REAL ground, not on the shore
            // clustering — a halo is a gradient across dozens of buckets, which
            // is exactly the case the clustering gate rejects.
            if (keyed > N_PIX * 0.03) {
              const LO = 60, HI = 210;
              for (let i = 0; i < d.length; i += 4) {
                if (d[i + 3] < 8) continue;
                const dist = Math.abs(d[i] - 255) + d[i + 1] + Math.abs(d[i + 2] - 255);
                if (dist >= HI) continue;
                if (dist <= LO) { d[i + 3] = 0; keyed++; continue; }
                const a2 = (dist - LO) / (HI - LO);
                // P = a*F + (1-a)*B, with B = magenta  =>  F = (P - (1-a)*B) / a
                const un = (v, bg) => {
                  const f = (v - (1 - a2) * bg) / a2;
                  return f < 0 ? 0 : f > 255 ? 255 : Math.round(f);
                };
                d[i] = un(d[i], 255);
                d[i + 1] = un(d[i + 1], 0);
                d[i + 2] = un(d[i + 2], 255);
                d[i + 3] = Math.round(d[i + 3] * a2);
              }
            }

            // ── Boundary erode ──
            //
            // The difference key only reaches pixels within 210 of magenta, and
            // the very outermost rim of a soft edge sits beyond that — which is
            // why the sun kept a thin pink outline after everything else. Being
            // ADJACENT to keyed background is itself strong evidence, so the
            // rule can be much looser there than it could be image-wide.
            if (keyed > N_PIX * 0.03) {
              const W2 = p.sw, H2 = p.sh;
              const Aa = (k) => d[k * 4 + 3];
              for (let pass = 0; pass < 2; pass++) {
                const edits = [];
                for (let y = 0; y < H2; y++) {
                  for (let x = 0; x < W2; x++) {
                    const k = y * W2 + x, i = k * 4;
                    if (d[i + 3] < 8) continue;
                    const touches = (x > 0 && Aa(k - 1) < 8) || (x < W2 - 1 && Aa(k + 1) < 8)
                      || (y > 0 && Aa(k - W2) < 8) || (y < H2 - 1 && Aa(k + W2) < 8);
                    if (!touches) continue;
                    const dist = Math.abs(d[i] - 255) + d[i + 1] + Math.abs(d[i + 2] - 255);
                    if (dist >= 300) continue;
                    edits.push([i, Math.round(d[i + 3] * Math.max(0, (dist - 120) / 180))]);
                  }
                }
                if (!edits.length) break;
                for (const [i, a2] of edits) d[i + 3] = a2;
              }
            }

            // ── Spill suppression ──
            //
            // What is left after unmixing is a mauve ring: halo pixels far
            // enough from pure magenta that widening the unmix to reach them
            // would start eating the moon's own pale edge.
            //
            // So stop trying to make them transparent and take the magenta OUT
            // of them instead. Magenta's signature is red and blue both above
            // green; pulling the excess down leaves a neutral halo, which is
            // what the glow was supposed to be. Warm art is untouched — cream
            // and tan have blue BELOW green, so they show no excess at all.
            if (keyed > N_PIX * 0.03) {
              for (let i = 0; i < d.length; i += 4) {
                if (d[i + 3] < 8) continue;
                const g = d[i + 1];
                const spill = Math.min(d[i], d[i + 2]) - g;
                if (spill <= 0) continue;
                d[i] = Math.round(d[i] - spill * 0.9);
                d[i + 2] = Math.round(d[i + 2] - spill * 0.9);
              }
            }

            cc.putImageData(id, 0, 0);
          }

          // ── Whatever the background actually turned out to be ──
          //
          // The magenta key only removes magenta. Returns arrive on white, on
          // cream parchment, or with the transparency CHECKERBOARD painted in
          // as literal pixels — a texture no colour key can express.
          //
          // So: work out what the background IS from the edge of the artwork,
          // then flood inward. Flooding is the trick — it only removes what is
          // CONNECTED to an edge, so a cream highlight inside the sun survives
          // while the cream around it does not.
          //
          // SEEDS ARE THE SHORE, NOT THE FRAME. Seeding from the image border
          // failed on the logo, which came back as a cream card floating on
          // magenta: the key cleared the border first, so there were no opaque
          // border pixels left to start from and the card sailed through. The
          // seeds are therefore every opaque pixel that touches transparency or
          // the frame — the outline of whatever is actually left.
          if (p.autoBg) {
            const W = p.sw, H = p.sh, N = W * H;
            const A = (k) => d[k * 4 + 3];
            const q = (i) => ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4);

            const seeds = [];
            for (let y = 0; y < H; y++) {
              for (let x = 0; x < W; x++) {
                const k = y * W + x;
                if (A(k) < 8) continue;
                // SEED FROM THE FRAME ONLY.
                //
                // Seeding from "opaque next to transparent" was seeding from
                // the ARTWORK'S OWN OUTLINE: once the magenta around a conifer
                // is keyed, the tree's silhouette becomes the shore, its
                // uniform dark green becomes "the background", and the flood
                // eats holes straight through the foliage.
                //
                // Background is by definition what reaches the edge of the
                // frame. Anything walled in by artwork is either a pocket
                // (handled separately) or it is the artwork.
                const onFrame = p.seedTopOnly
                  ? y === 0
                  : x === 0 || y === 0 || x === W - 1 || y === H - 1;
                if (onFrame) seeds.push(k);
              }
            }

            const counts = new Map();
            for (const k of seeds) {
              const key = q(k * 4);
              counts.set(key, (counts.get(key) ?? 0) + 1);
            }
            // CLUSTER the buckets, do not just take the top four.
            //
            // A JPEG smears one flat colour across a dozen neighbouring
            // buckets: the logo's magenta ring came back as 24 of them, and
            // taking the top four covered 68.9% — losing to a 70% gate by a
            // hair, on an image that was plainly magenta. Merging by proximity
            // measures what a human sees, which is one colour.
            const centre = (key) =>
              [((key >> 8) & 15) * 16 + 8, ((key >> 4) & 15) * 16 + 8, (key & 15) * 16 + 8];
            // 64, and the margin either side of that is the whole point.
            //
            // The logo's JPEG-smeared magenta spanned buckets about 48 apart,
            // so they must merge. Cream sits roughly 180 from magenta, so it
            // must NOT — at 96 it did, and the key ate the lettering entirely
            // and punched holes through the sun's face.
            const near = (a2, b2) =>
              Math.abs(a2[0] - b2[0]) + Math.abs(a2[1] - b2[1]) + Math.abs(a2[2] - b2[2]) <= 64;

            const ranked = [...counts].sort((a2, b2) => b2[1] - a2[1]);
            const refs = [];
            let covered = 0;
            for (const [key, n] of ranked) {
              const c2 = centre(key);
              const hit = refs.find((r2) => near(r2, c2));
              if (hit) { covered += n; continue; }
              if (refs.length < 4) { refs.push(c2); covered += n }
            }
            const keep = (i) => refs.some((r2) => near(r2, [d[i], d[i + 1], d[i + 2]]));

            // A flat ground clusters; a block's wood-grain border does not.
            if (seeds.length > 0 && covered / seeds.length >= 0.7) {
              const seen = new Uint8Array(N);
              const stack = [];
              for (const k of seeds) {
                if (keep(k * 4) && !seen[k]) { seen[k] = 1; stack.push(k); }
              }
              let removed = 0;
              while (stack.length) {
                const k = stack.pop();
                d[k * 4 + 3] = 0;
                removed++;
                const x = k % W, y = (k / W) | 0;
                const push = (nk) => {
                  if (nk < 0 || nk >= N || seen[nk]) return;
                  if (A(nk) < 8) { seen[nk] = 1; return; }
                  if (!keep(nk * 4)) return;
                  seen[nk] = 1; stack.push(nk);
                };
                if (x > 0) push(k - 1);
                if (x < W - 1) push(k + 1);
                if (y > 0) push(k - W);
                if (y < H - 1) push(k + W);
              }

              // ── Enclosed pockets ──
              //
              // A checkerboard square sitting in the gap between two of the
              // sun's rays is walled in by artwork, so the flood never reaches
              // it and it survives as grey speckle. Anything still matching the
              // background AND small enough to be a gap rather than a subject
              // goes too.
              // A pocket has to be a real gap, matched TIGHTLY.
              //
              // The loose match used for the flood is wrong here. JPEG noise
              // sprinkles single pixels that pass it, and removing those
              // punched magenta speckle right across the logo's card; a looser
              // match also ate two holes in the sun's face, where pale cream
              // came within range of checker-white. Cream sits ~89 from white,
              // so 32 protects it while still catching a true checker cell.
              const nearTight = (a2, b2) =>
                Math.abs(a2[0] - b2[0]) + Math.abs(a2[1] - b2[1]) + Math.abs(a2[2] - b2[2]) <= 32
              const pocketBg = (i) => refs.some((r2) => nearTight(r2, [d[i], d[i + 1], d[i + 2]]))
              const POCKET_MAX = p.pockets ? Math.max(64, Math.round(N * 0.004)) : 0
              /** Below this it is compression noise, not a gap in the drawing. */
              const POCKET_MIN = 8
              const comp = new Int32Array(N).fill(-1)
              for (let k0 = 0; k0 < N; k0++) {
                if (comp[k0] !== -1 || A(k0) < 8 || !pocketBg(k0 * 4)) continue
                const cells = []
                const st = [k0]
                comp[k0] = k0
                while (st.length) {
                  const k = st.pop()
                  cells.push(k)
                  const x = k % W, y = (k / W) | 0
                  const step = (nk) => {
                    if (nk < 0 || nk >= N || comp[nk] !== -1) return
                    if (A(nk) < 8 || !pocketBg(nk * 4)) return
                    comp[nk] = k0; st.push(nk)
                  }
                  if (x > 0) step(k - 1)
                  if (x < W - 1) step(k + 1)
                  if (y > 0) step(k - W)
                  if (y < H - 1) step(k + W)
                }
                if (cells.length >= POCKET_MIN && cells.length <= POCKET_MAX) {
                  for (const k of cells) { d[k * 4 + 3] = 0; removed++ }
                }
              }

              // ── De-fringe ──
              //
              // A checkerboard against ink leaves a rim of pixels that are a
              // BLEND of the two, matching neither bucket, which survives as
              // white speckle along every ray. How close a boundary pixel is to
              // the background decides how much alpha it keeps.
              for (let pass = 0; pass < 2; pass++) {
                const edits = [];
                for (let y = 0; y < H; y++) {
                  for (let x = 0; x < W; x++) {
                    const k = y * W + x, i = k * 4;
                    if (d[i + 3] < 8) continue;
                    const touches = (x > 0 && A(k - 1) < 8) || (x < W - 1 && A(k + 1) < 8)
                      || (y > 0 && A(k - W) < 8) || (y < H - 1 && A(k + W) < 8);
                    if (!touches) continue;
                    let best = 1e9;
                    for (const [rr, gg, bb] of refs) {
                      const dist = Math.abs(d[i] - rr) + Math.abs(d[i + 1] - gg) + Math.abs(d[i + 2] - bb);
                      if (dist < best) best = dist;
                    }
                    if (best < 70) edits.push([i, 0]);
                    else if (best < 170) edits.push([i, Math.round(d[i + 3] * (best - 70) / 100)]);
                  }
                }
                if (!edits.length) break;
                for (const [i, a2] of edits) { if (a2 === 0) removed++; d[i + 3] = a2; }
              }

              keyed += removed;
              cc.putImageData(id, 0, 0);
            }
          }

          let x0 = p.sw, y0 = p.sh, x1 = -1, y1 = -1, opaque = 0;
          for (let y = 0; y < p.sh; y++)
            for (let x = 0; x < p.sw; x++) {
              const a = d[(y * p.sw + x) * 4 + 3];
              if (a > 8) {
                opaque++;
                if (x < x0) x0 = x; if (x > x1) x1 = x;
                if (y < y0) y0 = y; if (y > y1) y1 = y;
              }
            }
          if (x1 < 0) {
            // A dropped panel is the commonest way a walk sheet comes back wrong,
            // and it must not silently become a hole in the animation.
            if (p.frame !== undefined) strip.push({ frame: p.frame, empty: true });
            else out.push({ id: p.id, empty: true });
            continue;
          }

          // A block has to reach all four edges or it tiles with a seam, and an
          // illustrator's instinct is to leave a polite margin — this crops
          // that margin back off and lets the block fill its cell. Only for
          // blocks: an enemy is SUPPOSED to have space around it.
          let src = { x: 0, y: 0, w: p.sw, h: p.sh };
          let trimmed = false;
          if (p.isBlock && p.trim && x1 >= 0) {
            const touches = x0 === 0 && y0 === 0 && x1 === p.sw - 1 && y1 === p.sh - 1;
            if (!touches) {
              src = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
              trimmed = true;
            }
          }

          let dst;
          if (p.letterboxed) {
            // This cell holds an existing bitmap that was padded into a square.
            // Trim the padding back off and restore its real dimensions, or the
            // game gets a square file where it expects a 3:1 ribbon.
            const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
            dst = document.createElement('canvas');
            dst.width = p.letterboxed.w; dst.height = p.letterboxed.h;
            dst.getContext('2d').drawImage(cell, x0, y0, bw, bh, 0, 0, dst.width, dst.height);
          } else if (p.outW && p.outH) {
            // A landscape band: written at its declared shape, never squared.
            dst = document.createElement('canvas');
            dst.width = p.outW; dst.height = p.outH;
            dst.getContext('2d').drawImage(cell, 0, 0, p.outW, p.outH);
          } else if (!trimmed && p.out === p.sw && p.out === p.sh) {
            dst = cell;
          } else if (trimmed) {
            dst = document.createElement('canvas');
            dst.width = p.out; dst.height = p.out;
            dst.getContext('2d').drawImage(cell, src.x, src.y, src.w, src.h,
              0, 0, p.out, p.out);
          } else {
            dst = document.createElement('canvas');
            dst.width = p.out; dst.height = p.out;
            const dc = dst.getContext('2d');
            if (p.fit === 'crop' && p.sw !== p.sh) {
              // Keep the material's proportions and lose the outer edges.
              const side = Math.min(p.sw, p.sh);
              dc.drawImage(cell, (p.sw - side) / 2, (p.sh - side) / 2, side, side,
                0, 0, p.out, p.out);
            } else {
              dc.drawImage(cell, 0, 0, p.out, p.out);
            }
          }
          // How much of each edge of the cell is actually opaque. A building
          // block has to reach all four, or the tower shows a seam around every
          // one of them — rounded corners and a polite margin are exactly what
          // an illustrator draws unless told not to.
          const edge = (pick) => {
            let on = 0, n = 0;
            for (let t = 0; t < (pick < 2 ? p.sw : p.sh); t++) {
              const x = pick === 0 || pick === 1 ? t : (pick === 3 ? 0 : p.sw - 1);
              const y = pick === 0 ? 0 : pick === 1 ? p.sh - 1 : t;
              n++;
              if (d[(y * p.sw + x) * 4 + 3] > 8) on++;
            }
            return n ? on / n : 0;
          };
          const edges = [edge(0), edge(1), edge(2), edge(3)];

          // A walk-cycle panel is a FRAME, not a file. It is held with its
          // content bbox so the frames can be checked against each other, then
          // composed into one strip below.
          if (p.frame !== undefined) {
            strip.push({
              frame: p.frame, cv: dst, keyed, srcArea: p.sw * p.sh,
              // Where the drawing sits in its panel, as fractions of the panel.
              // These are what catch a creature that wandered between frames.
              foot: (y1 + 1) / p.sh, top: y0 / p.sh,
              midX: ((x0 + x1) / 2) / p.sw,
              coverage: opaque / (p.sw * p.sh)
            });
            continue;
          }

          out.push({
            id: p.id,
            target: p.target,
            keyed,
            srcArea: p.sw * p.sh,
            // How much of the finished sprite's BORDER is opaque.
            //
            // Total transparency is the wrong signal: the logo came back with a
            // cream card behind it and a magenta strip along one edge, so a
            // fifth of it keyed out and a whole-image threshold saw nothing
            // wrong. What says "the background survived" is the edge — a sprite
            // meant to sit on the battlefield has see-through borders.
            // How solidly the sprite fills its own bounding box.
            //
            // The border was the wrong probe. Once the magenta ring around the
            // logo's cream card is keyed, the border IS transparent and the
            // check passes — while the card sits untouched in the middle. What
            // gives a card away is that it fills its bounding box completely;
            // a sun, a tree or a logo's lettering never does.
            bboxFill: (() => {
              const W = dst.width, H = dst.height;
              const q = dst.getContext('2d').getImageData(0, 0, W, H).data;
              let x0 = W, y0 = H, x1 = -1, y1 = -1, on = 0;
              for (let y = 0; y < H; y++) {
                for (let x = 0; x < W; x++) {
                  if (q[(y * W + x) * 4 + 3] < 8) continue;
                  on++;
                  if (x < x0) x0 = x; if (x > x1) x1 = x;
                  if (y < y0) y0 = y; if (y > y1) y1 = y;
                }
              }
              if (x1 < 0) return 0;
              return on / ((x1 - x0 + 1) * (y1 - y0 + 1));
            })(),
            edges,
            trimmed,
            w: dst.width, h: dst.height,
            coverage: opaque / (p.sw * p.sh),
            dataUrl: dst.toDataURL('image/webp', q)
          });
        }
        // ── Compose the walk cycle ──
        //
        // One image, frames left to right in cycle order, every panel the same
        // size. The runtime divides the width by the frame box's aspect to get
        // the frame count back, so the panels must be uniform and in order.
        if (strip.length) {
          const walkId = ((plan.find((x) => x.frame !== undefined) || {}).id || 'walk')
            .split('#')[0];
          strip.sort((a2, b2) => a2.frame - b2.frame);
          const solid = strip.filter((f) => !f.empty);
          if (!solid.length) {
            out.push({ id: walkId, empty: true });
          } else {
            const fw = solid[0].cv.width, fh = solid[0].cv.height;
            const cv = document.createElement('canvas');
            cv.width = fw * strip.length;
            cv.height = fh;
            const g = cv.getContext('2d');
            for (let i = 0; i < strip.length; i++) {
              const f = strip[i];
              // A dropped panel holds its slot as a transparent frame rather
              // than shortening the strip: a missing frame is a visible hitch
              // in the walk, which is the point of reporting it.
              if (!f.empty) g.drawImage(f.cv, i * fw, 0);
            }
            out.push({
              id: walkId,
              target: (plan.find((x) => x.frame !== undefined) || {}).target,
              frames: strip.length,
              missing: strip.filter((f) => f.empty).map((f) => f.frame + 1),
              feet: solid.map((f) => f.foot),
              mids: solid.map((f) => f.midX),
              coverages: solid.map((f) => f.coverage),
              keyed: solid.reduce((a2, f) => a2 + f.keyed, 0),
              srcArea: solid.reduce((a2, f) => a2 + f.srcArea, 0),
              w: cv.width, h: cv.height,
              dataUrl: cv.toDataURL('image/webp', q)
            });
          }
        }

        return JSON.stringify(out);
      })()`,
      returnByValue: true
    })
    if (cut.exceptionDetails) {
      throw new Error(cut.exceptionDetails.exception?.description ?? 'slice failed')
    }

    for (const r of JSON.parse(cut.result.value)) {
      if (r.empty) {
        console.log(`  · ${r.id.padEnd(26)} empty cell, skipped`)
        skipped++
        continue
      }
      if (!r.dataUrl.startsWith('data:image/webp')) {
        console.error(`  ✗ ${r.id.padEnd(26)} browser would not encode WebP`)
        failed++
        continue
      }
      const full = safeTarget(r.target)
      if (!full) {
        console.error(`  ✗ ${r.id.padEnd(26)} target escapes ${relative(ROOT, OUT_ROOT)}/`)
        failed++
        continue
      }
      // A sprite that is meant to sit ON something needs a background that was
      // actually removed. Blocks are the exception: they fill their cell by
      // contract, so an opaque one is correct.
      // An opaque band IS a solid rectangle — that is its whole job.
      if (r.bboxFill !== undefined && r.bboxFill > 0.92
        && !(r.target ?? '').startsWith('images/blocks/')
        && sheet.bg !== 'opaque') {
        console.warn(`    ! ${r.id} fills ${(r.bboxFill * 100).toFixed(0)}% of its own`
          + ' bounding box — it is a solid rectangle.')
        console.warn('      The subject was almost certainly painted onto a card or panel')
        console.warn('      that is now welded in. Re-generate it on flat magenta.')
      }

      // Enemies and allies are ANIMATED. `drawEnemy` early-returns on an
      // override and blits the still, so a bitmap here does not restyle the
      // character — it freezes it, replacing a 16-frame walk cycle with one
      // pose that slides across the ground. Blocks do not have this problem
      // because a block never moves.
      //
      // `images/monsters/` is the answer to this and gets no such warning: it
      // is a strip, and it keeps the character walking.
      if (/^images\/(enemies|allies)\//.test(r.target ?? '')) {
        console.warn(`    ! ${r.id} is an ANIMATED character. This still replaces its`)
        console.warn('      whole 16-frame walk cycle with one frozen pose.')
        console.warn(`      A walk-cycle sheet (art-sheets/walk-*.png) restyles it instead.`)
      }

      // ── Walk-cycle sanity ──
      //
      // The strip is composed blind from a fixed grid, so everything that can go
      // wrong with it goes wrong quietly: a panel the model declined to paint, a
      // creature that grew between frames, a creature that walked out of its own
      // panel. None of that is visible in the file — it is visible in the game,
      // as a limp.
      if (r.frames !== undefined) {
        if (r.missing?.length) {
          console.warn(`    ! frame${r.missing.length > 1 ? 's' : ''} ${r.missing.join(', ')}`
            + ` of ${r.frames} came back EMPTY — the walk will hitch there.`)
        }
        const spread = (xs) => (xs?.length ? Math.max(...xs) - Math.min(...xs) : 0)
        // The feet must land on one line. This is the difference between a walk
        // and a hop, and it is the single most likely thing to be wrong.
        const foot = spread(r.feet)
        if (foot > 0.04) {
          console.warn(`    ! the feet move ${(foot * 100).toFixed(0)}% of the panel height`
            + ' between frames — the creature will bob as it walks.')
        }
        const mid = spread(r.mids)
        if (mid > 0.08) {
          console.warn(`    ! the body drifts ${(mid * 100).toFixed(0)}% of the panel width`
            + ' between frames — it will slide as it walks.')
        }
        // A frame that is much bigger or smaller than its neighbours is a
        // redraw at a different scale, not a pose.
        const cov = spread(r.coverages)
        const avg = r.coverages?.length
          ? r.coverages.reduce((a, b) => a + b, 0) / r.coverages.length
          : 0
        if (avg > 0 && cov / avg > 0.5) {
          console.warn(`    ! frame sizes vary by ${((cov / avg) * 100).toFixed(0)}%`
            + ' — the creature was redrawn at different scales.')
        }
      }

      // A block that does not reach its own edges will tile with a gap.
      if (r.target?.startsWith('images/blocks/') && r.edges && !r.trimmed) {
        const names = ['top', 'bottom', 'left', 'right']
        const short = r.edges
          .map((v, i) => ({ v, n: names[i] }))
          .filter((e) => e.v < 0.9)
        if (short.length) {
          console.warn(`    ! ${r.id} does not reach its ${short.map((e) => e.n).join('/')} edge`
            + ` (${short.map((e) => `${(e.v * 100).toFixed(0)}%`).join(', ')}).`
            + ' Stacked, this shows a seam — ask for square corners, no margin.')
        }
      }
      const bytes = Buffer.from(r.dataUrl.slice(r.dataUrl.indexOf(',') + 1), 'base64')
      const shown = `${r.target}  ${r.w}x${r.h}  ${(bytes.length / 1024).toFixed(1)}kB`
        + (r.trimmed ? '  (trimmed to fill)' : '')
        + (r.keyed ? `  (keyed ${(100 * r.keyed / r.srcArea).toFixed(0)}% bg)` : '')
      if (DRY) {
        console.log(`  → ${r.id.padEnd(26)} ${shown}`)
      } else {
        mkdirSync(dirname(full), { recursive: true })
        writeFileSync(full, bytes)
        console.log(`  ✓ ${r.id.padEnd(26)} ${shown}`)
      }
      written++
    }
  }

  console.log(`\n${DRY ? 'would write' : 'wrote'} ${written} file(s)`
    + `${skipped ? `, skipped ${skipped} empty` : ''}`
    + `${failed ? `, ${failed} FAILED` : ''}`)
  if (written && !DRY) {
    console.log('\nTo see it: open the game with  ?art=on   (remembered; ?art=off reverts).')
    console.log('Already open? Run  __art.refresh()  in the console to re-read from disk.')
    console.log('To ship it enabled, set VITE_ENABLE_ART_OVERRIDES=true in .env.')
  }
  shutdown(failed ? 1 : 0)
} catch (e) {
  console.error('\nERROR: ' + e.message)
  shutdown(1)
}
