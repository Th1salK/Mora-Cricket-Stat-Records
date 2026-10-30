import { expect, it } from 'vitest'
import { filterLeaderboard, sortLeaderboard } from '@/lib/ui/leaderboard'
it('puts nulls last in both directions without mutating the source', () => {
  const rows = [null, 0, 4, 2]
  expect(sortLeaderboard(rows, (x) => x, 'asc')).toEqual([0, 2, 4, null])
  expect(sortLeaderboard(rows, (x) => x, 'desc')).toEqual([4, 2, 0, null]); expect(rows[0]).toBeNull()
})
it('filters by name and uses balls for bowling minimums', () => {
  const rows = [{ playerName: 'Ali', innings: 3, balls: 29 }, { playerName: 'ALi B', innings: 5, balls: 60 }]
  expect(filterLeaderboard(rows, 'ali', 30, 'bowling')).toHaveLength(1)
  expect(filterLeaderboard(rows, '', 5, 'batting')).toHaveLength(1)
})
it('compares bowling figures by wickets then runs', () => {
  expect(sortLeaderboard([{ wickets: 2, runs: 5 }, { wickets: 3, runs: 20 }, { wickets: 3, runs: 10 }], (x) => x, 'desc')[0]).toEqual({ wickets: 3, runs: 10 })
})
