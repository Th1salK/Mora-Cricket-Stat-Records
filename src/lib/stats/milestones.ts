import { INTERNAL_MATCH_TYPES } from '@/lib/stats/config'
import type { BatRow, BowlRow, MatchRow } from '@/lib/stats/types'
export type Milestone = { kind: 'century' | 'five-for' | 'runs' | 'wickets' | 'winning-run'; date: Date; matchId: string; matchType: MatchRow['matchType']; playerId?: string; season: string; value: number }
export function recentMilestones(batting: BatRow[], bowling: BowlRow[], matches: MatchRow[], seasonOf: (id: string) => string): Milestone[] {
  const events: Milestone[] = [], centuries = new Set<string>(), totals = new Map<string, number>()
  const ordered = <T extends { date: Date; matchId: string }>(rows: T[]) => [...rows].sort((a, b) => a.date.getTime() - b.date.getTime() || a.matchId.localeCompare(b.matchId))
  for (const row of ordered(batting.filter((r) => r.dismissalType !== 'did not bat'))) {
    const season = seasonOf(row.matchId), key = row.playerId + ':' + season, previous = totals.get(key) ?? 0, value = previous + row.runs
    const base = { date: row.date, matchId: row.matchId, matchType: row.matchType, playerId: row.playerId, season }
    if (row.runs >= 100 && !centuries.has(season)) { events.push({ ...base, kind: 'century', value: row.runs }); centuries.add(season) }
    for (const n of [250, 500]) if (previous < n && value >= n) events.push({ ...base, kind: 'runs', value: n })
    totals.set(key, value)
  }
  totals.clear()
  for (const row of ordered(bowling)) {
    const season = seasonOf(row.matchId), key = row.playerId + ':' + season, previous = totals.get(key) ?? 0, value = previous + row.wickets
    const base = { date: row.date, matchId: row.matchId, matchType: row.matchType, playerId: row.playerId, season }
    if (row.wickets >= 5) events.push({ ...base, kind: 'five-for', value: row.wickets })
    for (const n of [10, 15, 20]) if (previous < n && value >= n) events.push({ ...base, kind: 'wickets', value: n })
    totals.set(key, value)
  }
  let run = 0, previousSeason: string | null = null
  for (const row of ordered(matches)) {
    if (INTERNAL_MATCH_TYPES.includes(row.matchType) || row.outcome === null || row.outcome === 'no result') continue
    const season = seasonOf(row.matchId)
    if (previousSeason !== season) run = 0
    previousSeason = season
    run = row.outcome === 'won' ? run + 1 : 0
    if (run >= 3) events.push({ kind: 'winning-run', date: row.date, matchId: row.matchId, matchType: row.matchType, season, value: run })
  }
  return events.sort((a, b) => b.date.getTime() - a.date.getTime() || a.matchId.localeCompare(b.matchId)).slice(0, 4)
}
