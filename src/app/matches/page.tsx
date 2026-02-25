import MatchesClient from '../../components/MatchesClient'
import { connectDB } from '../../lib/mongodb'
import Match from '../../models/Match'
import { isAdmin } from '../../lib/auth'

export default async function Page() {
  await connectDB()

  const [matches, admin] = await Promise.all([
    Match.find().sort({ date: -1 }).lean(),
    isAdmin(),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-white text-2xl font-bold">Matches</h1>
      <MatchesClient matches={JSON.parse(JSON.stringify(matches))} isAdmin={admin} />
    </div>
  )
}
