import { expect, it, vi } from 'vitest'
const mock = vi.hoisted(() => ({ select: vi.fn() }))
vi.mock('@/lib/mongodb', () => ({ connectDB: vi.fn() }))
vi.mock('@/models/User', () => ({ default: { find: () => ({ select: mock.select }) } }))
import { listAdmins } from '@/lib/queries/admins'
it('selects only public account details and preserves legacy admin access', async () => {
  mock.select.mockReturnValue({ sort: () => ({ lean: async () => [{ _id: 'user', username: 'legacy', passwordHash: 'must-not-leak', createdAt: new Date('2026-01-01Z') }] }) })
  expect(await listAdmins()).toEqual([{ id: 'user', username: 'legacy', role: 'admin', createdAt: '2026-01-01T00:00:00.000Z' }])
  expect(mock.select).toHaveBeenCalledWith('username role createdAt')
})
