'use client'
import { Chip } from '@heroui/react'
import type { MatchTypeValue } from '@/lib/constants'
import { formatColors } from '@/lib/ui/formatColors'
import { cn } from '@/lib/ui/cn'

export function MatchTypeBadge({ matchType, className }: { matchType: MatchTypeValue; className?: string }) {
  const color = formatColors[matchType]
  return <Chip size="sm" variant="tertiary" className={cn('h-6 gap-1.5 rounded-full border bg-transparent px-2.5 text-xs text-foreground', className)}
    style={{ borderColor: `color-mix(in srgb, ${color} 50%, transparent)` }}>
    <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
    <Chip.Label>{matchType}</Chip.Label>
  </Chip>
}
