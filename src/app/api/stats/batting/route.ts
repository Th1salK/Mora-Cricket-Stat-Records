import { NextRequest, NextResponse } from 'next/server'
import { getBattingTable, resolveFilter } from '@/lib/queries/stats'
import { battingTableApi } from '@/lib/stats/api'
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams
    const filter = await resolveFilter({ season: params.get('season'), matchType: params.get('matchType') })
    return NextResponse.json((await getBattingTable(filter)).map(battingTableApi))
  } catch {
    return NextResponse.json({ error: 'Failed to compute batting stats' }, { status: 500 })
  }
}
