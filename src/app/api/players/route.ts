import { NextResponse } from 'next/server'
import { connectDB } from '../../../lib/mongodb'
import { assertCanWrite } from '../../../lib/auth'
import Player from '../../../models/Player'

const PLAYER_ALLOWED_FIELDS = ['fullName', 'shortName', 'battingStyle', 'bowlingStyle', 'role', 'isActive'] as const

export async function GET() {
  try {
    await connectDB()
    const players = await Player.find().sort({ fullName: 1 }).lean()
    return NextResponse.json(players)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const denied = await assertCanWrite(request)
    if (denied) return denied

    await connectDB()
    const body = await request.json()
    const { fullName, shortName, battingStyle, bowlingStyle, role, isActive } = body
    if (!fullName || !shortName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const player = await Player.create({ fullName, shortName, battingStyle, bowlingStyle, role, isActive })
    return NextResponse.json(player, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create player' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const denied = await assertCanWrite(request)
    if (denied) return denied

    await connectDB()
    const body = await request.json()

    const { id } = body

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

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
