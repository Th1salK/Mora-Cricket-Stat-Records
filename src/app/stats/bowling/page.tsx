'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MatchTypeDropdown from '../../../components/MatchTypeDropdown'

interface PlayerBowlingRow {
  playerId: string
  playerName: string
  wickets: number
  overs: string
  average: number
  economy: number
  strikeRate: number
  bestFigures: string
  fiveWickets: number
  wides: number
  noBalls: number
}

type SortKey = keyof Omit<PlayerBowlingRow, 'playerId' | 'playerName' | 'overs' | 'bestFigures'>
type SortDir = 'asc' | 'desc'

export default function BowlingStatsPage() {
  const [matchType, setMatchType] = useState('All')
  const [rows, setRows] = useState<PlayerBowlingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('wickets')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(() => {
    setLoading(true)
    const qs = matchType === 'All' ? '' : `&matchType=${encodeURIComponent(matchType)}`
    fetch(`/api/stats/bowling?perPlayer=true${qs}`)
      .then((r) => r.json())
      .then((data) => { setRows(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [matchType])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
    return sortDir === 'desc' ? -cmp : cmp
  })

  const cols: { key: SortKey; label: string }[] = [
    { key: 'wickets',    label: 'Wkts' },
    { key: 'economy',    label: 'Econ' },
    { key: 'average',    label: 'Avg'  },
    { key: 'strikeRate', label: 'SR'   },
    { key: 'fiveWickets',label: '5W'   },
    { key: 'wides',      label: 'Wd'   },
    { key: 'noBalls',    label: 'NB'   },
  ]

  function arrow(key: SortKey) {
    if (sortKey !== key) return <span className="text-slate-600 ml-1">↕</span>
    return <span className="text-yellow-400 ml-1">{sortDir === 'desc' ? '↓' : '↑'}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold">Bowling Stats</h1>
          <p className="text-slate-400 text-sm mt-1">Per-player bowling performance</p>
        </div>
        <MatchTypeDropdown value={matchType} onChange={setMatchType} includeAll />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rows.length === 0 ? (
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
                    {c.label}{arrow(c.key)}
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
                  <td className="px-4 py-3 text-slate-300">{r.economy === 0 ? '-' : r.economy}</td>
                  <td className="px-4 py-3 text-slate-300">{r.average === 0 ? '-' : r.average}</td>
                  <td className="px-4 py-3 text-slate-300">{r.strikeRate === 0 ? '-' : r.strikeRate}</td>
                  <td className="px-4 py-3 text-slate-300">{r.fiveWickets}</td>
                  <td className="px-4 py-3 text-slate-300">{r.wides}</td>
                  <td className="px-4 py-3 text-slate-300">{r.noBalls}</td>
                  <td className="px-4 py-3 text-slate-300">{r.overs}</td>
                  <td className="px-4 py-3 text-slate-300">{r.bestFigures}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
