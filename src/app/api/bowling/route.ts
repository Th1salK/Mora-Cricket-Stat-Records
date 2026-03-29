import { NextResponse } from 'next/server'
import { connectDB } from '../../../lib/mongodb'
import BowlingPerformance from '../../../models/BowlingPerformance'

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { matchId, playerId, balls = 0, runs = 0, wickets = 0, wides = 0, noBalls = 0 } = body
    if (!matchId || !playerId) {
      return NextResponse.json({ error: 'Missing matchId or playerId' }, { status: 400 })
    }
    const filter = { matchId, playerId }
    const update = { balls, runs, wickets, wides, noBalls }
    const opts = { upsert: true, new: true, setDefaultsOnInsert: true }
    const doc = await BowlingPerformance.findOneAndUpdate(filter, update, opts)
    return NextResponse.json(doc)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to upsert bowling performance' }, { status: 500 })
  }
}
