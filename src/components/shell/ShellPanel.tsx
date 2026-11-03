import type { ReactNode } from 'react'
import { ShellBrand } from '@/components/shell/ShellBrand'
import { ShellNav } from '@/components/shell/ShellNav'
import { ShellFooter } from '@/components/shell/ShellFooter'
import { SeasonSelector } from '@/components/shell/SeasonSelector'
import type { ShellProps } from '@/components/shell/types'

export function ShellPanel({ isAdmin, isSuperadmin = false, seasons, currentSeasonId, hasLogo, closeAction, onNavigate }: ShellProps & {
  closeAction?: ReactNode; onNavigate?: () => void
}) {
  return <div className="flex min-h-full flex-col gap-5">
    <div className="flex items-start justify-between gap-2"><ShellBrand hasLogo={hasLogo} />{closeAction}</div>
    <SeasonSelector seasons={seasons} currentSeasonId={currentSeasonId} onNavigate={onNavigate} />
    <ShellNav isAdmin={isAdmin} isSuperadmin={isSuperadmin} onNavigate={onNavigate} />
    <ShellFooter isAdmin={isAdmin} isSuperadmin={isSuperadmin} onNavigate={onNavigate} />
  </div>
}
