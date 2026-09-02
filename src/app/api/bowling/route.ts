import { NextResponse } from "next/server"
import { connectDB } from "../../../lib/mongodb"
import { assertCanWrite } from "../../../lib/auth"
import { checkApiRateLimit, apiLockoutSeconds } from "../../../lib/rateLimit"
import { bowlingPerformanceSchema } from "../../../lib/validations"
import BowlingPerformance from "../../../models/BowlingPerformance"

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
    const parsed = bowlingPerformanceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    await connectDB()
    const { matchId, playerId, ...update } = parsed.data
    const filter = { matchId, playerId }
    const opts = { upsert: true, new: true, setDefaultsOnInsert: true }
    const doc = await BowlingPerformance.findOneAndUpdate(filter, update, opts)
    return NextResponse.json(doc)
  } catch {
    return NextResponse.json({ error: "Failed to upsert bowling performance" }, { status: 500 })
  }
}
