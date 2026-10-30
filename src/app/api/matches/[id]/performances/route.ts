import { NextResponse } from 'next/server'
import { getMatchDetail } from '@/lib/queries/matches'
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const detail = await getMatchDetail(id)
  return detail ? NextResponse.json(detail) : NextResponse.json({ error: 'Match not found' }, { status: 404 })
}
