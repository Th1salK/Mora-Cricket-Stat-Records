import type { MatchTypeValue } from '@/lib/constants'

export type BatRow = {
  playerId: string; matchId: string; matchType: MatchTypeValue; date: Date
  runs: number; balls: number; fours: number; sixes: number; out: boolean
  dismissalType?: string | null
}
export type BowlRow = {
  playerId: string; matchId: string; matchType: MatchTypeValue; date: Date
  balls: number; runs: number; wickets: number; wides: number; noBalls: number; maidens: number
}
export type Figures = { wickets: number; runs: number }
export type Coverage = { used: number; total: number }
export type MatchRow = {
  matchId: string; date: Date; matchType: MatchTypeValue; opponent: string
  outcome: 'won' | 'lost' | 'draw' | 'tie' | 'no result' | null
  margin: number | null; marginType: 'runs' | 'wickets' | null
  moraInnings: { runs: number; wickets: number; balls: number } | null
  oppInnings: { runs: number; wickets: number; balls: number } | null
}
