import { NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/mongodb'
import { assertCanWrite } from '../../../../lib/auth'
import Player from '../../../../models/Player'

type Params = { params: Promise<{ id: string }> }

const PLAYER_ALLOWED_FIELDS = ['fullName', 'shortName', 'battingStyle', 'bowlingStyle', 'role', 'isActive'] as const

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
    const denied = await assertCanWrite(req)
    if (denied) return denied

    const { id } = await params
    await connectDB()
    const body = await req.json()

    const updates: Record<string, unknown> = {}
    for (const key of PLAYER_ALLOWED_FIELDS) {
      if (key in body) updates[key] = body[key]
    }

    const player = await Player.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    return NextResponse.json(player)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update player' }, { status: 500 })
  }
}
