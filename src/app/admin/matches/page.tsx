import Link from 'next/link'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import { listMatches } from '@/lib/queries/matches'
import { resolveFilter } from '@/lib/queries/stats'
import { listDrafts } from '@/lib/queries/drafts'
import { listSeasonsWithCounts, getCurrentSeason } from '@/lib/seasonsServer'
import { SeasonSelector } from '@/components/shell/SeasonSelector'
import { ManageMatches } from '@/components/admin/ManageMatches'
import { PageHeader } from '@/components/ui/PageHeader'
import { UrlSearch, UrlSelect } from '@/components/ui/UrlControls'
import { MATCH_TYPES } from '@/lib/constants'
import { scalar, type PageParams } from '@/lib/ui/url'
export default async function ManageMatchesPage({ searchParams }: { searchParams: Promise<PageParams> }) {
  if (!(await isAdmin())) redirect('/login')
  const params = await searchParams, filter = await resolveFilter({ season: scalar(params.season), matchType: scalar(params.matchType) })
  const [all, drafts, seasons, current] = await Promise.all([listMatches({ ...filter, search: scalar(params.q) }), listDrafts(), listSeasonsWithCounts(), getCurrentSeason()])
  const scorecard = scalar(params.scorecard) ?? 'All', rows = all.filter((r) => scorecard === 'All' || (scorecard === 'full') === !!(r.mora || r.opposition))
  return <div className="space-y-5"><PageHeader eyebrow="Admin" title="Manage matches" subtitle="Every published match. Unpublished imports stay in Saved drafts. Old matches with stats only can be re-imported." actions={<><Link className="button button--secondary" href="/admin/drafts">Saved drafts · {drafts.length}</Link><Link className="button button--primary" href="/admin/import">Import match</Link></>} /><div className="flex flex-wrap gap-3"><Suspense><UrlSearch placeholder="Search opponent or venue" /><UrlSelect label="Match format" name="matchType" value={filter.matchType} options={['All', ...MATCH_TYPES].map((r) => ({ id: r, label: r === 'All' ? 'All formats' : r }))} /><UrlSelect label="Scorecard" name="scorecard" value={scorecard} options={[{ id: 'All', label: 'All scorecards' }, { id: 'full', label: 'Full scorecard' }, { id: 'stats', label: 'Stats only' }]} /><div className="w-48"><SeasonSelector seasons={seasons} currentSeasonId={current?.id ?? null} /></div></Suspense></div><ManageMatches rows={rows} /></div>
}
