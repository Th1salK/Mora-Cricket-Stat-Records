import type { ReactNode } from 'react'
import { cn } from '@/lib/ui/cn'

export type StatTone = 'default' | 'teal' | 'ball' | 'gold' | 'brand'
const tones = {
  default: { value: 'text-foreground', icon: 'bg-default text-text-secondary' },
  teal: { value: 'text-teal-bright', icon: 'bg-teal/20 text-teal-bright' },
  ball: { value: 'text-ball', icon: 'bg-ball/20 text-ball' },
  gold: { value: 'text-gold', icon: 'bg-gold/20 text-gold' },
  brand: { value: 'text-brand-hover', icon: 'bg-brand-soft text-brand-hover' },
} as const

export function StatTile({ label, value, hint, icon, tone = 'default', large = false, layout = 'default', compactLabel, className }: {
  label: string; value: ReactNode; hint?: string; icon?: ReactNode; tone?: StatTone; large?: boolean; layout?: 'default' | 'dashboard'; compactLabel?: string; className?: string
}) {
  if (layout === 'dashboard') return <div className={cn('grid min-h-[126px] grid-cols-1 gap-2 rounded-[14px] border border-separator bg-surface p-4 md:min-h-[156px] md:grid-cols-[36px_minmax(0,1fr)] md:gap-3 md:p-5', className)}>
    {icon && <span className={cn('row-start-1 inline-flex size-8 items-center justify-center rounded-[10px] md:size-9', tones[tone].icon)}>{icon}</span>}
    <p className="row-start-3 text-xs text-text-secondary md:col-start-2 md:row-start-1 md:self-center"><span className="md:hidden">{compactLabel ?? label}</span><span className="hidden md:inline">{label}</span></p>
    <p className="row-start-2 text-2xl leading-[1.25] font-semibold tracking-[-0.01em] tabular-nums md:col-span-2 md:text-4xl md:leading-[1.2]">{value}</p>
    {hint && <p className="hidden text-xs leading-4 text-text-secondary md:col-span-2 md:block">{hint}</p>}
  </div>
  return (
    <div className={cn('rounded-[12px] bg-surface-secondary p-4', className)}>
      {icon && <span className={cn('mb-3 inline-flex size-9 items-center justify-center rounded-[10px]', tones[tone].icon)}>{icon}</span>}
      <p className="text-xs leading-4 text-text-secondary">{label}</p>
      <p className={cn('mt-1 font-semibold tabular-nums', large ? 'text-4xl leading-[1.2] tracking-[-0.015em]' : 'text-2xl leading-[1.25] tracking-[-0.01em]', tones[tone].value)}>{value}</p>
      {hint && <p className="mt-2 text-xs leading-4 text-text-secondary">{hint}</p>}
    </div>
  )
}
