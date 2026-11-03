import { describe, expect, it } from 'vitest'
import { createAdminSchema, deleteAdminSchema, isSuperadminRole } from '@/lib/adminAccounts'

describe('admin account rules', () => {
  it.each([undefined, null, 'admin', 'Superadmin', 'thisal36', {}, true])('does not grant superadmin access for %j', (role) => {
    expect(isSuperadminRole(role)).toBe(false)
  })
  it('grants account-management access only for the stored superadmin role', () => {
    expect(isSuperadminRole('superadmin')).toBe(true)
  })
  it('normalises usernames while preserving the password exactly', () => {
    expect(createAdminSchema.parse({ username: ' New.Admin ', password: ' password ' })).toEqual({ username: 'new.admin', password: ' password ' })
  })
  it.each([
    { username: 'ab', password: 'password' }, { username: 'a b', password: 'password' },
    { username: 'a'.repeat(51), password: 'password' }, { username: 'admin', password: 'short' },
    { username: 'admin', password: 'a'.repeat(73) }, { username: 'admin', password: 'é'.repeat(37) },
    { username: 'admin', password: 'password', role: 'superadmin' },
    { username: 'admin', password: 'password', passwordHash: 'injected' },
  ])('rejects invalid input and injected account fields %j', (input) => {
    expect(createAdminSchema.safeParse(input).success).toBe(false)
  })
  it('accepts the bcrypt byte limit and validates deletion IDs', () => {
    expect(createAdminSchema.safeParse({ username: 'admin', password: 'a'.repeat(72) }).success).toBe(true)
    expect(deleteAdminSchema.safeParse({ id: '507f1f77bcf86cd799439011' }).success).toBe(true)
    expect(deleteAdminSchema.safeParse({ id: 'bad' }).success).toBe(false)
  })
})
