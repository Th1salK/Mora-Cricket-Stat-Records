import { expect, it } from 'vitest'
import { normalizeAliases } from '@/lib/ui/aliases'
it('trims, removes blanks and deduplicates case-insensitively', () => { expect(normalizeAliases([' Ali ', 'ALI', '', 'A. B'])).toEqual(['Ali', 'A. B']) })
