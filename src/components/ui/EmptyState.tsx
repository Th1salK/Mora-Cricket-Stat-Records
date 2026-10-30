import type { ReactNode } from 'react'
import { Info } from '@/components/ui/icons'
import { cn } from '@/lib/ui/cn'

export function EmptyState({ title, message, icon = <Info size={22} />, action, className }: {
  title: string; message: string; icon?: ReactNode; action?: ReactNode; className?: string
}) {
  return <div className={cn('flex flex-col items-center rounded-[14px] border border-separator bg-surface p-8 text-center', className)}>
    <span className="mb-4 inline-flex size-12 items-center justify-center rounded-[12px] bg-brand-soft text-brand-hover">{icon}</span>
    <h3 className="text-[17px] leading-6 font-semibold tracking-[-0.005em]">{title}</h3>
    <p className="mt-2 max-w-md text-sm leading-5 text-text-secondary">{message}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
}
