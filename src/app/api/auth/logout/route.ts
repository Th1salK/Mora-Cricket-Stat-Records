import { NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/mongodb'
import Session from '../../../../models/Session'
import {
  getSessionToken,
  hashToken,
  buildClearSessionCookieOptions,
} from '../../../../lib/auth'

export async function POST() {
  try {
    const token = await getSessionToken()
    if (token) {
      await connectDB()
      await Session.deleteOne({ tokenHash: hashToken(token) })
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set('admin_session', '', buildClearSessionCookieOptions())
    return response
  } catch {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
