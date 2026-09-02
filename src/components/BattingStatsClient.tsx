"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import MatchTypeDropdown from "./MatchTypeDropdown"

interface PlayerBattingRow {
  playerId: string
  playerName: string
  innings: number
  runs: number
  average: number
  strikeRate: number
  highScore: number
  notOuts: number
  ducks: number
  fifties: number
  hundreds: number
  fours: number
  sixes: number
}

type SortKey = keyof Omit<PlayerBattingRow, "playerId" | "playerName">
type SortDir = "asc" | "desc"

export default function BattingStatsClient({
  rows,
  currentMatchType,
}: {
  rows: PlayerBattingRow[]
  currentMatchType: string
}) {
  const router = useRouter()
  const [sortKey, setSortKey] = useState<SortKey>("runs")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  function handleMatchTypeChange(val: string) {
    const qs = val === "All" ? "" : `?matchType=${encodeURIComponent(val)}`
    router.push(`/stats/batting${qs}`)
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
    const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv))
    return sortDir === "desc" ? -cmp : cmp
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
          <p className="text-slate-400 text-sm mt-1">Per-player batting performance</p>
        </div>
        <MatchTypeDropdown value={currentMatchType} onChange={handleMatchTypeChange} includeAll />
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
                  <td className="px-4 py-3 text-slate-300">{r.average === 0 ? "-" : r.average}</td>
                  <td className="px-4 py-3 text-slate-300">{r.strikeRate === 0 ? "-" : r.strikeRate}</td>
                  <td className="px-4 py-3 text-slate-300">{r.highScore}</td>
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
