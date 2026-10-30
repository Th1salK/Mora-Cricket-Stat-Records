import type { ReactNode } from 'react'
import { Info } from '@/components/ui/icons'
export function Banner({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warning' | 'error' | 'success' }) {
  const colors = { info: 'border-accent/35 bg-accent/10 text-brand-hover', warning: 'border-gold/35 bg-gold/10 text-gold', error: 'border-danger/35 bg-danger/10 text-danger', success: 'border-win/35 bg-win/10 text-win' }
  return <div role={tone === 'error' ? 'alert' : 'status'} className={'flex items-start gap-3 rounded-[12px] border p-3 text-sm ' + colors[tone]}><Info className="mt-0.5 shrink-0" /><div>{children}</div></div>
}
