import mongoose from 'mongoose'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { connectWithFallback } from '@/lib/mongodb'
import Match from '@/models/Match'
import Season from '@/models/Season'
import BattingPerformance from '@/models/BattingPerformance'
import BowlingPerformance from '@/models/BowlingPerformance'

async function main() {
  if (process.argv.slice(2).some((arg) => arg !== '--apply')) throw new Error('Only --apply is supported. This migration assigns every existing match to 2026.')
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not defined.')
  const apply = process.argv.includes('--apply')
  // A dry run must not create collections or indexes either.
  mongoose.set('autoCreate', false)
  mongoose.set('autoIndex', false)
  await connectWithFallback(uri)
  try {
    const matches = await Match.find().select('_id season').lean()
    const seasons = await Season.find().select('_id name isCurrent endedAt').lean()
    const target = seasons.find((season) => season.name === '2026')
    if (target?.endedAt) throw new Error('2026 has ended. The migration will not reopen it or add matches to it.')
    const assigned = matches.filter((match) => target && String(match.season) === String(target._id)).length
    const before = { batting: await BattingPerformance.countDocuments(), bowling: await BowlingPerformance.countDocuments() }
    console.log(apply ? 'APPLY: assigning every existing match to 2026.' : 'DRY RUN: no writes. Use --apply to assign every existing match to 2026.')
    console.table([{ season: '2026', total: matches.length, alreadyAssigned: assigned, toAssign: matches.length - assigned, createSeason: !target }])
    if (!apply) return

    const directory = join(process.cwd(), 'scripts', 'output')
    await mkdir(directory, { recursive: true })
    const backup = join(directory, `season-assignment-${Date.now()}.json`)
    await writeFile(backup, JSON.stringify({
      createdAt: new Date().toISOString(), targetExisted: !!target,
      matches: matches.map((match) => ({ id: String(match._id), season: match.season ? String(match.season) : null })),
      seasons: seasons.map((season) => ({ id: String(season._id), name: season.name, isCurrent: season.isCurrent })),
      performanceCounts: before,
    }, null, 2), { flag: 'wx' })
    console.log(`Previous assignments backed up to ${backup}`)
    await Season.createCollection()
    const session = await mongoose.startSession()
    try {
      await session.withTransaction(async () => {
        const current = await Match.find().select('_id season').session(session).lean()
        const snapshot = new Map(matches.map((match) => [String(match._id), String(match.season ?? '')]))
        if (current.length !== snapshot.size || current.some((match) => snapshot.get(String(match._id)) !== String(match.season ?? ''))) {
          throw new Error('Matches changed after the preview. Run the migration again.')
        }
        let season = await Season.findOne({ name: '2026' }).session(session)
        if (!season) [season] = await Season.create([{
          name: '2026', startDate: new Date('2026-01-01T00:00:00Z'), endDate: new Date('2027-01-01T00:00:00Z'),
        }], { session })
        if (season.endedAt) throw new Error('2026 has ended. No matches were reassigned.')
        await Season.updateMany({ _id: { $ne: season._id }, isCurrent: true }, { $set: { isCurrent: false } }, { session })
        await Season.updateOne({ _id: season._id }, { $set: { isCurrent: true }, $inc: { writeVersion: 1 } }, { session })
        const ids = current.map((match) => match._id)
        await Match.updateMany({ _id: { $in: ids }, season: { $ne: season._id } }, { $set: { season: season._id } }, { session, timestamps: false })
        const assignedCount = await Match.countDocuments({ _id: { $in: ids }, season: season._id }).session(session)
        if (assignedCount !== ids.length) throw new Error('Assignment verification failed; rolling back.')
        if (await BattingPerformance.countDocuments().session(session) !== before.batting || await BowlingPerformance.countDocuments().session(session) !== before.bowling) {
          throw new Error('Performance counts changed; rolling back. Retry while match publishing is idle.')
        }
      })
    } finally { await session.endSession() }
    await Season.createIndexes()
    console.log(`Verified ${matches.length} matches assigned to 2026. Performance counts unchanged. Other seasons retained.`)
  } finally { await mongoose.disconnect() }
}
main().catch((error) => {
  console.error('Failed to assign seasons:', error instanceof Error ? error.message : 'Unknown error')
  process.exitCode = 1
})
