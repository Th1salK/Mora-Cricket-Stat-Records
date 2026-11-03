import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDB } from "@/lib/mongodb"
import { assertCanWrite } from "@/lib/auth"
import { checkApiRateLimit, apiLockoutSeconds } from "@/lib/rateLimit"
import { matchSchema } from "@/lib/validations"
import { admitSeason } from "@/lib/seasonsServer"
import { SeasonError } from "@/lib/seasonValidation"
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
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid match ID" }, { status: 400 })
    const match = await Match.findById(id).lean()
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
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid match ID" }, { status: 400 })
    const body = await request.json()
    const parsed = matchSchema.safeParse({ ...body, ...(body.toss === null ? { toss: undefined } : {}), ...(body.result === null ? { result: undefined } : {}) })

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const session = await mongoose.startSession()
    let updated
    try {
      updated = await session.withTransaction(async () => {
        const existing = await Match.findById(id).session(session)
        if (!existing) throw new MatchNotFoundError()
        const existingSeasonId = existing.season ? String(existing.season) : undefined
        const seasonId = await admitSeason(parsed.data.season ?? existingSeasonId, session, existingSeasonId)
        return await Match.findByIdAndUpdate(
          id,
          { $set: { ...parsed.data, season: seasonId }, ...((body.toss === null || body.result === null) ? { $unset: { ...(body.toss === null ? { toss: 1 } : {}), ...(body.result === null ? { result: 1 } : {}) } } : {}) },
          { returnDocument: 'after', runValidators: true, session }
          )

      })
    } finally { await session.endSession() }

    if (!updated) return NextResponse.json({ error: "Match not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof SeasonError) return NextResponse.json({ error: error.message }, { status: 400 })
    if (error instanceof MatchNotFoundError) return NextResponse.json({ error: error.message }, { status: 404 })
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
