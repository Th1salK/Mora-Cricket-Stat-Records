'use client'
import { Suspense } from 'react'
import { ListBox, Select, Skeleton } from '@heroui/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Calendar } from '@/components/ui/icons'
import { formatCount } from '@/lib/ui/numbers'
import type { ShellSeason } from '@/components/shell/types'

export type SeasonSelectorProps = { seasons: ShellSeason[]; currentSeasonId: string | null; onNavigate?: () => void; defaultSeasonId?: string }

function SeasonSelectorContent({ seasons, currentSeasonId, onNavigate, defaultSeasonId }: SeasonSelectorProps) {
  const pathname = usePathname()
  const params = useSearchParams()
  const router = useRouter()
  const requested = params.get('season') ?? defaultSeasonId ?? currentSeasonId ?? 'all'
  const value = requested === 'all' || seasons.some((season) => season.id === requested) ? requested : 'all'
  return <Select aria-label="Season" value={seasons.length ? value : 'all'} isDisabled={seasons.length === 0}
    onChange={(key) => {
      if (key === null) return
      const nextParams = new URLSearchParams(params.toString())
      nextParams.set('season', String(key))
      router.push(`${pathname}?${nextParams.toString()}`)
      onNavigate?.()
    }}>
    <Select.Trigger className="h-10 w-full gap-2 rounded-[12px] border-0 bg-surface-secondary px-3 text-sm font-semibold text-foreground">
      <Calendar className="shrink-0 text-teal" />
      <Select.Value className="min-w-0 flex-1 text-left">{({ selectedText }) => selectedText}</Select.Value>
      <Select.Indicator className="size-4 shrink-0 text-text-secondary" />
    </Select.Trigger>
    <Select.Popover placement="bottom start" className="w-[296px] max-w-[calc(100vw-32px)] rounded-[12px] border border-border bg-surface-secondary p-1.5">
      <ListBox aria-label="Seasons">
        <ListBox.Section aria-label="Available seasons">
          {seasons.map((season) => <ListBox.Item key={season.id} id={season.id} textValue={`${season.name} Season`}
            className="min-h-14 rounded-[8px] px-2.5 py-2 data-[selected=true]:bg-brand-soft">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold">{season.name} Season</span>
              <span className="text-xs font-normal text-text-secondary">{season.id === currentSeasonId ? 'Current · ' : ''}{formatCount(season.matchCount)} matches</span>
            </div>
            <ListBox.ItemIndicator className="text-brand-hover" />
          </ListBox.Item>)}
        </ListBox.Section>
        <ListBox.Section aria-label="Career totals" className="mt-1 border-t border-separator pt-1">
          <ListBox.Item id="all" textValue="All seasons" className="min-h-14 rounded-[8px] px-2.5 py-2 data-[selected=true]:bg-brand-soft">
            <div className="flex flex-col gap-1"><span className="text-sm font-semibold">All seasons</span><span className="text-xs font-normal text-text-secondary">Career totals</span></div>
            <ListBox.ItemIndicator className="text-brand-hover" />
          </ListBox.Item>
        </ListBox.Section>
      </ListBox>
    </Select.Popover>
  </Select>
}

export function SeasonSelector(props: SeasonSelectorProps) {
  return <Suspense fallback={<Skeleton aria-label="Loading seasons" className="h-10 w-full rounded-[12px]" />}>
    <SeasonSelectorContent {...props} />
  </Suspense>
}
