import type { ReactNode } from 'react'
export function ResponsiveFilters({ children, label = 'More filters' }: { children: ReactNode; label?: string }) {
  return <><div className="hidden items-center gap-3 md:flex">{children}</div><details className="w-full md:hidden"><summary className="min-h-10 cursor-pointer py-2 text-xs text-text-secondary">{label}</summary><div className="flex flex-wrap items-center gap-3 py-3">{children}</div></details></>
}
