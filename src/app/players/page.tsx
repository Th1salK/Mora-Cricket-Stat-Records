import PlayersClient from '../../components/PlayersClient'
import { connectDB } from '../../lib/mongodb'
import Player from '../../models/Player'

export default async function Page() {
  await connectDB()
  const raw = await Player.find().sort({ createdAt: -1 }).lean()
  // Serialize: Mongoose ObjectIds and Dates are not plain JSON-safe values
  const players = JSON.parse(JSON.stringify(raw))

  return (
    <div className="space-y-6">
      <h1 className="text-white text-2xl font-bold">Players</h1>
      <PlayersClient players={players} />
    </div>
  )
}
