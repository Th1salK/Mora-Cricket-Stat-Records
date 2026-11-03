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

export function StatTile({ label, value, hint, icon, tone = 'default', large = false, className }: {
  label: string; value: ReactNode; hint?: string; icon?: ReactNode; tone?: StatTone; large?: boolean; className?: string
}) {
  return (
    <div className={cn('rounded-[12px] bg-surface-secondary p-4', className)}>
      {icon && <span className={cn('mb-3 inline-flex size-9 items-center justify-center rounded-[10px]', tones[tone].icon)}>{icon}</span>}
      <p className="text-xs leading-4 text-text-secondary">{label}</p>
      <p className={cn('mt-1 font-semibold tabular-nums', large ? 'text-4xl leading-[1.2] tracking-[-0.015em]' : 'text-2xl leading-[1.25] tracking-[-0.01em]', tones[tone].value)}>{value}</p>
      {hint && <p className="mt-2 text-xs leading-4 text-text-secondary">{hint}</p>}
    </div>
  )
}
