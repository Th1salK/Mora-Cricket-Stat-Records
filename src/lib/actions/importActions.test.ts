import { beforeEach, expect, it, vi } from 'vitest'
const mock = vi.hoisted(() => ({ events: [] as string[], session: {} as Record<string, unknown>, published: false, duplicate: false, exists: true, query: {} as Record<string, unknown> }))
vi.mock('@/lib/auth', () => ({ getCurrentUser: vi.fn(async () => ({ _id: 'admin' })) }))
vi.mock('@/lib/mongodb', () => ({ connectDB: vi.fn() }))
vi.mock('@/lib/seasonsServer', () => ({ ensureSeasonForDate: vi.fn(async () => 'season') }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/headers', () => ({ headers: vi.fn(async () => new Headers()) }))
vi.mock('@/lib/rateLimit', () => ({ checkApiRateLimit: vi.fn(async () => true) }))
vi.mock('@/lib/import/extract', () => ({ ExtractionError: class extends Error {}, extractScorecard: vi.fn() }))
vi.mock('@/lib/import/publish', () => ({ buildPublishPayload: () => ({ problems: [], payload: { match: { date: '2026-03-14', opponent: 'X' }, batting: [], bowling: [], aliases: [] } }) }))
vi.mock('@/models/Player', () => ({ default: { find: () => ({ select: () => ({ lean: async () => [] }) }) } }))
vi.mock('@/models/ImportDraft', () => ({ default: {
  findById: async () => ({ status: mock.published ? 'published' : 'draft', matchDetails: { matchType: 'Div 3', date: '2026-03-14', opponent: 'X', venue: 'Home', overs: 50 }, edited: { innings: [{ side: 'mora', battingTeam: 'Mora', total: { runs: 0, wickets: 0, overs: '0.0' }, extras: { byes: 0, legByes: 0, wides: 0, noBalls: 0, penalty: 0 }, batting: [], bowling: [], didNotBat: [] }], unreadable: [] } }),
  updateOne: async (_query: unknown, _update: unknown, options: { session: unknown }) => { expect(options.session).toBe(mock.session); mock.events.push('mark published'); return { modifiedCount: 1 } },
} }))
vi.mock('@/models/Match', () => ({ default: {
  findOne: (query: Record<string, unknown>) => { mock.query = query; return { select: () => ({ lean: async () => mock.duplicate ? { _id: 'other' } : null }) } },
  findById: () => ({ session: async (session: unknown) => { expect(session).toBe(mock.session); return mock.exists ? { _id: 'old' } : null } }),
  deleteOne: async (_query: unknown, options: { session: unknown }) => { expect(options.session).toBe(mock.session); mock.events.push('delete match') },
  create: async (_rows: unknown, options: { session: unknown }) => { expect(options.session).toBe(mock.session); mock.events.push('create replacement'); return [{ _id: 'new' }] },
} }))
vi.mock('@/models/BattingPerformance', () => ({ default: { deleteMany: async (_query: unknown, options: { session: unknown }) => { expect(options.session).toBe(mock.session); mock.events.push('delete batting') } } }))
vi.mock('@/models/BowlingPerformance', () => ({ default: { deleteMany: async (_query: unknown, options: { session: unknown }) => { expect(options.session).toBe(mock.session); mock.events.push('delete bowling') } } }))
import mongoose from 'mongoose'
import { publishAction } from '@/lib/actions/importActions'
const id = '507f1f77bcf86cd799439011', old = '507f1f77bcf86cd799439012'
beforeEach(() => {
  vi.restoreAllMocks(); mock.events = []; mock.published = false; mock.duplicate = false; mock.exists = true; mock.query = {}
  mock.session = { withTransaction: async (work: () => Promise<void>) => { mock.events.push('begin'); await work(); mock.events.push('commit') }, endSession: vi.fn() }
  vi.spyOn(mongoose, 'startSession').mockResolvedValue(mock.session as unknown as mongoose.ClientSession)
})
it('deletes old performances and saves the replacement in the same transaction', async () => {
  expect(await publishAction(id, { replaceMatchId: old })).toEqual({ ok: true, matchId: 'new' })
  expect(mock.events).toEqual(['begin', 'delete batting', 'delete bowling', 'delete match', 'create replacement', 'mark published', 'commit'])
  expect(mock.query._id).toEqual({ $ne: old })
})
it('still blocks another duplicate and rejects invalid replacement IDs', async () => {
  mock.duplicate = true
  expect((await publishAction(id, { replaceMatchId: old })).ok).toBe(false)
  expect(mock.events).toEqual([])
  expect((await publishAction(id, { replaceMatchId: 'bad' })).ok).toBe(false)
})
it('never deletes anything when a draft was already published', async () => {
  mock.published = true
  expect((await publishAction(id, { replaceMatchId: old })).ok).toBe(false)
  expect(mock.events).toEqual([])
})
