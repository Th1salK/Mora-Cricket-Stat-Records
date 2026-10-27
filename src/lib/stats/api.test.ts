import { it, expect } from 'vitest'
import { battingApi, bowlingApi, battingTableApi, bowlingTableApi } from '@/lib/stats/api'
import { battingSummary } from '@/lib/stats/batting'
import { bowlingSummary } from '@/lib/stats/bowling'
import { bat, bowl } from '@/lib/stats/fixtures.test-support'
it('keeps legacy response names and preserves zero versus null', () => {
  const batting = battingSummary([bat({ out: false, runs: 0 })])
  expect(battingApi(batting)).toMatchObject({ totalInnings: 1, totalRuns: 0, average: null, strikeRate: 0, highScoreNotOut: true })
  expect(battingTableApi({ ...batting, playerId: 'p1', playerName: 'Player' })).toMatchObject({ playerId: 'p1', innings: 1, runs: 0 })
  const bowling = bowlingSummary([bowl({ wickets: 0 })])
  expect(bowlingApi(bowling)).toMatchObject({ totalBalls: 24, totalWickets: 0, average: null, strikeRate: null, bestFigures: '0/20' })
  expect(bowlingTableApi({ ...bowling, playerId: 'p1', playerName: 'Player' })).toMatchObject({ wickets: 0, overs: '4.0' })
})
