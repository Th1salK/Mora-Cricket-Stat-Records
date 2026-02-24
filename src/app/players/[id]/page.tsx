'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MatchTypeDropdown from '@/components/MatchTypeDropdown'
import { getMatchTypeBadgeClass } from '@/lib/matchTypeBadge'

type MatchType = 'All' | 'Home and Home' | 'Practice' | 'Div 3' | 'Inter Uni' | 'SLUG'

interface PlayerInfo {
  _id: string
  fullName: string
  shortName: string
  role: string
  battingStyle?: string | null
  bowlingStyle?: string | null
  isActive: boolean
}

interface BattingStats {
  totalInnings: number
  totalRuns: number
  totalBalls: number
  average: number
  strikeRate: number
  highScore: number
  notOuts: number
  ducks: number
  fours: number
  sixes: number
  fifties: number
  hundreds: number
}

interface BowlingStats {
  totalBalls: number
  totalRuns: number
  totalWickets: number
  totalWides: number
  totalNoBalls: number
  overs: string
  average: number
  economy: number
  strikeRate: number
  bestFigures: string
  fiveWickets: number
}

interface RecentBatting {
  matchId: string
  opponent: string
  date: string | null
  matchType: string
  runs: number
  balls: number
  fours: number
  sixes: number
  out: boolean
}

interface RecentBowling {
  matchId: string
  opponent: string
  date: string | null
  matchType: string
  balls: number
  runs: number
  wickets: number
  wides: number
  noBalls: number
}

