import { it, expect } from 'vitest'
import { describeResult } from '@/lib/stats/describeResult'
it('describes wins/losses and singular margins', () => {
  expect(describeResult({ outcome: 'won', margin: 6, marginType: 'runs' })).toBe('Mora CC won by 6 runs')
  expect(describeResult({ outcome: 'lost', margin: 3, marginType: 'wickets' })).toBe('Mora CC lost by 3 wickets')
  expect(describeResult({ outcome: 'won', margin: 1, marginType: 'runs' })).toBe('Mora CC won by 1 run')
  expect(describeResult({ outcome: 'won', margin: 1, marginType: 'wickets' })).toBe('Mora CC won by 1 wicket')
})
it('does not invent a margin when one was not recorded', () => {
  expect(describeResult({ outcome: 'won', margin: null, marginType: null })).toBe('Mora CC won')
  expect(describeResult({ outcome: 'lost', margin: 3, marginType: null })).toBe('Mora CC lost')
})
it.each([['tie', 'Match tied'], ['draw', 'Match drawn'], ['no result', 'No result'], [null, null]] as const)('handles %s', (outcome, text) => {
  expect(describeResult({ outcome, margin: null, marginType: null })).toBe(text)
})
