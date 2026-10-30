import { MatchTypeBadge } from '@/components/ui/MatchTypeBadge'
import { ResultBadge } from '@/components/ui/ResultBadge'
import type { MatchListRow } from '@/lib/queries/matchRows'
import { describeResult } from '@/lib/stats/describeResult'
import { fmtOvers } from '@/lib/stats/format'
import { formatDate } from '@/lib/ui/dates'
import { formatCount } from '@/lib/ui/numbers'
import { cn } from '@/lib/ui/cn'

function Score({ innings }: { innings: MatchListRow['mora'] }) {
  if (!innings) return <span className="text-xs text-text-secondary">Score not recorded</span>
  return <span className="text-right">
    <strong className="text-2xl font-semibold tabular-nums">{formatCount(innings.runs)}/{formatCount(innings.wickets)}</strong>
    <span className="ml-2 hidden text-xs text-text-secondary sm:inline">({fmtOvers(innings.balls)})</span>
  </span>
}
export function DashboardLastMatch({ match, className }: { match: MatchListRow; className?: string }) {
  const result = describeResult(match)
  return <section aria-label="Last match" className={cn('rounded-[14px] border border-separator bg-surface p-5', className)}>
    <div className="mb-4 flex items-center justify-between gap-3">
      <p className="text-xs text-text-secondary uppercase">Last match · {formatDate(match.date, 'compact')}</p>
      <ResultBadge outcome={match.outcome} internal={match.isInternal} />
    </div>
    <dl className="space-y-3">
      <div className="flex items-center justify-between gap-3"><dt className="min-w-0 text-sm font-semibold">Mora CC</dt><dd><Score innings={match.mora} /></dd></div>
      <div className="flex items-center justify-between gap-3"><dt className="min-w-0 truncate text-sm font-semibold text-text-secondary" title={match.opponent}>{match.opponent}</dt><dd className="shrink-0"><Score innings={match.opposition} /></dd></div>
    </dl>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      {result && <p className={cn('text-xs', match.isInternal ? 'text-text-secondary' : match.outcome === 'won' ? 'text-win' : match.outcome === 'lost' ? 'text-loss' : 'text-draw')}>{result}</p>}
      <MatchTypeBadge matchType={match.matchType} className="ml-auto" />
    </div>
  </section>
}
