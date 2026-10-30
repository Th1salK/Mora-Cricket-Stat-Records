import { it, expect } from 'vitest'
import { formatDate, matchDateParts } from '@/lib/ui/dates'
it('formats header and compact dates in Colombo', () => {
  expect(formatDate('2026-04-04T00:00:00Z', 'long')).toBe('Saturday, 4 April 2026')
  expect(formatDate('2026-04-04T00:00:00Z', 'compact')).toBe('4 Apr')
  expect(formatDate('2026-04-04T00:00:00Z')).toBe('4 Apr 2026')
  expect(formatDate('2026-04-03T20:00:00Z', 'compact')).toBe('4 Apr')
})
it('uses a dash for invalid dates', () => { expect(formatDate('invalid')).toBe('–') })

it('splits Colombo dates into the match date block', () => { expect(matchDateParts('2026-03-28')).toEqual({ day: '28', month: 'MAR', weekday: 'Sat' }); expect(matchDateParts('bad').day).toBe('–') })
