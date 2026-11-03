import { beforeEach, describe, expect, it, vi } from 'vitest'

const mock = vi.hoisted(() => ({ role: 'admin' as string | undefined, passwordOk: true, found: true, limited: false, create: vi.fn(), find: vi.fn(), failure: vi.fn() }))
vi.mock('@/lib/mongodb', () => ({ connectDB: vi.fn() }))
vi.mock('@/models/User', () => ({ default: { findOne: mock.find } }))
vi.mock('@/models/Session', () => ({ default: { create: mock.create } }))
vi.mock('bcryptjs', () => ({ default: { compare: async () => mock.passwordOk } }))
vi.mock('@/lib/auth', () => ({ createSessionToken: () => 'test-token', hashToken: () => 'hashed-token', buildSessionCookieOptions: () => ({ httpOnly: true, path: '/' }), SESSION_MAX_AGE_MS: 60000 }))
vi.mock('@/lib/rateLimit', () => ({ checkLoginRateLimit: async () => !mock.limited, recordLoginFailure: mock.failure, clearLoginRateLimit: vi.fn(), loginLockoutSeconds: async () => 30 }))

import { POST } from '@/app/api/auth/login/route'

const request = (extra = {}) => new Request('http://localhost/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: ' Thisal36 ', password: 'test-password', ...extra }) })
beforeEach(() => {
  mock.role = 'admin'; mock.passwordOk = true; mock.found = true; mock.limited = false
  mock.create.mockReset().mockResolvedValue({})
  mock.failure.mockReset()
  mock.find.mockReset().mockImplementation(() => ({ lean: async () => mock.found ? { _id: 'owner', username: 'thisal36', passwordHash: 'stored-hash', role: mock.role } : null }))
})

describe('login roles', () => {
  it.each(['superadmin', 'admin', undefined])('returns the stored role for %s and sets a session cookie', async (role) => {
    mock.role = role
    const response = await POST(request())
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true, username: 'thisal36', role: role ?? 'admin' })
    expect(response.cookies.get('admin_session')?.value).toBe('test-token')
    expect(mock.find).toHaveBeenCalledWith({ username: 'thisal36' })
    expect(mock.create).toHaveBeenCalledOnce()
  })
  it('does not let a submitted role elevate a regular admin', async () => {
    const response = await POST(request({ role: 'superadmin' }))
    expect((await response.json()).role).toBe('admin')
  })
  it.each([false, true])('denies invalid credentials without creating a session (missing user: %s)', async (missing) => {
    mock.found = !missing; mock.passwordOk = false
    expect((await POST(request())).status).toBe(401)
    expect(mock.create).not.toHaveBeenCalled()
    expect(mock.failure).toHaveBeenCalledOnce()
  })
  it('rate limits login before querying accounts', async () => {
    mock.limited = true
    expect((await POST(request())).status).toBe(429)
    expect(mock.find).not.toHaveBeenCalled()
    expect(mock.create).not.toHaveBeenCalled()
  })
})
