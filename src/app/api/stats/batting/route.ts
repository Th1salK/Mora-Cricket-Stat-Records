import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/mongodb'
import { getBattingStats, MatchType, MATCH_TYPES } from '../../../../lib/statsCalculator'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const matchTypeParam = searchParams.get('matchType') || 'All'

    const validTypes: string[] = [...MATCH_TYPES, 'All']
    const matchType: MatchType = validTypes.includes(matchTypeParam)
      ? (matchTypeParam as MatchType)
      : 'All'

    const stats = await getBattingStats(matchType)
    return NextResponse.json(stats)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to compute batting stats' }, { status: 500 })
  }
}
