import { expect, it } from 'vitest'
import { mergePlayerCards } from '@/lib/queries/playerCards'
it('includes players without games and counts distinct appearances across both disciplines', () => {
  const p = { id: 'a', fullName: 'A', shortName: 'A', aliases: [], role: 'Bowler' as const, isActive: false, battingStyle: null, bowlingStyle: null }
  expect(mergePlayerCards([p, { ...p, id: 'b' }], [{ playerId: 'a', runs: 8 }], [{ playerId: 'a', wickets: 2 }], [{ playerId: 'a', matchId: 'm' }, { playerId: 'a', matchId: 'm' }]).map(({ runs, wickets, matches }) => ({ runs, wickets, matches }))).toEqual([{ runs: 8, wickets: 2, matches: 1 }, { runs: 0, wickets: 0, matches: 0 }])
})
