import { expect, it } from 'vitest'
import { DISMISSAL_TYPES } from '@/lib/import/parse'
import { formatDismissal } from '@/lib/stats/dismissal'
it('handles every dismissal and missing older dismissals', () => {
  for (const type of DISMISSAL_TYPES) expect(formatDismissal({ out: true, dismissal: { type } })).toBeTruthy()
  expect(formatDismissal({ out: true })).toBe('out'); expect(formatDismissal({ out: false })).toBe('not out')
  expect(formatDismissal({ out: true, dismissal: { type: 'caught', fielder: 'Ali', bowler: 'Ali' } })).toBe('c & b Ali')
  expect(formatDismissal({ out: true, dismissal: { type: 'caught', fielder: 'F', bowler: 'B' } })).toBe('c F b B')
  expect(formatDismissal({ out: true, dismissal: { type: 'run out', fielder: 'F' } })).toBe('run out (F)')
})
