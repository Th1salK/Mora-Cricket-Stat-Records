import { ShellPanel } from '@/components/shell/ShellPanel'
import type { ShellProps } from '@/components/shell/types'

export function AppSidebar(props: ShellProps) {
  return <aside aria-label="Desktop sidebar" className="fixed inset-y-0 left-0 z-30 hidden w-64 overflow-y-auto border-r border-separator bg-background px-4 py-6 md:block">
    <ShellPanel {...props} />
  </aside>
}
