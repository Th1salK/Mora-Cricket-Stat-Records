import type { MatchTypeValue } from '@/lib/constants'
import { INTERNAL_MATCH_TYPES } from '@/lib/stats/config'
import { summariseGroups } from '@/lib/stats/group'
import type { MatchRow } from '@/lib/stats/types'

export type WinningRun = { length: number; from: Date; to: Date; matchType: MatchTypeValue | 'mixed' }
export type CurrentRun = { kind: 'won' | 'lost'; length: number }
function orderedResults(matches: MatchRow[]) {
  return matches.filter((match) => !INTERNAL_MATCH_TYPES.includes(match.matchType) && match.outcome !== null && match.outcome !== 'no result')
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.matchId.localeCompare(b.matchId))
}
export function longestWinningRun(matches: MatchRow[]): WinningRun | null {
  let best: WinningRun | null = null
  let run: WinningRun | null = null
  for (const match of orderedResults(matches)) {
    if (match.outcome !== 'won') { run = null; continue }
    run = run ? {
      from: run.from, length: run.length + 1, to: match.date,
      matchType: run.matchType === match.matchType ? match.matchType : 'mixed',
    } : { length: 1, from: match.date, to: match.date, matchType: match.matchType }
    if (!best || run.length > best.length) best = run
  }
  return best
}
export function currentRun(matches: MatchRow[]): CurrentRun | null {
  const ordered = orderedResults(matches).reverse()
  const kind = ordered[0]?.outcome
  if (kind !== 'won' && kind !== 'lost') return null
  let length = 0
  for (const match of ordered) {
    if (match.outcome !== kind) break
    length++
  }
  return { kind, length }
}
export function longestWinningRunByMatchType(matches: MatchRow[]) {
  return summariseGroups(matches, (match) => match.matchType, longestWinningRun)
}
export function currentRunByMatchType(matches: MatchRow[]) {
  return summariseGroups(matches, (match) => match.matchType, currentRun)
}
