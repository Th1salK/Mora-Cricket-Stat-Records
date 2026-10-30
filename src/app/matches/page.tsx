import Link from 'next/link'
import { Suspense } from 'react'
import { listMatches } from '@/lib/queries/matches'
import { resolveFilter } from '@/lib/queries/stats'
import { MATCH_TYPES } from '@/lib/constants'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatTile } from '@/components/ui/StatTile'
import { MatchList } from '@/components/ui/MatchList'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { UrlSearch, UrlSelect } from '@/components/ui/UrlControls'
import { ExportCsv } from '@/components/ui/ExportCsv'
import { EmptyState } from '@/components/ui/EmptyState'
import { toCsv } from '@/lib/ui/csv'
import { pageHref, scalar, type PageParams } from '@/lib/ui/url'
export default async function MatchesPage({ searchParams }: { searchParams: Promise<PageParams> }) {
  const params = await searchParams
  const filter = await resolveFilter({ season: scalar(params.season), matchType: scalar(params.matchType) })
  const seasonRows = await listMatches({ ...filter, matchType: 'All' })
  const sort = scalar(params.sort) === 'oldest' ? 'oldest' : 'newest'
  const rows = await listMatches({ ...filter, search: scalar(params.q), sort })
  const external = seasonRows.filter((row) => !row.isInternal)
  const recorded = external.some((row) => row.outcome !== null)
  const page = Math.max(1, Math.min(Math.ceil(rows.length / 15) || 1, Number.parseInt(scalar(params.page) ?? '1') || 1))
  const visible = rows.slice((page - 1) * 15, page * 15)
  const href = (changes: Record<string, string | null>) => pageHref('/matches', params, changes)
  const csv = toCsv(rows, ['date', 'opponent', 'venue', 'matchType', 'overs', 'outcome'].map((key) => ({ label: key, value: (row) => row[key as keyof typeof row] })))
  return <div className="space-y-5"><PageHeader className="[&_p.mt-3]:hidden md:[&_p.mt-3]:block [&>div:last-child]:hidden md:[&>div:last-child]:flex" eyebrow={filter.seasonName ? filter.seasonName + ' Season' : 'All seasons'} title="Matches" subtitle={seasonRows.length + ' fixtures across ' + new Set(seasonRows.map((row) => row.matchType)).size + ' formats.'} actions={<ExportCsv name="mora-matches" csv={csv} />} />
    <div className="hidden gap-4 md:grid md:grid-cols-4">{[{ label: 'Played', value: seasonRows.length }, { label: 'Won', value: recorded ? external.filter((r) => r.outcome === 'won').length : '–' }, { label: 'Lost', value: recorded ? external.filter((r) => r.outcome === 'lost').length : '–' }, { label: 'Internal games', value: seasonRows.length - external.length }].map((tile) => <StatTile key={tile.label} {...tile} />)}</div>
    <div className="flex flex-wrap items-center gap-3"><FilterTabs label="Match formats" options={['All', ...MATCH_TYPES.filter((type) => seasonRows.some((row) => row.matchType === type))].map((type) => ({ label: type, active: filter.matchType === type, href: href({ matchType: type, page: null }), count: type === 'All' ? seasonRows.length : seasonRows.filter((row) => row.matchType === type).length }))} /><div className="hidden gap-3 md:flex"><Suspense><UrlSearch placeholder="Search opponent or venue" /><UrlSelect label="Sort matches" name="sort" value={sort} options={[{ id: 'newest', label: 'Newest first' }, { id: 'oldest', label: 'Oldest first' }]} /></Suspense></div></div><details className="md:hidden"><summary className="min-h-10 cursor-pointer py-2 text-xs text-text-secondary">Search and sort</summary><div className="flex flex-wrap gap-3 py-3"><Suspense><UrlSearch placeholder="Search opponent or venue" /><UrlSelect label="Sort matches" name="sort" value={sort} options={[{ id: 'newest', label: 'Newest first' }, { id: 'oldest', label: 'Oldest first' }]} /></Suspense></div></details>
    {rows.length ? <section className="rounded-[14px] md:border md:border-separator md:bg-surface md:p-3"><MatchList rows={visible} /><footer className="mt-4 flex items-center justify-between gap-3 p-2 text-xs text-text-secondary"><span>Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, rows.length)} of {rows.length}</span><div className="flex gap-3">{page > 1 && <Link className="button button--secondary" href={href({ page: String(page - 1) })}>Previous</Link>}{page * 15 < rows.length && <Link className="button button--secondary" href={href({ page: String(page + 1) })}>Next</Link>}</div></footer></section> : <EmptyState title="No matches found" message="Try another format, season or search." />}
  </div>
}
