import StatCard from "@/components/StatCard"
import { getMatchTypeBadgeClass } from "@/lib/matchTypeBadge"
import { MATCH_TYPES } from "@/lib/constants"
import { getTeamOverview, getBreakdownByMatchType } from "@/lib/queries/stats"
import { fmtNumber, fmtFigures, fmtHighScore, fmtOvers } from "@/lib/stats/format"
type BreakdownEntry = Awaited<ReturnType<typeof getTeamOverview>>

export default async function CareerPage() {
  const filter = { seasonId: "all", matchType: "All" } as const
  const [overview, breakdown] = await Promise.all([getTeamOverview(filter), getBreakdownByMatchType(filter)])
  const { batting, bowling } = overview

  const activeTypes = MATCH_TYPES.filter(
    (t) => breakdown[t] && breakdown[t].matchCount > 0
  )

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">Career Overview</h1>
        <p className="text-slate-400 text-sm mt-1">All seasons · All match types</p>
      </div>

      {/* Batting Section */}
      <section>
        <h2 className="text-white text-lg font-semibold border-l-4 border-yellow-400 pl-3 mb-4">
          Batting
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Innings" value={batting.innings} />
          <StatCard label="Runs" value={batting.runs} />
          <StatCard label="Average" value={fmtNumber(batting.average)} />
          <StatCard label="Strike Rate" value={fmtNumber(batting.strikeRate)} />
          <StatCard label="High Score" value={fmtHighScore(batting.highScore, batting.highScoreNotOut)} />
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
          <StatCard label="Wickets" value={bowling.wickets} />
          <StatCard label="Overs" value={fmtOvers(bowling.balls)} />
          <StatCard label="Average" value={fmtNumber(bowling.average)} />
          <StatCard label="Economy" value={fmtNumber(bowling.economy)} />
          <StatCard label="Best Figures" value={fmtFigures(bowling.best)} />
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
                  { label: "Matches", getValue: (e: BreakdownEntry) => e.matchCount },
                  { label: "Runs", getValue: (e: BreakdownEntry) => e.batting.runs },
                  { label: "Avg", getValue: (e: BreakdownEntry) => fmtNumber(e.batting.average) },
                  { label: "SR", getValue: (e: BreakdownEntry) => fmtNumber(e.batting.strikeRate) },
                  { label: "HS", getValue: (e: BreakdownEntry) => fmtHighScore(e.batting.highScore, e.batting.highScoreNotOut) },
                  { label: "Wickets", getValue: (e: BreakdownEntry) => e.bowling.wickets },
                  { label: "Economy", getValue: (e: BreakdownEntry) => fmtNumber(e.bowling.economy) },
                  { label: "Best", getValue: (e: BreakdownEntry) => fmtFigures(e.bowling.best) },
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
