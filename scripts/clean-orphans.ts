import mongoose from 'mongoose'
import { connectWithFallback } from '../src/lib/mongodb'
import { isOrphan } from '../src/lib/orphans'
import Match from '../src/models/Match'
import Player from '../src/models/Player'
import BattingPerformance from '../src/models/BattingPerformance'
import BowlingPerformance from '../src/models/BowlingPerformance'

const apply = process.argv.includes('--apply')

type OrphanDoc = {
  _id: mongoose.Types.ObjectId
  matchId?: unknown
  playerId?: unknown
}

async function handleOrphans(
  label: string,
  docs: OrphanDoc[],
  deleteByIds: (ids: mongoose.Types.ObjectId[]) => Promise<number>
): Promise<number> {
  const matchIds = [
    ...new Set(docs.map((d) => d.matchId).filter((id) => id != null).map(String)),
  ]
  const playerIds = [
    ...new Set(docs.map((d) => d.playerId).filter((id) => id != null).map(String)),
  ]

  const existingMatchIds = new Set(
    (await Match.find({ _id: { $in: matchIds } }).select('_id').lean()).map((m) => String(m._id))
  )
  const existingPlayerIds = new Set(
    (await Player.find({ _id: { $in: playerIds } }).select('_id').lean()).map((p) => String(p._id))
  )

  const orphans = docs.filter((d) => isOrphan(d, existingMatchIds, existingPlayerIds))

  console.log(`${label}: ${orphans.length} orphaned document(s)`)
  for (const orphan of orphans) {
    console.log(
      `  ${String(orphan._id)}  matchId=${String(orphan.matchId)}  playerId=${String(orphan.playerId)}`
    )
  }

  if (apply && orphans.length > 0) {
    const deletedCount = await deleteByIds(orphans.map((o) => o._id))
    console.log(`${label}: deleted ${deletedCount} document(s)`)
  } else if (orphans.length > 0) {
    console.log(`${label}: dry run, nothing deleted. Re-run with --apply to delete.`)
  }

  return orphans.length
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is not defined.')
    process.exit(1)
  }

  await connectWithFallback(uri)

  console.log(
    apply
      ? 'Running in APPLY mode...\n'
      : 'Running in DRY-RUN mode (pass --apply to delete)...\n'
  )

  const battingDocs = await BattingPerformance.find().select('_id matchId playerId').lean()
  const bowlingDocs = await BowlingPerformance.find().select('_id matchId playerId').lean()

  const battingOrphans = await handleOrphans(
    'BattingPerformance',
    battingDocs,
    async (ids) =>
      (await BattingPerformance.deleteMany({ _id: { $in: ids } })).deletedCount
  )
  const bowlingOrphans = await handleOrphans(
    'BowlingPerformance',
    bowlingDocs,
    async (ids) =>
      (await BowlingPerformance.deleteMany({ _id: { $in: ids } })).deletedCount
  )

  console.log(`\nTotal: ${battingOrphans + bowlingOrphans} orphaned document(s).`)

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('Failed to clean orphans:', err)
  process.exit(1)
})
