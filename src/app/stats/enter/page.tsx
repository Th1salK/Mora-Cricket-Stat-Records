import StatsEntryClient from '../../../components/StatsEntryClient'

type Player = {
  _id: string
  fullName: string
  role: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper'
  isActive: boolean
}

type Match = {
  _id: string
  date: string
  opponent: string
  venue: 'Home' | 'Away'
  overs: number
  matchType: 'Home and Home' | 'Practice' | 'Div 3' | 'Inter Uni' | 'SLUG'
}

export default async function Page() {
  const playersRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/players`, { cache: 'no-store' })
  const matchesRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/matches`, { cache: 'no-store' })

  const players: Player[] = (await playersRes.json()) || []
  const matches: Match[] = (await matchesRes.json()) || []

  return (
    <div className="space-y-6">
      <h1 className="text-white text-2xl font-bold">Stats Entry</h1>
      <StatsEntryClient players={players} matches={matches} />
    </div>
  )
}
