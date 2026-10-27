import { describe, it, expect } from 'vitest'
import { battingSummary, battingByPlayer, battingByMatchType } from '@/lib/stats/batting'
import { bat } from '@/lib/stats/fixtures.test-support'

describe('battingSummary', () => {
  it('ignores not outs when calculating average (original regression)', () => {
    const s = battingSummary([bat({ runs: 50, balls: 60 }), bat({ runs: 30, balls: 20, out: false })])
    expect(s).toMatchObject({ innings: 2, runs: 80, average: 80, strikeRate: 100, highScore: 50, outs: 1, notOuts: 1 })
  })
  it('has no average when never dismissed (original regression)', () => {
    expect(battingSummary([bat({ runs: 10, balls: 8, out: false })]).average).toBeNull()
  })
  it('skips every contribution from did-not-bat rows', () => {
    expect(battingSummary([bat({ dismissalType: 'did not bat' })])).toEqual(battingSummary([]))
  })
  it('counts a duck only when dismissed', () => {
    expect(battingSummary([bat({ runs: 0 }), bat({ runs: 0, out: false })]).ducks).toBe(1)
  })
  it('counts 50 and 99 as fifties, 100 as a hundred', () => {
    expect(battingSummary([bat({ runs: 50 }), bat({ runs: 99 }), bat({ runs: 100 })])).toMatchObject({ fifties: 2, hundreds: 1 })
  })
  it('prefers a not-out high score on a tie', () => {
    expect(battingSummary([bat({ runs: 72 }), bat({ runs: 72, out: false })])).toMatchObject({ highScore: 72, highScoreNotOut: true })
  })
  it('returns null strike rate with no balls and preserves a real zero average', () => {
    expect(battingSummary([bat({ runs: 0, balls: 0 })])).toMatchObject({ average: 0, strikeRate: null })
  })
  it('returns null high score with no innings and sums boundaries', () => {
    expect(battingSummary([]).highScore).toBeNull()
    expect(battingSummary([bat(), bat()])).toMatchObject({ fours: 4, sixes: 2, balls: 48 })
  })
  it('groups players and only match types with batting rows', () => {
    const rows = [bat(), bat({ playerId: 'p2', matchType: 'SLUG' }), bat({ matchType: 'Div 3', dismissalType: 'did not bat' })]
    expect(battingByPlayer(rows).get('p1')?.innings).toBe(1)
    expect([...battingByMatchType(rows).keys()]).toEqual(['Friendly', 'SLUG'])
  })
})
