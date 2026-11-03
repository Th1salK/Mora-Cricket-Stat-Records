import { describe, expect, it } from 'vitest'
import { seasonInputSchema, seasonIdSchema, seasonChangeSchema } from '@/lib/seasonValidation'
const input = { name: ' 2027 ', startDate: '2027-01-01', endDate: '2027-12-31' }
describe('manual season validation', () => {
  it('trims names without automatically making a new season current', () => {
    expect(seasonInputSchema.parse(input)).toEqual({ ...input, name: '2027', makeCurrent: false })
  })
  it.each([
    { name: '' }, { name: 'x'.repeat(41) }, { startDate: '2027-02-29' },
    { endDate: 'invalid' }, { endDate: '2026-12-31' }, { endDate: '2027-01-01' },
  ])('rejects invalid fields %j', (changes) => {
    expect(seasonInputSchema.safeParse({ ...input, ...changes }).success).toBe(false)
  })
  it('validates leap days and explicit current-season selection', () => {
    expect(seasonInputSchema.safeParse({ ...input, startDate: '2028-02-29', endDate: '2028-12-31', makeCurrent: true }).success).toBe(true)
  })
  it('rejects malformed IDs and unsupported lifecycle actions', () => {
    expect(seasonIdSchema.safeParse('all').success).toBe(false)
    expect(seasonChangeSchema.safeParse({ action: 'reopen' }).success).toBe(false)
  })
})
