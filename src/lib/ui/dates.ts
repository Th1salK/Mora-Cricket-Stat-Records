export function formatDate(value: Date | string, style: 'long' | 'short' | 'compact' = 'short'): string {
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '–'
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Colombo', day: 'numeric', month: style === 'long' ? 'long' : 'short',
    ...(style === 'long' ? { weekday: 'long' as const } : {}),
    ...(style === 'compact' ? {} : { year: 'numeric' as const }),
  }).format(date)
}

export function matchDateParts(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { day: '–', month: '', weekday: '' }
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Colombo', day: '2-digit', month: 'short', weekday: 'short' }).formatToParts(date)
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return { day: part('day'), month: part('month').toUpperCase(), weekday: part('weekday') }
}
