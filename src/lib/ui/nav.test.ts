import { describe, expect, it } from 'vitest'
import { isActive, mobileTabs, navGroups, tabActive } from '@/lib/ui/nav'

describe('shell navigation', () => {
  it('only includes existing public routes and maps Records to records', () => {
    expect(navGroups(false).map((group) => group.label)).toEqual(['Overview', 'Statistics'])
    expect(navGroups(false).flatMap((group) => group.items.map((item) => item.href)))
      .toEqual(['/', '/matches', '/players', '/stats/batting', '/stats/bowling', '/records'])
  })
  it('shows the four built admin routes only to admins', () => {
    expect(navGroups(true)[2].items.map((item) => item.href)).toEqual(['/admin/import', '/admin/drafts', '/admin/matches', '/admin/players'])
    expect(navGroups(false).some((group) => group.label === 'Admin')).toBe(false)
  })
  it.each([
    ['/', '/', true], ['/players', '/', false], ['/players', '/players', true],
    ['/players/123', '/players', true], ['/playersX', '/players', false],
    ['/stats/bowling', '/stats/batting', false], ['/stats/batting', '/stats/batting', true],
    ['/admin/import/123', '/admin/import', true], ['/matchesX', '/matches', false],
  ])('matches %s against %s as %s', (path, href, expected) => {
    expect(isActive(path, href)).toBe(expected)
  })
  it('keeps the Stats tab active for every stats sub-route', () => {
    expect(tabActive('/stats/bowling', '/stats/batting')).toBe(true)
    expect(tabActive('/stats/batting', '/stats/batting')).toBe(true)
    expect(tabActive('/statsX/bowling', '/stats/batting')).toBe(false)
    expect(tabActive('/players/123', '/players')).toBe(true)
    expect(mobileTabs.map((tab) => tab.label)).toEqual(['Home', 'Matches', 'Players', 'Stats', 'Records'])
  })
})
