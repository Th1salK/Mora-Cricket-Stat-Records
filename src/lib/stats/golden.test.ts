import { it, expect } from 'vitest'
import { battingByPlayer } from '@/lib/stats/batting'
import { bowlingByPlayer } from '@/lib/stats/bowling'
import { fmtFigures, fmtOvers } from '@/lib/stats/format'
import { legacyBattingByPlayer, legacyBowlingByPlayer } from '@/lib/stats/legacy/statsCalculatorLegacy'
import { bat, bowl } from '@/lib/stats/fixtures.test-support'
import type { MatchTypeValue } from '@/lib/constants'
const types: MatchTypeValue[] = ['Friendly', 'SLUG', 'Div 3']
const batting = Array.from({ length: 15 }, (_, i) => bat({
  playerId: 'p' + i % 3, matchId: 'm' + i, matchType: types[Math.floor(i / 3) % 3],
  runs: [0, 50, 100, 30, 10][Math.floor(i / 3)], out: i % 3 !== 1, balls: i % 3 === 2 ? 0 : 25,
}))
const bowling = Array.from({ length: 12 }, (_, i) => bowl({
  playerId: 'p' + i % 3, matchId: 'm' + i, matchType: types[Math.floor(i / 3) % 3],
  wickets: i % 3 === 1 ? 0 : 2, balls: i % 3 === 2 ? 0 : 24,
}))

it('golden batting: every legacy field matches except never-out average and zero-ball strike rate become null', () => {
  const actual = battingByPlayer(batting)
  for (const [id, legacy] of legacyBattingByPlayer(batting)) {
    const summary = actual.get(id)!
    for (const key of Object.keys(legacy) as (keyof typeof legacy)[]) {
      if ((key === 'average' && id === 'p1') || (key === 'strikeRate' && id === 'p2')) {
        expect(legacy[key]).toBe(0)
        expect(summary[key]).toBeNull()
      } else expect(summary[key], id + '.' + key).toEqual(legacy[key])
    }
    expect(summary.outs).toBe(summary.innings - summary.notOuts)
    expect(summary.balls).toBe(batting.filter((r) => r.playerId === id).reduce((s, r) => s + r.balls, 0))
    expect(summary.highScoreNotOut).toBe(id === 'p1')
  }
})
it('golden bowling: every legacy field matches except zero-ball economy and zero-wicket average/SR become null', () => {
  const actual = bowlingByPlayer(bowling)
  for (const [id, legacy] of legacyBowlingByPlayer(bowling)) {
    const summary = actual.get(id)!
    const comparable = { ...summary, overs: fmtOvers(summary.balls), bestFigures: fmtFigures(summary.best) }
    for (const key of Object.keys(legacy) as (keyof typeof legacy)[]) {
      if ((id === 'p1' && (key === 'average' || key === 'strikeRate')) || (id === 'p2' && key === 'economy')) {
        expect(legacy[key]).toBe(0)
        expect(comparable[key]).toBeNull()
      } else expect(comparable[key], id + '.' + key).toEqual(legacy[key])
    }
    const rows = bowling.filter((r) => r.playerId === id)
    expect(summary.innings).toBe(rows.filter((r) => r.balls > 0).length)
    for (const key of ['balls', 'runs', 'maidens'] as const) expect(summary[key]).toBe(rows.reduce((sum, row) => sum + row[key], 0))
  }
})
