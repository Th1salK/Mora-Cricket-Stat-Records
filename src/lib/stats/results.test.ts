import { it, expect } from 'vitest'
import { resultSummary, resultsByMatchType } from '@/lib/stats/results'
import { match } from '@/lib/stats/fixtures.test-support'
it('counts internal games in played/withResult but excludes them from results and coverage', () => {
  const rows = [match({ outcome: 'won', matchType: 'Home and Home' }), match({ outcome: 'won' }), match({ outcome: 'lost' }), match()]
  expect(resultSummary(rows)).toEqual({ played: 4, withResult: 3, won: 1, lost: 1, draw: 0, tie: 0, noResult: 0, winRate: 50, coverage: { used: 2, total: 3 } })
  expect(resultsByMatchType(rows).size).toBe(2)
})
it('excludes no-result from win-rate denominator, includes draws and ties', () => {
  expect(resultSummary(['won', 'draw', 'tie', 'no result'].map((outcome) => match({ outcome: outcome as 'won' | 'draw' | 'tie' | 'no result' })))).toMatchObject({ winRate: 33, noResult: 1, coverage: { used: 4, total: 4 } })
})
it('returns null rate for empty or unknown results', () => {
  expect(resultSummary([]).winRate).toBeNull()
  expect(resultSummary([match()]).winRate).toBeNull()
})
