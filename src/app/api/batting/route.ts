import { NextResponse } from 'next/server'
import { connectDB } from '../../../lib/mongodb'
import BattingPerformance from '../../../models/BattingPerformance'
import { isAdmin } from '../../../lib/auth'

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const body = await request.json()
    const { matchId, playerId, runs = 0, balls = 0, fours = 0, sixes = 0, out = false } = body
    if (!matchId || !playerId) {
      return NextResponse.json({ error: 'Missing matchId or playerId' }, { status: 400 })
    }
    const filter = { matchId, playerId }
    const update = { runs, balls, fours, sixes, out }
    const opts = { upsert: true, new: true, setDefaultsOnInsert: true }
    const doc = await BattingPerformance.findOneAndUpdate(filter, update, opts)
    return NextResponse.json(doc)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to upsert batting performance' }, { status: 500 })
  }
}
