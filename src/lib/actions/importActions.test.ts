import { beforeEach, expect, it, vi } from 'vitest'
const mock = vi.hoisted(() => ({ events: [] as string[], session: {} as Record<string, unknown>, published: false, duplicate: false, exists: true, query: {} as Record<string, unknown>, createDraft: vi.fn() }))
vi.mock('@/lib/auth', () => ({ getCurrentUser: vi.fn(async () => ({ _id: 'admin' })) }))
vi.mock('@/lib/mongodb', () => ({ connectDB: vi.fn() }))
vi.mock('@/lib/seasonsServer', () => ({ admitSeason: vi.fn(async () => 'season') }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/headers', () => ({ headers: vi.fn(async () => new Headers()) }))
vi.mock('@/lib/rateLimit', () => ({ checkApiRateLimit: vi.fn(async () => true) }))
vi.mock('@/lib/import/extract', () => ({ ExtractionError: class extends Error {}, extractScorecard: vi.fn() }))
vi.mock('@/lib/import/publish', () => ({ buildPublishPayload: () => ({ problems: [], payload: { match: { date: '2026-03-14', opponent: 'X' }, batting: [], bowling: [], aliases: [] } }) }))
vi.mock('@/models/Player', () => ({ default: { find: () => ({ select: () => ({ lean: async () => [] }) }) } }))
vi.mock('@/models/ImportDraft', () => ({ default: {
  create: mock.createDraft,
  findById: async () => ({ status: mock.published ? 'published' : 'draft', matchDetails: { season: '507f1f77bcf86cd799439013', matchType: 'Div 3', date: '2026-03-14', opponent: 'X', venue: 'Home', overs: 50 }, edited: { innings: [{ side: 'mora', battingTeam: 'Mora', total: { runs: 0, wickets: 0, overs: '0.0' }, extras: { byes: 0, legByes: 0, wides: 0, noBalls: 0, penalty: 0 }, batting: [], bowling: [], didNotBat: [] }], unreadable: [] } }),
  updateOne: async (_query: unknown, _update: unknown, options: { session: unknown }) => { expect(options.session).toBe(mock.session); mock.events.push('mark published'); return { modifiedCount: 1 } },
} }))
vi.mock('@/models/Match', () => ({ default: {
  findOne: (query: Record<string, unknown>) => { mock.query = query; return { select: () => ({ lean: async () => mock.duplicate ? { _id: 'other' } : null }) } },
  findById: () => ({ session: async (session: unknown) => { expect(session).toBe(mock.session); return mock.exists ? { _id: 'old', season: '507f1f77bcf86cd799439013' } : null } }),
  deleteOne: async (_query: unknown, options: { session: unknown }) => { expect(options.session).toBe(mock.session); mock.events.push('delete match') },
  create: async (_rows: unknown, options: { session: unknown }) => { expect(options.session).toBe(mock.session); mock.events.push('create replacement'); return [{ _id: 'new' }] },
} }))
vi.mock('@/models/BattingPerformance', () => ({ default: { deleteMany: async (_query: unknown, options: { session: unknown }) => { expect(options.session).toBe(mock.session); mock.events.push('delete batting') } } }))
vi.mock('@/models/BowlingPerformance', () => ({ default: { deleteMany: async (_query: unknown, options: { session: unknown }) => { expect(options.session).toBe(mock.session); mock.events.push('delete bowling') } } }))
import mongoose from 'mongoose'
import { createManualDraftAction, publishAction } from '@/lib/actions/importActions'
import { getCurrentUser } from '@/lib/auth'
import { checkApiRateLimit } from '@/lib/rateLimit'
import { extractScorecard } from '@/lib/import/extract'
import { parseSlcPdf } from '@/lib/import/parseSlcPdf'
import { buildDraft } from '@/lib/import/draft'
import pdfFixture from '@/lib/import/fixtures/slc-scorecard.json'
const id = '507f1f77bcf86cd799439011', old = '507f1f77bcf86cd799439012'
beforeEach(() => {
  mock.createDraft.mockReset().mockResolvedValue({ _id: id })
  vi.restoreAllMocks(); mock.events = []; mock.published = false; mock.duplicate = false; mock.exists = true; mock.query = {}
  mock.session = { withTransaction: async (work: () => Promise<void>) => { mock.events.push('begin'); await work(); mock.events.push('commit') }, endSession: vi.fn() }
  vi.spyOn(mongoose, 'startSession').mockResolvedValue(mock.session as unknown as mongoose.ClientSession)
})

it('saves a Mora-only PDF draft through the existing action without any AI request', async () => {
  const draft = { ...buildDraft(parseSlcPdf(pdfFixture), [], 'Old Joes S C'), moraOnly: true as const }
  const details = { season: '507f1f77bcf86cd799439013', matchType: 'Div 3' as const, date: '2026-06-07', opponent: 'Old Joes S C', venue: 'Away' as const, overs: 50 }
  expect(await createManualDraftAction(details, draft)).toEqual({ ok: true, draftId: id })
  expect(mock.createDraft).toHaveBeenCalledWith(expect.objectContaining({ modelUsed: null, edited: expect.objectContaining({ moraOnly: true }), createdBy: 'admin' }))
  const saved = mock.createDraft.mock.calls[0][0]
  expect(saved.edited.innings[0].bowling).toEqual([])
  expect(saved.edited.innings[1].batting).toEqual([])
  expect(extractScorecard).not.toHaveBeenCalled()
})

it('does not create a PDF draft for signed-out or rate-limited requests', async () => {
  const draft = { ...buildDraft(parseSlcPdf(pdfFixture), [], 'Old Joes S C'), moraOnly: true as const }
  const details = { matchType: 'Div 3' as const, date: '2026-06-07', opponent: 'Old Joes S C', venue: 'Away' as const, overs: 50 }
  vi.mocked(getCurrentUser).mockResolvedValueOnce(null)
  expect(await createManualDraftAction(details, draft)).toEqual({ ok: false, error: 'Not authorised' })
  vi.mocked(checkApiRateLimit).mockResolvedValueOnce(false)
  expect(await createManualDraftAction(details, draft)).toEqual({ ok: false, error: 'Too many requests. Try again later.' })
  expect(mock.createDraft).not.toHaveBeenCalled()
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

// Lifecycle failures must happen before old scorecards are removed.
it('keeps the original scorecard when its requested season rejects admission', async () => {
  const { admitSeason } = await import('@/lib/seasonsServer')
  const { SeasonError } = await import('@/lib/seasonValidation')
  vi.mocked(admitSeason).mockRejectedValueOnce(new SeasonError('Season has ended'))
  expect(await publishAction(id, { replaceMatchId: old })).toEqual({ ok: false, error: 'Season has ended' })
  expect(mock.events).toEqual(['begin'])
})
it('checks the selected season inside the publishing transaction', async () => {
  const { admitSeason } = await import('@/lib/seasonsServer')
  await publishAction(id, { replaceMatchId: old })
  expect(admitSeason).toHaveBeenLastCalledWith('507f1f77bcf86cd799439013', mock.session, '507f1f77bcf86cd799439013')
})
