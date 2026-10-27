// Null values stay last in both directions. Real zero values are sortable numbers.
export function compareNullable(a: number | null, b: number | null, direction: 'asc' | 'desc' = 'asc'): number {
  if (a === null) return b === null ? 0 : 1
  if (b === null) return -1
  return direction === 'asc' ? a - b : b - a
}
