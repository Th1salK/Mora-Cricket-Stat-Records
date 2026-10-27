import type { MatchTypeValue } from '@/lib/constants'

// Choose calendar years or university years for automatic season assignment.
export const SEASON_MODE: 'calendar' | 'university' = 'calendar'

// First month (1–12) of a university season; ignored in calendar mode.
export const UNIVERSITY_SEASON_START_MONTH = 3

// Minimum participation needed to qualify for average and rate records.
export const QUALIFIERS = {
  battingAverageMinInnings: 5,
  battingStrikeRateMinRuns: 100,
  economyMinBalls: 60,
  bowlingAverageMinWickets: 5,
  bowlingStrikeRateMinWickets: 5,
} as const

// Hide inactive players only on the current season's leaderboards.
export const HIDE_INACTIVE_IN_CURRENT_SEASON = true

// Squad-versus-squad matches do not contribute to team win rates.
export const INTERNAL_MATCH_TYPES: readonly MatchTypeValue[] = ['Home and Home']
