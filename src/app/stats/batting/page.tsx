'use client'

import { useEffect, useState } from 'react'
import MatchTypeDropdown from '../../../components/MatchTypeDropdown'
import StatCard from '../../../components/StatCard'

interface BattingStats {
  totalInnings: number
  totalRuns: number
  totalBalls: number
  average: number
  strikeRate: number
  highScore: number
  notOuts: number
  ducks: number
  totalFours: number
  totalSixes: number
  fifties: number
  hundreds: number
}

export default function BattingStatsPage() {
  const [matchType, setMatchType] = useState('All')
  const [stats, setStats] = useState<BattingStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const url =
      matchType === 'All'
        ? '/api/stats/batting'
        : `/api/stats/batting?matchType=${encodeURIComponent(matchType)}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [matchType])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Batting Stats</h1>
          <p className="text-slate-400 text-sm mt-1">Aggregated batting performance</p>
        </div>
        <MatchTypeDropdown value={matchType} onChange={setMatchType} includeAll />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !stats ? (
        <div className="glass p-6 text-slate-400 text-center">No stats available</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard label="Total Innings" value={stats.totalInnings} />
          <StatCard label="Total Runs" value={stats.totalRuns} />
          <StatCard label="Average" value={stats.average === 0 ? '-' : stats.average} />
          <StatCard label="Strike Rate" value={stats.strikeRate === 0 ? '-' : stats.strikeRate} />
          <StatCard label="Highest Score" value={stats.highScore} />
          <StatCard label="Not Outs" value={stats.notOuts} />
          <StatCard label="Ducks" value={stats.ducks} />
          <StatCard label="50s" value={stats.fifties} />
          <StatCard label="100s" value={stats.hundreds} />
          <StatCard label="Total Fours" value={stats.totalFours} />
          <StatCard label="Total Sixes" value={stats.totalSixes} />
        </div>
      )}
    </div>
  )
}
