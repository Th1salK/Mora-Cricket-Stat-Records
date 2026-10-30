import { battingByPlayer } from '@/lib/stats/batting'
import { bowlingByPlayer } from '@/lib/stats/bowling'
import type { BatRow, BowlRow } from '@/lib/stats/types'
import type { Rec } from '@/lib/stats/records'

function totalLeader<T extends BatRow | BowlRow>(rows: T[], totals: Map<string, number>): Rec<number> | null {
  let record: Rec<number> | null = null
  const ordered = [...rows].sort((a, b) => a.date.getTime() - b.date.getTime() || a.matchId.localeCompare(b.matchId))
  for (const row of ordered) {
    const value = totals.get(row.playerId)
    if (value === undefined || (record && value <= record.value)) continue
    const matchTypes = [...new Set(rows.filter((item) => item.playerId === row.playerId).map((item) => item.matchType))]
    record = { value, playerId: row.playerId, matchId: row.matchId, date: row.date, matchTypes,
      ...(matchTypes.length === 1 ? { matchType: matchTypes[0] } : {}) }
  }
  return record
}
export function dashboardTotals(batting: BatRow[], bowling: BowlRow[]) {
  const played = batting.filter((row) => row.dismissalType !== 'did not bat')
  return {
    mostRuns: totalLeader(played, new Map([...battingByPlayer(played)].map(([id, summary]) => [id, summary.runs]))),
    mostWickets: totalLeader(bowling, new Map([...bowlingByPlayer(bowling)].map(([id, summary]) => [id, summary.wickets]))),
  }
}
