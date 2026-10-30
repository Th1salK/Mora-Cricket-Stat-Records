import { cn } from '@/lib/ui/cn'

export function RankBadge({ rank, className }: { rank: number; className?: string }) {
  return <span aria-label={`Rank ${rank}`} className={cn(
    'inline-flex size-6 shrink-0 items-center justify-center rounded-[6px] text-xs font-semibold tabular-nums',
    rank === 1 ? 'bg-gold/20 text-gold' : rank === 3 ? 'bg-ball/20 text-ball' : 'bg-surface-secondary text-text-secondary',
    className,
  )}>{rank}</span>
}
