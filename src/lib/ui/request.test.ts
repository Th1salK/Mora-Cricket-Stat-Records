import { afterEach, expect, it, vi } from 'vitest'
import { mutateJson } from '@/lib/ui/request'
afterEach(() => vi.unstubAllGlobals())
it('surfaces server validation failures', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Mark inactive instead' }) }))
  await expect(mutateJson('/api/players/p', 'DELETE')).rejects.toThrow('Mark inactive instead')
})
