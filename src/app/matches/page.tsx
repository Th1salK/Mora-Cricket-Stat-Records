import MatchesClient from '../../components/MatchesClient'

type Match = {
  _id?: string
  date: string
  opponent: string
  venue: 'Home' | 'Away'
  overs: number
  matchType: 'League' | 'Friendly' | 'Tournament'
}

export default async function Page() {
  const res = await fetch('http://localhost:3000/api/matches', { cache: 'no-store' })
  const data = await  res.json()
  const matches: Match[] = data.matches ?? []

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Matches</h1>
      <MatchesClient matches={matches} />
    </div>
  )
}
