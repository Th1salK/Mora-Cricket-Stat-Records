import { formatDate, matchDateParts } from '@/lib/ui/dates'
export function DateBlock({ date }: { date: string }) {
  const parts = matchDateParts(date)
  return <time dateTime={date} aria-label={formatDate(date, 'short')} className="inline-flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-[10px] bg-surface-secondary"><strong className="text-xl leading-6 tabular-nums">{parts.day}</strong><span className="text-[11px] text-text-secondary">{parts.month}</span></time>
}
