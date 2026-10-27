import type { MatchTypeValue } from '@/lib/constants'
import type { BatRow, BowlRow, MatchRow } from '@/lib/stats/types'

type Id = { toString(): string }
export type MatchDocument = {
  _id: Id; date: Date; matchType: MatchTypeValue; opponent: string; season?: Id
  result?: { outcome?: MatchRow['outcome']; margin?: number; marginType?: 'runs' | 'wickets' }
  innings?: { team: string; runs: number; wickets: number; balls: number }[]
}
export type PerformanceDocument = {
  matchId: Id; playerId: unknown; runs?: number; balls?: number; fours?: number; sixes?: number
  out?: boolean; dismissal?: { type?: string }; wickets?: number; wides?: number; noBalls?: number; maidens?: number
}
export type PlayerInfo = { playerId: string; playerName: string; isActive: boolean }

export function populatedPlayer(value: unknown): PlayerInfo | null {
  if (!value || typeof value !== 'object' || !('_id' in value) || !('fullName' in value)) return null
  const player = value as { _id: Id; fullName: string; isActive?: boolean }
  return { playerId: String(player._id), playerName: player.fullName, isActive: player.isActive !== false }
}
export function mapMatch(match: MatchDocument): MatchRow {
  function innings(team: string) {
    const row = match.innings?.find((innings) => innings.team === team)
    return row && [row.runs, row.wickets, row.balls].every(Number.isFinite)
      ? { runs: row.runs, wickets: row.wickets, balls: row.balls } : null
  }
  return {
    matchId: String(match._id), date: match.date, matchType: match.matchType, opponent: match.opponent,
    outcome: match.result?.outcome ?? null, margin: match.result?.margin ?? null, marginType: match.result?.marginType ?? null,
    moraInnings: innings('mora'), oppInnings: innings('opposition'),
  }
}
function performanceBase(row: PerformanceDocument, matches: Map<string, MatchRow>) {
  const player = populatedPlayer(row.playerId)
  const match = matches.get(String(row.matchId))
  if (!player || !match) return null
  return { playerId: player.playerId, matchId: match.matchId, matchType: match.matchType, date: match.date }
}
export function mapBatting(row: PerformanceDocument, matches: Map<string, MatchRow>): BatRow | null {
  const base = performanceBase(row, matches)
  return base ? { ...base, runs: row.runs ?? 0, balls: row.balls ?? 0, fours: row.fours ?? 0, sixes: row.sixes ?? 0,
    out: row.out ?? false, dismissalType: row.dismissal?.type ?? null } : null
}
export function mapBowling(row: PerformanceDocument, matches: Map<string, MatchRow>): BowlRow | null {
  const base = performanceBase(row, matches)
  return base ? { ...base, runs: row.runs ?? 0, balls: row.balls ?? 0, wickets: row.wickets ?? 0,
    wides: row.wides ?? 0, noBalls: row.noBalls ?? 0, maidens: row.maidens ?? 0 } : null
}
