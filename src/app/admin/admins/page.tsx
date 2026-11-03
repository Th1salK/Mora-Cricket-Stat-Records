import { redirect } from 'next/navigation'
import { isAdmin, isSuperadmin } from '@/lib/auth'
import { listAdmins } from '@/lib/queries/admins'
import { PageHeader } from '@/components/ui/PageHeader'
import { ManageAdmins } from '@/components/admin/ManageAdmins'
import { EmptyState } from '@/components/ui/EmptyState'

export default async function AdminsPage() {
  if (!(await isAdmin())) redirect('/login')
  if (!(await isSuperadmin())) return <EmptyState title="Superadmin access required" message="Only the superadmin can create or remove admin accounts. Sign in with your superadmin account to manage admins." />
  const admins = await listAdmins()
  return <div className="space-y-5">
    <PageHeader eyebrow="Superadmin" title="Manage admins" subtitle="Create admin accounts and manage who can update team records." />
    <ManageAdmins admins={admins} />
  </div>
}
