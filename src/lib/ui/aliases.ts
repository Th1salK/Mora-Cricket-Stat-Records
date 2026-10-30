export function normalizeAliases(values: string[]) {
  const seen = new Set<string>()
  return values.map((s) => s.trim()).filter((s) => { const key = s.toLocaleLowerCase('en'); if (!s || seen.has(key)) return false; seen.add(key); return true })
}
