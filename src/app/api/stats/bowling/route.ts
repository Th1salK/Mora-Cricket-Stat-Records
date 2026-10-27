import { NextRequest, NextResponse } from 'next/server'
import { getBowlingTable, resolveFilter } from '@/lib/queries/stats'
import { bowlingTableApi } from '@/lib/stats/api'
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams
    const filter = await resolveFilter({ season: params.get('season'), matchType: params.get('matchType') })
    return NextResponse.json((await getBowlingTable(filter)).map(bowlingTableApi))
  } catch {
    return NextResponse.json({ error: 'Failed to compute bowling stats' }, { status: 500 })
  }
}
