import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { buildAdminCookie } from '../../../../lib/auth'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    const { name, value, options } = buildAdminCookie()
    const cookieStore = await cookies()
    cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
