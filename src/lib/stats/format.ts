import { ballsToOvers } from '@/lib/import/parse'
import type { Figures } from '@/lib/stats/types'

export function fmtNumber(value: number | null, decimals = 2): string {
  return value === null ? '–' : value.toFixed(decimals)
}
export function fmtOvers(balls: number): string { return ballsToOvers(balls) }
export function fmtFigures(f: Figures | null): string { return f === null ? '–' : `${f.wickets}/${f.runs}` }
export function fmtHighScore(runs: number | null, notOut: boolean): string {
  return runs === null ? '–' : `${runs}${notOut ? '*' : ''}`
}
