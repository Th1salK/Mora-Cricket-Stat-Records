import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/ui/cn'

describe('cn', () => {
  it('joins class names and ignores conditional empty values', () => {
    expect(cn('one', false, null, undefined, '', 'two')).toBe('one two')
  })
  it('returns an empty string with no classes', () => {
    expect(cn()).toBe('')
  })
})
