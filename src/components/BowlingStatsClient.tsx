"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import MatchTypeDropdown from "@/components/MatchTypeDropdown"
import SeasonDropdown from "@/components/SeasonDropdown"
import { seasonLabel } from "@/lib/stats/seasons"
import { compareNullable } from "@/lib/stats/sort"
import { fmtNumber, fmtFigures, fmtOvers } from "@/lib/stats/format"
import type { BowlingTableRow as PlayerBowlingRow } from "@/lib/queries/stats"



type SortKey = "wickets" | "economy" | "average" | "strikeRate" | "fiveWickets" | "wides" | "noBalls"
type SortDir = "asc" | "desc"

export default function BowlingStatsClient({
  rows,
  currentMatchType, seasons, currentSeason, seasonName,
}: {
  rows: PlayerBowlingRow[]
  currentMatchType: string
  seasons: { id: string; name: string }[]
  currentSeason: string
  seasonName: string | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sortKey, setSortKey] = useState<SortKey>("wickets")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  function handleMatchTypeChange(val: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("matchType", val)
    params.set("season", currentSeason)
    router.push("/stats/bowling?" + params.toString())
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    return compareNullable(av, bv, sortDir)
  })

  const cols: { key: SortKey; label: string }[] = [
    { key: "wickets", label: "Wkts" },
    { key: "economy", label: "Econ" },
    { key: "average", label: "Avg" },
    { key: "strikeRate", label: "SR" },
    { key: "fiveWickets", label: "5W" },
    { key: "wides", label: "Wd" },
    { key: "noBalls", label: "NB" },
  ]

  function arrow(key: SortKey) {
    if (sortKey !== key) return <span className="text-slate-600 ml-1">{"\u2195"}</span>
    return <span className="text-yellow-400 ml-1">{sortDir === "desc" ? "\u2193" : "\u2191"}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold">Bowling Stats</h1>
          <p className="text-slate-400 text-sm mt-1">{seasonName ? seasonLabel(seasonName) : "All seasons"}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SeasonDropdown seasons={seasons} value={currentSeason} />
          <MatchTypeDropdown value={currentMatchType} onChange={handleMatchTypeChange} includeAll />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="glass p-6 text-slate-400 text-center">No bowling data for this filter.</div>
      ) : (
        <div className="glass overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-yellow-400 font-semibold whitespace-nowrap">Player</th>
                {cols.map((c) => (
                  <th
                    key={c.key}
                    onClick={() => handleSort(c.key)}
                    className="px-4 py-3 text-left text-yellow-400 font-semibold whitespace-nowrap cursor-pointer hover:text-white transition-colors select-none"
                  >
                    {c.label}
                    {arrow(c.key)}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-yellow-400 font-semibold whitespace-nowrap">Overs</th>
                <th className="px-4 py-3 text-left text-yellow-400 font-semibold whitespace-nowrap">Best</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.playerId} className="border-b border-white/5 hover:bg-blue-900/10 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link href={`/players/${r.playerId}`} className="text-blue-400 hover:text-blue-300 hover:underline">
                      {r.playerName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{r.wickets}</td>
                  <td className="px-4 py-3 text-slate-300">{fmtNumber(r.economy)}</td>
                  <td className="px-4 py-3 text-slate-300">{fmtNumber(r.average)}</td>
                  <td className="px-4 py-3 text-slate-300">{fmtNumber(r.strikeRate)}</td>
                  <td className="px-4 py-3 text-slate-300">{r.fiveWickets}</td>
                  <td className="px-4 py-3 text-slate-300">{r.wides}</td>
                  <td className="px-4 py-3 text-slate-300">{r.noBalls}</td>
                  <td className="px-4 py-3 text-slate-300">{fmtOvers(r.balls)}</td>
                  <td className="px-4 py-3 text-slate-300">{fmtFigures(r.best)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
