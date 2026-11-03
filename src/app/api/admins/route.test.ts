import { beforeEach, describe, expect, it, vi } from 'vitest'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
const mock = vi.hoisted(() => ({ role: 'superadmin' as string | null, limited: false, target: { _id: '507f1f77bcf86cd799439011', role: 'admin' as string | undefined } as { _id: string; role?: string } | null, created: vi.fn(), deleted: vi.fn(), sessionsDeleted: vi.fn(), hash: vi.fn(), list: vi.fn(), session: {} as Record<string, unknown>, events: [] as string[] }))
vi.mock('@/lib/auth', () => ({
  requireSuperadmin: async () => mock.role === 'superadmin' ? null : NextResponse.json({ error: 'Denied' }, { status: mock.role ? 403 : 401 }),
  assertCanManageAdmins: async () => mock.role === 'superadmin' ? null : NextResponse.json({ error: 'Denied' }, { status: mock.role ? 403 : 401 }),
}))
vi.mock('@/lib/mongodb', () => ({ connectDB: vi.fn() }))
vi.mock('@/lib/rateLimit', () => ({ checkApiRateLimit: async () => !mock.limited, apiLockoutSeconds: async () => 30 }))
vi.mock('@/lib/queries/admins', () => ({ listAdmins: mock.list }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('bcryptjs', () => ({ default: { hash: mock.hash } }))
vi.mock('@/models/User', () => ({ default: {
  create: mock.created, deleteOne: mock.deleted,
  findById: () => ({ select: () => ({ session: async () => mock.target }) }),
} }))
vi.mock('@/models/Session', () => ({ default: { deleteMany: mock.sessionsDeleted } }))
import { GET, POST, DELETE } from '@/app/api/admins/route'
const id = '507f1f77bcf86cd799439011'
const input = { username: ' New.Admin ', password: 'test-password' }
const request = (body: unknown) => new Request('http://localhost/api/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
beforeEach(() => {
  vi.restoreAllMocks(); mock.role = 'superadmin'; mock.limited = false; mock.target = { _id: id, role: 'admin' }; mock.events = []
  mock.created.mockReset().mockImplementation(async (input) => ({ _id: id, ...input }))
  mock.deleted.mockReset().mockImplementation(async () => { mock.events.push('delete user'); return { deletedCount: 1 } })
  mock.sessionsDeleted.mockReset().mockImplementation(async () => { mock.events.push('revoke sessions') })
  mock.hash.mockReset().mockResolvedValue('stored-hash')
  mock.list.mockReset().mockResolvedValue([{ id, username: 'thisal36', role: 'superadmin', createdAt: '2026-01-01' }])
  mock.session = { withTransaction: async (work: () => Promise<void>) => { mock.events.push('begin'); await work(); mock.events.push('commit') }, endSession: vi.fn() }
  vi.spyOn(mongoose, 'startSession').mockResolvedValue(mock.session as unknown as mongoose.ClientSession)
})
describe('superadmin-only account API', () => {
  it.each(['admin', null])('denies list, create and delete to %s', async (role) => {
    mock.role = role
    const status = role ? 403 : 401
    expect((await GET()).status).toBe(status)
    expect((await POST(request(input))).status).toBe(status)
    expect((await DELETE(request({ id }))).status).toBe(status)
    expect(mock.list).not.toHaveBeenCalled(); expect(mock.created).not.toHaveBeenCalled(); expect(mock.deleted).not.toHaveBeenCalled()
  })
  it('creates only regular admins, hashes the password, and returns no credentials', async () => {
    const response = await POST(request(input))
    expect(response.status).toBe(201)
    expect(mock.hash).toHaveBeenCalledWith(input.password, 12)
    expect(mock.created).toHaveBeenCalledWith({ username: 'new.admin', passwordHash: 'stored-hash', role: 'admin' })
    expect(await response.json()).toEqual({ id, username: 'new.admin', role: 'admin' })
  })
  it.each([{ ...input, role: 'superadmin' }, { ...input, passwordHash: 'injected' }, { ...input, password: 'short' }])('rejects invalid fields and privilege injection', async (body) => {
    expect((await POST(request(body))).status).toBe(400)
    expect(mock.created).not.toHaveBeenCalled(); expect(mock.hash).not.toHaveBeenCalled()
  })
  it('rate limits writes before hashing passwords', async () => {
    mock.limited = true
    expect((await POST(request(input))).status).toBe(429)
    expect((await DELETE(request({ id }))).status).toBe(429)
    expect(mock.hash).not.toHaveBeenCalled(); expect(mock.deleted).not.toHaveBeenCalled()
  })
  it('reports duplicate usernames without exposing database details', async () => {
    mock.created.mockRejectedValue(new mongoose.mongo.MongoServerError({ message: 'internal duplicate', code: 11000 }))
    const response = await POST(request(input))
    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({ error: 'That username already exists.' })
  })
  it('protects the superadmin account even from a superadmin deletion request', async () => {
    mock.target = { _id: id, role: 'superadmin' }
    const response = await DELETE(request({ id }))
    expect(response.status).toBe(403)
    expect(mock.deleted).not.toHaveBeenCalled(); expect(mock.sessionsDeleted).not.toHaveBeenCalled()
  })
  it('removes an ordinary account and its sessions in one transaction', async () => {
    expect((await DELETE(request({ id }))).status).toBe(200)
    expect(mock.deleted).toHaveBeenCalledWith({ _id: id, role: { $ne: 'superadmin' } }, { session: mock.session })
    expect(mock.sessionsDeleted).toHaveBeenCalledWith({ userId: id }, { session: mock.session })
    expect(mock.events).toEqual(['begin', 'delete user', 'revoke sessions', 'commit'])
  })
  it('retains protection if an account changes before the conditional deletion', async () => {
    mock.deleted.mockResolvedValue({ deletedCount: 0 })
    expect((await DELETE(request({ id }))).status).toBe(403)
    expect(mock.sessionsDeleted).not.toHaveBeenCalled()
  })
  it('validates IDs and reports missing accounts', async () => {
    expect((await DELETE(request({ id: 'bad' }))).status).toBe(400)
    mock.target = null
    expect((await DELETE(request({ id }))).status).toBe(404)
  })
  it('returns the protected list without shared caching', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect((await response.json()).admins[0].role).toBe('superadmin')
  })
})
