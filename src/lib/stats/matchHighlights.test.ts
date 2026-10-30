import { expect, it } from 'vitest'
import { matchHighlights, runRate } from '@/lib/stats/matchHighlights'
it('chooses highlights and best figures and handles empty rows', () => {
  expect(matchHighlights([{ runs: 50, sixes: 1 }, { runs: 20, sixes: 3 }], [{ wickets: 3, runs: 20 }, { wickets: 3, runs: 10 }])).toEqual({ topScorer: { runs: 50, sixes: 1 }, mostSixes: { runs: 20, sixes: 3 }, bestBowling: { wickets: 3, runs: 10 } })
  expect(matchHighlights([], [])).toEqual({ topScorer: null, mostSixes: null, bestBowling: null })
  expect(runRate(30, 53)).toBe(3.4); expect(runRate(0, 0)).toBeNull()
})
