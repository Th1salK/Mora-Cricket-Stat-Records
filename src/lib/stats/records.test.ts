import { it, expect } from 'vitest'
import * as records from '@/lib/stats/records'
import { bat, bowl, match } from '@/lib/stats/fixtures.test-support'
it('returns null for all empty player records', () => {
  for (const fn of [records.highestScore, records.bestBattingAverage, records.bestBattingStrikeRate]) expect(fn([])).toBeNull()
  for (const fn of [records.bestBowling, records.bestEconomy, records.bestBowlingAverage, records.bestBowlingStrikeRate]) expect(fn([])).toBeNull()
  expect(records.mostRunsInASeason([], () => '2026')).toBeNull()
  expect(records.mostSixesInASeason([], () => '2026')).toBeNull()
  expect(records.mostWicketsInASeason([], () => '2026')).toBeNull()
})
it('keeps the earlier tied performance; a not-out high score wins a score tie', () => {
  const late = new Date('2026-02-01Z')
  expect(records.highestScore([bat({ date: late, matchId: 'late' }), bat()])?.matchId).toBe('m1')
  expect(records.highestScore([bat(), bat({ out: false, date: late })])?.value.notOut).toBe(true)
  expect(records.bestBowling([bowl({ wickets: 2, runs: 5 }), bowl({ wickets: 3, runs: 25 }), bowl({ wickets: 3, runs: 20 })])?.value).toEqual({ wickets: 3, runs: 20 })
  expect(records.bestBowling([bowl({ date: late, matchId: 'late' }), bowl()])?.matchId).toBe('m1')
})
it('applies all qualifiers, excludes undefined rates, and reports their thresholds', () => {
  expect(records.bestBattingAverage([bat({ runs: 200 })])).toBeNull()
  expect(records.bestBattingAverage(Array.from({ length: 5 }, () => bat()))).toMatchObject({ value: 20, qualifier: 'min. 5 innings' })
  expect(records.bestBattingAverage(Array.from({ length: 5 }, () => bat({ out: false })))).toBeNull()
  expect(records.bestBattingStrikeRate([bat({ runs: 99 })])).toBeNull()
  expect(records.bestBattingStrikeRate([bat({ runs: 100, balls: 50 })])?.value).toBe(200)
  expect(records.bestEconomy([bowl({ balls: 59 })])).toBeNull()
  expect(records.bestEconomy([bowl({ balls: 60, runs: 30 })])).toMatchObject({ value: 3, qualifier: 'min. 60 balls' })
  expect(records.bestBowlingAverage([bowl({ wickets: 4 })])).toBeNull()
  expect(records.bestBowlingAverage([bowl({ wickets: 5, runs: 10 })])?.value).toBe(2)
  expect(records.bestBowlingStrikeRate([bowl({ wickets: 4 })])).toBeNull()
  expect(records.bestBowlingStrikeRate([bowl({ wickets: 5, balls: 30 })])?.value).toBe(6)
})
it('groups season records by player and season across match types', () => {
  const rows = [bat({ matchId: 'old', runs: 500 }), bat({ runs: 30 }), bat({ runs: 40, matchId: 'm2', matchType: 'SLUG' })]
  const seasonOf = (id: string) => id === 'old' ? '2025' : '2026'
  expect(records.mostRunsInASeason(rows, seasonOf)).toMatchObject({ value: 500, season: '2025' })
  expect(records.mostRunsInASeason(rows.slice(1), seasonOf)).toMatchObject({ value: 70, season: '2026', matchTypes: ['Friendly', 'SLUG'] })
  expect(records.mostSixesInASeason(rows, seasonOf)?.value).toBe(2)
  expect(records.mostWicketsInASeason([bowl(), bowl()], seasonOf)?.value).toBe(4)
})
it('old matches never produce fake zero team records and coverage counts available data', () => {
  for (const fn of [records.highestTotal, records.lowestAllOutTotal, records.biggestWinByRuns, records.biggestWinByWickets]) {
    expect(fn([match()])).toEqual({ record: null, coverage: { used: 0, total: 1 } })
    expect(fn([]).record).toBeNull()
  }
  const rows = [match(), match({ moraInnings: { runs: 120, wickets: 10, balls: 100 } }), match({ moraInnings: { runs: 200, wickets: 7, balls: 120 } })]
  expect(records.highestTotal(rows)).toMatchObject({ record: { value: 200 }, coverage: { used: 2, total: 3 } })
  expect(records.lowestAllOutTotal(rows).record?.value).toBe(120)
})
it('uses only wins with known margins for biggest-win records', () => {
  const rows = [match({ outcome: 'lost', margin: 100, marginType: 'runs' }), match({ outcome: 'won', margin: 20, marginType: 'runs' }), match({ outcome: 'won', margin: 4, marginType: 'wickets' }), match({ outcome: 'won' })]
  expect(records.biggestWinByRuns(rows)).toMatchObject({ record: { value: 20 }, coverage: { used: 2, total: 4 } })
  expect(records.biggestWinByWickets(rows).record?.value).toBe(4)
})
