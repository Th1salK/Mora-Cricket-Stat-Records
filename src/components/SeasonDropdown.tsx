'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { seasonLabel } from '@/lib/stats/seasons'

export default function SeasonDropdown({ seasons, value }: { seasons: { id: string; name: string }[]; value: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  return (
    <select aria-label="Season" className="glass-select" value={value} onChange={(event) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('season', event.target.value)
      router.push(`${pathname}?${params.toString()}`)
    }}>
      {seasons.map((season) => <option key={season.id} value={season.id}>{seasonLabel(season.name)}</option>)}
      <option value="all">All seasons</option>
    </select>
  )
}
