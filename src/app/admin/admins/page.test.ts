import { beforeEach, describe, expect, it, vi } from 'vitest'

const mock = vi.hoisted(() => ({ admin: false, superadmin: false, list: vi.fn() }))
vi.mock('@/lib/auth', () => ({ isAdmin: async () => mock.admin, isSuperadmin: async () => mock.superadmin }))
vi.mock('@/lib/queries/admins', () => ({ listAdmins: mock.list }))
vi.mock('next/navigation', () => ({ redirect: (url: string) => { throw new Error(`redirect:${url}`) } }))
vi.mock('@/components/admin/ManageAdmins', () => ({ ManageAdmins: () => null }))
vi.mock('@/components/ui/PageHeader', () => ({ PageHeader: () => null }))
vi.mock('@/components/ui/EmptyState', () => ({ EmptyState: () => null }))

import AdminsPage from '@/app/admin/admins/page'
import { EmptyState } from '@/components/ui/EmptyState'
import { ManageAdmins } from '@/components/admin/ManageAdmins'

beforeEach(() => {
  mock.admin = false; mock.superadmin = false
  mock.list.mockReset().mockResolvedValue([])
})

describe('Manage admins page', () => {
  it('asks signed-out visitors to sign in without loading account data', async () => {
    await expect(AdminsPage()).rejects.toThrow('redirect:/login')
    expect(mock.list).not.toHaveBeenCalled()
  })
  it('explains restricted access to regular admins without loading account data', async () => {
    mock.admin = true
    const page = await AdminsPage()
    expect(page.type).toBe(EmptyState)
    expect(page.props.title).toBe('Superadmin access required')
    expect(mock.list).not.toHaveBeenCalled()
  })
  it('renders account management with real query results for the superadmin', async () => {
    mock.admin = true; mock.superadmin = true
    const accounts = [{ id: 'owner', username: 'thisal36', role: 'superadmin', createdAt: '2026-01-01T00:00:00.000Z' }]
    mock.list.mockResolvedValue(accounts)
    const page = await AdminsPage()
    expect(mock.list).toHaveBeenCalledOnce()
    const manager = page.props.children[1]
    expect(manager.type).toBe(ManageAdmins)
    expect(manager.props.admins).toEqual(accounts)
  })
})
