import mongoose, { type ClientSession } from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { seasonIdSchema, SeasonError } from '@/lib/seasonValidation'
import Match from '@/models/Match'
import Season from '@/models/Season'

// Writing this document serialises match admission with ending the season.
export async function admitSeason(id: unknown, session: ClientSession, existingSeasonId?: string): Promise<mongoose.Types.ObjectId> {
  const parsed = seasonIdSchema.safeParse(id)
  if (!parsed.success) throw new SeasonError('Choose a season before saving the match')
  const season = await Season.findOneAndUpdate(
    { _id: parsed.data, ...(existingSeasonId === parsed.data ? {} : { endedAt: null }) },
    { $inc: { writeVersion: 1 } },
    { returnDocument: 'after', session }
  )
  if (!season) throw new SeasonError('Choose an open season. This season has ended or no longer exists.')
  return season._id
}

export async function listSeasons(): Promise<{
  id: string; name: string; startDate: string; endDate: string; isCurrent: boolean; endedAt: string | null
}[]> {
  await connectDB()
  const seasons = await Season.find().select('name startDate endDate isCurrent endedAt').sort({ startDate: -1 }).lean()
  return seasons.map((season) => ({
    id: String(season._id),
    name: season.name,
    startDate: season.startDate.toISOString(),
    endDate: season.endDate.toISOString(),
    isCurrent: season.isCurrent,
    endedAt: season.endedAt?.toISOString() ?? null,
  }))
}

export async function getCurrentSeason(): Promise<{ id: string; name: string } | null> {
  await connectDB()
  const season = await Season.findOne({ isCurrent: true, endedAt: null }).select('name').lean()
  return season ? { id: String(season._id), name: season.name } : null
}

export async function listSeasonsWithCounts() {
  await connectDB()
  const [seasons, counts] = await Promise.all([
    listSeasons(),
    Match.aggregate<{ _id: mongoose.Types.ObjectId; matchCount: number }>([
      { $match: { season: { $exists: true, $ne: null } } },
      { $group: { _id: '$season', matchCount: { $sum: 1 } } },
    ]),
  ])
  const byId = new Map(counts.map((row) => [String(row._id), row.matchCount]))
  return seasons.map((season) => ({ ...season, matchCount: byId.get(season.id) ?? 0 }))
}
