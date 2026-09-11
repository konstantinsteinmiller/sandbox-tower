// Operator-only: pull each playtester's final save + controller log stats.
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const PT = 'C:/Users/konst/AppData/Local/Temp/claude/C--Users-konst-Documents---p-tower-siege/686de921-c5a0-4519-8e50-1f8cf868a764/scratchpad/playtest'
const evalIn = async (id, expr) => {
  const list = await (await fetch(`http://127.0.0.1:${9300 + id}/json/list`)).json()
  const page = list.find((t) => t.type === 'page')
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((r) => { ws.onopen = r })
  return new Promise((resolve) => {
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data)
      if (m.id !== 1) return
      ws.close()
      resolve(m.result?.result?.value)
    }
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }))
  })
}

const rows = []
for (let id = 1; id <= 10; id++) {
  const s = await evalIn(id, `JSON.parse(localStorage.getItem('tower_state') || '{}')`).catch(() => ({}))
  const log = readFileSync(join(PT, 'logs', `pt-${id}.log`), 'utf8').split('\n')
  const cmds = log.filter((l) => l.includes('] cmd '))
  const last = cmds.at(-1) || ''
  const vt = Number((last.match(/vt=(\d+)/) || [])[1] || 0)
  const mobile = id >= 6
  const tech = (mobile ? s.ts_m2_tech : s.ts_tech)?.levels || {}
  const missions = s.ts_missions?.missions || []
  rows.push({
    id,
    platform: mobile ? 'phone' : 'desktop',
    runsStarted: s.ts_runs ?? null,
    bestWave: mobile ? s.ts_m2_best_wave ?? null : s.ts_best_wave ?? null,
    bestScore: s.ts_best_score ?? null,
    coinsHeld: s.ts_coins ?? null,
    coinsEarnedTotal: s.ts_total_coins ?? null,
    techRanksBought: Object.values(tech).reduce((a, b) => a + b, 0),
    techNodes: Object.keys(tech).join(' '),
    missionsClaimed: missions.filter((m) => m.claimed).length + '/' + missions.length,
    tutorialDone: mobile ? !!s.ts_m2_tutorial : !!s.ts_tutorial,
    mergeGuideSeen: mobile ? !!s.ts_m2_merge_guide : !!s.ts_merge_guide,
    techIntroSeen: mobile ? !!s.ts_m2_tech_intro : !!s.ts_tech_intro,
    controllerCommands: cmds.length,
    reloads: log.filter((l) => l.includes('player reload')).length,
    gameSeconds: Math.round(vt / 1000),
    pageExceptions: log.filter((l) => l.includes('PAGE EXCEPTION')).length,
    notes: existsSync(join(PT, 'reports', `pt-${id}.notes.md`)) ? readFileSync(join(PT, 'reports', `pt-${id}.notes.md`), 'utf8').split('\n').filter(Boolean).length : 0,
    report: existsSync(join(PT, 'reports', `pt-${id}.md`))
  })
}
writeFileSync(join(PT, 'reports', 'operator-stats.json'), JSON.stringify(rows, null, 1))
console.table(rows.map(({ techNodes, ...r }) => r))
for (const r of rows) console.log(`pt-${r.id} tech: ${r.techNodes}`)
