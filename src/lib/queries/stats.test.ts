import { it, expect } from 'vitest'
import { mapMatch, mapBatting, mapBowling } from '@/lib/queries/mapping'
it('keeps missing historical results and innings null, preserves actual zero totals', () => {
  const old = mapMatch({ _id: 'm1', date: new Date('2026-01-01Z'), opponent: 'Visitors', matchType: 'Friendly' })
  expect(old).toMatchObject({ outcome: null, moraInnings: null, oppInnings: null, margin: null })
  expect(mapMatch({ _id: 'm2', date: old.date, opponent: 'Visitors', matchType: 'Friendly', innings: [{ team: 'mora', runs: 0, wickets: 10, balls: 20 }] }).moraInnings?.runs).toBe(0)
})
it('maps old performances with missing maidens and skips missing players/matches', () => {
  const match = mapMatch({ _id: 'm1', date: new Date(), matchType: 'Friendly', opponent: 'Visitors' })
  const matches = new Map([['m1', match]])
  const row = { matchId: 'm1', playerId: { _id: 'p1', fullName: 'Player', isActive: false }, runs: 20 }
  expect(mapBatting(row, matches)).toMatchObject({ playerId: 'p1', runs: 20, dismissalType: null })
  expect(mapBowling(row, matches)?.maidens).toBe(0)
  expect(mapBatting({ ...row, playerId: null }, matches)).toBeNull()
  expect(mapBowling({ ...row, matchId: 'missing' }, matches)).toBeNull()
  expect(mapBatting({ ...row, playerId: 'unpopulated' }, matches)).toBeNull()
})
