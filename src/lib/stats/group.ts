export function groupBy<T, K>(rows: readonly T[], key: (row: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>()
  for (const row of rows) {
    const value = key(row)
    const group = groups.get(value) ?? []
    group.push(row)
    groups.set(value, group)
  }
  return groups
}
export function summariseGroups<T, K, S>(rows: T[], key: (row: T) => K, summary: (rows: T[]) => S): Map<K, S> {
  return new Map([...groupBy(rows, key)].map(([key, group]) => [key, summary(group)]))
}
