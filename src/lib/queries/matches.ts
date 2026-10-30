import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { MATCH_TYPES } from '@/lib/constants'
import type { StatsFilter } from '@/lib/queries/stats'
import { escapeMatchSearch, toMatchListRow } from '@/lib/queries/matchRows'
import Match from '@/models/Match'
import Player from '@/models/Player'
import BattingPerformance from '@/models/BattingPerformance'
import BowlingPerformance from '@/models/BowlingPerformance'
import { populatedPlayer } from '@/lib/queries/mapping'

export type { MatchListRow } from '@/lib/queries/matchRows'
export type MatchesFilter = StatsFilter & { search?: string; sort?: 'newest' | 'oldest' }

function matchQuery(filter: MatchesFilter) {
  if (filter.seasonId !== 'all' && !mongoose.isValidObjectId(filter.seasonId)) throw new Error('Invalid season ID')
  if (filter.matchType !== 'All' && !MATCH_TYPES.includes(filter.matchType)) throw new Error('Invalid match type')
  const search = filter.search?.trim()
  const literal = search ? new RegExp(escapeMatchSearch(search), 'i') : null
  return {
    ...(filter.seasonId === 'all' ? {} : { season: filter.seasonId }),
    ...(filter.matchType === 'All' ? {} : { matchType: filter.matchType }),
    ...(literal ? { $or: [{ opponent: literal }, { venueName: literal }] } : {}),
  }
}
const fields = '_id date opponent venue venueName matchType overs innings result source'
export async function listMatches(filter: MatchesFilter) {
  const query = matchQuery(filter)
  await connectDB()
  const direction = filter.sort === 'oldest' ? 1 : -1
  const matches = await Match.find(query).select(fields).sort({ date: direction, _id: direction }).lean()
  return matches.map(toMatchListRow)
}
export async function getLatestMatch(filter: MatchesFilter) {
  const query = matchQuery(filter)
  await connectDB()
  const match = await Match.findOne(query).select(fields).sort({ date: -1, _id: -1 }).lean()
  return match ? toMatchListRow(match) : null
}

export async function getMatchDetail(id: string) {
  if (!mongoose.isValidObjectId(id)) return null
  await connectDB()
  const doc = await Match.findById(id).lean()
  if (!doc) return null
  const [bat, bowl] = await Promise.all([
    BattingPerformance.find({ matchId: id }).sort({ position: 1, _id: 1 }).populate({ path: 'playerId', model: Player, select: 'fullName' }).lean(),
    BowlingPerformance.find({ matchId: id }).sort({ _id: 1 }).populate({ path: 'playerId', model: Player, select: 'fullName' }).lean(),
  ])
  return { match: toMatchListRow(doc), toss: doc.toss?.wonBy ? { wonBy: doc.toss.wonBy, decision: doc.toss.decision } : null,
    extras: { mora: doc.innings?.find((row) => row.team === 'mora')?.extras ?? null, opposition: doc.innings?.find((row) => row.team === 'opposition')?.extras ?? null },
    batting: bat.flatMap((row) => { const player = populatedPlayer(row.playerId); return player ? [{ playerId: player.playerId, playerName: player.playerName, runs: row.runs, balls: row.balls, fours: row.fours, sixes: row.sixes, out: row.out, position: row.position ?? null, dismissal: row.dismissal ? { type: row.dismissal.type, fielder: row.dismissal.fielder, bowler: row.dismissal.bowler } : null }] : [] }),
    bowling: bowl.flatMap((row) => { const player = populatedPlayer(row.playerId); return player ? [{ playerId: player.playerId, playerName: player.playerName, balls: row.balls, maidens: doc.innings?.length ? row.maidens ?? null : null, runs: row.runs, wickets: row.wickets, wides: row.wides, noBalls: row.noBalls }] : [] }),
  }
}
