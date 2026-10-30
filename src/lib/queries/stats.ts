import mongoose from 'mongoose'
import { dashboardTotals } from '@/lib/queries/dashboardRows'
import { recentMilestones } from '@/lib/stats/milestones'
import { MATCH_TYPES, type MatchTypeFilter } from '@/lib/constants'
import { connectDB } from '@/lib/mongodb'
import { getCurrentSeason } from '@/lib/seasonsServer'
import { battingSummary, battingByPlayer, type BattingSummary } from '@/lib/stats/batting'
import { bowlingSummary, bowlingByPlayer, type BowlingSummary } from '@/lib/stats/bowling'
import { HIDE_INACTIVE_IN_CURRENT_SEASON } from '@/lib/stats/config'
import { fmtOvers } from '@/lib/stats/format'
import { seasonForDate } from '@/lib/stats/seasons'
import { compareNullable } from '@/lib/stats/sort'
import { resultSummary } from '@/lib/stats/results'
import * as records from '@/lib/stats/records'
import * as streaks from '@/lib/stats/streaks'
import { mapMatch, mapBatting, mapBowling, populatedPlayer, type PlayerInfo } from '@/lib/queries/mapping'
import Match from '@/models/Match'
import Player from '@/models/Player'
import Season from '@/models/Season'
import BattingPerformance from '@/models/BattingPerformance'
import BowlingPerformance from '@/models/BowlingPerformance'

export type StatsFilter = { seasonId: string | 'all'; matchType: MatchTypeFilter }
export type BattingTableRow = PlayerInfo & BattingSummary & { matches: number }
export type BowlingTableRow = PlayerInfo & BowlingSummary & { overs: string; matches: number }

export async function resolveFilter(params: { season?: string | null; matchType?: string | null }) {
  await connectDB()
  const matchType: MatchTypeFilter = MATCH_TYPES.includes(params.matchType as typeof MATCH_TYPES[number])
    ? params.matchType as typeof MATCH_TYPES[number] : 'All'
  const current = await getCurrentSeason()
  let selected: { id: string; name: string } | null = null
  if (params.season === 'all') {
    return { seasonId: 'all', matchType, seasonName: null, isCurrentSeason: false }
  }
  if (params.season && mongoose.isValidObjectId(params.season)) {
    const season = await Season.findById(params.season).select('name').lean()
    if (season) selected = { id: String(season._id), name: season.name }
  }
  if (!selected) {
    selected = current
    if (selected && !(await Match.exists({ season: selected.id }))) {
      const ids = await Match.distinct('season')
      const latest = await Season.findOne({ _id: { $in: ids } }).select('name').sort({ startDate: -1 }).lean()
      selected = latest ? { id: String(latest._id), name: latest.name } : null
    }
  }
  return { seasonId: selected?.id ?? 'all', matchType, seasonName: selected?.name ?? null,
    isCurrentSeason: !!selected && selected.id === current?.id }
}

