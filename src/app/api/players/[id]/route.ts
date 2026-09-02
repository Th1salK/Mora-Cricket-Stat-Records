import { NextResponse } from "next/server"
import { connectDB } from "../../../../lib/mongodb"
import { assertCanWrite } from "../../../../lib/auth"
import { checkApiRateLimit, apiLockoutSeconds } from "../../../../lib/rateLimit"
import { playerSchema } from "../../../../lib/validations"
import Player from "../../../../models/Player"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params
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
    if (!checkApiRateLimit(req)) {
      return NextResponse.json(
        { error: "Too many requests. Try again in " + apiLockoutSeconds(req) + "s." },
        { status: 429 }
      )
    }

    const denied = await assertCanWrite(req)
    if (denied) return denied

    const { id } = await params
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
