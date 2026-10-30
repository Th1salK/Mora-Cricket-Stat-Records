import { it, expect } from 'vitest'
import { resultSegments } from '@/lib/ui/resultBar'
it('uses actual outcomes for the bar and includes draws/ties/no-results', () => {
  const rows = resultSegments({ won: 3, lost: 1, draw: 1, tie: 0, noResult: 1 })
  expect(rows.map((row) => row.count)).toEqual([3, 1, 1, 1])
  expect(rows[0].width).toBe(50)
  expect(rows.reduce((sum, row) => sum + row.width, 0)).toBeCloseTo(100)
})
it('does not divide by zero without results', () => {
  expect(resultSegments({ won: 0, lost: 0, draw: 0, tie: 0, noResult: 0 }).every((row) => row.width === 0)).toBe(true)
})
