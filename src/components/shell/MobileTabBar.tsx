'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { icons } from '@/components/ui/icons'
import { cn } from '@/lib/ui/cn'
import { mobileTabs, tabActive } from '@/lib/ui/nav'

export function MobileTabBar() {
  const pathname = usePathname()
  return <nav aria-label="Mobile tabs" className="fixed inset-x-0 bottom-0 z-30 h-[calc(64px+env(safe-area-inset-bottom))] border-t border-separator bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
    <ul className="grid h-full grid-cols-5">
      {mobileTabs.map((tab) => {
        const active = tabActive(pathname, tab.href)
        const Icon = icons[tab.icon]
        return <li key={tab.href}><Link href={tab.href} aria-current={active ? 'page' : undefined}
          className={cn('flex h-full min-h-10 flex-col items-center justify-center gap-1 px-1 text-[11px] leading-4',
            active ? 'bg-brand-row text-brand-hover' : 'text-text-secondary hover:bg-surface-secondary')}>
          <Icon size={22} /><span>{tab.label}</span>
        </Link></li>
      })}
    </ul>
  </nav>
}
