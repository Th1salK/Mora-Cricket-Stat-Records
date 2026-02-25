import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { buildClearCookie } from '../../../../lib/auth'

export async function POST() {
  const { name, value, options } = buildClearCookie()
  const cookieStore = await cookies()
  cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
  return NextResponse.json({ ok: true })
}
