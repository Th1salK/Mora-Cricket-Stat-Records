import { describe, expect, it } from 'vitest'
import { initials } from '@/lib/ui/initials'

describe('initials', () => {
  it.each([
    ['Behan Inuka', 'BI'], ['Behan', 'BE'], ['', '?'], ['  ', '?'],
    ['  Behan   Inuka  ', 'BI'], ['Behan Kumar Inuka', 'BI'], ['A', 'A'],
  ])('formats %j as %s', (name, expected) => {
    expect(initials(name)).toBe(expected)
  })
})
