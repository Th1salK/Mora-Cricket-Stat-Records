import { beforeEach, describe, expect, it, vi } from 'vitest'

const mock = vi.hoisted(() => ({ user: null as { username: string; role?: string } | null }))
vi.mock('@/lib/auth', () => ({ getCurrentUser: async () => mock.user }))
vi.mock('next/navigation', () => ({ redirect: (path: string) => { throw new Error(`redirect:${path}`) } }))
vi.mock('@/app/login/LoginForm', () => ({ default: () => null }))
vi.mock('@/components/shell/ShellBrand', () => ({ ShellBrand: () => null }))

import LoginPage from '@/app/login/page'

beforeEach(() => { mock.user = null })

describe('login page routing', () => {
  it('takes an existing superadmin session directly to account management', async () => {
    mock.user = { username: 'thisal36', role: 'superadmin' }
    await expect(LoginPage()).rejects.toThrow('redirect:/admin/admins')
  })
  it.each(['admin', undefined])('keeps the dashboard destination for a %s account', async (role) => {
    mock.user = { username: 'team-admin', role }
    await expect(LoginPage()).rejects.toThrow('redirect:/')
  })
  it('shows the login page when signed out', async () => {
    expect((await LoginPage()).type).toBe('div')
  })
})
