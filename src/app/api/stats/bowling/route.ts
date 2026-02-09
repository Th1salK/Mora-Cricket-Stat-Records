import { NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/mongodb'
import BowlingPerformance from '../../../../models/BowlingPerformance'

export async function GET() {
  try {
    await connectDB()

    const pipeline: any[] = [
      {
        $group: {
          _id: '$playerId',
          matches: { $sum: 1 },
          balls: { $sum: '$balls' },
          runs: { $sum: '$runs' },
          wickets: { $sum: '$wickets' },
          wides: { $sum: '$wides' },
          noBalls: { $sum: '$noBalls' },
        },
      },
      {
        $lookup: {
          from: 'players',
          localField: '_id',
          foreignField: '_id',
          as: 'player',
        },
      },
      { $unwind: { path: '$player', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          playerId: '$_id',
          fullName: '$player.fullName',
          matches: 1,
          balls: 1,
          runs: 1,
          wickets: 1,
          wides: 1,
          noBalls: 1,
          average: {
            $cond: [{ $eq: ['$wickets', 0] }, null, { $divide: ['$runs', '$wickets'] }],
          },
          economy: {
            $cond: [{ $eq: ['$balls', 0] }, 0, { $multiply: [{ $divide: ['$runs', '$balls'] }, 6] }],
          },
          strikeRate: {
            $cond: [{ $eq: ['$wickets', 0] }, 0, { $divide: ['$balls', '$wickets'] }],
          },
        },
      },
      { $sort: { wickets: -1 } },
    ]

    const stats = await BowlingPerformance.aggregate(pipeline)
    return NextResponse.json(stats)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to compute bowling stats' }, { status: 500 })
  }
}
