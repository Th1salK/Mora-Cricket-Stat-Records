import type { PlayerRole } from '@/lib/ui/formatColors'
export type PlayerCardRow = { id: string; fullName: string; shortName: string; aliases: string[]; role: PlayerRole; isActive: boolean; battingStyle: string | null; bowlingStyle: string | null; matches: number; runs: number; wickets: number }
export function mergePlayerCards(players: Omit<PlayerCardRow, 'matches' | 'runs' | 'wickets'>[], batting: { playerId: string; runs: number }[], bowling: { playerId: string; wickets: number }[], appearances: { playerId: string; matchId: string }[]): PlayerCardRow[] {
  const bat = new Map(batting.map((row) => [row.playerId, row.runs])), bowl = new Map(bowling.map((row) => [row.playerId, row.wickets]))
  const matches = new Map<string, Set<string>>()
  for (const row of appearances) { const ids = matches.get(row.playerId) ?? new Set<string>(); ids.add(row.matchId); matches.set(row.playerId, ids) }
  return players.map((player) => ({ ...player, runs: bat.get(player.id) ?? 0, wickets: bowl.get(player.id) ?? 0, matches: matches.get(player.id)?.size ?? 0 }))
}
