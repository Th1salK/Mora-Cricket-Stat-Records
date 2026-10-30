import { compareNullable } from '@/lib/stats/sort'
import { compareFigures } from '@/lib/stats/bowling'
import type { Figures } from '@/lib/stats/types'
export function filterLeaderboard<T extends { playerName: string; innings: number; balls: number }>(rows: T[], query: string, minimum: number, kind: 'batting' | 'bowling') {
  return rows.filter((row) => row.playerName.toLowerCase().includes(query.toLowerCase()) && (kind === 'batting' ? row.innings : row.balls) >= minimum)
}
export function sortLeaderboard<T>(rows: T[], value: (row: T) => number | string | Figures | null, direction: 'asc' | 'desc') {
  return [...rows].sort((a, b) => {
    const x = value(a), y = value(b)
    if (x === null || y === null) return x === null ? y === null ? 0 : 1 : -1
    if (typeof x === 'number' && typeof y === 'number') return compareNullable(x, y, direction)
    if (typeof x === 'object' && typeof y === 'object') return compareFigures(x, y) * (direction === 'desc' ? 1 : -1)
    return String(x).localeCompare(String(y)) * (direction === 'asc' ? 1 : -1)
  })
}
