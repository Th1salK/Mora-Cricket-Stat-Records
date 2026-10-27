"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import MatchTypeDropdown from "@/components/MatchTypeDropdown"
import SeasonDropdown from "@/components/SeasonDropdown"
import { seasonLabel } from "@/lib/stats/seasons"
import { compareNullable } from "@/lib/stats/sort"
import { fmtNumber, fmtHighScore } from "@/lib/stats/format"
import type { BattingTableRow as PlayerBattingRow } from "@/lib/queries/stats"



type SortKey = "innings" | "runs" | "average" | "strikeRate" | "highScore" | "notOuts" | "ducks" | "fifties" | "hundreds" | "fours" | "sixes"
type SortDir = "asc" | "desc"

export default function BattingStatsClient({
  rows,
  currentMatchType, seasons, currentSeason, seasonName,
}: {
  rows: PlayerBattingRow[]
  currentMatchType: string
  seasons: { id: string; name: string }[]
  currentSeason: string
  seasonName: string | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sortKey, setSortKey] = useState<SortKey>("runs")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  function handleMatchTypeChange(val: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("matchType", val)
    params.set("season", currentSeason)
    router.push("/stats/batting?" + params.toString())
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
    { key: "innings", label: "Inn" },
    { key: "runs", label: "Runs" },
    { key: "average", label: "Avg" },
    { key: "strikeRate", label: "SR" },
    { key: "highScore", label: "HS" },
    { key: "notOuts", label: "NO" },
    { key: "fifties", label: "50s" },
    { key: "hundreds", label: "100s" },
    { key: "fours", label: "4s" },
    { key: "sixes", label: "6s" },
    { key: "ducks", label: "0s" },
  ]

  function arrow(key: SortKey) {
    if (sortKey !== key) return <span className="text-slate-600 ml-1">{"\u2195"}</span>
    return <span className="text-yellow-400 ml-1">{sortDir === "desc" ? "\u2193" : "\u2191"}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold">Batting Stats</h1>
          <p className="text-slate-400 text-sm mt-1">{seasonName ? seasonLabel(seasonName) : "All seasons"}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SeasonDropdown seasons={seasons} value={currentSeason} />
          <MatchTypeDropdown value={currentMatchType} onChange={handleMatchTypeChange} includeAll />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="glass p-6 text-slate-400 text-center">No batting data for this filter.</div>
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
                  <td className="px-4 py-3 text-slate-300">{r.innings}</td>
                  <td className="px-4 py-3 text-white font-medium">{r.runs}</td>
                  <td className="px-4 py-3 text-slate-300">{fmtNumber(r.average)}</td>
                  <td className="px-4 py-3 text-slate-300">{fmtNumber(r.strikeRate)}</td>
                  <td className="px-4 py-3 text-slate-300">{fmtHighScore(r.highScore, r.highScoreNotOut)}</td>
                  <td className="px-4 py-3 text-slate-300">{r.notOuts}</td>
                  <td className="px-4 py-3 text-slate-300">{r.fifties}</td>
                  <td className="px-4 py-3 text-slate-300">{r.hundreds}</td>
                  <td className="px-4 py-3 text-slate-300">{r.fours}</td>
                  <td className="px-4 py-3 text-slate-300">{r.sixes}</td>
                  <td className="px-4 py-3 text-slate-300">{r.ducks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
