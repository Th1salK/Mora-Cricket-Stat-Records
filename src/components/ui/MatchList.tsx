import Link from 'next/link'
import type { MatchListRow } from '@/lib/queries/matchRows'
import { MatchTypeBadge } from '@/components/ui/MatchTypeBadge'
import { ResultBadge } from '@/components/ui/ResultBadge'
import { ChevronRight } from '@/components/ui/icons'
import { matchDateParts } from '@/lib/ui/dates'
import { DateBlock } from '@/components/ui/DateBlock'
export function matchScore(innings: MatchListRow['mora']) { return innings ? `${innings.runs}/${innings.wickets}` : '–' }
export function MatchList({ rows }: { rows: MatchListRow[] }) {
  return <><div className="hidden overflow-x-auto md:block"><table className="data-table"><thead><tr>{['Date', 'Match', 'Format', 'Overs', 'Mora', 'Opposition', 'Result', ''].map((s) => <th scope="col" key={s}>{s}</th>)}</tr></thead>
    <tbody>{rows.map((row) => <tr key={row.id} className="group relative hover:bg-brand-row"><td className="whitespace-nowrap"><span className="flex items-center gap-2"><DateBlock date={row.date} /><span className="hidden text-xs text-text-secondary lg:inline">{matchDateParts(row.date).weekday}</span></span></td><td><Link className="font-semibold after:absolute after:inset-0" href={`/matches/${row.id}`}>vs {row.opponent}</Link><p className="text-xs text-text-secondary">{row.venueName ?? row.venue}</p></td><td><MatchTypeBadge matchType={row.matchType} /></td><td>{row.overs}</td><td className="font-semibold">{matchScore(row.mora)}</td><td>{matchScore(row.opposition)}</td><td><ResultBadge outcome={row.outcome} internal={row.isInternal} /></td><td><ChevronRight /></td></tr>)}</tbody></table></div>
    <div className="space-y-4 md:hidden">{rows.map((row) => <Link href={`/matches/${row.id}`} key={row.id} className="block rounded-[14px] border border-separator bg-surface p-4 hover:bg-brand-row"><div className="flex items-center gap-3"><DateBlock date={row.date} /><div className="min-w-0 flex-1"><p className="mb-1 truncate font-semibold">vs {row.opponent}</p><MatchTypeBadge matchType={row.matchType} /></div><ResultBadge outcome={row.outcome} internal={row.isInternal} /></div><div className="mt-3 flex justify-between rounded-[10px] bg-surface-secondary p-3 text-sm"><strong>Mora {matchScore(row.mora)}</strong><span className="flex items-center gap-2 text-text-secondary">Opp {matchScore(row.opposition)}<ChevronRight /></span></div></Link>)}</div></>
}
