import { LeaderboardPage } from '@/components/ui/LeaderboardPage'
import type { PageParams } from '@/lib/ui/url'
export default async function Page({ searchParams }: { searchParams: Promise<PageParams> }) { return <LeaderboardPage kind="batting" params={await searchParams} /> }
