import { formatDate } from '@/lib/ui/dates'
import { formatCount } from '@/lib/ui/numbers'
export function RunsChart({ rows }: { rows: { date: string; runs: number }[] }) {
  if (!rows.length) return <p className="text-sm text-text-secondary">No batting innings for these filters.</p>
  const max = Math.max(1, ...rows.map((row) => row.runs))
  return <><div aria-hidden="true" className="flex h-52 items-end gap-2 pt-6">{rows.map((row, i) => <div key={i} className="flex h-full min-w-0 flex-1 flex-col justify-end text-center"><span className="mb-1 text-xs text-text-secondary">{formatCount(row.runs)}</span><div className={row.runs >= 50 ? 'rounded-t-md bg-teal' : 'rounded-t-md bg-accent'} style={{ height: `${Math.max(1, row.runs / max * 85)}%` }} /></div>)}</div><div aria-hidden="true" className="mt-3 flex justify-between text-xs text-text-secondary"><span>{formatDate(rows[0].date, 'compact')}</span><span>{formatDate(rows.at(-1)!.date, 'compact')}</span></div><ol className="sr-only">{rows.map((row, i) => <li key={i}>{formatDate(row.date, 'short')}: {row.runs} runs</li>)}</ol></>
}
