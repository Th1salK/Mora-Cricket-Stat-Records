import { it, expect } from 'vitest'
import { comparePlayerStats } from '@/lib/stats/compare'
import { bat, bowl } from '@/lib/stats/fixtures.test-support'
it('compares normal values and explicitly classifies null-rate changes', () => {
  const result = comparePlayerStats([bat({ out: false })], [bowl({ balls: 0, wickets: 0 })])
  expect(result.fieldsCompared).toBe(20)
  expect(result.differences).toHaveLength(4)
  expect(result.differences.every((row) => row.classification === 'EXPECTED')).toBe(true)
})
it('proves did-not-bat changes by comparing the legacy maths on played rows', () => {
  const result = comparePlayerStats([bat({ out: false }), bat({ dismissalType: 'did not bat', runs: 0, balls: 0, fours: 0, sixes: 0, out: false })], [])
  expect(result.differences.find((row) => row.field === 'innings')?.reason).toContain('Did-not-bat')
  expect(result.differences.every((row) => row.classification === 'EXPECTED')).toBe(true)
})
it('handles a player whose only row is did-not-bat and empty input', () => {
  expect(comparePlayerStats([bat({ runs: 0, balls: 0, fours: 0, sixes: 0, out: false, dismissalType: 'did not bat' })], []).differences.every((row) => row.classification === 'EXPECTED')).toBe(true)
  expect(comparePlayerStats([], [])).toEqual({ playersCompared: 0, fieldsCompared: 0, differences: [] })
})
it('flags unexplained differences rather than approving every changed number', () => {
  const result = comparePlayerStats([bat({ runs: Number.NaN })], [])
  expect(result.differences.some((row) => row.classification === 'UNEXPECTED')).toBe(true)
})
