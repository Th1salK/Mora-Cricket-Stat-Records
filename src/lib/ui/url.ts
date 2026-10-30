export type PageParams = Record<string, string | string[] | undefined>
export function scalar(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value }
export function pageHref(path: string, params: PageParams, changes: Record<string, string | null>) {
  const next = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) { const item = scalar(value); if (item !== undefined) next.set(key, item) }
  for (const [key, value] of Object.entries(changes)) { if (value === null) next.delete(key); else next.set(key, value) }
  return `${path}${next.size ? `?${next}` : ''}`
}
