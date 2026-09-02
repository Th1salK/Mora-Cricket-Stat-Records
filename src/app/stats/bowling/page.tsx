import { connectDB } from "../../../lib/mongodb"
import { getPlayerBowlingStats, MatchType, MATCH_TYPES } from "../../../lib/statsCalculator"
import BowlingStatsClient from "../../../components/BowlingStatsClient"

type PageProps = {
  searchParams: Promise<{ matchType?: string }>
}

export default async function BowlingStatsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const matchTypeParam = params.matchType || "All"

  const validTypes: string[] = [...MATCH_TYPES, "All"]
  const matchType: MatchType = validTypes.includes(matchTypeParam)
    ? (matchTypeParam as MatchType)
    : "All"

  await connectDB()
  const rows = await getPlayerBowlingStats(matchType)
  const serializedRows = JSON.parse(JSON.stringify(rows))

  return <BowlingStatsClient rows={serializedRows} currentMatchType={matchType} />
}
