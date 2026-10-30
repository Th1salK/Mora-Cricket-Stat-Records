import { fmtNumber } from '@/lib/stats/format'

// Add grouping to the existing integer formatter without changing the stats API.
export function formatCount(value: number | null): string {
  return fmtNumber(value, 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
