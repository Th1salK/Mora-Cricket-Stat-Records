// Frozen copy of the pre-Phase-1 maths. Used only by golden tests and
// scripts/compare-stats.ts. Delete after Phase 1 ships.
import type { BatRow, BowlRow } from "@/lib/stats/types"

export function legacyBattingByPlayer(rows: BatRow[]) {
  const grouped: Record<string, BatRow[]> = {}
  for (const row of rows) (grouped[row.playerId] ??= []).push(row)
  return new Map(Object.entries(grouped).map(([pid, perfs]) => {
    const innings = perfs.length
    const runs = perfs.reduce((s, p) => s + (p.runs || 0), 0)
    const balls = perfs.reduce((s, p) => s + (p.balls || 0), 0)
    const dismissals = perfs.filter((p) => p.out).length
    const notOuts = innings - dismissals
    const average = dismissals === 0 ? 0 : Number((runs / dismissals).toFixed(2))
    const strikeRate = balls === 0 ? 0 : Number(((runs / balls) * 100).toFixed(2))
    const highScore = innings === 0 ? 0 : Math.max(...perfs.map((p) => p.runs || 0))
    const ducks = perfs.filter((p) => p.runs === 0 && p.out).length
    const fifties = perfs.filter((p) => (p.runs || 0) >= 50 && (p.runs || 0) < 100).length
    const hundreds = perfs.filter((p) => (p.runs || 0) >= 100).length
    const fours = perfs.reduce((s, p) => s + (p.fours || 0), 0)
    const sixes = perfs.reduce((s, p) => s + (p.sixes || 0), 0)
    return [pid, { innings, runs, average, strikeRate, highScore, notOuts, ducks, fifties, hundreds, fours, sixes }] as const
  }))
}

export function legacyBowlingByPlayer(rows: BowlRow[]) {
  const grouped: Record<string, BowlRow[]> = {}
  for (const row of rows) (grouped[row.playerId] ??= []).push(row)
  return new Map(Object.entries(grouped).map(([pid, perfs]) => {
    const totalBalls = perfs.reduce((s, p) => s + (p.balls || 0), 0)
    const totalRuns = perfs.reduce((s, p) => s + (p.runs || 0), 0)
    const wickets = perfs.reduce((s, p) => s + (p.wickets || 0), 0)
    const wides = perfs.reduce((s, p) => s + (p.wides || 0), 0)
    const noBalls = perfs.reduce((s, p) => s + (p.noBalls || 0), 0)
    const overs = `${Math.floor(totalBalls / 6)}.${totalBalls % 6}`
    const average = wickets === 0 ? 0 : Number((totalRuns / wickets).toFixed(2))
    const economy = totalBalls === 0 ? 0 : Number(((totalRuns / totalBalls) * 6).toFixed(2))
    const strikeRate = wickets === 0 ? 0 : Number((totalBalls / wickets).toFixed(2))
    const fiveWickets = perfs.filter((p) => (p.wickets || 0) >= 5).length
    const best = [...perfs].sort((a, b) =>
      (b.wickets || 0) !== (a.wickets || 0)
        ? (b.wickets || 0) - (a.wickets || 0)
        : (a.runs || 0) - (b.runs || 0)
    )[0]
    const bestFigures = best ? `${best.wickets || 0}/${best.runs || 0}` : '-'
    return [pid, { wickets, overs, average, economy, strikeRate, bestFigures, fiveWickets, wides, noBalls }] as const
  }))
}

