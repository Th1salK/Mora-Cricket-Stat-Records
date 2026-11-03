import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { assertCanManageAdmins, requireSuperadmin } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { checkApiRateLimit, apiLockoutSeconds } from '@/lib/rateLimit'
import { AdminAccountError, createAdminSchema, deleteAdminSchema, isSuperadminRole } from '@/lib/adminAccounts'
import { listAdmins } from '@/lib/queries/admins'
import User from '@/models/User'
import Session from '@/models/Session'

function failure(error: unknown) {
  if (error instanceof AdminAccountError) return NextResponse.json({ error: error.message }, { status: error.status })
  if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
    return NextResponse.json({ error: 'That username already exists.' }, { status: 409 })
  }
  return NextResponse.json({ error: 'Could not update admin accounts. Try again.' }, { status: 500 })
}
async function authorize(request: Request) {
  const denied = await assertCanManageAdmins(request)
  if (denied) return denied
  if (!(await checkApiRateLimit(request))) return NextResponse.json({
    error: 'Too many requests', retryAfter: await apiLockoutSeconds(request),
  }, { status: 429 })
}
export async function GET() {
  const denied = await requireSuperadmin()
  if (denied) return denied
  try { return NextResponse.json({ admins: await listAdmins() }, { headers: { 'Cache-Control': 'no-store' } }) }
  catch { return NextResponse.json({ error: 'Could not load admin accounts.' }, { status: 500 }) }
}
export async function POST(request: Request) {
  try {
    const denied = await authorize(request)
    if (denied) return denied
    const parsed = createAdminSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    await connectDB()
    const passwordHash = await bcrypt.hash(parsed.data.password, 12)
    const user = await User.create({ username: parsed.data.username, passwordHash, role: 'admin' })
    revalidatePath('/admin/admins')
    return NextResponse.json({ id: String(user._id), username: user.username, role: 'admin' }, { status: 201 })
  } catch (error) { return failure(error) }
}
export async function DELETE(request: Request) {
  try {
    const denied = await authorize(request)
    if (denied) return denied
    const parsed = deleteAdminSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 })
    await connectDB()
    const session = await mongoose.startSession()
    try {
      await session.withTransaction(async () => {
        const target = await User.findById(parsed.data.id).select('role').session(session)
        if (!target) throw new AdminAccountError('Admin account not found.', 404)
        if (isSuperadminRole(target.role)) throw new AdminAccountError('The superadmin account cannot be removed.', 403)
        const deleted = await User.deleteOne({ _id: target._id, role: { $ne: 'superadmin' } }, { session })
        if (!deleted.deletedCount) throw new AdminAccountError('This account cannot be removed.', 403)
        await Session.deleteMany({ userId: target._id }, { session })
      })
    } finally { await session.endSession() }
    revalidatePath('/', 'layout')
    return NextResponse.json({ ok: true })
  } catch (error) { return failure(error) }
}
