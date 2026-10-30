import type { MatchTypeValue } from '@/lib/constants'

export const formatColors: Record<MatchTypeValue, string> = {
  'Div 3': 'var(--format-div-3)',
  'Home and Home': 'var(--format-home-and-home)',
  Practice: 'var(--format-practice)',
  'Inter Uni': 'var(--format-inter-uni)',
  SLUG: 'var(--format-slug)',
  Friendly: 'var(--format-friendly)',
}

export type Outcome = 'won' | 'lost' | 'draw' | 'tie' | 'no result'
export const outcomeTones = {
  won: 'win', lost: 'loss', draw: 'draw', tie: 'draw', 'no result': 'muted',
} as const satisfies Record<Outcome, string>

export type PlayerRole = 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper'
export const roleColors: Record<PlayerRole, string> = {
  Batsman: 'var(--teal)', Bowler: 'var(--ball)',
  'All-rounder': 'var(--accent)', 'Wicket-keeper': 'var(--gold)',
}
