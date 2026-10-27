import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDB } from "@/lib/mongodb"
import { assertCanWrite } from "@/lib/auth"
import { checkApiRateLimit, apiLockoutSeconds } from "@/lib/rateLimit"
import { matchSchema } from "@/lib/validations"
import { ensureSeasonForDate } from "@/lib/seasonsServer"
import Match from "@/models/Match"
import BattingPerformance from "@/models/BattingPerformance"
import BowlingPerformance from "@/models/BowlingPerformance"

class MatchNotFoundError extends Error {
  constructor() {
    super("Match not found")
    this.name = "MatchNotFoundError"
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const match = await Match.findById(id).select('-season').lean()
    if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(match)
  } catch {
    return NextResponse.json({ error: "Failed to fetch match" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await checkApiRateLimit(request))) {
      return NextResponse.json(
        { error: "Too many requests", retryAfter: await apiLockoutSeconds(request) },
        { status: 429 }
      )
    }

    const denied = await assertCanWrite(request)
    if (denied) return denied

    await connectDB()
    const { id } = await params
    const body = await request.json()
    const parsed = matchSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const seasonId = await ensureSeasonForDate(new Date(parsed.data.date))
    const updated = await Match.findByIdAndUpdate(
      id,
      { ...parsed.data, season: seasonId },
      { new: true, runValidators: true }
    ).select('-season')

    if (!updated) return NextResponse.json({ error: "Match not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await checkApiRateLimit(request))) {
      return NextResponse.json(
        { error: "Too many requests", retryAfter: await apiLockoutSeconds(request) },
        { status: 429 }
      )
    }

    const denied = await assertCanWrite(request)
    if (denied) return denied

    await connectDB()
    const { id } = await params

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid match id" }, { status: 400 })
    }

    const dbSession = await mongoose.startSession()
    let deletedCounts = { batting: 0, bowling: 0 }

    try {
      await dbSession.withTransaction(async () => {
        const exists = await Match.exists({ _id: id }).session(dbSession)
        if (!exists) throw new MatchNotFoundError()

        const batting = await BattingPerformance.deleteMany(
          { matchId: id },
          { session: dbSession }
        )
        const bowling = await BowlingPerformance.deleteMany(
          { matchId: id },
          { session: dbSession }
        )
        await Match.findByIdAndDelete(id, { session: dbSession })

        deletedCounts = {
          batting: batting.deletedCount ?? 0,
          bowling: bowling.deletedCount ?? 0,
        }
      })
    } catch (error) {
      if (error instanceof MatchNotFoundError) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      }
      throw error
    } finally {
      await dbSession.endSession()
    }

    return NextResponse.json({ success: true, deleted: deletedCounts })
  } catch (error) {
    console.error("Failed to delete match:", error)
    return NextResponse.json({ error: "Failed to delete match" }, { status: 500 })
  }
}