async function loadData(filter: StatsFilter) {
  await connectDB()
  if (filter.seasonId !== 'all' && !mongoose.isValidObjectId(filter.seasonId)) throw new Error('Invalid season ID')
  const docs = await Match.find({
    ...(filter.seasonId === 'all' ? {} : { season: filter.seasonId }),
    ...(filter.matchType === 'All' ? {} : { matchType: filter.matchType }),
  }).select('_id date opponent matchType innings result season').lean()
  const matches = docs.map(mapMatch)
  const matchMap = new Map(matches.map((match) => [match.matchId, match]))
  const matchIds = docs.map((match) => match._id)
  const [batDocs, bowlDocs] = await Promise.all([
    BattingPerformance.find({ matchId: { $in: matchIds } }).select('matchId playerId runs balls fours sixes out dismissal')
      .populate({ path: 'playerId', model: Player, select: 'fullName isActive role' }).lean(),
    BowlingPerformance.find({ matchId: { $in: matchIds } }).select('matchId playerId balls runs wickets wides noBalls maidens')
      .populate({ path: 'playerId', model: Player, select: 'fullName isActive role' }).lean(),
  ])
  const batting = batDocs.map((row) => mapBatting(row, matchMap)).filter((row) => row !== null)
  const bowling = bowlDocs.map((row) => mapBowling(row, matchMap)).filter((row) => row !== null)
  const players = new Map<string, PlayerInfo>()
  for (const doc of [...batDocs, ...bowlDocs]) {
    const player = populatedPlayer(doc.playerId)
    if (player) players.set(player.playerId, player)
  }
  return { docs, matches, matchMap, batting, bowling, players }
}
async function hideInactive(filter: StatsFilter) {
  if (!HIDE_INACTIVE_IN_CURRENT_SEASON || filter.seasonId === 'all') return false
  return filter.seasonId === (await getCurrentSeason())?.id
}
export async function getBattingTable(filter: StatsFilter, options: { includeInactive?: boolean } = {}): Promise<BattingTableRow[]> {
  const data = await loadData(filter)
  const hide = await hideInactive(filter)
  return [...battingByPlayer(data.batting)].map(([id, summary]) => ({ ...data.players.get(id)!, matches: new Set([...data.batting, ...data.bowling].filter((row) => row.playerId === id).map((row) => row.matchId)).size, ...summary }))
    .filter((row) => options.includeInactive || !hide || row.isActive).sort((a, b) => b.runs - a.runs || a.playerName.localeCompare(b.playerName))
}
export async function getBowlingTable(filter: StatsFilter, options: { includeInactive?: boolean } = {}): Promise<BowlingTableRow[]> {
  const data = await loadData(filter)
  const hide = await hideInactive(filter)
  return [...bowlingByPlayer(data.bowling)].map(([id, summary]) => ({ ...data.players.get(id)!, matches: new Set([...data.batting, ...data.bowling].filter((row) => row.playerId === id).map((row) => row.matchId)).size, ...summary, overs: fmtOvers(summary.balls) }))
    .filter((row) => options.includeInactive || !hide || row.isActive)
    .sort((a, b) => b.wickets - a.wickets || compareNullable(a.economy, b.economy) || a.playerName.localeCompare(b.playerName))
}
function overview(data: Awaited<ReturnType<typeof loadData>>) {
  return { batting: battingSummary(data.batting), bowling: bowlingSummary(data.bowling),
    results: resultSummary(data.matches), matchCount: data.matches.length }
}
export async function getTeamOverview(filter: StatsFilter) { return overview(await loadData(filter)) }
function breakdown(data: Awaited<ReturnType<typeof loadData>>): Record<string, ReturnType<typeof overview>> {
  return Object.fromEntries(MATCH_TYPES.filter((type) => data.matches.some((match) => match.matchType === type)).map((type) => [
    type, overview({ ...data, matches: data.matches.filter((match) => match.matchType === type),
      batting: data.batting.filter((row) => row.matchType === type), bowling: data.bowling.filter((row) => row.matchType === type) }),
  ]))
}
export async function getBreakdownByMatchType(filter: StatsFilter) { return breakdown(await loadData(filter)) }
export async function getPlayerStats(playerId: string, filter: StatsFilter) {
  if (!mongoose.isValidObjectId(playerId)) throw new Error('Invalid player ID')
  const data = await loadData(filter)
  data.batting = data.batting.filter((row) => row.playerId === playerId)
  data.bowling = data.bowling.filter((row) => row.playerId === playerId)
  const playedIds = new Set([...data.batting, ...data.bowling].map((row) => row.matchId))
  data.matches = data.matches.filter((match) => playedIds.has(match.matchId))
  const recent = <T extends { date: Date; matchId: string }>(rows: T[]) => [...rows]
    .sort((a, b) => b.date.getTime() - a.date.getTime() || a.matchId.localeCompare(b.matchId)).slice(0, 10)
    .map((row) => ({ ...row, date: row.date.toISOString(), opponent: data.matchMap.get(row.matchId)!.opponent }))
  return { matches: playedIds.size, runsByInnings: [...data.batting].filter((row) => row.dismissalType !== 'did not bat').sort((a, b) => a.date.getTime() - b.date.getTime()).slice(-12).map((row) => ({ date: row.date.toISOString(), runs: row.runs })), recentPerformances: [...data.matches].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5).map((match) => ({ matchId: match.matchId, date: match.date.toISOString(), opponent: match.opponent, bat: data.batting.find((row) => row.matchId === match.matchId && row.dismissalType !== 'did not bat') ?? null, bowl: data.bowling.find((row) => row.matchId === match.matchId) ?? null })), batting: battingSummary(data.batting), bowling: bowlingSummary(data.bowling), byMatchType: breakdown(data),
    recentBatting: recent(data.batting.filter((row) => row.dismissalType !== 'did not bat')), recentBowling: recent(data.bowling) }
}
export async function getRecords(filter: StatsFilter) {
  const data = await loadData(filter)
  const seasonIds = data.docs.flatMap((match) => match.season ? [match.season] : [])
  const seasons = await Season.find({ _id: { $in: seasonIds } }).select('name').lean()
  const names = new Map(seasons.map((season) => [String(season._id), season.name]))
  const matchSeasons = new Map(data.docs.map((match) => [String(match._id),
    (match.season ? names.get(String(match.season)) : undefined) ?? seasonForDate(match.date).name]))
  const seasonOf = (matchId: string) => matchSeasons.get(matchId)!
  return {
    ...dashboardTotals(data.batting, data.bowling),
    matchInfo: Object.fromEntries(data.matches.map((match) => [match.matchId, { opponent: match.opponent, mora: match.moraInnings }])),
    topRuns: [...battingByPlayer(data.batting)].sort((a, b) => b[1].runs - a[1].runs).slice(0, 5).map(([playerId, summary]) => ({ ...data.players.get(playerId)!, ...summary })),
    topWickets: [...bowlingByPlayer(data.bowling)].sort((a, b) => b[1].wickets - a[1].wickets).slice(0, 5).map(([playerId, summary]) => ({ ...data.players.get(playerId)!, ...summary })),
    milestones: recentMilestones(data.batting, data.bowling, data.matches, seasonOf),
    playerNames: Object.fromEntries([...data.players].map(([id, player]) => [id, player.playerName])),
    highestScore: records.highestScore(data.batting), bestBowling: records.bestBowling(data.bowling),
    mostRunsInASeason: records.mostRunsInASeason(data.batting, seasonOf),
    mostWicketsInASeason: records.mostWicketsInASeason(data.bowling, seasonOf),
    mostSixesInASeason: records.mostSixesInASeason(data.batting, seasonOf),
    bestBattingAverage: records.bestBattingAverage(data.batting), bestBattingStrikeRate: records.bestBattingStrikeRate(data.batting),
    bestEconomy: records.bestEconomy(data.bowling), bestBowlingAverage: records.bestBowlingAverage(data.bowling),
    bestBowlingStrikeRate: records.bestBowlingStrikeRate(data.bowling),
    highestTotal: records.highestTotal(data.matches), lowestAllOutTotal: records.lowestAllOutTotal(data.matches),
    biggestWinByRuns: records.biggestWinByRuns(data.matches), biggestWinByWickets: records.biggestWinByWickets(data.matches),
    longestWinningRun: streaks.longestWinningRun(data.matches), currentRun: streaks.currentRun(data.matches),
    longestWinningRunByMatchType: Object.fromEntries(streaks.longestWinningRunByMatchType(data.matches)),
    currentRunByMatchType: Object.fromEntries(streaks.currentRunByMatchType(data.matches)),
  }
}

export async function getTableBreakdownByMatchType(filter: StatsFilter) {
  const data = await loadData(filter)
  const hide = await hideInactive(filter)
  return Object.fromEntries(MATCH_TYPES.map((type) => {
    const batting = [...battingByPlayer(data.batting.filter((row) => row.matchType === type))]
      .map(([id, summary]) => ({ ...data.players.get(id)!, ...summary })).filter((row) => !hide || row.isActive)
      .sort((a, b) => b.runs - a.runs)
    const bowling = [...bowlingByPlayer(data.bowling.filter((row) => row.matchType === type))]
      .map(([id, summary]) => ({ ...data.players.get(id)!, ...summary })).filter((row) => !hide || row.isActive)
      .sort((a, b) => b.wickets - a.wickets || compareNullable(a.economy, b.economy))
    return [type, { batting, bowling, matchCount: data.matches.filter((match) => match.matchType === type).length }] as const
  }))
}
