import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { assertCanWrite } from '@/lib/auth'
import { checkApiRateLimit, apiLockoutSeconds } from '@/lib/rateLimit'
import { connectDB } from '@/lib/mongodb'
import { listSeasons, getCurrentSeason } from '@/lib/seasonsServer'
import { seasonInputSchema, seasonChangeSchema, seasonIdSchema, SeasonError } from '@/lib/seasonValidation'
import Season from '@/models/Season'

export async function GET() {
  try {
    const [seasons, current] = await Promise.all([listSeasons(), getCurrentSeason()])
    return NextResponse.json({ seasons, currentSeasonId: current?.id ?? null })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch seasons' }, { status: 500 })
  }
}

async function authorize(request: Request) {
  const denied = await assertCanWrite(request)
  if (denied) return denied
  if (!(await checkApiRateLimit(request))) return NextResponse.json({
    error: 'Too many requests', retryAfter: await apiLockoutSeconds(request),
  }, { status: 429 })
}
function failure(error: unknown) {
  if (error instanceof SeasonError) return NextResponse.json({ error: error.message }, { status: 409 })
  if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
    return NextResponse.json({ error: 'That season name already exists, or another admin changed the current season. Refresh and try again.' }, { status: 409 })
  }
  return NextResponse.json({ error: 'Could not save the season. Try again.' }, { status: 500 })
}
export async function POST(request: Request) {
  try {
    const denied = await authorize(request)
    if (denied) return denied
    const parsed = seasonInputSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    await connectDB()
    const session = await mongoose.startSession()
    try {
      await session.withTransaction(async () => {
        if (parsed.data.makeCurrent) await Season.updateMany({ isCurrent: true }, { $set: { isCurrent: false } }, { session })
        await Season.create([{
          name: parsed.data.name, startDate: new Date(parsed.data.startDate),
          endDate: new Date(parsed.data.endDate), isCurrent: parsed.data.makeCurrent,
        }], { session })
      })
    } finally { await session.endSession() }
    revalidatePath('/', 'layout')
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) { return failure(error) }
}
export async function PUT(request: Request) {
  try {
    const denied = await authorize(request)
    if (denied) return denied
    const body = await request.json()
    const parsed = seasonChangeSchema.extend({ id: seasonIdSchema }).safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid season or action' }, { status: 400 })
    await connectDB()
    const session = await mongoose.startSession()
    try {
      await session.withTransaction(async () => {
        const season = await Season.findById(parsed.data.id).session(session)
        if (!season) throw new SeasonError('Season not found')
        if (parsed.data.action === 'end') {
          if (!season.endedAt) await Season.updateOne({ _id: season._id }, {
            $set: { endedAt: new Date(), isCurrent: false }, $inc: { writeVersion: 1 },
          }, { session })
        } else {
          if (season.endedAt) throw new SeasonError('An ended season cannot be made current')
          await Season.updateMany({ isCurrent: true }, { $set: { isCurrent: false } }, { session })
          await Season.updateOne({ _id: season._id }, { $set: { isCurrent: true }, $inc: { writeVersion: 1 } }, { session })
        }
      })
    } finally { await session.endSession() }
    revalidatePath('/', 'layout')
    return NextResponse.json({ ok: true })
  } catch (error) { return failure(error) }
}
