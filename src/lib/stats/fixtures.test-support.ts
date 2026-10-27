import type { BatRow, BowlRow, MatchRow } from '@/lib/stats/types'
export function bat(overrides: Partial<BatRow> = {}): BatRow {
  return { playerId: 'p1', matchId: 'm1', matchType: 'Friendly', date: new Date('2026-01-01Z'),
    runs: 20, balls: 24, fours: 2, sixes: 1, out: true, ...overrides }
}
export function bowl(overrides: Partial<BowlRow> = {}): BowlRow {
  return { playerId: 'p1', matchId: 'm1', matchType: 'Friendly', date: new Date('2026-01-01Z'),
    balls: 24, runs: 20, wickets: 2, wides: 1, noBalls: 0, maidens: 1, ...overrides }
}
export function match(overrides: Partial<MatchRow> = {}): MatchRow {
  return { matchId: 'm1', matchType: 'Friendly', date: new Date('2026-01-01Z'), opponent: 'Visitors',
    outcome: null, margin: null, marginType: null, moraInnings: null, oppInnings: null, ...overrides }
}
