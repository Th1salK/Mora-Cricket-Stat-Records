import Link from 'next/link'
import { SectionCard } from '@/components/ui/SectionCard'
import type { getRecords } from '@/lib/queries/stats'
import { fmtFigures, fmtNumber } from '@/lib/stats/format'
import { formatCount } from '@/lib/ui/numbers'
import { cn } from '@/lib/ui/cn'

export function DashboardLeaders({ records, seasonId, seasonLabel }: {
  records: Awaited<ReturnType<typeof getRecords>>; seasonId: string; seasonLabel: string
}) {
  const rows = [
    { label: 'Most runs', record: records.mostRuns, value: records.mostRuns ? formatCount(records.mostRuns.value) : '–', tone: 'text-teal-bright', qualifier: null },
    { label: 'Most wickets', record: records.mostWickets, value: records.mostWickets ? formatCount(records.mostWickets.value) : '–', tone: 'text-ball', qualifier: null },
    { label: 'Best figures', record: records.bestBowling, value: fmtFigures(records.bestBowling?.value ?? null), tone: 'text-gold', qualifier: null },
    { label: 'Best economy', record: records.bestEconomy, value: fmtNumber(records.bestEconomy?.value ?? null), tone: 'text-brand-hover', qualifier: records.bestEconomy?.qualifier },
  ].filter((row) => row.record?.playerId && records.playerNames[row.record.playerId])
  return <SectionCard title="Season leaders" subtitle={`${seasonLabel} · all formats`}>
    {rows.length === 0 ? <p className="text-sm text-text-secondary">No qualifying player records in this season yet.</p> :
      <ul className="space-y-4">{rows.map(({ label, record, value, tone, qualifier }) => {
        const types = record?.matchTypes ?? (record?.matchType ? [record.matchType] : [])
        return <li key={label}><Link href={`/players/${record!.playerId}?season=${encodeURIComponent(seasonId)}`} className="flex min-h-10 items-center gap-3 rounded-[8px]">
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-text-secondary">{label}</span>
            <span className="block truncate text-sm font-semibold">{records.playerNames[record!.playerId!]}</span>
            {types.length > 0 && <span className="block text-xs text-text-secondary">{types.join(' · ')}</span>}
            {qualifier && <span className="block text-xs text-text-secondary">{qualifier}</span>}
          </span>
          <strong className={cn('shrink-0 text-2xl font-semibold tabular-nums', tone)}>{value}</strong>
        </Link></li>
      })}</ul>}
  </SectionCard>
}
