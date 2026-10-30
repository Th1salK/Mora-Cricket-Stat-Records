'use client'
import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { Button } from '@heroui/react'
import { setPlayer, type Draft, type DraftInnings } from '@/lib/import/draft'
import type { PlayerLite } from '@/lib/import/matchPlayers'
export function DraftInningsEditor({ draft, players, onChange }: { draft: Draft; players: PlayerLite[]; onChange: (draft: Draft) => void }) {
  const [tab, setTab] = useState(0)
  const tabId = useId()
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([])

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const count = draft.innings.length
    let next: number
    switch (event.key) {
      case 'ArrowRight': next = (index + 1) % count; break
      case 'ArrowLeft': next = (index + count - 1) % count; break
      case 'Home': next = 0; break
      case 'End': next = count - 1; break
      default: return
    }
    event.preventDefault()
    setTab(next)
    tabButtons.current[next]?.focus()
  }

  const update = (index: number, change: (inn: DraftInnings) => DraftInnings) => onChange({ ...draft, innings: draft.innings.map((inn, i) => i === index ? change(inn) : inn) })
  const playerPicker = (index: number, table: 'batting' | 'bowling', rowIndex: number) => {
    const row = draft.innings[index][table][rowIndex]
    return <div><select aria-label={`Player for ${row.name || 'new row'}`} value={row.playerId ?? ''} className="ui-field" onChange={(e) => onChange(setPlayer(draft, index, table, rowIndex, e.target.value || null))}><option value="">Pick player…</option>{players.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}</select><p className={'mt-1 text-xs ' + (!row.playerId ? 'text-danger' : row.match?.status === 'confirm' ? 'text-gold' : 'text-win')}>{!row.playerId ? 'not linked' : row.match?.status === 'confirm' ? 'check' : 'matched'} · {row.match?.reason ?? 'Selected by you'}</p></div>
  }
  return <div className="space-y-4"><div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Review innings">{draft.innings.map((inn, i) => <button key={i} type="button" ref={(button) => { tabButtons.current[i] = button }} id={`${tabId}-tab-${i}`} role="tab" tabIndex={tab === i ? 0 : -1} onKeyDown={(event) => navigateTabs(event, i)} aria-selected={tab === i} aria-controls={`${tabId}-panel-${i}`} className={'min-h-12 shrink-0 rounded-[12px] px-4 text-sm ' + (tab === i ? 'bg-brand-soft text-brand-hover' : 'bg-surface-secondary')} onClick={() => setTab(i)}>Innings {i + 1} · {inn.battingTeam}</button>)}</div>{draft.innings.map((inn, i) => <section key={i} id={`${tabId}-panel-${i}`} role="tabpanel" tabIndex={0} aria-labelledby={`${tabId}-tab-${i}`} hidden={tab !== i} className="space-y-5 rounded-[14px] border border-separator bg-surface p-4 md:p-5"><h2 className="text-lg font-semibold">{inn.side === 'mora' ? 'Mora batting' : 'Mora bowling'}</h2>
    {(['batting', 'bowling'] as const).map((table) => {
      const editable = table === 'batting' ? inn.side === 'mora' : inn.side === 'opposition'
      if (!editable) return null
      const fields = table === 'batting' ? ['runs', 'balls', 'fours', 'sixes'] as const : ['overs', 'maidens', 'runs', 'wickets', 'wides', 'noBalls'] as const
      return <div key={table} className="space-y-3">{inn[table].map((row, rowIndex) => <div key={rowIndex} className="rounded-[12px] border border-separator p-4"><div className="mb-3 flex items-center justify-between gap-3"><input aria-label="Name as read" value={row.name} className="min-h-10 min-w-0 flex-1 bg-transparent font-semibold" onChange={(e) => update(i, (current) => ({ ...current, [table]: current[table].map((r, n) => n === rowIndex ? { ...r, name: e.target.value } : r) }))} /><Button size="sm" variant="ghost" aria-label={`Remove ${row.name || 'row'}`} onPress={() => update(i, (current) => ({ ...current, [table]: current[table].filter((_, n) => n !== rowIndex) }))}>Remove</Button></div>{'howOut' in row && <label className="mb-3 block text-xs text-text-secondary">Dismissal<input className="ui-field mt-1" value={row.howOut} onChange={(e) => update(i, (current) => ({ ...current, batting: current.batting.map((r, n) => n === rowIndex ? { ...r, howOut: e.target.value } : r) }))} /></label>}<div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-6">{fields.map((field) => <label key={field} className="text-xs text-text-secondary">{field}<input aria-label={`${row.name} ${field}`} className="ui-field mt-1" type={field === 'overs' ? 'text' : 'number'} min={0} value={(row as unknown as Record<string, string | number | null>)[field] ?? ''} onChange={(e) => update(i, (current) => ({ ...current, [table]: current[table].map((r, n) => n === rowIndex ? { ...r, [field]: field === 'overs' ? e.target.value : e.target.value === '' ? null : Number(e.target.value) } : r) }))} /></label>)}</div>{playerPicker(i, table, rowIndex)}</div>)}<Button variant="outline" onPress={() => update(i, (current) => table === 'batting' ? { ...current, batting: [...current.batting, { name: '', howOut: 'not out', runs: 0, balls: 0, fours: 0, sixes: 0, match: null, playerId: null }] } : { ...current, bowling: [...current.bowling, { name: '', overs: '0.0', maidens: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0, match: null, playerId: null }] })}>Add {table === 'batting' ? 'batter' : 'bowler'}</Button></div>
    })}
    {!!inn.didNotBat.length && <p className="text-xs text-text-secondary">Did not bat: {inn.didNotBat.join(', ')}</p>}
    <div className="grid grid-cols-2 gap-3 rounded-[12px] bg-surface-secondary p-3 md:grid-cols-4">{(['byes', 'legByes', 'wides', 'noBalls', 'penalty'] as const).map((field) => <label className="text-xs text-text-secondary" key={field}>{field}<input className="ui-field mt-1" type="number" min={0} value={inn.extras[field] ?? ''} onChange={(e) => update(i, (current) => ({ ...current, extras: { ...current.extras, [field]: e.target.value === '' ? null : Number(e.target.value) } }))} /></label>)}{(['runs', 'wickets', 'overs'] as const).map((field) => <label className="text-xs text-text-secondary" key={field}>Total {field}<input className="ui-field mt-1" type={field === 'overs' ? 'text' : 'number'} min={0} value={inn.total[field] ?? ''} onChange={(e) => update(i, (current) => ({ ...current, total: { ...current.total, [field]: field === 'overs' ? e.target.value : e.target.value === '' ? null : Number(e.target.value) } }))} /></label>)}</div>
    </section>)}</div>
}
