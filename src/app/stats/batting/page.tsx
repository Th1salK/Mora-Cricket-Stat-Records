import { connectDB } from "../../../lib/mongodb"
import { getPlayerBattingStats, MatchType, MATCH_TYPES } from "../../../lib/statsCalculator"
import BattingStatsClient from "../../../components/BattingStatsClient"

type PageProps = {
  searchParams: Promise<{ matchType?: string }>
}

export default async function BattingStatsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const matchTypeParam = params.matchType || "All"

  const validTypes: string[] = [...MATCH_TYPES, "All"]
  const matchType: MatchType = validTypes.includes(matchTypeParam)
    ? (matchTypeParam as MatchType)
    : "All"

  await connectDB()
  const rows = await getPlayerBattingStats(matchType)
  const serializedRows = JSON.parse(JSON.stringify(rows))

  return <BattingStatsClient rows={serializedRows} currentMatchType={matchType} />
}
