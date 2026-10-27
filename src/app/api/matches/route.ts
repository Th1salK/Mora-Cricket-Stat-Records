import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { assertCanWrite } from "@/lib/auth"
import { checkApiRateLimit, apiLockoutSeconds } from "@/lib/rateLimit"
import { matchSchema } from "@/lib/validations"
import { ensureSeasonForDate } from "@/lib/seasonsServer"
import Match from "@/models/Match"

export async function GET() {
  try {
    await connectDB()
    const matches = await Match.find().select('-season').sort({ date: -1 }).lean()
    return NextResponse.json(matches)
  } catch {
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkApiRateLimit(request))) {
      return NextResponse.json(
        { error: "Too many requests", retryAfter: await apiLockoutSeconds(request) },
        { status: 429 }
      )
    }

    const denied = await assertCanWrite(request)
    if (denied) return denied

    const body = await request.json()
    const parsed = matchSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    await connectDB()
    const seasonId = await ensureSeasonForDate(new Date(parsed.data.date))
    const match = await Match.create({ ...parsed.data, season: seasonId })
    const response = match.toObject()
    delete response.season
    return NextResponse.json(response, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create match" }, { status: 500 })
  }
}
