import type { BatRow } from '@/lib/stats/types'
import { summariseGroups } from '@/lib/stats/group'

export type BattingSummary = {
  innings: number; runs: number; balls: number; outs: number; notOuts: number
  average: number | null; strikeRate: number | null; highScore: number | null
  highScoreNotOut: boolean; fifties: number; hundreds: number; ducks: number; fours: number; sixes: number
}
export function battingSummary(rows: BatRow[]): BattingSummary {
  const innings = rows.filter((row) => row.dismissalType !== 'did not bat')
  const runs = innings.reduce((sum, row) => sum + row.runs, 0)
  const balls = innings.reduce((sum, row) => sum + row.balls, 0)
  const outs = innings.filter((row) => row.out).length
  const best = [...innings].sort((a, b) => b.runs - a.runs || Number(a.out) - Number(b.out))[0]
  return {
    innings: innings.length, runs, balls, outs, notOuts: innings.length - outs,
    average: outs === 0 ? null : +(runs / outs).toFixed(2),
    strikeRate: balls === 0 ? null : +(runs / balls * 100).toFixed(2),
    highScore: best?.runs ?? null, highScoreNotOut: best ? !best.out : false,
    fifties: innings.filter((row) => row.runs >= 50 && row.runs < 100).length,
    hundreds: innings.filter((row) => row.runs >= 100).length,
    ducks: innings.filter((row) => row.runs === 0 && row.out).length,
    fours: innings.reduce((sum, row) => sum + row.fours, 0),
    sixes: innings.reduce((sum, row) => sum + row.sixes, 0),
  }
}
export function battingByPlayer(rows: BatRow[]) {
  return summariseGroups(rows.filter((row) => row.dismissalType !== 'did not bat'), (row) => row.playerId, battingSummary)
}
export function battingByMatchType(rows: BatRow[]) {
  return summariseGroups(rows.filter((row) => row.dismissalType !== 'did not bat'), (row) => row.matchType, battingSummary)
}
