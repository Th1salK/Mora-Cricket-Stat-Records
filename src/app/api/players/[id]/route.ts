import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDB } from "@/lib/mongodb"
import { assertCanWrite } from "@/lib/auth"
import { checkApiRateLimit, apiLockoutSeconds } from "@/lib/rateLimit"
import { playerSchema } from "@/lib/validations"
import Player from "@/models/Player"
import BattingPerformance from "@/models/BattingPerformance"
import BowlingPerformance from "@/models/BowlingPerformance"

type Params = { params: Promise<{ id: string }> }

export async function DELETE(req: Request, { params }: Params) {
  try {
    const denied = await assertCanWrite(req)
    if (denied) return denied
    if (!(await checkApiRateLimit(req))) return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    const { id } = await params
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid player ID" }, { status: 400 })
    await connectDB()
    const [bat, bowl] = await Promise.all([BattingPerformance.exists({ playerId: id }), BowlingPerformance.exists({ playerId: id })])
    if (bat || bowl) return NextResponse.json({ error: "This player has performances. Mark inactive instead.", code: "has-performances" }, { status: 409 })
    const deleted = await Player.findByIdAndDelete(id)
    return deleted ? NextResponse.json({ success: true }) : NextResponse.json({ error: "Player not found" }, { status: 404 })
  } catch { return NextResponse.json({ error: "Could not delete player" }, { status: 500 }) }
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid player ID" }, { status: 400 })
    await connectDB()
    const player = await Player.findById(id).lean()
    if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 })
    return NextResponse.json(player)
  } catch {
    return NextResponse.json({ error: "Failed to fetch player" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    if (!(await checkApiRateLimit(req))) {
      return NextResponse.json(
        { error: "Too many requests", retryAfter: await apiLockoutSeconds(req) },
        { status: 429 }
      )
    }

    const denied = await assertCanWrite(req)
    if (denied) return denied

    const { id } = await params
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid player ID" }, { status: 400 })
    const body = await req.json()
    const parsed = playerSchema.partial().safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    await connectDB()
    const player = await Player.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true })
    if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 })
    return NextResponse.json(player)
  } catch {
    return NextResponse.json({ error: "Failed to update player" }, { status: 500 })
  }
}