function initials(name?: string) {
  if (!name) return ''
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function fmt(val: number | null | undefined, decimals = 2) {
  if (val == null) return '—'
  return Number(val).toFixed(decimals)
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass-blue rounded-xl p-4 flex flex-col gap-1">
      <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  )
}

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [player, setPlayer] = useState<PlayerInfo | null>(null)
  const [batting, setBatting] = useState<BattingStats | null>(null)
  const [bowling, setBowling] = useState<BowlingStats | null>(null)
  const [recentBatting, setRecentBatting] = useState<RecentBatting[]>([])
  const [recentBowling, setRecentBowling] = useState<RecentBowling[]>([])
  const [matchType, setMatchType] = useState<MatchType>('All')
  const [loadingPlayer, setLoadingPlayer] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch player info once
  useEffect(() => {
    if (!id) return
    fetch(`/api/players/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Player not found')
        return r.json()
      })
      .then((data) => setPlayer(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingPlayer(false))
  }, [id])

  // Fetch stats whenever matchType changes
  useEffect(() => {
    if (!id) return
    setLoadingStats(true)
    const qs = matchType === 'All' ? '' : `?matchType=${encodeURIComponent(matchType)}`
    fetch(`/api/players/${id}/stats${qs}`)
      .then((r) => r.json())
      .then((data) => {
        setBatting(data.batting)
        setBowling(data.bowling)
        setRecentBatting(data.recentBatting ?? [])
        setRecentBowling(data.recentBowling ?? [])
      })
      .catch(console.error)
      .finally(() => setLoadingStats(false))
  }, [id, matchType])

  if (loadingPlayer) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400" />
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="glass p-8 text-center">
        <p className="text-red-400 font-semibold">{error ?? 'Player not found'}</p>
        <button onClick={() => router.push('/players')} className="mt-4 text-sm text-blue-400 hover:text-blue-300 underline">
          Back to Players
        </button>
      </div>
    )
  }

  const roleBadgeColor: Record<string, string> = {
    Batsman: 'bg-blue-600/30 text-blue-300 border border-blue-500/30',
    Bowler: 'bg-green-600/30 text-green-300 border border-green-500/30',
    'All-rounder': 'bg-yellow-600/30 text-yellow-300 border border-yellow-500/30',
    'Wicket-keeper': 'bg-purple-600/30 text-purple-300 border border-purple-500/30',
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push('/players')}
        className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
      >
        ← Back to Players
      </button>

      {/* Player Header */}
      <div className="glass p-6 flex items-center gap-6">
        <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center text-white text-2xl font-bold border border-blue-500/30">
          {initials(player.fullName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{player.fullName}</h1>
            {!player.isActive && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">Inactive</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeColor[player.role] ?? 'bg-slate-700 text-slate-300'}`}>
              {player.role}
            </span>
            {player.battingStyle && (
              <span className="text-slate-400">Bat: <span className="text-slate-200">{player.battingStyle}</span></span>
            )}
            {player.bowlingStyle && (
              <span className="text-slate-400">Bowl: <span className="text-slate-200">{player.bowlingStyle}</span></span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <MatchTypeDropdown value={matchType} onChange={(v) => setMatchType(v as MatchType)} />
        </div>
      </div>

      {loadingStats ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
        </div>
      ) : (
        <>
          {/* Batting Stats */}
          <div className="glass p-6">
            <h2 className="text-white text-lg font-semibold border-l-4 border-yellow-400 pl-3 mb-4">Batting</h2>
            {batting && batting.totalInnings > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard label="Innings" value={batting.totalInnings} />
                <StatCard label="Runs" value={batting.totalRuns} />
                <StatCard label="Average" value={fmt(batting.average)} />
                <StatCard label="Strike Rate" value={fmt(batting.strikeRate)} />
                <StatCard label="High Score" value={batting.highScore} />
                <StatCard label="Not Outs" value={batting.notOuts} />
                <StatCard label="4s" value={batting.fours} />
                <StatCard label="6s" value={batting.sixes} />
                <StatCard label="50s" value={batting.fifties} />
                <StatCard label="100s" value={batting.hundreds} />
                <StatCard label="Ducks" value={batting.ducks} />
                <StatCard label="Balls" value={batting.totalBalls} />
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No batting data for this filter.</p>
            )}
          </div>

          {/* Bowling Stats */}
          <div className="glass p-6">
            <h2 className="text-white text-lg font-semibold border-l-4 border-yellow-400 pl-3 mb-4">Bowling</h2>
            {bowling && bowling.totalBalls > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard label="Wickets" value={bowling.totalWickets} />
                <StatCard label="Overs" value={bowling.overs} />
                <StatCard label="Runs" value={bowling.totalRuns} />
                <StatCard label="Average" value={fmt(bowling.average)} />
                <StatCard label="Economy" value={fmt(bowling.economy)} />
                <StatCard label="Strike Rate" value={fmt(bowling.strikeRate)} />
                <StatCard label="Best" value={bowling.bestFigures} />
                <StatCard label="5-wkts" value={bowling.fiveWickets} />
                <StatCard label="Wides" value={bowling.totalWides} />
                <StatCard label="No Balls" value={bowling.totalNoBalls} />
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No bowling data for this filter.</p>
            )}
          </div>

          {/* Recent Batting */}
          <div className="glass p-6">
            <h2 className="text-white text-lg font-semibold border-l-4 border-yellow-400 pl-3 mb-4">Recent Batting</h2>
            {recentBatting.length === 0 ? (
              <p className="text-slate-500 text-sm">No recent batting performances.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-white/10">
                    <tr>
                      {['Date', 'Opponent', 'Type', 'Runs', 'Balls', '4s', '6s', 'Out'].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-yellow-400 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentBatting.map((r, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-blue-900/10 transition-colors">
                        <td className="px-3 py-2 text-slate-300 whitespace-nowrap">
                          {r.date ? new Date(r.date).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-3 py-2 text-slate-200">{r.opponent}</td>
                        <td className="px-3 py-2">
                          <span className={getMatchTypeBadgeClass(r.matchType)}>{r.matchType}</span>
                        </td>
                        <td className="px-3 py-2 text-white font-medium">{r.runs}</td>
                        <td className="px-3 py-2 text-slate-300">{r.balls}</td>
                        <td className="px-3 py-2 text-slate-300">{r.fours}</td>
                        <td className="px-3 py-2 text-slate-300">{r.sixes}</td>
                        <td className="px-3 py-2">
                          {r.out
                            ? <span className="text-red-400">Out</span>
                            : <span className="text-green-400">NO</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Bowling */}
          <div className="glass p-6">
            <h2 className="text-white text-lg font-semibold border-l-4 border-yellow-400 pl-3 mb-4">Recent Bowling</h2>
            {recentBowling.length === 0 ? (
              <p className="text-slate-500 text-sm">No recent bowling performances.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-white/10">
                    <tr>
                      {['Date', 'Opponent', 'Type', 'Overs', 'Runs', 'Wkts', 'Wd', 'NB'].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-yellow-400 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentBowling.map((r, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-blue-900/10 transition-colors">
                        <td className="px-3 py-2 text-slate-300 whitespace-nowrap">
                          {r.date ? new Date(r.date).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-3 py-2 text-slate-200">{r.opponent}</td>
                        <td className="px-3 py-2">
                          <span className={getMatchTypeBadgeClass(r.matchType)}>{r.matchType}</span>
                        </td>
                        <td className="px-3 py-2 text-slate-300">{Math.floor(r.balls / 6)}.{r.balls % 6}</td>
                        <td className="px-3 py-2 text-slate-300">{r.runs}</td>
                        <td className="px-3 py-2 text-white font-medium">{r.wickets}</td>
                        <td className="px-3 py-2 text-slate-300">{r.wides}</td>
                        <td className="px-3 py-2 text-slate-300">{r.noBalls}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
