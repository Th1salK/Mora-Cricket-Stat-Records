import BowlingStatsClient from '@/components/BowlingStatsClient'
import { getBowlingTable, resolveFilter } from '@/lib/queries/stats'
import { listSeasons } from '@/lib/seasonsServer'
export default async function BowlingStatsPage({ searchParams }: {
  searchParams: Promise<{ season?: string | string[]; matchType?: string | string[] }>
}) {
  const params = await searchParams
  const filter = await resolveFilter({
    season: Array.isArray(params.season) ? params.season[0] : params.season,
    matchType: Array.isArray(params.matchType) ? params.matchType[0] : params.matchType,
  })
  const [rows, seasons] = await Promise.all([getBowlingTable(filter), listSeasons()])
  return <BowlingStatsClient rows={rows} currentMatchType={filter.matchType}
    seasons={seasons} currentSeason={filter.seasonId} seasonName={filter.seasonName} />
}
