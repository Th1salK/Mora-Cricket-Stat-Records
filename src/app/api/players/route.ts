import { NextResponse } from "next/server"
import { connectDB } from "../../../lib/mongodb"
import { assertCanWrite } from "../../../lib/auth"
import { checkApiRateLimit, apiLockoutSeconds } from "../../../lib/rateLimit"
import { playerSchema } from "../../../lib/validations"
import Player from "../../../models/Player"

export async function GET() {
  try {
    await connectDB()
    const players = await Player.find().sort({ fullName: 1 }).lean()
    return NextResponse.json(players)
  } catch {
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!checkApiRateLimit(request)) {
      return NextResponse.json(
        { error: "Too many requests. Try again in " + apiLockoutSeconds(request) + "s." },
        { status: 429 }
      )
    }

    const denied = await assertCanWrite(request)
    if (denied) return denied

    const body = await request.json()
    const parsed = playerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    await connectDB()
    const player = await Player.create(parsed.data)
    return NextResponse.json(player, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    if (!checkApiRateLimit(request)) {
      return NextResponse.json(
        { error: "Too many requests. Try again in " + apiLockoutSeconds(request) + "s." },
        { status: 429 }
      )
    }

    const denied = await assertCanWrite(request)
    if (denied) return denied

    const body = await request.json()
    const { id, ...rest } = body

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const parsed = playerSchema.partial().safeParse(rest)
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
