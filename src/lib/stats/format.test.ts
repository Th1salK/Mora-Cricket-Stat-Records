import { it, expect } from 'vitest'
import { fmtNumber, fmtOvers, fmtFigures, fmtHighScore } from '@/lib/stats/format'
it('formats numbers, including zero, precision and null', () => {
  expect(fmtNumber(null)).toBe('–')
  expect(fmtNumber(0)).toBe('0.00')
  expect(fmtNumber(3.4)).toBe('3.40')
  expect(fmtNumber(3.456, 1)).toBe('3.5')
})
it('formats overs in base six', () => {
  expect(fmtOvers(53)).toBe('8.5')
  expect(fmtOvers(0)).toBe('0.0')
})
it('formats figures and null', () => {
  expect(fmtFigures({ wickets: 3, runs: 32 })).toBe('3/32')
  expect(fmtFigures(null)).toBe('–')
})
it('formats high scores and not-out stars', () => {
  expect(fmtHighScore(72, true)).toBe('72*')
  expect(fmtHighScore(72, false)).toBe('72')
  expect(fmtHighScore(null, true)).toBe('–')
})
