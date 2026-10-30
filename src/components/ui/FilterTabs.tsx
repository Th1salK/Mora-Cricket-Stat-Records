import Link from 'next/link'
import { cn } from '@/lib/ui/cn'
export function FilterTabs({ label, options }: { label: string; options: { label: string; href: string; active: boolean; count?: number }[] }) {
  return <nav aria-label={label} className="flex max-w-full gap-1 overflow-x-auto rounded-[12px] bg-surface-secondary p-1">
    {options.map((option) => <Link key={option.label} href={option.href} aria-current={option.active ? 'page' : undefined}
      className={cn('flex min-h-10 shrink-0 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold', option.active ? 'bg-surface-tertiary text-foreground' : 'text-text-secondary hover:text-foreground')}>
      {option.label}{option.count !== undefined && <span className="rounded-full bg-foreground/10 px-1.5 text-xs">{option.count}</span>}
    </Link>)}
  </nav>
}
