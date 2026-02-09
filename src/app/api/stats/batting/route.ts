import { NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/mongodb'
import BattingPerformance from '../../../../models/BattingPerformance'
import Player from '../../../../models/Player'
import mongoose from 'mongoose'

export async function GET() {
  try {
    await connectDB()

    const pipeline: any[] = [
      {
        $group: {
          _id: '$playerId',
          matches: { $sum: 1 },
          runs: { $sum: '$runs' },
          balls: { $sum: '$balls' },
          fours: { $sum: '$fours' },
          sixes: { $sum: '$sixes' },
          outs: { $sum: { $cond: ['$out', 1, 0] } },
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
          runs: 1,
          balls: 1,
          fours: 1,
          sixes: 1,
          outs: 1,
          average: {
            $cond: [{ $eq: ['$outs', 0] }, null, { $divide: ['$runs', '$outs'] }],
          },
          strikeRate: {
            $cond: [{ $eq: ['$balls', 0] }, 0, { $multiply: [{ $divide: ['$runs', '$balls'] }, 100] }],
          },
        },
      },
      { $sort: { runs: -1 } },
    ]

    const stats = await BattingPerformance.aggregate(pipeline)
    return NextResponse.json(stats)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to compute batting stats' }, { status: 500 })
  }
}
