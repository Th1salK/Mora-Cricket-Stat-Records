'use client'
import { Chip } from '@heroui/react'
import { roleColors, type PlayerRole } from '@/lib/ui/formatColors'

export function RoleChip({ role }: { role: PlayerRole }) {
  return <Chip size="sm" variant="tertiary" className="h-6 gap-1.5 rounded-full bg-surface-secondary px-2.5 text-xs text-foreground">
    <span aria-hidden="true" className="size-1.5 rounded-full" style={{ backgroundColor: roleColors[role] }} />
    <Chip.Label>{role}</Chip.Label>
  </Chip>
}
