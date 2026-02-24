import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/mongodb'
import { getBowlingStats, MatchType, MATCH_TYPES } from '../../../../lib/statsCalculator'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const matchTypeParam = searchParams.get('matchType') || 'All'

    const validTypes: string[] = [...MATCH_TYPES, 'All']
    const matchType: MatchType = validTypes.includes(matchTypeParam)
      ? (matchTypeParam as MatchType)
      : 'All'

    const stats = await getBowlingStats(matchType)
    return NextResponse.json(stats)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to compute bowling stats' }, { status: 500 })
  }
}
