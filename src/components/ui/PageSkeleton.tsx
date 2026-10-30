'use client'
import { Skeleton } from '@heroui/react'
export function PageSkeleton({ kind = 'table' }: { kind?: 'table' | 'cards' | 'profile' }) {
  return <div role="status" aria-label="Loading page" className="space-y-5"><span className="sr-only">Loading…</span><Skeleton className="h-4 w-28 rounded-md" /><Skeleton className="h-12 w-60 rounded-[12px]" /><div className="flex gap-3"><Skeleton className="h-10 w-1/2 rounded-[12px]" /><Skeleton className="h-10 w-36 rounded-[12px]" /></div>{kind === 'table' ? <div className="space-y-3 rounded-[14px] bg-surface p-5">{Array.from({ length: 7 }, (_, i) => <Skeleton key={i} className="h-12 w-full rounded-[10px]" />)}</div> : <div className={'grid gap-4 ' + (kind === 'cards' ? 'grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-2')}>{Array.from({ length: kind === 'cards' ? 8 : 4 }, (_, i) => <Skeleton key={i} className="h-56 rounded-[14px]" />)}</div>}</div>
}
