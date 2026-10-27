import mongoose from 'mongoose'
import { connectWithFallback } from '@/lib/mongodb'
import { ensureSeasonForDate } from '@/lib/seasonsServer'
import { seasonForDate, type SeasonRange } from '@/lib/stats/seasons'
import Match from '@/models/Match'
import Season from '@/models/Season'

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not defined.')
  const apply = process.argv.includes('--apply')

  // Even automatic collection/index creation must not write during a dry run.
  mongoose.set('autoCreate', apply)
  mongoose.set('autoIndex', apply)
  await connectWithFallback(uri)

  try {
    if (apply) await Season.init()
    const matches = await Match.find().select('_id date opponent season').lean()
    const seasons = await Season.find().select('_id name').lean()
    const existingIds = new Map(seasons.map((season) => [season.name, String(season._id)]))
    const groups = new Map<string, {
      range: SeasonRange
      matches: number
      assigned: number
      pending: mongoose.Types.ObjectId[]
    }>()

    console.log(apply ? 'APPLY: assigning seasons.' : 'DRY RUN: no database writes. Use --apply to assign seasons.')
    for (const match of matches) {
      if (!(match.date instanceof Date) || Number.isNaN(match.date.getTime())) {
        console.warn(`Skipping invalid date: ${match._id} | ${match.opponent} | ${String(match.date)}`)
        continue
      }
      const range = seasonForDate(match.date)
      let group = groups.get(range.name)
      if (!group) {
        group = { range, matches: 0, assigned: 0, pending: [] }
        groups.set(range.name, group)
      }
      group.matches++
      const expectedId = existingIds.get(range.name)
      if (expectedId && String(match.season) === expectedId) {
        group.assigned++
      } else {
        group.pending.push(match._id)
      }
    }

    const sorted = [...groups.values()].sort((a, b) => a.range.startDate.getTime() - b.range.startDate.getTime())
    console.table(sorted.map((group) => ({
      'season name': group.range.name,
      matches: group.matches,
      'already assigned': group.assigned,
      'to assign': group.pending.length,
    })))

    if (apply) {
      let updated = 0
      for (const group of sorted) {
        if (group.pending.length === 0) continue
        const seasonId = await ensureSeasonForDate(group.range.startDate)
        const result = await Match.bulkWrite(group.pending.map((id) => ({
          updateOne: {
            filter: { _id: id, season: { $ne: seasonId } },
            update: { $set: { season: seasonId } },
            timestamps: false,
          },
        })))
        updated += result.modifiedCount
      }
      console.log(`Updated ${updated} match(es).`)
    }
  } finally {
    await mongoose.disconnect()
  }
}

main().catch((err) => {
  console.error('Failed to assign seasons:', err)
  process.exit(1)
})
