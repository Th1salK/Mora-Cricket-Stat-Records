import { expect, it } from 'vitest'
import { toCsv } from '@/lib/ui/csv'
it('escapes commas, quotes, newlines and null cells', () => {
  expect(toCsv(['a,b', 'a"b', 'a\nb', null], [{ label: 'Value', value: (x) => x }])).toBe('Value\r\n"a,b"\r\n"a""b"\r\n"a\nb"\r\n')
})
