'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { icons } from '@/components/ui/icons'
import { cn } from '@/lib/ui/cn'
import { isActive, navGroups } from '@/lib/ui/nav'

export function ShellNav({ isAdmin, onNavigate }: { isAdmin: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()
  return <nav aria-label="Main navigation" className="space-y-6">
    {navGroups(isAdmin).map((group) => <div key={group.label}>
      <p className="mb-2 px-3 text-xs leading-4 font-medium text-muted">{group.label}</p>
      <ul className="space-y-1">
        {group.items.map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = icons[item.icon]
          return <li key={item.href}><Link href={item.href} onNavigate={onNavigate} aria-current={active ? 'page' : undefined}
            className={cn('flex min-h-10 items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm leading-5',
              active ? 'bg-brand-soft text-foreground' : 'text-text-secondary hover:bg-surface-secondary hover:text-foreground')}>
            <Icon className={active ? 'shrink-0 text-brand-hover' : 'shrink-0'} />
            {item.label}
          </Link></li>
        })}
      </ul>
    </div>)}
  </nav>
}
