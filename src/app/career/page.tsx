import { permanentRedirect } from 'next/navigation'
import { scalar, type PageParams } from '@/lib/ui/url'
export default async function Career({ searchParams }: { searchParams: Promise<PageParams> }) {
  const season = scalar((await searchParams).season)
  permanentRedirect('/records' + (season ? '?season=' + encodeURIComponent(season) : ''))
}
