import { NextResponse } from 'next/server'
import { connectDB } from '../../../lib/mongodb'
import Player from '../../../models/Player'
import { isAdmin } from '../../../lib/auth'

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
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
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
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const body = await request.json()

    console.log('CREATE PLAYER BODY:',body) 

    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const player = await Player.findByIdAndUpdate(id, updates, { new: true })

    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 })

    return NextResponse.json(player)

  } catch (err: any) {
    console.error("PLAYER CREATE ERROR",err)
    
    return NextResponse.json({ error: err.message || 'Failed to update player' }, { status: 500 })
  }
}
