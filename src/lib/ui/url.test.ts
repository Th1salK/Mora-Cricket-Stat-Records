import { expect, it } from 'vitest'
import { pageHref } from '@/lib/ui/url'
it('preserves filters while replacing and removing parameters', () => {
  expect(pageHref('/matches', { season: 'all', q: ['Mora'], page: '2' }, { page: null, sort: 'oldest' })).toBe('/matches?season=all&q=Mora&sort=oldest')
})
