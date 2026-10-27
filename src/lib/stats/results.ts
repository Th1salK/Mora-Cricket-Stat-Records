import { INTERNAL_MATCH_TYPES } from '@/lib/stats/config'
import { summariseGroups } from '@/lib/stats/group'
import type { Coverage, MatchRow } from '@/lib/stats/types'

export type ResultSummary = {
  played: number; withResult: number; won: number; lost: number; draw: number; tie: number; noResult: number
  winRate: number | null; coverage: Coverage
}
export function resultSummary(matches: MatchRow[]): ResultSummary {
  const external = matches.filter((match) => !INTERNAL_MATCH_TYPES.includes(match.matchType))
  const count = (outcome: MatchRow['outcome']) => external.filter((match) => match.outcome === outcome).length
  const won = count('won'), lost = count('lost'), draw = count('draw'), tie = count('tie')
  const decided = won + lost + draw + tie
  return {
    played: matches.length, withResult: matches.filter((match) => match.outcome !== null).length,
    won, lost, draw, tie, noResult: count('no result'),
    winRate: decided === 0 ? null : Math.round(won / decided * 100),
    coverage: { used: external.filter((match) => match.outcome !== null).length, total: external.length },
  }
}
export function resultsByMatchType(matches: MatchRow[]) {
  return summariseGroups(matches, (match) => match.matchType, resultSummary)
}
