import { NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/mongodb'
import Player from '../../../../models/Player'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params
    await connectDB()
    const player = await Player.findById(id).lean()
    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    return NextResponse.json(player)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch player' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params
    await connectDB()
    const body = await req.json()
    const player = await Player.findByIdAndUpdate(id, body, { new: true })
    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    return NextResponse.json(player)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update player' }, { status: 500 })
  }
}
