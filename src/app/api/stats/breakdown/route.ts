import { NextRequest, NextResponse } from 'next/server'
import { getTableBreakdownByMatchType, resolveFilter } from '@/lib/queries/stats'
import { battingTableApi, bowlingTableApi } from '@/lib/stats/api'
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams
    const filter = await resolveFilter({ season: params.get('season'), matchType: params.get('matchType') })
    const breakdown = await getTableBreakdownByMatchType(filter)
    return NextResponse.json(Object.fromEntries(Object.entries(breakdown).map(([type, stats]) => [
      type, { batting: stats.batting.map(battingTableApi), bowling: stats.bowling.map(bowlingTableApi), matchCount: stats.matchCount },
    ])))
  } catch {
    return NextResponse.json({ error: 'Failed to compute breakdown stats' }, { status: 500 })
  }
}
