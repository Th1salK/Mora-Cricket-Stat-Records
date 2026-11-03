import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ManageAdmins } from '@/components/admin/ManageAdmins'
import type { AdminAccountRow } from '@/lib/queries/admins'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

const owner: AdminAccountRow = { id: 'owner', username: 'thisal36', role: 'superadmin', createdAt: '2026-01-01T00:00:00.000Z' }
const admin: AdminAccountRow = { id: 'admin', username: 'team-admin', role: 'admin', createdAt: '2026-01-01T00:00:00.000Z' }

describe('account role display', () => {
  it('lists the superadmin separately and never offers to remove that account', () => {
    const html = renderToStaticMarkup(createElement(ManageAdmins, { admins: [owner] }))
    expect(html).toContain('Superadmin · Protected account')
    expect(html.match(/thisal36/g)).toHaveLength(1)
    expect(html.slice(html.indexOf('Admin accounts'))).not.toContain('thisal36')
    expect(html).toContain('No admins yet.')
    expect(html).not.toContain('Remove admin</button>')
  })

  it('keeps regular admins in the removable admin list', () => {
    const html = renderToStaticMarkup(createElement(ManageAdmins, { admins: [owner, admin] }))
    const adminSection = html.slice(html.indexOf('Admin accounts'))
    expect(adminSection).toContain('team-admin')
    expect(adminSection).not.toContain('thisal36')
    expect(adminSection).toContain('Remove admin</button>')
    expect(html).not.toContain('No admins yet.')
  })
})
