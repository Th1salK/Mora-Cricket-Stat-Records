import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '../../../../lib/mongodb'
import User from '../../../../models/User'
import Session from '../../../../models/Session'
import {
  createSessionToken,
  hashToken,
  buildSessionCookieOptions,
  SESSION_MAX_AGE_MS,
} from '../../../../lib/auth'
import {
  checkLoginRateLimit,
  recordLoginFailure,
  clearLoginRateLimit,
  loginLockoutSeconds,
} from '../../../../lib/rateLimit'

export async function POST(request: Request) {
  try {
    if (!checkLoginRateLimit(request)) {
      return NextResponse.json(
        { error: `Too many login attempts. Try again in ${loginLockoutSeconds(request)}s.` },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { username, password } = body

    if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ username: username.trim().toLowerCase() })

    const passwordOk = user ? await bcrypt.compare(password, user.passwordHash) : false

    if (!user || !passwordOk) {
      recordLoginFailure(request)
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    clearLoginRateLimit(request)

    const token = createSessionToken()
    await Session.create({
      tokenHash: hashToken(token),
      userId: user._id,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS),
    })

    const response = NextResponse.json({ ok: true, username: user.username })
    response.cookies.set('admin_session', token, buildSessionCookieOptions())
    return response
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
