import { DraftSchema, MatchDetailsSchema, canPublish, draftWarnings } from '@/lib/import/draft'
export function draftStatus(edited: unknown, details: unknown, updatedAt: Date, manual = false) {
  const expiresAt = new Date(updatedAt.getTime() + 30 * 86400000).toISOString()
  const parsed = DraftSchema.safeParse(edited), match = MatchDetailsSchema.safeParse(details)
  if (!parsed.success) return { status: 'empty' as const, count: 0, expiresAt }
  const rows = parsed.data.innings.flatMap((inn) => (inn.side === 'mora' ? inn.batting : inn.bowling).map((row) => ({ playerId: row.playerId })))
  if (!rows.length) return { status: 'empty' as const, count: 0, expiresAt }
  const missing = rows.filter((row) => !row.playerId).length
  if (manual && missing) return { status: 'empty' as const, count: missing, expiresAt }
  const warnings = draftWarnings(parsed.data), blocking = warnings.filter((w) => w.blocking).length + (match.success ? 0 : 1)
  if (blocking || !canPublish(parsed.data)) return { status: 'blocking' as const, count: blocking, expiresAt }
  if (warnings.length) return { status: 'check' as const, count: warnings.length, expiresAt }
  return { status: 'ready' as const, count: 0, expiresAt }
}
