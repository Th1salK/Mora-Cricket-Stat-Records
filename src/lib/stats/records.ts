import type { MatchTypeValue } from '@/lib/constants'
import { battingByPlayer } from '@/lib/stats/batting'
import { bowlingByPlayer, compareFigures } from '@/lib/stats/bowling'
import { QUALIFIERS } from '@/lib/stats/config'
import { groupBy } from '@/lib/stats/group'
import type { BatRow, BowlRow, Coverage, Figures, MatchRow } from '@/lib/stats/types'

export type Rec<T> = {
  value: T; playerId?: string; matchId?: string; opponent?: string; matchType?: MatchTypeValue
  date?: Date; season?: string; matchTypes?: MatchTypeValue[]
}
type PlayerRow = BatRow | BowlRow
type QualifiedRecord = (Rec<number> & { qualifier: string }) | null

function earlier<T extends { date: Date; matchId: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.date.getTime() - b.date.getTime() || a.matchId.localeCompare(b.matchId))
}
function playerRecord<T>(row: PlayerRow, value: T): Rec<T> {
  return { value, playerId: row.playerId, matchId: row.matchId, matchType: row.matchType, date: row.date }
}
export function highestScore(rows: BatRow[]): Rec<{ runs: number; notOut: boolean }> | null {
  const best = earlier(rows.filter((row) => row.dismissalType !== 'did not bat'))
    .sort((a, b) => b.runs - a.runs || Number(a.out) - Number(b.out))[0]
  return best ? playerRecord(best, { runs: best.runs, notOut: !best.out }) : null
}
export function bestBowling(rows: BowlRow[]): Rec<Figures> | null {
  const best = earlier(rows).sort(compareFigures)[0]
  return best ? playerRecord(best, { wickets: best.wickets, runs: best.runs }) : null
}
function seasonRecord<T extends PlayerRow>(rows: T[], seasonOf: (matchId: string) => string, value: (row: T) => number): Rec<number> | null {
  const groups = groupBy(earlier(rows), (row) => JSON.stringify([row.playerId, seasonOf(row.matchId)]))
  let record: Rec<number> | null = null
  for (const group of groups.values()) {
    const total = group.reduce((sum, row) => sum + value(row), 0)
    if (!record || total > record.value) {
      const matchTypes = [...new Set(group.map((row) => row.matchType))]
      record = { ...playerRecord(group[0], total), season: seasonOf(group[0].matchId), matchTypes }
      if (matchTypes.length > 1) delete record.matchType
    }
  }
  return record
}
export function mostRunsInASeason(rows: BatRow[], seasonOf: (matchId: string) => string) {
  return seasonRecord(rows.filter((row) => row.dismissalType !== 'did not bat'), seasonOf, (row) => row.runs)
}
export function mostSixesInASeason(rows: BatRow[], seasonOf: (matchId: string) => string) {
  return seasonRecord(rows.filter((row) => row.dismissalType !== 'did not bat'), seasonOf, (row) => row.sixes)
}
export function mostWicketsInASeason(rows: BowlRow[], seasonOf: (matchId: string) => string) {
  return seasonRecord(rows, seasonOf, (row) => row.wickets)
}
function qualified<T extends PlayerRow, S>(rows: T[], summaries: Map<string, S>, eligible: (summary: S) => boolean,
  metric: (summary: S) => number | null, lowerIsBetter: boolean, qualifier: string): QualifiedRecord {
  let record: QualifiedRecord = null
  for (const [playerId, group] of groupBy(earlier(rows), (row) => row.playerId)) {
    const summary = summaries.get(playerId)
    if (!summary || !eligible(summary)) continue
    const value = metric(summary)
    if (value === null) continue
    if (!record || (lowerIsBetter ? value < record.value : value > record.value)) {
      const matchTypes = [...new Set(group.map((row) => row.matchType))]
      record = { ...playerRecord(group[0], value), qualifier, matchTypes }
      if (matchTypes.length > 1) delete record.matchType
    }
  }
  return record
}
export function bestBattingAverage(rows: BatRow[]): QualifiedRecord {
  const played = rows.filter((row) => row.dismissalType !== 'did not bat')
  return qualified(played, battingByPlayer(played), (s) => s.innings >= QUALIFIERS.battingAverageMinInnings,
    (s) => s.average, false, `min. ${QUALIFIERS.battingAverageMinInnings} innings`)
}
export function bestBattingStrikeRate(rows: BatRow[]): QualifiedRecord {
  const played = rows.filter((row) => row.dismissalType !== 'did not bat')
  return qualified(played, battingByPlayer(played), (s) => s.runs >= QUALIFIERS.battingStrikeRateMinRuns,
    (s) => s.strikeRate, false, `min. ${QUALIFIERS.battingStrikeRateMinRuns} runs`)
}
export function bestEconomy(rows: BowlRow[]): QualifiedRecord {
  return qualified(rows, bowlingByPlayer(rows), (s) => s.balls >= QUALIFIERS.economyMinBalls,
    (s) => s.economy, true, `min. ${QUALIFIERS.economyMinBalls} balls`)
}
export function bestBowlingAverage(rows: BowlRow[]): QualifiedRecord {
  return qualified(rows, bowlingByPlayer(rows), (s) => s.wickets >= QUALIFIERS.bowlingAverageMinWickets,
    (s) => s.average, true, `min. ${QUALIFIERS.bowlingAverageMinWickets} wickets`)
}
export function bestBowlingStrikeRate(rows: BowlRow[]): QualifiedRecord {
  return qualified(rows, bowlingByPlayer(rows), (s) => s.wickets >= QUALIFIERS.bowlingStrikeRateMinWickets,
    (s) => s.strikeRate, true, `min. ${QUALIFIERS.bowlingStrikeRateMinWickets} wickets`)
}
function teamRecord(matches: MatchRow[], hasData: (match: MatchRow) => boolean, eligible: (match: MatchRow) => boolean,
  valueOf: (match: MatchRow) => number, lowerIsBetter = false): { record: Rec<number> | null; coverage: Coverage } {
  const available = matches.filter(hasData)
  let record: Rec<number> | null = null
  for (const match of earlier(available.filter(eligible))) {
    const value = valueOf(match)
    if (!record || (lowerIsBetter ? value < record.value : value > record.value)) {
      record = { value, matchId: match.matchId, opponent: match.opponent, matchType: match.matchType, date: match.date }
    }
  }
  return { record, coverage: { used: available.length, total: matches.length } }
}
export function highestTotal(matches: MatchRow[]) {
  return teamRecord(matches, (m) => m.moraInnings !== null, () => true, (m) => m.moraInnings!.runs)
}
export function lowestAllOutTotal(matches: MatchRow[]) {
  return teamRecord(matches, (m) => m.moraInnings !== null, (m) => m.moraInnings!.wickets === 10, (m) => m.moraInnings!.runs, true)
}
function biggestWin(matches: MatchRow[], kind: 'runs' | 'wickets') {
  // Coverage includes complete margins in this unit, even when Mora lost.
  return teamRecord(matches, (m) => m.outcome !== null && m.margin !== null && m.marginType === kind,
    (m) => m.outcome === 'won', (m) => m.margin!)
}
export function biggestWinByRuns(matches: MatchRow[]) { return biggestWin(matches, 'runs') }
export function biggestWinByWickets(matches: MatchRow[]) { return biggestWin(matches, 'wickets') }
