import { NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/mongodb'
import Match from '../../../../models/Match'
import { isAdmin } from '../../../../lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const match = await Match.findById(id).lean()
    if (!match) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(match)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const { id } = await params
    const body = await request.json()
    const { date, opponent, venue, overs, matchType } = body

    if (!date || !opponent || !venue || !matchType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const updated = await Match.findByIdAndUpdate(
      id,
      { date, opponent, venue, overs: Number(overs), matchType },
      { new: true, runValidators: true }
    )

    if (!updated) return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update match' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const { id } = await params
    const deleted = await Match.findByIdAndDelete(id)
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
