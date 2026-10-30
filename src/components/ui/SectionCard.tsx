'use client'
import { useId, type ReactNode } from 'react'
import { Card } from '@heroui/react'
import { cn } from '@/lib/ui/cn'

export function SectionCard({ title, subtitle, action, children, className }: {
  title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string
}) {
  const headingId = useId()
  return <Card role="region" aria-labelledby={headingId} className={cn('min-w-0 gap-4 rounded-[14px] border border-separator bg-surface p-4 shadow-none md:p-5', className)}>
    <Card.Header className="flex flex-row items-start justify-between gap-4">
      <div>
        <Card.Title id={headingId} className="text-[17px] leading-6 font-semibold tracking-[-0.005em]">{title}</Card.Title>
        {subtitle && <Card.Description className="mt-1 text-xs leading-4 text-text-secondary">{subtitle}</Card.Description>}
      </div>
      {action}
    </Card.Header>
    <Card.Content className="min-w-0">{children}</Card.Content>
  </Card>
}
