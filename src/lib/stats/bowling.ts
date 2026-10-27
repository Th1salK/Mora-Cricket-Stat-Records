import type { BowlRow, Figures } from '@/lib/stats/types'
import { summariseGroups } from '@/lib/stats/group'

export type BowlingSummary = {
  innings: number; balls: number; runs: number; wickets: number; wides: number; noBalls: number; maidens: number
  average: number | null; economy: number | null; strikeRate: number | null; best: Figures | null; fiveWickets: number
}
export function compareFigures(a: Figures, b: Figures): number {
  return b.wickets - a.wickets || a.runs - b.runs
}
export function bowlingSummary(rows: BowlRow[]): BowlingSummary {
  const balls = rows.reduce((sum, row) => sum + row.balls, 0)
  const runs = rows.reduce((sum, row) => sum + row.runs, 0)
  const wickets = rows.reduce((sum, row) => sum + row.wickets, 0)
  const best = [...rows].sort(compareFigures)[0]
  return {
    innings: rows.filter((row) => row.balls > 0).length, balls, runs, wickets,
    wides: rows.reduce((sum, row) => sum + row.wides, 0),
    noBalls: rows.reduce((sum, row) => sum + row.noBalls, 0),
    maidens: rows.reduce((sum, row) => sum + row.maidens, 0),
    average: wickets === 0 ? null : +(runs / wickets).toFixed(2),
    economy: balls === 0 ? null : +(runs / balls * 6).toFixed(2),
    strikeRate: wickets === 0 ? null : +(balls / wickets).toFixed(2),
    best: best ? { wickets: best.wickets, runs: best.runs } : null,
    fiveWickets: rows.filter((row) => row.wickets >= 5).length,
  }
}
export function bowlingByPlayer(rows: BowlRow[]) {
  return summariseGroups(rows, (row) => row.playerId, bowlingSummary)
}
export function bowlingByMatchType(rows: BowlRow[]) {
  return summariseGroups(rows, (row) => row.matchType, bowlingSummary)
}
