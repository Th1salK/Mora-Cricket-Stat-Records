import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Player from '@/models/Player'
import { ManagePlayers } from '@/components/admin/ManagePlayers'
import { PageHeader } from '@/components/ui/PageHeader'
import { UrlSearch, UrlSelect } from '@/components/ui/UrlControls'
import { roleColors } from '@/lib/ui/formatColors'
import { scalar, type PageParams } from '@/lib/ui/url'
export default async function ManagePlayersPage({ searchParams }: { searchParams: Promise<PageParams> }) {
  if (!(await isAdmin())) redirect('/login')
  await connectDB()
  const params = await searchParams, docs = await Player.find().sort({ fullName: 1 }).lean()
  const players = docs.map((p) => ({ id: String(p._id), fullName: p.fullName, shortName: p.shortName, aliases: p.aliases ?? [], role: p.role, isActive: p.isActive, battingStyle: p.battingStyle ?? null, bowlingStyle: p.bowlingStyle ?? null }))
  const q = (scalar(params.q) ?? '').toLowerCase(), role = scalar(params.role) ?? 'All', active = scalar(params.active) ?? 'All'
  const rows = players.filter((p) => [p.fullName, p.shortName, ...p.aliases].some((n) => n.toLowerCase().includes(q)) && (role === 'All' || p.role === role) && (active === 'All' || p.isActive === (active === 'Active')))
  return <div className="space-y-5"><PageHeader eyebrow="Admin" title="Manage players" subtitle={`${players.length} players · ${players.filter((p) => p.isActive).length} active`} /><div className="flex flex-wrap gap-3"><Suspense><UrlSearch placeholder="Search name, short name or alias" /><UrlSelect label="Player role" name="role" value={role} options={['All', ...Object.keys(roleColors)].map((r) => ({ id: r, label: r === 'All' ? 'All roles' : r }))} /><UrlSelect label="Active players" name="active" value={active} options={['All', 'Active', 'Inactive'].map((r) => ({ id: r, label: r }))} /></Suspense></div><ManagePlayers players={rows} /></div>
}
