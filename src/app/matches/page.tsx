import MatchesClient from '../../components/MatchesClient'

type Match = {
  _id?: string
  date: string
  opponent: string
  venue: 'Home' | 'Away'
  overs: number
  matchType: 'Home and Home' | 'Practice' | 'Div 3'|'Inter Uni' | 'SLUG'
}

export default async function Page() {

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  const res = await fetch(`${baseUrl}/api/matches`, { cache: 'no-store' })
  const data = await  res.json()
  const matches: Match[] = data.matches ?? []

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Matches</h1>
      <MatchesClient matches={matches} />
    </div>
  )
}
