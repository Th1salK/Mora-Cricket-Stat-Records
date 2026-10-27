import { it, expect } from 'vitest'
import { currentRun, longestWinningRun, longestWinningRunByMatchType, currentRunByMatchType } from '@/lib/stats/streaks'
import { match } from '@/lib/stats/fixtures.test-support'
import type { MatchRow } from '@/lib/stats/types'
function sequence(outcomes: MatchRow['outcome'][]) {
  return outcomes.map((outcome, i) => match({ outcome, matchId: String(i), date: new Date(Date.UTC(2026, 0, i + 1)) }))
}
it('sorts dates and breaks a winning run on a loss or draw', () => {
  const rows = sequence(['won', 'won', 'lost', 'won', 'draw', 'won'])
  expect(longestWinningRun([...rows].reverse())).toMatchObject({ length: 2, from: rows[0].date, to: rows[1].date })
  expect(currentRun(rows)).toEqual({ kind: 'won', length: 1 })
  expect(currentRun(sequence(['lost', 'lost']))).toEqual({ kind: 'lost', length: 2 })
  expect(currentRun(sequence(['won', 'tie']))).toBeNull()
})
it('skips no-result, unknown and internal matches', () => {
  const rows = sequence(['won', 'no result', null, 'won', 'lost'])
  rows[4].matchType = 'Home and Home'
  expect(longestWinningRun(rows)?.length).toBe(2)
  expect(currentRun(rows)).toEqual({ kind: 'won', length: 2 })
})
it('reports mixed types and groups independently', () => {
  const rows = sequence(['won', 'won'])
  rows[1].matchType = 'SLUG'
  expect(longestWinningRun(rows)?.matchType).toBe('mixed')
  expect(longestWinningRunByMatchType(rows).get('SLUG')?.length).toBe(1)
  expect(currentRunByMatchType(rows).size).toBe(2)
})
it('keeps the earliest equally long streak and returns null without wins', () => {
  const rows = sequence(['won', 'lost', 'won'])
  expect(longestWinningRun(rows)?.from).toEqual(rows[0].date)
  expect(longestWinningRun(sequence(['lost', 'draw']))).toBeNull()
  expect(longestWinningRun([])).toBeNull()
  expect(currentRun([])).toBeNull()
})
