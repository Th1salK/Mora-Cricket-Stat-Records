import { describe, expect, it } from 'vitest'
import { seasonForDate, seasonLabel } from '@/lib/stats/seasons'

describe('seasonForDate', () => {
  it.each(['2026-01-01', '2026-12-31', '2026-03-28'])('assigns %s to the calendar year', (day) => {
    expect(seasonForDate(new Date(`${day}T00:00:00Z`), 'calendar')).toEqual({
      name: '2026',
      startDate: new Date('2026-01-01T00:00:00Z'),
      endDate: new Date('2027-01-01T00:00:00Z'),
    })
  })

  it.each([
    ['2026-02-28', '2025/26', 2025],
    ['2026-03-01', '2026/27', 2026],
    ['2026-12-31', '2026/27', 2026],
    ['2027-01-15', '2026/27', 2026],
    ['2028-02-29', '2027/28', 2027],
  ])('assigns %s to university season %s', (day, name, year) => {
    expect(seasonForDate(new Date(`${day}T00:00:00Z`), 'university', 3)).toEqual({
      name,
      startDate: new Date(`${year}-03-01T00:00:00Z`),
      endDate: new Date(`${year + 1}-03-01T00:00:00Z`),
    })
  })

  it.each(['calendar', 'university'] as const)('uses an exclusive end date in %s mode', (mode) => {
    const season = seasonForDate(new Date('2026-06-01T00:00:00Z'), mode, 3)
    expect(seasonForDate(new Date(season.endDate.getTime() - 1), mode, 3)).toEqual(season)
    const next = seasonForDate(season.endDate, mode, 3)
    expect(next.startDate).toEqual(season.endDate)
    expect(next.name).not.toBe(season.name)
  })

  it('uses UTC rather than the date in the input timezone', () => {
    expect(seasonForDate(new Date('2026-01-01T00:30:00+05:30'), 'calendar').name).toBe('2025')
  })

  it('supports a different university start month', () => {
    expect(seasonForDate(new Date('2026-08-31T00:00:00Z'), 'university', 9).name).toBe('2025/26')
    expect(seasonForDate(new Date('2026-09-01T00:00:00Z'), 'university', 9).name).toBe('2026/27')
  })

  it('throws for an invalid date', () => {
    expect(() => seasonForDate(new Date('invalid'))).toThrow('Invalid season date')
  })

  it.each([0, 13, 1.5, NaN])('rejects invalid university start month %s', (month) => {
    expect(() => seasonForDate(new Date('2026-01-01'), 'university', month)).toThrow('start month')
  })
})

describe('seasonLabel', () => {
  it('labels calendar and university seasons', () => {
    expect(seasonLabel('2026')).toBe('2026 Season')
    expect(seasonLabel('2026/27')).toBe('2026/27 Season')
  })
})
