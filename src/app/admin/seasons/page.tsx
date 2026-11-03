import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import { listSeasonsWithCounts } from '@/lib/seasonsServer'
import { PageHeader } from '@/components/ui/PageHeader'
import { ManageSeasons } from '@/components/admin/ManageSeasons'

export default async function SeasonsPage() {
  if (!(await isAdmin())) redirect('/login')
  const seasons = await listSeasonsWithCounts()
  return <div className="space-y-5">
    <PageHeader eyebrow="Admin" title="Manage seasons" subtitle="Create seasons, choose the current season, and close completed seasons." />
    <ManageSeasons seasons={seasons} />
  </div>
}
