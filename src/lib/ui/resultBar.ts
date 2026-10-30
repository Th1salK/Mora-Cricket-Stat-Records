export type ResultCounts = { won: number; lost: number; draw: number; tie: number; noResult: number }
export function resultSegments(counts: ResultCounts) {
  const rows = [
    { label: 'won', count: counts.won, color: 'var(--win)' },
    { label: 'lost', count: counts.lost, color: 'var(--loss)' },
    { label: 'drawn or tied', count: counts.draw + counts.tie, color: 'var(--draw)' },
    { label: 'no result', count: counts.noResult, color: 'var(--text-secondary)' },
  ]
  const total = rows.reduce((sum, row) => sum + row.count, 0)
  return rows.map((row) => ({ ...row, width: total ? row.count / total * 100 : 0 }))
}
