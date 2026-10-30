import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import { listDrafts } from '@/lib/queries/drafts'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { MatchTypeBadge } from '@/components/ui/MatchTypeBadge'
import { DeleteDraftButton } from '@/components/ui/DeleteDraftButton'
import { Banner } from '@/components/ui/Banner'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/ui/dates'
import { MATCH_TYPES, type MatchTypeValue } from '@/lib/constants'
import { scalar, type PageParams } from '@/lib/ui/url'
export default async function DraftsPage({ searchParams }: { searchParams: Promise<PageParams> }) {
  if (!(await isAdmin())) redirect('/login')
  const all = await listDrafts(), selected = scalar((await searchParams).status) ?? 'All'
  const groups = { All: all, Ready: all.filter((r) => r.status === 'ready'), 'Needs fixes': all.filter((r) => r.status !== 'ready'), Manual: all.filter((r) => r.kind === 'Manual draft') }
  const rows = groups[selected as keyof typeof groups] ?? all
  return <div className="space-y-5"><PageHeader eyebrow="Admin" title="Saved drafts" subtitle="Continue reviewing a scorecard before publishing." actions={<Link href="/admin/import" className="button button--primary">Import match</Link>} /><FilterTabs label="Draft status" options={Object.entries(groups).map(([name, rows]) => ({ label: name, count: rows.length, active: selected === name, href: '/admin/drafts?status=' + encodeURIComponent(name) }))} />{rows.length ? <div className="overflow-x-auto rounded-[14px] bg-surface p-4"><table className="data-table"><thead><tr>{['Match', 'Format', 'Saved', 'Status', 'Expires', 'Actions'].map((s) => <th key={s} scope="col">{s}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><strong>vs {row.opponent}</strong><p className="text-xs text-text-secondary">{row.date ? formatDate(row.date, 'short') : 'Date not set'} · {row.venue ?? 'Venue not set'}</p></td><td>{MATCH_TYPES.includes(row.matchType as MatchTypeValue) ? <MatchTypeBadge matchType={row.matchType as MatchTypeValue} /> : '–'}</td><td>{formatDate(row.savedAt, 'short')}<p className="text-xs text-text-secondary">{row.kind}</p></td><td className={row.status === 'ready' ? 'text-win' : row.status === 'blocking' ? 'text-danger' : 'text-gold'}>{row.status === 'ready' ? 'Ready to publish' : row.status === 'blocking' ? row.count + ' blocking warnings' : row.status === 'check' ? row.count + ' to check' : row.count ? row.count + ' rows without a player' : 'Empty draft'}</td><td className={row.expiresSoon ? 'text-gold' : 'text-text-secondary'}>{formatDate(row.expiresAt, 'short')}</td><td><div className="flex items-center gap-2"><Link className="button button--secondary" href={'/admin/import/' + row.id}>Open</Link><DeleteDraftButton id={row.id} opponent={row.opponent} /></div></td></tr>)}</tbody></table></div> : <EmptyState title="No saved drafts" message="Import a scorecard to start a new draft." />}<Banner>Drafts expire 30 days after their last update. Screenshots are never saved.</Banner></div>
}
