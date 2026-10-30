import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { getBattingTable, getBowlingTable, type StatsFilter } from '@/lib/queries/stats'
import { mergePlayerCards } from '@/lib/queries/playerCards'
import Player from '@/models/Player'
import Match from '@/models/Match'
import BattingPerformance from '@/models/BattingPerformance'
import BowlingPerformance from '@/models/BowlingPerformance'
export async function getPlayer(id: string) {
  if (!mongoose.isValidObjectId(id)) return null
  await connectDB()
  const row = await Player.findById(id).lean()
  return row ? { id: String(row._id), fullName: row.fullName, shortName: row.shortName, aliases: row.aliases ?? [], role: row.role, isActive: row.isActive, battingStyle: row.battingStyle ?? null, bowlingStyle: row.bowlingStyle ?? null } : null
}
export async function getPlayerCards(filter: StatsFilter) {
  await connectDB()
  if (filter.seasonId !== 'all' && !mongoose.isValidObjectId(filter.seasonId)) throw new Error('Invalid season ID')
  const [players, batting, bowling, ids] = await Promise.all([Player.find().sort({ fullName: 1 }).lean(), getBattingTable(filter, { includeInactive: true }), getBowlingTable(filter, { includeInactive: true }), Match.find({ ...(filter.seasonId === 'all' ? {} : { season: filter.seasonId }), ...(filter.matchType === 'All' ? {} : { matchType: filter.matchType }) }).distinct('_id')])
  const [bat, bowl] = await Promise.all([BattingPerformance.find({ matchId: { $in: ids } }).select('playerId matchId').lean(), BowlingPerformance.find({ matchId: { $in: ids } }).select('playerId matchId').lean()])
  return mergePlayerCards(players.map((p) => ({ id: String(p._id), fullName: p.fullName, shortName: p.shortName, aliases: p.aliases ?? [], role: p.role, isActive: p.isActive, battingStyle: p.battingStyle ?? null, bowlingStyle: p.bowlingStyle ?? null })), batting, bowling, [...bat, ...bowl].map((row) => ({ playerId: String(row.playerId), matchId: String(row.matchId) })))
}
