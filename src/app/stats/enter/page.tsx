import { isAdmin } from '../../../lib/auth'
import StatsEntryClient from '../../../components/StatsEntryClient'
import Link from 'next/link'

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
  const admin = await isAdmin()

  if (!admin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass p-8 max-w-md text-center space-y-4">
          <h1 className="text-white text-2xl font-bold">Access Denied</h1>
          <p className="text-slate-400 text-sm">Stats entry is restricted to admins only.</p>
          <Link
            href="/login"
            className="inline-block mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-6 py-2 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    )
  }

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
