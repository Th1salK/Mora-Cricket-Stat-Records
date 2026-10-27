import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { getPlayerStats, resolveFilter } from '@/lib/queries/stats'
import { battingApi, bowlingApi } from '@/lib/stats/api'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Invalid player ID' }, { status: 400 })
  try {
    const search = new URL(request.url).searchParams
    const filter = await resolveFilter({ season: search.get('season'), matchType: search.get('matchType') })
    const stats = await getPlayerStats(id, filter)
    return NextResponse.json({ ...stats, batting: battingApi(stats.batting), bowling: bowlingApi(stats.bowling), filter })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch player stats' }, { status: 500 })
  }
}
