import type { MatchListRow } from '@/lib/queries/matchRows'
import { fmtNumber } from '@/lib/stats/format'

export function describeResult(row: Pick<MatchListRow, 'outcome' | 'margin' | 'marginType'>): string | null {
  switch (row.outcome) {
    case null: return null
    case 'tie': return 'Match tied'
    case 'draw': return 'Match drawn'
    case 'no result': return 'No result'
    default: {
      const result = `Mora CC ${row.outcome}`
      if (row.margin === null || row.marginType === null) return result
      const unit = row.margin === 1 ? row.marginType.slice(0, -1) : row.marginType
      return `${result} by ${fmtNumber(row.margin, 0)} ${unit}`
    }
  }
}
