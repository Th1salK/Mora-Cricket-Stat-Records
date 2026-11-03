import { expect, it } from 'vitest'
import { matchPrefill } from '@/lib/queries/reimport'
import { toMatchListRow } from '@/lib/queries/matchRows'
it('prefills the original UTC date and details without inventing results', () => {
  const row = toMatchListRow({ _id: 'm', date: new Date('2026-03-14Z'), opponent: 'X', venue: 'Away', overs: 50, matchType: 'Div 3' })
  expect(matchPrefill(row)).toEqual({ date: '2026-03-14', opponent: 'X', venue: 'Away', overs: 50, matchType: 'Div 3' })
})

it('preserves manual season assignment when re-importing a match', () => {
  const row = toMatchListRow({ _id: 'm', season: '507f1f77bcf86cd799439011', date: new Date('2024-03-14Z'), opponent: 'X', venue: 'Away', overs: 50, matchType: 'Div 3' })
  expect(matchPrefill(row).season).toBe('507f1f77bcf86cd799439011')
})
