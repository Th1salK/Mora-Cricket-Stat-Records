import mongoose from 'mongoose'
import { connectWithFallback } from '../src/lib/mongodb'
import Match from '../src/models/Match'
import { MATCH_TYPES } from '../src/lib/constants'

async function main() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error('MONGODB_URI is not defined.')
    process.exit(1)
  }

  await connectWithFallback(uri)

  const matches = await Match.find({ matchType: { $nin: [...MATCH_TYPES] } })
    .select('date opponent matchType')
    .sort({ date: 1 })
    .lean()

  if (matches.length === 0) {
    console.log('All matches have a known match type.')
  } else {
    console.log(`Found ${matches.length} match(es) with an unknown match type:\n`)
    for (const match of matches) {
      const date = new Date(match.date).toISOString().slice(0, 10)
      console.log(`- ${match._id.toString()} | ${date} | ${match.opponent} | ${match.matchType}`)
    }
  }

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('Failed to check match types:', err)
  process.exit(1)
})
