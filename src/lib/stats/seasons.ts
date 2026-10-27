import { SEASON_MODE, UNIVERSITY_SEASON_START_MONTH } from '@/lib/stats/config'

export type SeasonRange = { name: string; startDate: Date; endDate: Date }

export function seasonForDate(
  date: Date,
  mode: 'calendar' | 'university' = SEASON_MODE,
  startMonth = UNIVERSITY_SEASON_START_MONTH
): SeasonRange {
  if (Number.isNaN(date.getTime())) throw new Error('Invalid season date')
  if (mode === 'university' && (!Number.isInteger(startMonth) || startMonth < 1 || startMonth > 12)) {
    throw new Error('University season start month must be between 1 and 12')
  }

  const month = mode === 'calendar' ? 0 : startMonth - 1
  const year = date.getUTCFullYear() - (date.getUTCMonth() < month ? 1 : 0)
  const name = mode === 'calendar'
    ? String(year)
    : `${year}/${String((year + 1) % 100).padStart(2, '0')}`

  return {
    name,
    startDate: new Date(Date.UTC(year, month, 1)),
    // Exclusive: the next season starts exactly where this one ends.
    endDate: new Date(Date.UTC(year + 1, month, 1)),
  }
}

export function seasonLabel(name: string): string {
  return `${name} Season`
}
