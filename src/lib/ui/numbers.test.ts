import { it, expect } from 'vitest'
import { formatCount } from '@/lib/ui/numbers'
it('groups counts and preserves real zero versus missing data', () => {
  expect(formatCount(1899)).toBe('1,899')
  expect(formatCount(1234567)).toBe('1,234,567')
  expect(formatCount(0)).toBe('0')
  expect(formatCount(null)).toBe('–')
})
