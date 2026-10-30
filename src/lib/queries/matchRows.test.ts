import { describe, it, expect } from 'vitest'
import { toMatchListRow, escapeMatchSearch, type MatchListDocument } from '@/lib/queries/matchRows'
const doc: MatchListDocument = { _id: 'match-1', date: new Date('2026-04-04T00:00:00Z'), opponent: 'Visitors',
  venue: 'Home', matchType: 'Div 3', overs: 40 }

describe('match list mapping', () => {
  it('keeps missing historic scores and results null', () => {
    expect(toMatchListRow(doc)).toEqual({ id: 'match-1', date: '2026-04-04T00:00:00.000Z',
      opponent: 'Visitors', venue: 'Home', venueName: null, matchType: 'Div 3', overs: 40, mora: null,
      opposition: null, outcome: null, margin: null, marginType: null, isInternal: false, source: 'manual' })
  })
  it('finds teams by their tag, not innings order, and preserves zero', () => {
    expect(toMatchListRow({ ...doc, source: 'import', innings: [
      { team: 'opposition', runs: 100, wickets: 10, balls: 120 },
      { team: 'mora', runs: 0, wickets: 0, balls: 0 },
    ], result: { outcome: 'won', margin: 0, marginType: 'runs' } })).toMatchObject({
      mora: { runs: 0, wickets: 0, balls: 0 }, opposition: { runs: 100, wickets: 10, balls: 120 },
      source: 'import', outcome: 'won', margin: 0,
    })
  })
  it('flags internal matches and keeps one-sided innings incomplete', () => {
    expect(toMatchListRow({ ...doc, matchType: 'Home and Home', venueName: '  Ground  ', innings: [
      { team: 'mora', runs: 120, wickets: 4, balls: 100 },
    ] })).toMatchObject({ isInternal: true, venueName: 'Ground', opposition: null })
  })
  it('treats incomplete totals as missing', () => {
    expect(toMatchListRow({ ...doc, innings: [{ team: 'mora', runs: NaN, wickets: 0, balls: 0 }] }).mora).toBeNull()
  })
  it('escapes regex characters so opponent searches remain literal', () => {
    const query = new RegExp(escapeMatchSearch('CC (A).*'), 'i')
    expect(query.test('Mora CC (A).*')).toBe(true)
    expect(query.test('Mora CC Aanything')).toBe(false)
  })
})
