import { createHash, randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { connectDB } from './mongodb'
import Session from '../models/Session'
import User, { IUser } from '../models/User'

export const SESSION_COOKIE = 'admin_session'
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function createSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function buildSessionCookieOptions(): {
  httpOnly: boolean
  secure: boolean
  sameSite: 'lax'
  path: string
  maxAge: number
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_MS / 1000,
  }
}

export function buildClearSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  }
}

/** Resolve the current session token from the request cookie. */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value ?? null
}

/** Returns the admin user for the current request, or null. Expired sessions are deleted lazily. */
export async function getCurrentUser(): Promise<IUser | null> {
  const token = await getSessionToken()
  if (!token) return null

  await connectDB()
  const session = await Session.findOne({ tokenHash: hashToken(token) })

  if (!session) return null

  if (session.expiresAt.getTime() <= Date.now()) {
    await Session.deleteOne({ _id: session._id })
    return null
  }

  const user = await User.findById(session.userId)
  return user ?? null
}

/** True when the current request belongs to an authenticated admin. */
export async function isAdmin(): Promise<boolean> {
  return (await getCurrentUser()) !== null
}

/**
 * Guards a mutation route: returns a 401 response when the caller is not an
 * authenticated admin, otherwise null (caller may proceed).
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Please log in as admin.' }, { status: 401 })
  }
  return null
}

/**
 * CSRF defense for state-changing requests: browsers send an Origin header on
 * cross-origin POST/PUT/DELETE. If the Origin does not match the Host, reject.
 * Requests without an Origin (curl, same-origin fetches in some browsers) pass.
 */
export function assertSameOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get('origin')
  if (!origin) return null

  const host = request.headers.get('host')
  if (!host) return null

  try {
    if (new URL(origin).host === host) return null
  } catch {
    // fall through to reject
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

/** Convenience guard combining CSRF + auth checks for mutation routes. */
export async function assertCanWrite(request: Request): Promise<NextResponse | null> {
  return assertSameOrigin(request) ?? (await requireAdmin())
}
