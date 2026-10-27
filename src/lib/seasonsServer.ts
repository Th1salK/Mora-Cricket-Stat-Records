import mongoose, { type ClientSession } from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { seasonForDate } from '@/lib/stats/seasons'
import Match from '@/models/Match'
import Season from '@/models/Season'

export async function ensureSeasonForDate(date: Date, session?: ClientSession): Promise<mongoose.Types.ObjectId> {
  const range = seasonForDate(date)
  await connectDB()
  const season = await Season.findOneAndUpdate(
    { name: range.name },
    { $setOnInsert: range },
    { upsert: true, new: true, ...(session ? { session } : {}) }
  )
  return season._id
}

export async function listSeasons(): Promise<{
  id: string; name: string; startDate: string; endDate: string
}[]> {
  await connectDB()
  const seasons = await Season.find().select('name startDate endDate').sort({ startDate: -1 }).lean()
  return seasons.map((season) => ({
    id: String(season._id),
    name: season.name,
    startDate: season.startDate.toISOString(),
    endDate: season.endDate.toISOString(),
  }))
}

export async function getCurrentSeason(): Promise<{ id: string; name: string } | null> {
  await connectDB()
  let season = await Season.findOne({ isCurrent: true }).select('name').sort({ startDate: -1 }).lean()
  if (!season) {
    const today = new Date()
    season = await Season.findOne({ startDate: { $lte: today }, endDate: { $gt: today } })
      .select('name').sort({ startDate: -1 }).lean()
  }
  if (!season) {
    const seasonIds = await Match.distinct('season')
    season = await Season.findOne({ _id: { $in: seasonIds } }).select('name').sort({ startDate: -1 }).lean()
  }
  return season ? { id: String(season._id), name: season.name } : null
}
