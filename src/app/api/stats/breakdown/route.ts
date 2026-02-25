import { NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/mongodb'
import { getPlayerBattingStats, getPlayerBowlingStats, MATCH_TYPES } from '../../../../lib/statsCalculator'
import Match from '../../../../models/Match'

export async function GET() {
  try {
    await connectDB()

    const result: Record<string, { batting: object; bowling: object; matchCount: number }> = {}

    for (const matchType of MATCH_TYPES) {
      const matchCount = await Match.countDocuments({ matchType })
      const batting = await getPlayerBattingStats(matchType)
      const bowling = await getPlayerBowlingStats(matchType)
      result[matchType] = { batting, bowling, matchCount }
    }

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to compute breakdown stats' }, { status: 500 })
  }
}
