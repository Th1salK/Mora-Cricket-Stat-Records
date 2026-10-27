import { NextResponse } from 'next/server'
import { listSeasons } from '@/lib/seasonsServer'
import { resolveFilter } from '@/lib/queries/stats'
export async function GET() {
  try {
    const [seasons, filter] = await Promise.all([listSeasons(), resolveFilter({})])
    return NextResponse.json({ seasons, currentSeasonId: filter.seasonId === 'all' ? null : filter.seasonId })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch seasons' }, { status: 500 })
  }
}
