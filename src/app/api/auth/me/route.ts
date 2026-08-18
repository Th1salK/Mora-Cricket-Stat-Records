import { NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ isAdmin: false })
    return NextResponse.json({ isAdmin: true, username: user.username })
  } catch {
    return NextResponse.json({ isAdmin: false }, { status: 500 })
  }
}
