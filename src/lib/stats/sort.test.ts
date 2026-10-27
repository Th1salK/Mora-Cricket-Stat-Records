import { it, expect } from 'vitest'
import { compareNullable } from '@/lib/stats/sort'
it('keeps nulls last ascending and descending and preserves real zeros', () => {
  expect([null, 2, 0, 1, null].sort((a, b) => compareNullable(a, b))).toEqual([0, 1, 2, null, null])
  expect([null, 2, 0, 1, null].sort((a, b) => compareNullable(a, b, 'desc'))).toEqual([2, 1, 0, null, null])
})
