import StatsEntryClient from '../../../components/StatsEntryClient'

type Player = {
  _id?: string
  fullName: string
  shortName: string
}

type Match = {
  _id?: string
  date: string
  opponent: string
  venue: string
  overs: number
  matchType: string
}

export default async function Page() {
  const playersRes = await fetch('http://localhost:3000/api/players', { cache: 'no-store' })
  const matchesRes = await fetch('http://localhost:3000/api/matches', { cache: 'no-store' })

  const players: Player[] = (await playersRes.json()) || []
  const matches: Match[] = (await matchesRes.json()) || []

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Enter Stats (Phase 1)</h1>
      <StatsEntryClient players={players} matches={matches} />
    </div>
  )
}
