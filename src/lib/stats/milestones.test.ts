import { expect, it } from 'vitest'
import { recentMilestones } from '@/lib/stats/milestones'
import type { BatRow, BowlRow, MatchRow } from '@/lib/stats/types'
const bat = (id: string, runs: number, year = 2026): BatRow => ({ playerId: 'p', matchId: id, date: new Date(`${year}-01-0${id}`), matchType: 'Div 3', runs, balls: 100, fours: 0, sixes: 0, out: true })
it('reports only the first century per season and crossed totals', () => {
  const events = recentMilestones([bat('1', 140), bat('2', 130)], [], [], () => '2026')
  expect(events.filter((e) => e.kind === 'century')).toHaveLength(1)
  expect(events.find((e) => e.kind === 'runs')?.value).toBe(250)
})
it('reports each five-for, wicket thresholds and limits the newest events', () => {
  const rows = [1, 2, 3, 4].map((n) => ({ ...bat(String(n), 20), wickets: 5, wides: 0, noBalls: 0, maidens: 0 })) as BowlRow[]
  const events = recentMilestones([], rows, [], () => '2026')
  expect(events).toHaveLength(4); expect(events[0].date.getUTCDate()).toBe(4)
  expect(events.some((e) => e.kind === 'wickets' && e.value === 20)).toBe(true)
})
it('ignores internal and no-result games, and resets winning runs after losses', () => {
  const rows = ['won', 'won', 'no result', 'won', 'lost'].map((outcome, n) => ({ ...bat(String(n + 1), 0), outcome, opponent: 'X', margin: null, marginType: null, moraInnings: null, oppInnings: null })) as MatchRow[]
  expect(recentMilestones([], [], rows, () => '2026').find((e) => e.kind === 'winning-run')?.value).toBe(3)
  expect(recentMilestones([], [], rows.map((r) => ({ ...r, matchType: 'Home and Home' })), () => '2026')).toEqual([])
  expect(recentMilestones([], [], [], () => '')).toEqual([])
})
