import { NextResponse } from 'next/server'
import { connectDB } from '../../../lib/mongodb'
import Match from '../../../models/Match'

export async function GET() {
  try {
    await connectDB()
    const matches = await Match.find().sort({ date: -1 }).lean()
    return NextResponse.json(matches)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { date, opponent, venue, overs, matchType} = body
   if (!date || !opponent || !venue || !matchType) {
     return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

   if (typeof overs !== 'number' || overs <= 0) {
      return NextResponse.json({ error: 'Overs must be a positive number' }, { status: 400 })
  }

    const match = await Match.create({ date, opponent, venue, overs, matchType})
    return NextResponse.json(match, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create match' }, { status: 500 })
  }
}
