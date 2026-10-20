export function isOrphan(
  ref: { matchId?: unknown; playerId?: unknown },
  existingMatchIds: Set<string>,
  existingPlayerIds: Set<string>
): boolean {
  if (ref.matchId == null || ref.playerId == null) return true

  return (
    !existingMatchIds.has(String(ref.matchId)) ||
    !existingPlayerIds.has(String(ref.playerId))
  )
}
