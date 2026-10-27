import { describe, it, expect } from 'vitest'
import { bowlingSummary, compareFigures, bowlingByPlayer, bowlingByMatchType } from '@/lib/stats/bowling'
import { bowl } from '@/lib/stats/fixtures.test-support'

describe('bowling', () => {
  it('uses balls for economy: 8.5 overs is 53 balls', () => {
    expect(bowlingSummary([bowl({ balls: 53, runs: 30 })]).economy).toBe(3.40)
  })
  it('has no bowling average or strike rate with no wickets', () => {
    expect(bowlingSummary([bowl({ wickets: 0 })])).toMatchObject({ average: null, strikeRate: null })
  })
  it('has no economy with zero balls and counts only bowling innings', () => {
    expect(bowlingSummary([bowl({ balls: 0, wickets: 0 })])).toMatchObject({ innings: 0, economy: null })
  })
  it('ranks best figures by wickets then runs', () => {
    expect(compareFigures({ wickets: 3, runs: 20 }, { wickets: 3, runs: 25 })).toBeLessThan(0)
    expect(compareFigures({ wickets: 3, runs: 20 }, { wickets: 2, runs: 5 })).toBeLessThan(0)
    expect(bowlingSummary([bowl({ wickets: 2, runs: 5 }), bowl({ wickets: 3, runs: 25 }), bowl({ wickets: 3, runs: 20 })]).best).toEqual({ wickets: 3, runs: 20 })
  })
  it('counts five-wicket hauls and sums maidens and extras', () => {
    expect(bowlingSummary([bowl({ wickets: 5 }), bowl({ wickets: 6 })])).toMatchObject({ fiveWickets: 2, maidens: 2, wides: 2, noBalls: 0 })
  })
  it('groups players/types and handles empty input', () => {
    const rows = [bowl(), bowl({ playerId: 'p2', matchType: 'SLUG' })]
    expect(bowlingByPlayer(rows).size).toBe(2)
    expect([...bowlingByMatchType(rows).keys()]).toEqual(['Friendly', 'SLUG'])
    expect(bowlingSummary([]).best).toBeNull()
  })
})
