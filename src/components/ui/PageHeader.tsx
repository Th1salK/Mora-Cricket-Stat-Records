import type { ReactNode } from 'react'
import { cn } from '@/lib/ui/cn'

export function PageHeader({ eyebrow, title, subtitle, actions, className }: {
  eyebrow?: string; title: string; subtitle?: string; actions?: ReactNode; className?: string
}) {
  return (
    <header className={cn('flex flex-col justify-between gap-4 sm:flex-row sm:items-end', className)}>
      <div>
        {eyebrow && <p className="mb-2 text-xs font-medium leading-4 text-teal">{eyebrow}</p>}
        <h1 className="font-display text-4xl leading-none tracking-[0.01em] uppercase md:text-[52px]">{title}</h1>
        {subtitle && <p className="mt-3 text-sm leading-5 text-text-secondary">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  )
}
