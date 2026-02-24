'use client'

import { useEffect, useState } from 'react'
import MatchTypeDropdown from '../../../components/MatchTypeDropdown'
import StatCard from '../../../components/StatCard'

interface BowlingStats {
  totalMatches: number
  totalWickets: number
  totalBalls: number
  totalRuns: number
  totalWides: number
  totalNoBalls: number
  overs: string
  average: number
  economy: number
  strikeRate: number
  bestFigures: string
  fiveWickets: number
}

export default function BowlingStatsPage() {
  const [matchType, setMatchType] = useState('All')
  const [stats, setStats] = useState<BowlingStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const url =
      matchType === 'All'
        ? '/api/stats/bowling'
        : `/api/stats/bowling?matchType=${encodeURIComponent(matchType)}`
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
          <h1 className="text-white text-2xl font-bold">Bowling Stats</h1>
          <p className="text-slate-400 text-sm mt-1">Aggregated bowling performance</p>
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
          <StatCard label="Total Wickets" value={stats.totalWickets} />
          <StatCard label="Overs Bowled" value={stats.overs} />
          <StatCard label="Average" value={stats.average === 0 ? '-' : stats.average} />
          <StatCard label="Economy" value={stats.economy === 0 ? '-' : stats.economy} />
          <StatCard label="Strike Rate" value={stats.strikeRate === 0 ? '-' : stats.strikeRate} />
          <StatCard label="Best Figures" value={stats.bestFigures} />
          <StatCard label="5-Wicket Hauls" value={stats.fiveWickets} />
          <StatCard label="Total Wides" value={stats.totalWides} />
          <StatCard label="No Balls" value={stats.totalNoBalls} />
        </div>
      )}
    </div>
  )
}
