import { NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/mongodb'
import { getBattingStats, getBowlingStats, MATCH_TYPES } from '../../../../lib/statsCalculator'
import Match from '../../../../models/Match'

export async function GET() {
  try {
    await connectDB()

    const result: Record<string, { batting: object; bowling: object; matchCount: number }> = {}

    for (const matchType of MATCH_TYPES) {
      const matchCount = await Match.countDocuments({ matchType })
      const batting = await getBattingStats(matchType)
      const bowling = await getBowlingStats(matchType)
      result[matchType] = { batting, bowling, matchCount }
    }

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to compute breakdown stats' }, { status: 500 })
  }
}
