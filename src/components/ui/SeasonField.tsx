'use client'
import Link from 'next/link'
import type { listSeasons } from '@/lib/seasonsServer'

export type SeasonOption = Awaited<ReturnType<typeof listSeasons>>[number]
export function SeasonField({ seasons, value, onChange, existingSeasonId, compact = false }: {
  seasons: SeasonOption[]; value?: string; onChange: (id: string) => void; existingSeasonId?: string; compact?: boolean
}) {
  const available = seasons.some((season) => !season.endedAt || season.id === existingSeasonId)
  return <label className={compact ? 'block text-xs text-text-secondary' : 'block text-sm'}>Season
    <select required className={compact ? 'ui-field mt-1' : 'ui-field mt-2'} value={value ?? ''} onChange={(event) => onChange(event.target.value)}>
      <option value="" disabled>Choose a season</option>
      {seasons.map((season) => <option key={season.id} value={season.id} disabled={!!season.endedAt && season.id !== existingSeasonId}>
        {season.name} Season{season.endedAt ? ' · Ended' : season.isCurrent ? ' · Current' : ''}
      </option>)}
    </select>
    {!available && <span className="mt-2 block text-xs text-text-secondary">No open seasons. <Link href="/admin/seasons" className="text-brand-hover">Add a season</Link> before adding matches.</span>}
  </label>
}
