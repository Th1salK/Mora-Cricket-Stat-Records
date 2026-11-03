'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@heroui/react'
import type { listSeasonsWithCounts } from '@/lib/seasonsServer'
import { SectionCard } from '@/components/ui/SectionCard'
import { Banner } from '@/components/ui/Banner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatDate } from '@/lib/ui/dates'
import { formatCount } from '@/lib/ui/numbers'
import { mutateJson } from '@/lib/ui/request'

type Season = Awaited<ReturnType<typeof listSeasonsWithCounts>>[number]
export function ManageSeasons({ seasons }: { seasons: Season[] }) {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', makeCurrent: false })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [ending, setEnding] = useState<Season | null>(null)
  async function create(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    try {
      await mutateJson('/api/seasons', 'POST', form)
      setForm({ name: '', startDate: '', endDate: '', makeCurrent: false })
      setNotice('Season added. Choose it when adding matches.'); router.refresh()
    } catch (error) { setError((error as Error).message) } finally { setBusy(false) }
  }
  async function change(id: string, action: 'set-current' | 'end') {
    setBusy(true); setError(''); setNotice('')
    try {
      await mutateJson('/api/seasons', 'PUT', { id, action })
      setEnding(null); setNotice(action === 'end' ? 'Season ended. No additional matches can be added to it.' : 'Current season updated.')
      router.refresh()
    } catch (error) { setError((error as Error).message) } finally { setBusy(false) }
  }
  return <div className="space-y-5">
    {error && <Banner tone="error">{error}</Banner>}
    {notice && <p role="status" className="text-sm text-win">{notice}</p>}
    <SectionCard title="Add season" subtitle="Dates describe the season. You choose which matches belong to it.">
      <form onSubmit={create} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm">Season name<input required maxLength={40} placeholder="2027" className="ui-field mt-2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label className="text-sm">Start date<input required type="date" className="ui-field mt-2" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></label>
          <label className="text-sm">End date<input required type="date" className="ui-field mt-2" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} /></label>
        </div>
        <label className="flex min-h-10 items-center gap-3 text-sm"><input type="checkbox" checked={form.makeCurrent} onChange={(event) => setForm({ ...form, makeCurrent: event.target.checked })} />Set as current season</label>
        <Button type="submit" isDisabled={busy}>Add season</Button>
      </form>
    </SectionCard>
    <SectionCard title="Seasons" subtitle="Ended seasons remain available for viewing. Existing scorecards can still be corrected.">
      {seasons.length ? <ul className="divide-y divide-separator">{seasons.map((season) => <li key={season.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0"><h3 className="break-words font-semibold">{season.name} Season <span className={season.endedAt ? 'text-xs font-normal text-text-secondary' : 'text-xs font-normal text-brand-hover'}>{season.endedAt ? 'Ended' : season.isCurrent ? 'Current' : 'Open'}</span></h3>
          <p className="mt-1 text-xs text-text-secondary">{formatDate(season.startDate, 'short')} – {formatDate(season.endDate, 'short')} · {formatCount(season.matchCount)} matches</p>
          {season.endedAt && <p className="mt-1 text-xs text-text-secondary">Ended {formatDate(season.endedAt, 'short')}</p>}
        </div>
        {!season.endedAt && <div className="flex shrink-0 flex-wrap gap-2">
          {!season.isCurrent && <Button variant="secondary" isDisabled={busy} onPress={() => change(season.id, 'set-current')}>Set current</Button>}
          <Button variant="outline" isDisabled={busy} onPress={() => { setError(''); setEnding(season) }}>End season</Button>
        </div>}
      </li>)}</ul> : <p className="text-sm text-text-secondary">No seasons yet. Add one to start recording matches.</p>}
    </SectionCard>
    <ConfirmDialog open={!!ending} title="End this season?" confirmLabel="End season" busy={busy} onClose={() => setEnding(null)} onConfirm={async () => { if (ending) await change(ending.id, 'end') }}>
      <p>End {ending?.name} Season? No additional matches can be added or moved into it. Existing matches and statistics will remain available. This cannot be undone here.</p>
      {error && <p role="alert" className="mt-3 text-danger">{error}</p>}
    </ConfirmDialog>
  </div>
}
