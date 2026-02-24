import PlayersClient from '../../components/PlayersClient'

type Player = {
  _id?: string
  fullName: string
  shortName: string
  battingStyle?: string | null
  bowlingStyle?: string | null
  role: string
  isActive?: boolean
}

export default async function Page() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/players`, { cache: 'no-store' })
  const data = await res.json()
  const players: Player[] = data.players ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-white text-2xl font-bold">Players</h1>
      <PlayersClient players={players} />
    </div>
  )
}
