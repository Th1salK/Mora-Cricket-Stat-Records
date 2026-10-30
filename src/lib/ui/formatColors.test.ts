import { describe, expect, it } from 'vitest'
import { MATCH_TYPES } from '@/lib/constants'
import { formatColors, outcomeTones, roleColors } from '@/lib/ui/formatColors'

describe('UI colour mappings', () => {
  it('covers every supported match type', () => {
    expect(Object.keys(formatColors).sort()).toEqual([...MATCH_TYPES].sort())
    for (const type of MATCH_TYPES) expect(formatColors[type]).toMatch(/^var\(--format-/)
  })
  it('covers every outcome with its semantic tone', () => {
    expect(outcomeTones).toEqual({ won: 'win', lost: 'loss', draw: 'draw', tie: 'draw', 'no result': 'muted' })
  })
  it('covers every player role with the design colour', () => {
    expect(roleColors).toEqual({
      Batsman: 'var(--teal)', Bowler: 'var(--ball)',
      'All-rounder': 'var(--accent)', 'Wicket-keeper': 'var(--gold)',
    })
  })
})
