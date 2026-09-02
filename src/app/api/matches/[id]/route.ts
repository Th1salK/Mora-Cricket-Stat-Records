import { NextResponse } from "next/server"
import { connectDB } from "../../../../lib/mongodb"
import { assertCanWrite } from "../../../../lib/auth"
import { checkApiRateLimit, apiLockoutSeconds } from "../../../../lib/rateLimit"
import { matchSchema } from "../../../../lib/validations"
import Match from "../../../../models/Match"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
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
    if (!checkApiRateLimit(request)) {
      return NextResponse.json(
        { error: "Too many requests. Try again in " + apiLockoutSeconds(request) + "s." },
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

    const updated = await Match.findByIdAndUpdate(
      id,
      parsed.data,
      { new: true, runValidators: true }
    )

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
    if (!checkApiRateLimit(request)) {
      return NextResponse.json(
        { error: "Too many requests. Try again in " + apiLockoutSeconds(request) + "s." },
        { status: 429 }
      )
    }

    const denied = await assertCanWrite(request)
    if (denied) return denied

    await connectDB()
    const { id } = await params
    const deleted = await Match.findByIdAndDelete(id)
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete match" }, { status: 500 })
  }
}
