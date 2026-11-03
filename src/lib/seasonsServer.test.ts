import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ClientSession } from 'mongoose'
const mock = vi.hoisted(() => ({ update: vi.fn(), find: vi.fn() }))
vi.mock('@/lib/mongodb', () => ({ connectDB: vi.fn() }))
vi.mock('@/models/Season', () => ({ default: { findOneAndUpdate: mock.update, findOne: mock.find } }))
vi.mock('@/models/Match', () => ({ default: {} }))
import { admitSeason, getCurrentSeason } from '@/lib/seasonsServer'
const id = '507f1f77bcf86cd799439011', other = '507f1f77bcf86cd799439012'
const session = {} as ClientSession
beforeEach(() => { vi.clearAllMocks() })
describe('season admission', () => {
  it('requires an explicit ID and never derives a season from a date', async () => {
    await expect(admitSeason(undefined, session)).rejects.toThrow('Choose a season')
    await expect(admitSeason('2026-03-01', session)).rejects.toThrow('Choose a season')
    expect(mock.update).not.toHaveBeenCalled()
  })
  it('admits new matches only to open seasons and locks the season in the same transaction', async () => {
    mock.update.mockResolvedValue({ _id: id })
    expect(await admitSeason(id, session)).toBe(id)
    expect(mock.update).toHaveBeenCalledWith({ _id: id, endedAt: null }, { $inc: { writeVersion: 1 } }, { returnDocument: 'after', session })
  })
  it('rejects missing or ended targets, including reassignment from another season', async () => {
    mock.update.mockResolvedValue(null)
    await expect(admitSeason(id, session, other)).rejects.toThrow('ended or no longer exists')
    expect(mock.update.mock.calls[0][0]).toEqual({ _id: id, endedAt: null })
  })
  it('allows corrections to an existing match in its ended season without adding membership', async () => {
    mock.update.mockResolvedValue({ _id: id })
    expect(await admitSeason(id, session, id)).toBe(id)
    expect(mock.update.mock.calls[0][0]).toEqual({ _id: id })
  })
})
it('never picks the current season from dates or match counts', async () => {
  mock.find.mockReturnValue({ select: () => ({ lean: async () => null }) })
  expect(await getCurrentSeason()).toBeNull()
  expect(mock.find).toHaveBeenCalledWith({ isCurrent: true, endedAt: null })
})
