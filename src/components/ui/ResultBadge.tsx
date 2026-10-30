'use client'
import { Chip } from '@heroui/react'
import { outcomeTones, type Outcome } from '@/lib/ui/formatColors'

const labels: Record<Outcome, string> = { won: 'Won', lost: 'Lost', draw: 'Draw', tie: 'Tie', 'no result': 'No result' }
export function ResultBadge({ outcome, internal = false }: { outcome: Outcome | null; internal?: boolean }) {
  if (internal) return <span className="text-xs text-text-secondary">Internal</span>
  if (outcome === null) return <span className="text-xs text-text-secondary">–</span>
  const tone = outcomeTones[outcome]
  const color = tone === 'muted' ? 'var(--text-secondary)' : `var(--${tone})`
  return <Chip size="sm" variant="soft" className="h-6 rounded-full px-2.5 text-xs"
    style={{ color, backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)` }}>
    <Chip.Label>{labels[outcome]}</Chip.Label>
  </Chip>
}
