import { beforeEach, describe, expect, it, vi } from 'vitest'
import mongoose from 'mongoose'
const mock = vi.hoisted(() => ({ cookie: true, user: { _id: 'owner', role: undefined as string | undefined }, found: true, expired: false, cookies: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: async () => { mock.cookies(); return { get: () => mock.cookie ? { value: 'session-token' } : undefined } } }))
vi.mock('@/lib/mongodb', () => ({ connectDB: vi.fn() }))
vi.mock('@/models/Session', () => ({ default: { findOne: async () => ({ _id: 'session', userId: 'owner', expiresAt: new Date(Date.now() + (mock.expired ? -1000 : 60000)) }), deleteOne: vi.fn() } }))
vi.mock('@/models/User', () => ({ default: { findById: () => ({ select: () => ({ lean: async () => mock.found ? mock.user : null }) }) } }))
import { assertCanManageAdmins, assertCanWrite, getCurrentUser, isAdmin, isSuperadmin, requireSuperadmin } from '@/lib/auth'
beforeEach(() => { mock.cookie = true; mock.found = true; mock.expired = false; mock.user = { _id: 'owner', role: undefined }; mock.cookies.mockClear() })
describe('admin privilege boundaries', () => {
  it('reads the stored role even when an older cached Mongoose model has no role accessor', async () => {
    const CachedUser = mongoose.models.CachedRoleUser || mongoose.model('CachedRoleUser', new mongoose.Schema({ username: String }))
    const cachedDocument = CachedUser.hydrate({ username: 'thisal36', role: 'superadmin' })
    expect(cachedDocument.role).toBeUndefined()
    mock.user = cachedDocument.toObject() as typeof mock.user
    expect((await getCurrentUser())?.role).toBe('superadmin')
    expect(await isSuperadmin()).toBe(true)
    expect(await assertCanWrite(new Request('http://localhost/api/matches'))).toBeNull()
  })
  it('keeps legacy admin accounts working without granting account management', async () => {
    expect(await isAdmin()).toBe(true)
    expect(await isSuperadmin()).toBe(false)
    expect((await requireSuperadmin())?.status).toBe(403)
    expect(await assertCanWrite(new Request('http://localhost/api/matches'))).toBeNull()
  })
  it('returns 401 to signed-out or deleted accounts', async () => {
    mock.cookie = false
    expect((await requireSuperadmin())?.status).toBe(401)
    mock.cookie = true; mock.found = false
    expect(await isAdmin()).toBe(false)
    expect((await requireSuperadmin())?.status).toBe(401)
  })
  it('reads privileges from the user for each request, including existing sessions', async () => {
    expect(await isSuperadmin()).toBe(false)
    mock.user.role = 'superadmin'
    expect(await isSuperadmin()).toBe(true)
    expect(await requireSuperadmin()).toBeNull()
    mock.user.role = 'admin'
    expect((await requireSuperadmin())?.status).toBe(403)
  })
  it('rejects expired sessions even for a superadmin', async () => {
    mock.user.role = 'superadmin'; mock.expired = true
    expect(await isSuperadmin()).toBe(false)
    expect((await requireSuperadmin())?.status).toBe(401)
  })
  it('blocks cross-origin account mutations before consulting the session', async () => {
    mock.user.role = 'superadmin'
    const request = new Request('http://localhost/api/admins', { headers: { host: 'localhost', origin: 'https://untrusted.example' } })
    expect((await assertCanManageAdmins(request))?.status).toBe(403)
    expect(mock.cookies).not.toHaveBeenCalled()
  })
})
