import { resultSegments, type ResultCounts } from '@/lib/ui/resultBar'
import { formatCount } from '@/lib/ui/numbers'

export function ResultBar(counts: ResultCounts) {
  const segments = resultSegments(counts)
  const total = segments.reduce((sum, row) => sum + row.count, 0)
  const label = total ? segments.filter((row) => row.count).map((row) => `${formatCount(row.count)} ${row.label}`).join(', ') : 'No results recorded'
  return <div role="img" aria-label={label} className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-tertiary">
    {segments.filter((row) => row.count > 0).map((row) => <span key={row.label} style={{ width: `${row.width}%`, backgroundColor: row.color }} />)}
  </div>
}
