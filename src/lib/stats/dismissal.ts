import type { DismissalType } from '@/lib/import/parse'
export function formatDismissal(row: { out: boolean; dismissal?: { type: DismissalType; fielder?: string | null; bowler?: string | null } | null }) {
  const d = row.dismissal
  if (!d) return row.out ? 'out' : 'not out'
  const b = d.bowler ? ` b ${d.bowler}` : '', f = d.fielder
  switch (d.type) {
    case 'bowled': return d.bowler ? `b ${d.bowler}` : 'bowled'
    case 'caught': return f && d.bowler && f.trim().toLowerCase() === d.bowler.trim().toLowerCase() ? `c & b ${d.bowler}` : `c${f ? ` ${f}` : ''}${b}`
    case 'lbw': return `lbw${b}`
    case 'stumped': return `st${f ? ` ${f}` : ''}${b}`
    case 'run out': return `run out${f ? ` (${f})` : ''}`
    case 'hit wicket': return `hit wicket${b}`
    case 'other': return row.out ? 'out' : 'not out'
    default: return d.type
  }
}
