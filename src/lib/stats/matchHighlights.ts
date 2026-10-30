import { compareFigures } from '@/lib/stats/bowling'
export function runRate(runs: number, balls: number) { return balls === 0 ? null : Math.round(runs / balls * 600) / 100 }
export function matchHighlights<B extends { runs: number; sixes: number; dismissal?: { type?: string } | null }, W extends { wickets: number; runs: number }>(batting: B[], bowling: W[]) {
  const bat = batting.filter((row) => row.dismissal?.type !== 'did not bat')
  return { topScorer: [...bat].sort((a, b) => b.runs - a.runs)[0] ?? null,
    bestBowling: [...bowling].sort(compareFigures)[0] ?? null, mostSixes: [...bat].sort((a, b) => b.sixes - a.sixes)[0] ?? null }
}
