import type { MatchTypeValue } from '@/lib/constants'
import { INTERNAL_MATCH_TYPES } from '@/lib/stats/config'
import type { MatchRow } from '@/lib/stats/types'

export type MatchListRow = {
  id: string; date: string; opponent: string; venue: 'Home' | 'Away'; venueName: string | null
  matchType: MatchTypeValue; overs: number
  mora: { runs: number; wickets: number; balls: number } | null
  opposition: { runs: number; wickets: number; balls: number } | null
  outcome: MatchRow['outcome']; margin: number | null; marginType: 'runs' | 'wickets' | null
  isInternal: boolean; source: 'manual' | 'import'
}
export type MatchListDocument = {
  _id: { toString(): string }; date: Date; opponent: string; venue: 'Home' | 'Away'; venueName?: string
  matchType: MatchTypeValue; overs: number; source?: 'manual' | 'import'
  innings?: { team: string; runs: number; wickets: number; balls: number }[]
  result?: { outcome?: MatchRow['outcome']; margin?: number; marginType?: 'runs' | 'wickets' }
}
export function toMatchListRow(doc: MatchListDocument): MatchListRow {
  function innings(team: string) {
    const row = doc.innings?.find((innings) => innings.team === team)
    return row && [row.runs, row.wickets, row.balls].every(Number.isFinite)
      ? { runs: row.runs, wickets: row.wickets, balls: row.balls } : null
  }
  return {
    id: String(doc._id), date: doc.date.toISOString(), opponent: doc.opponent, venue: doc.venue,
    venueName: doc.venueName?.trim() || null, matchType: doc.matchType, overs: doc.overs,
    mora: innings('mora'), opposition: innings('opposition'),
    outcome: doc.result?.outcome ?? null, margin: doc.result?.margin ?? null, marginType: doc.result?.marginType ?? null,
    isInternal: INTERNAL_MATCH_TYPES.includes(doc.matchType), source: doc.source ?? 'manual',
  }
}
export function escapeMatchSearch(search: string): string {
  return search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
