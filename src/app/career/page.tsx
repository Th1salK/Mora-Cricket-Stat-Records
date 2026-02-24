import StatCard from '../../components/StatCard'
import { getMatchTypeBadgeClass } from '../../lib/matchTypeBadge'
import { BattingStats, BowlingStats } from '../../lib/statsCalculator'

interface BreakdownEntry {
  batting: BattingStats
  bowling: BowlingStats
  matchCount: number
}

type Breakdown = Record<string, BreakdownEntry>

const MATCH_TYPES = ['Home and Home', 'Practice', 'Div 3', 'Inter Uni', 'SLUG'] as const

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

async function fetchStats() {
  const [battingRes, bowlingRes, breakdownRes] = await Promise.all([
    fetch(`${BASE_URL}/api/stats/batting`, { cache: 'no-store' }),
    fetch(`${BASE_URL}/api/stats/bowling`, { cache: 'no-store' }),
    fetch(`${BASE_URL}/api/stats/breakdown`, { cache: 'no-store' }),
  ])

  const batting: BattingStats = await battingRes.json()
  const bowling: BowlingStats = await bowlingRes.json()
  const breakdown: Breakdown = await breakdownRes.json()

  return { batting, bowling, breakdown }
}

export default async function CareerPage() {
  const { batting, bowling, breakdown } = await fetchStats()

  const activeTypes = MATCH_TYPES.filter(
    (t) => breakdown[t] && breakdown[t].matchCount > 0
  )

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">Career Overview</h1>
        <p className="text-slate-400 text-sm mt-1">All-time statistics across all formats</p>
      </div>

      {/* Batting Section */}
      <section>
        <h2 className="text-white text-lg font-semibold border-l-4 border-yellow-400 pl-3 mb-4">
          Batting
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Innings" value={batting.totalInnings} />
          <StatCard label="Runs" value={batting.totalRuns} />
          <StatCard label="Average" value={batting.average === 0 ? '-' : batting.average} />
          <StatCard label="Strike Rate" value={batting.strikeRate === 0 ? '-' : batting.strikeRate} />
          <StatCard label="High Score" value={batting.highScore} />
          <StatCard label="50s" value={batting.fifties} />
          <StatCard label="100s" value={batting.hundreds} />
          <StatCard label="Ducks" value={batting.ducks} />
        </div>
      </section>

      {/* Bowling Section */}
      <section>
        <h2 className="text-white text-lg font-semibold border-l-4 border-yellow-400 pl-3 mb-4">
          Bowling
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Wickets" value={bowling.totalWickets} />
          <StatCard label="Overs" value={bowling.overs} />
          <StatCard label="Average" value={bowling.average === 0 ? '-' : bowling.average} />
          <StatCard label="Economy" value={bowling.economy === 0 ? '-' : bowling.economy} />
          <StatCard label="Best Figures" value={bowling.bestFigures} />
          <StatCard label="5-Wicket Hauls" value={bowling.fiveWickets} />
        </div>
      </section>

      {/* Stats by Format */}
      {activeTypes.length > 0 && (
        <section>
          <h2 className="text-white text-lg font-semibold border-l-4 border-yellow-400 pl-3 mb-4">
            Stats by Format
          </h2>
          <div className="glass overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-yellow-400 text-sm font-semibold">Stat</th>
                  {activeTypes.map((t) => (
                    <th key={t} className="px-4 py-3 text-left text-sm font-semibold">
                      <span className={getMatchTypeBadgeClass(t)}>{t}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Matches', getValue: (e: BreakdownEntry) => e.matchCount },
                  { label: 'Runs', getValue: (e: BreakdownEntry) => e.batting.totalRuns },
                  { label: 'Avg', getValue: (e: BreakdownEntry) => e.batting.average === 0 ? '-' : e.batting.average },
                  { label: 'SR', getValue: (e: BreakdownEntry) => e.batting.strikeRate === 0 ? '-' : e.batting.strikeRate },
                  { label: 'HS', getValue: (e: BreakdownEntry) => e.batting.highScore },
                  { label: 'Wickets', getValue: (e: BreakdownEntry) => e.bowling.totalWickets },
                  { label: 'Economy', getValue: (e: BreakdownEntry) => e.bowling.economy === 0 ? '-' : e.bowling.economy },
                  { label: 'Best', getValue: (e: BreakdownEntry) => e.bowling.bestFigures },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-white/5 hover:bg-blue-900/10 transition-colors">
                    <td className="px-4 py-3 text-yellow-400 text-sm font-medium">{row.label}</td>
                    {activeTypes.map((t) => (
                      <td key={t} className="px-4 py-3 text-slate-300 text-sm">
                        {String(row.getValue(breakdown[t]))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
