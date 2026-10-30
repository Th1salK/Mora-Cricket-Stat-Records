import Link from 'next/link'
import { Suspense } from 'react'
import { getPlayerCards } from '@/lib/queries/players'
import { resolveFilter } from '@/lib/queries/stats'
import { PageHeader } from '@/components/ui/PageHeader'
import { ResponsiveFilters } from '@/components/ui/ResponsiveFilters'
import { PlayerCard } from '@/components/ui/PlayerCard'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { UrlSearch, UrlSelect } from '@/components/ui/UrlControls'
import { EmptyState } from '@/components/ui/EmptyState'
import { roleColors } from '@/lib/ui/formatColors'
import { pageHref, scalar, type PageParams } from '@/lib/ui/url'
export default async function PlayersPage({ searchParams }: { searchParams: Promise<PageParams> }) {
  const params = await searchParams, filter = await resolveFilter({ season: scalar(params.season) })
  const all = await getPlayerCards(filter), showInactive = scalar(params.inactive) === 'true'
  const base = all.filter((p) => !filter.isCurrentSeason || showInactive || p.isActive)
  const role = scalar(params.role) ?? 'All', search = (scalar(params.q) ?? '').toLowerCase(), sort = scalar(params.sort) ?? 'runs'
  const rows = base.filter((p) => (role === 'All' || p.role === role) && [p.fullName, p.shortName, ...p.aliases].some((name) => name.toLowerCase().includes(search)))
  rows.sort((a, b) => sort === 'name' ? a.fullName.localeCompare(b.fullName) : (sort === 'wickets' ? b.wickets - a.wickets : sort === 'matches' ? b.matches - a.matches : b.runs - a.runs) || a.fullName.localeCompare(b.fullName))
  const limit = Math.max(20, Math.min(all.length || 20, Number.parseInt(scalar(params.limit) ?? '20') || 20)), list = scalar(params.view) === 'list'
  const label = filter.seasonName ? filter.seasonName + ' Season' : 'All seasons'
  const href = (changes: Record<string, string | null>) => pageHref('/players', params, changes)
  return <div className="space-y-5"><PageHeader eyebrow={label} title="Players" subtitle={all.length + ' registered players · tap a player for their full profile and format splits.'} />
    <div className="flex flex-wrap items-center gap-3"><FilterTabs label="Player roles" options={['All', ...Object.keys(roleColors)].map((r) => ({ label: r, active: role === r, count: r === 'All' ? base.length : base.filter((p) => p.role === r).length, href: href({ role: r, limit: null }) }))} /><div className="order-first w-full md:order-none md:w-auto"><Suspense><UrlSearch placeholder="Search players" /></Suspense></div><ResponsiveFilters><Suspense><UrlSelect label="Sort players" name="sort" value={sort} options={[{ id: 'runs', label: 'Most runs' }, { id: 'wickets', label: 'Most wickets' }, { id: 'matches', label: 'Most matches' }, { id: 'name', label: 'Name A–Z' }]} /></Suspense><FilterTabs label="Player layout" options={['grid', 'list'].map((view) => ({ label: view === 'grid' ? 'Grid' : 'List', active: list === (view === 'list'), href: href({ view }) }))} /><Link aria-pressed={showInactive} href={href({ inactive: String(!showInactive) })} className="button button--outline">{showInactive ? 'Hide inactive' : 'Show inactive'}</Link></ResponsiveFilters></div>
    {rows.length ? list ? <div className="overflow-x-auto rounded-[14px] bg-surface p-4"><table className="data-table"><thead><tr>{['Player', 'Role', 'Matches', 'Runs', 'Wickets'].map((s) => <th scope="col" key={s}>{s}</th>)}</tr></thead><tbody>{rows.slice(0, limit).map((p) => <tr key={p.id}><td><Link href={'/players/' + p.id + '?season=' + filter.seasonId}>{p.fullName}</Link></td><td>{p.role}</td><td>{p.matches}</td><td className="text-teal-bright">{p.runs}</td><td className="text-ball">{p.wickets}</td></tr>)}</tbody></table></div> : <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">{rows.slice(0, limit).map((player) => <PlayerCard key={player.id} player={player} seasonId={filter.seasonId} seasonLabel={label} />)}</div> : <EmptyState title="No players found" message="Try another role or search, or show inactive players." />}
    {rows.length > limit && <div className="text-center"><Link className="button button--outline" href={href({ limit: String(limit + 20) })}>Load 20 more players</Link></div>}
  </div>
}
