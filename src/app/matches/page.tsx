import MatchesClient from '../../components/MatchesClient'
import { connectDB } from '../../lib/mongodb'
import Match from '../../models/Match'

export default async function Page() {
  await connectDB()

  const matches = await Match.find().sort({ date: -1 }).lean()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Matches</h1>
      <MatchesClient matches={JSON.parse(JSON.stringify(matches))} />
    </div>
  )
}
