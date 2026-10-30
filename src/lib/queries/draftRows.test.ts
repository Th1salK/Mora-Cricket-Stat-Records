import { expect, it } from 'vitest'
import { draftStatus } from '@/lib/queries/draftRows'
import type { Draft } from '@/lib/import/draft'
it('handles unread drafts and computes expiry from last update in UTC', () => {
  expect(draftStatus(null, {}, new Date('2026-12-20Z'))).toEqual({ status: 'empty', count: 0, expiresAt: '2027-01-19T00:00:00.000Z' })
})
it('distinguishes ready, blocking, check and manual rows without players', () => {
  const details = { matchType: 'Div 3', opponent: 'X', date: '2026-01-01', venue: 'Home', overs: 50 }
  const draft: Draft = { unreadable: [], innings: [{ side: 'mora', battingTeam: 'Mora', total: { runs: 10, wickets: 0, overs: '0.0' }, extras: { byes: 0, legByes: 0, wides: 0, noBalls: 0, penalty: 0 }, bowling: [], didNotBat: [], batting: [{ name: 'A', howOut: 'not out', runs: 10, balls: 10, fours: 1, sixes: 0, match: null, playerId: 'p' }] }] }
  const now = new Date('2026-01-01')
  expect(draftStatus(draft, details, now).status).toBe('ready')
  draft.innings[0].batting[0].playerId = null
  expect(draftStatus(draft, details, now).status).toBe('blocking')
  expect(draftStatus(draft, details, now, true)).toMatchObject({ status: 'empty', count: 1 })
  draft.innings[0].batting[0].playerId = 'p'
  draft.innings[0].total.runs = 12
  expect(draftStatus(draft, details, now).status).toBe('check')
})
