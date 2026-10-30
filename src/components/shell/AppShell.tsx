'use client'
import { useCallback, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Drawer } from '@heroui/react'
import { AppSidebar } from '@/components/shell/AppSidebar'
import { MobileTopBar } from '@/components/shell/MobileTopBar'
import { MobileDrawer } from '@/components/shell/MobileDrawer'
import { MobileTabBar } from '@/components/shell/MobileTabBar'
import type { ShellProps } from '@/components/shell/types'
import { cn } from '@/lib/ui/cn'
import { isActive } from '@/lib/ui/nav'

export function AppShell({ children, ...props }: ShellProps & { children: ReactNode }) {
  const pathname = usePathname()
  const [drawer, setDrawer] = useState({ path: pathname, isOpen: false })
  // Adjust during navigation so browser back/forward cannot reopen an old drawer.
  if (drawer.path !== pathname) setDrawer({ path: pathname, isOpen: false })
  const onOpenChange = useCallback((isOpen: boolean) => setDrawer({ path: pathname, isOpen }), [pathname])
  const showTabs = !isActive(pathname, '/login') && !isActive(pathname, '/admin')
  if (pathname === '/login') return <main id="main" tabIndex={-1} className="min-h-dvh bg-background text-foreground">{children}</main>
  return <div className="min-h-dvh bg-background text-foreground md:pl-64">
    <AppSidebar {...props} />
    <Drawer isOpen={drawer.isOpen && drawer.path === pathname} onOpenChange={onOpenChange}>
      <MobileTopBar hasLogo={props.hasLogo} isOpen={drawer.isOpen && drawer.path === pathname} onOpen={() => onOpenChange(true)} />
      <MobileDrawer {...props} onOpenChange={onOpenChange} />
    </Drawer>
    <main id="main" tabIndex={-1} className={cn('min-h-dvh min-w-0 px-4 pt-[72px] md:px-10 md:py-8',
      showTabs ? 'pb-[calc(80px+env(safe-area-inset-bottom))]' : 'pb-[calc(16px+env(safe-area-inset-bottom))]')}>
      <div className="mx-auto w-full max-w-[1200px]">{children}</div>
    </main>
    {showTabs && <MobileTabBar />}
  </div>
}
