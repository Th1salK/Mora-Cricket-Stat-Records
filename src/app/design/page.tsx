import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DesignPreview } from '@/components/ui/DesignPreview'

export const metadata: Metadata = {
  title: 'Design preview | Mora Cricket Stats',
  robots: { index: false, follow: false },
}

export default function DesignPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <DesignPreview />
}
