import { it, expect } from 'vitest'
import { dashboardTotals } from '@/lib/queries/dashboardRows'
import { bat, bowl } from '@/lib/stats/fixtures.test-support'
it('uses totals across every season/type in the supplied filter, not a single innings', () => {
  const rows = [bat({ runs: 20 }), bat({ runs: 30, matchType: 'SLUG' }), bat({ runs: 40, playerId: 'p2' })]
  expect(dashboardTotals(rows, [bowl(), bowl()])).toMatchObject({ mostRuns: { playerId: 'p1', value: 50, matchTypes: ['Friendly', 'SLUG'] }, mostWickets: { value: 4 } })
})
it('ignores did-not-bat and returns null without data', () => {
  expect(dashboardTotals([bat({ dismissalType: 'did not bat' })], [])).toEqual({ mostRuns: null, mostWickets: null })
})
it('keeps the earliest tied player', () => {
  expect(dashboardTotals([bat({ playerId: 'late', date: new Date('2026-02-01Z') }), bat()], []).mostRuns?.playerId).toBe('p1')
})
