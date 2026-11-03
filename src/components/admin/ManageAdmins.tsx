'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@heroui/react'
import type { AdminAccountRow } from '@/lib/queries/admins'
import { SectionCard } from '@/components/ui/SectionCard'
import { Banner } from '@/components/ui/Banner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { mutateJson } from '@/lib/ui/request'
import { formatDate } from '@/lib/ui/dates'

export function ManageAdmins({ admins }: { admins: AdminAccountRow[] }) {
  const router = useRouter()
  const superadmins = admins.filter((account) => account.role === 'superadmin')
  const regularAdmins = admins.filter((account) => account.role === 'admin')
  const [form, setForm] = useState({ username: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [removing, setRemoving] = useState<AdminAccountRow | null>(null)
  async function create(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    try {
      await mutateJson('/api/admins', 'POST', form)
      setForm({ username: '', password: '' }); setNotice('Admin account created. They can sign in with the username and password you set.')
      router.refresh()
    } catch (error) { setError((error as Error).message) } finally { setBusy(false) }
  }
  async function remove() {
    if (!removing) return
    setBusy(true); setError(''); setNotice('')
    try {
      await mutateJson('/api/admins', 'DELETE', { id: removing.id })
      setRemoving(null); setNotice('Admin account removed and its sessions signed out.'); router.refresh()
    } catch (error) { setError((error as Error).message) } finally { setBusy(false) }
  }
  return <div className="space-y-5">
    {error && <Banner tone="error">{error}</Banner>}
    {notice && <p role="status" className="text-sm text-win">{notice}</p>}
    <SectionCard title="Create admin" subtitle="Admins can manage cricket records and seasons. Only the superadmin can manage admin accounts.">
      <form onSubmit={create} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Username<input className="ui-field mt-2" required minLength={3} maxLength={50} autoComplete="off" autoCapitalize="none" spellCheck={false} value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></label>
          <label className="text-sm">Password<input className="ui-field mt-2" type="password" required minLength={8} maxLength={72} autoComplete="new-password" aria-describedby="admin-password-help" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><span id="admin-password-help" className="mt-2 block text-xs text-text-secondary">At least 8 characters. Share it privately with the new admin.</span></label>
        </div>
        <Button type="submit" isDisabled={busy}>Create admin</Button>
      </form>
    </SectionCard>
    {superadmins.length > 0 && <SectionCard title="Superadmin" subtitle="Oversees the whole system and manages admin accounts. This account is protected.">
      <ul className="divide-y divide-separator">{superadmins.map((account) => <li key={account.id} className="py-4 first:pt-0 last:pb-0">
        <h3 className="break-words font-semibold">{account.username}</h3>
        <p className="mt-1 text-xs text-text-secondary">Superadmin · Protected account</p>
      </li>)}</ul>
    </SectionCard>}
    <SectionCard title="Admin accounts" subtitle="Admins can manage cricket records and seasons, but cannot manage other accounts.">
      {regularAdmins.length === 0 ? <p className="text-sm text-text-secondary">No admins yet. Create an admin using the form above.</p> : <ul className="divide-y divide-separator">{regularAdmins.map((admin) => <li key={admin.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0"><h3 className="break-words font-semibold">{admin.username}</h3><p className="mt-1 text-xs text-text-secondary">Admin · Added {formatDate(admin.createdAt, 'short')}</p></div>
        <Button variant="danger-soft" isDisabled={busy} onPress={() => { setError(''); setRemoving(admin) }}>Remove admin</Button>
      </li>)}</ul>
      }
    </SectionCard>
    <ConfirmDialog open={!!removing} title="Remove this admin?" confirmLabel="Remove admin" danger busy={busy} onClose={() => setRemoving(null)} onConfirm={remove}>
      <p>Remove {removing?.username}? They will be signed out and will no longer be able to manage the site. Cricket records will remain.</p>
      {error && <p role="alert" className="mt-3 text-danger">{error}</p>}
    </ConfirmDialog>
  </div>
}
