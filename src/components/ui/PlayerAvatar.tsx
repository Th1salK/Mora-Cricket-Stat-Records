'use client'
import { Avatar } from '@heroui/react'
import { initials } from '@/lib/ui/initials'
import { roleColors, type PlayerRole } from '@/lib/ui/formatColors'
import { cn } from '@/lib/ui/cn'

export function PlayerAvatar({ name, role = 'All-rounder', size = 40, className }: {
  name: string; role?: PlayerRole; size?: 28 | 40 | 56 | 72; className?: string
}) {
  const color = roleColors[role]
  const textColor = role === 'All-rounder' ? 'var(--brand-hover)' : color
  const textSize = { 28: 'text-[10px]', 40: 'text-xs', 56: 'text-lg', 72: 'text-2xl' }[size]
  return <Avatar role="img" aria-label={name.trim() || 'Unknown player'} className={cn('shrink-0 rounded-full', className)}
    style={{ width: size, height: size, color: textColor, backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)` }}>
    <Avatar.Fallback className={cn('font-semibold', textSize)} style={{ color: 'inherit', backgroundColor: 'transparent' }}>{initials(name)}</Avatar.Fallback>
  </Avatar>
}
