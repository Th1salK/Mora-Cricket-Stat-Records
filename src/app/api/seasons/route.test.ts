import { beforeEach, describe, expect, it, vi } from 'vitest'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
const mock = vi.hoisted(() => ({ denied: false, limited: false, season: null as null | { _id: string; endedAt?: Date | null }, create: vi.fn(), updateMany: vi.fn(), updateOne: vi.fn(), session: {} as Record<string, unknown> }))
vi.mock('@/lib/auth', () => ({ assertCanWrite: async () => mock.denied ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) : null }))
vi.mock('@/lib/rateLimit', () => ({ checkApiRateLimit: async () => !mock.limited, apiLockoutSeconds: async () => 30 }))
vi.mock('@/lib/mongodb', () => ({ connectDB: vi.fn() }))
vi.mock('@/lib/seasonsServer', () => ({ listSeasons: async () => [], getCurrentSeason: async () => null }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/models/Season', () => ({ default: {
  create: mock.create, updateMany: mock.updateMany, updateOne: mock.updateOne,
  findById: () => ({ session: async () => mock.season }),
} }))
import { POST, PUT } from '@/app/api/seasons/route'
const id = '507f1f77bcf86cd799439011'
const request = (body: unknown, method = 'POST') => new Request('http://localhost/api/seasons', { method, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })
beforeEach(() => {
  vi.restoreAllMocks(); mock.create.mockReset(); mock.updateMany.mockReset(); mock.updateOne.mockReset()
  mock.denied = false; mock.limited = false; mock.season = { _id: id, endedAt: null }
  mock.session = { withTransaction: async (work: () => Promise<void>) => { await work() }, endSession: vi.fn() }
  vi.spyOn(mongoose, 'startSession').mockResolvedValue(mock.session as unknown as mongoose.ClientSession)
})
describe('season mutations', () => {
  it('requires authentication before touching seasons', async () => {
    mock.denied = true
    expect((await POST(request({}))).status).toBe(401)
    expect((await PUT(request({ id, action: 'end' }, 'PUT'))).status).toBe(401)
    expect(mock.updateOne).not.toHaveBeenCalled(); expect(mock.create).not.toHaveBeenCalled()
  })
  it('rate limits mutations and rejects invalid input', async () => {
    mock.limited = true
    expect((await POST(request({}))).status).toBe(429)
    mock.limited = false
    expect((await POST(request({ name: '2027', startDate: '2027-02-30', endDate: '2027-12-31' }))).status).toBe(400)
    expect(mock.create).not.toHaveBeenCalled()
  })
  it('creates a manually named season and changes current flags in the same transaction', async () => {
    expect((await POST(request({ name: '2027', startDate: '2027-01-01', endDate: '2027-12-31', makeCurrent: true }))).status).toBe(201)
    expect(mock.updateMany).toHaveBeenCalledWith({ isCurrent: true }, { $set: { isCurrent: false } }, { session: mock.session })
    expect(mock.create.mock.calls[0][0][0]).toMatchObject({ name: '2027', isCurrent: true })
    expect(mock.create.mock.calls[0][1]).toEqual({ session: mock.session })
  })
  it('ends a season without deleting matches and clears its current flag', async () => {
    expect((await PUT(request({ id, action: 'end' }, 'PUT'))).status).toBe(200)
    expect(mock.updateOne).toHaveBeenCalledWith({ _id: id }, { $set: { endedAt: expect.any(Date), isCurrent: false }, $inc: { writeVersion: 1 } }, { session: mock.session })
  })
  it('will not reopen an ended season or make it current', async () => {
    mock.season = { _id: id, endedAt: new Date() }
    expect((await PUT(request({ id, action: 'set-current' }, 'PUT'))).status).toBe(409)
    expect((await PUT(request({ id, action: 'reopen' }, 'PUT'))).status).toBe(400)
    expect(mock.updateOne).not.toHaveBeenCalled()
  })
  it('returns a conflict for duplicate names instead of a generic failure', async () => {
    mock.create.mockRejectedValue(new mongoose.mongo.MongoServerError({ message: 'duplicate', code: 11000 }))
    expect((await POST(request({ name: '2026', startDate: '2026-01-01', endDate: '2026-12-31' }))).status).toBe(409)
  })
})
