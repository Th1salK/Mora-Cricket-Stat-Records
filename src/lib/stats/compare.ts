import { battingByPlayer, battingSummary } from '@/lib/stats/batting'
import { bowlingByPlayer } from '@/lib/stats/bowling'
import { fmtFigures, fmtOvers } from '@/lib/stats/format'
import { legacyBattingByPlayer, legacyBowlingByPlayer } from '@/lib/stats/legacy/statsCalculatorLegacy'
import { groupBy } from '@/lib/stats/group'
import type { BatRow, BowlRow } from '@/lib/stats/types'

export type Difference = { playerId: string; discipline: 'batting' | 'bowling'; field: string
  legacy: number | string; current: number | string | null; classification: 'EXPECTED' | 'UNEXPECTED'; reason: string }
export function comparePlayerStats(batting: BatRow[], bowling: BowlRow[]) {
  const differences: Difference[] = []
  let fieldsCompared = 0
  const batGroups = groupBy(batting, (row) => row.playerId)
  const currentBatting = battingByPlayer(batting)
  for (const [playerId, old] of legacyBattingByPlayer(batting)) {
    const rows = batGroups.get(playerId)!
    const actual = currentBatting.get(playerId) ?? battingSummary([])
    const played = rows.filter((row) => row.dismissalType !== 'did not bat')
    const filteredOld = legacyBattingByPlayer(played).get(playerId)
    for (const field of Object.keys(old) as (keyof typeof old)[]) {
      fieldsCompared++
      if (old[field] === actual[field]) continue
      let reason = ''
      if (old[field] === 0 && actual[field] === null &&
        ((field === 'average' && rows.every((row) => !row.out)) ||
        (field === 'strikeRate' && rows.reduce((sum, row) => sum + row.balls, 0) === 0))) {
        reason = field === 'average' ? 'Never dismissed: undefined average is null.' : 'Zero balls: undefined strike rate is null.'
      } else if (played.length !== rows.length) {
        const filteredValue = filteredOld?.[field]
        const matchesFiltered = filteredValue === actual[field] ||
          (filteredValue === 0 && actual[field] === null &&
            ((field === 'average' && played.every((row) => !row.out)) ||
            (field === 'strikeRate' && played.reduce((sum, row) => sum + row.balls, 0) === 0))) ||
          (played.length === 0 && (actual[field] === 0 || actual[field] === null))
        if (matchesFiltered) reason = 'Did-not-bat rows are excluded; the filtered legacy maths agrees.'
      }
      differences.push({ playerId, discipline: 'batting', field, legacy: old[field], current: actual[field],
        classification: reason ? 'EXPECTED' : 'UNEXPECTED', reason: reason || 'No approved behavioural change explains this difference.' })
    }
  }
  const currentBowling = bowlingByPlayer(bowling)
  const bowlGroups = groupBy(bowling, (row) => row.playerId)
  for (const [playerId, old] of legacyBowlingByPlayer(bowling)) {
    const summary = currentBowling.get(playerId)!
    const actual = { ...summary, overs: fmtOvers(summary.balls), bestFigures: fmtFigures(summary.best) }
    const rows = bowlGroups.get(playerId)!
    for (const field of Object.keys(old) as (keyof typeof old)[]) {
      fieldsCompared++
      if (old[field] === actual[field]) continue
      const zeroBalls = rows.reduce((sum, row) => sum + row.balls, 0) === 0
      const zeroWickets = rows.reduce((sum, row) => sum + row.wickets, 0) === 0
      const expected = old[field] === 0 && actual[field] === null &&
        ((field === 'economy' && zeroBalls) || ((field === 'average' || field === 'strikeRate') && zeroWickets))
      differences.push({ playerId, discipline: 'bowling', field, legacy: old[field], current: actual[field],
        classification: expected ? 'EXPECTED' : 'UNEXPECTED',
        reason: expected ? (field === 'economy' ? 'Zero balls: undefined economy is null.' : 'Zero wickets: undefined average/strike rate is null.')
          : 'No approved behavioural change explains this difference.' })
    }
  }
  return { playersCompared: new Set([...batting, ...bowling].map((row) => row.playerId)).size, fieldsCompared, differences }
}
