import Link from 'next/link'
import { Suspense } from 'react'
import { getBattingTable, getBowlingTable, resolveFilter } from '@/lib/queries/stats'
import { MATCH_TYPES } from '@/lib/constants'
import { ResponsiveFilters } from '@/components/ui/ResponsiveFilters'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { LeaderCard } from '@/components/ui/LeaderCard'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'
import { RankBadge } from '@/components/ui/RankBadge'
import { UrlSearch, UrlSelect } from '@/components/ui/UrlControls'
import { ExportCsv } from '@/components/ui/ExportCsv'
import { EmptyState } from '@/components/ui/EmptyState'
import { fmtFigures, fmtNumber, fmtHighScore, fmtOvers } from '@/lib/stats/format'
import { filterLeaderboard, sortLeaderboard } from '@/lib/ui/leaderboard'
import { pageHref, scalar, type PageParams } from '@/lib/ui/url'
import { toCsv } from '@/lib/ui/csv'
export async function LeaderboardPage({ kind, params }: { kind: 'batting' | 'bowling'; params: PageParams }) {
  const bat = kind === 'batting', filter = await resolveFilter({ season: scalar(params.season), matchType: scalar(params.matchType) })
  const source = bat ? await getBattingTable(filter) : await getBowlingTable(filter)
  type Row = typeof source[number]
  const allowed = bat ? [0, 3, 5] : [0, 30, 60], requested = Number(scalar(params.min) ?? 0), minimum = allowed.includes(requested) ? requested : 0
  const filtered = filterLeaderboard<Row>(source, scalar(params.q) ?? '', minimum, kind)
  const defaultSort = bat ? 'runs' : 'wickets', path = '/stats/' + kind
  const columns = bat ? [['matches', 'Mat'], ['innings', 'Inns'], ['notOuts', 'NO'], ['runs', 'Runs'], ['highScore', 'HS'], ['average', 'Avg'], ['strikeRate', 'SR'], ['fifties', '50s'], ['hundreds', '100s'], ['fours', '4s'], ['sixes', '6s'], ['ducks', '0s']] : [['wickets', 'Wkts'], ['economy', 'Econ'], ['average', 'Avg'], ['strikeRate', 'SR'], ['fiveWickets', '5W'], ['wides', 'Wd'], ['noBalls', 'NB'], ['balls', 'Overs'], ['best', 'Best']]
  const requestedSort = scalar(params.sort) ?? defaultSort, sort = requestedSort === 'playerName' || columns.some(([key]) => key === requestedSort) ? requestedSort : defaultSort, dir = scalar(params.dir) === 'asc' ? 'asc' : 'desc'
  const value = (row: Row, key: string) => key in row ? row[key as keyof Row] as number | string | { wickets: number; runs: number } | null : null
  const display = (row: Row, key: string): string => {
    if (key === 'best' && 'best' in row) return fmtFigures(row.best)
    if (key === 'highScore' && 'highScore' in row) return fmtHighScore(row.highScore, row.highScoreNotOut)
    if (key === 'balls' && !bat) return fmtOvers(row.balls)
    const v = value(row, key)
    return typeof v === 'number' || v === null ? fmtNumber(v, ['average', 'economy', 'strikeRate'].includes(key) ? key === 'strikeRate' && bat ? 1 : 2 : 0) : String(v)
  }
  const rows = sortLeaderboard(filtered, (r) => value(r, sort), dir), leaders = sortLeaderboard(filtered, (r) => value(r, defaultSort), 'desc').slice(0, 3)
  const label = filter.seasonName ? filter.seasonName + ' Season' : 'All seasons', href = (changes: Record<string, string | null>) => pageHref(path, params, changes)
  const mini = (r: Row) => bat ? [{ label: 'Avg', value: display(r, 'average') }, { label: 'SR', value: display(r, 'strikeRate') }, { label: 'HS', value: display(r, 'highScore') }] : [{ label: 'Econ', value: display(r, 'economy') }, { label: 'Avg', value: display(r, 'average') }, { label: 'Best', value: display(r, 'best') }]
  return <div className="space-y-5"><PageHeader className="[&>div:last-child]:hidden md:[&>div:last-child]:flex" eyebrow="Statistics" title={kind + ' stats'} subtitle={'Per-player ' + kind + ' performance · ' + label} actions={<ExportCsv name={'mora-' + kind} csv={toCsv(rows, [{ label: 'Player', value: (r) => r.playerName }, ...columns.map(([key, label]) => ({ label, value: (r: Row) => value(r, key) === null ? null : display(r, key) }))])} />} />
    <div className="md:hidden"><FilterTabs label="Statistics discipline" options={['batting', 'bowling'].map((k) => ({ label: k === 'batting' ? 'Batting' : 'Bowling', active: kind === k, href: pageHref('/stats/' + k, params, { min: null, sort: null }) }))} /></div>
    <div className="flex flex-wrap items-center gap-3"><FilterTabs label="Statistics formats" options={['All', ...MATCH_TYPES].map((type) => ({ label: type, active: filter.matchType === type, href: href({ matchType: type }) }))} /><ResponsiveFilters label="Search and qualifiers"><Suspense><UrlSearch placeholder="Search player" /><UrlSelect label="Minimum qualifier" name="min" value={String(minimum)} options={allowed.map((n) => ({ id: String(n), label: n === 0 ? 'All players' : bat ? 'Min. ' + n + ' inns' : 'Min. ' + n / 6 + ' overs' }))} /></Suspense></ResponsiveFilters></div>
    {rows.length ? <><div className="hidden grid-cols-3 gap-5 md:grid">{leaders.map((r, i) => <LeaderCard key={r.playerId} rank={i + 1} name={r.playerName} role={r.role} href={'/players/' + r.playerId + '?season=' + filter.seasonId} value={display(r, defaultSort)} unit={bat ? 'Runs' : 'Wickets'} stats={mini(r)} />)}</div><div className="md:hidden"><p className="mb-2 text-xs text-gold">{bat ? 'Top run scorer' : 'Top wicket taker'}</p>{leaders[0] && <LeaderCard compact rank={1} name={leaders[0].playerName} role={leaders[0].role} href={'/players/' + leaders[0].playerId + '?season=' + filter.seasonId} value={display(leaders[0], defaultSort)} unit={bat ? 'Runs' : 'Wickets'} stats={mini(leaders[0])} />}</div>
    <section className="rounded-[14px] border border-separator bg-surface p-3"><div className="hidden overflow-x-auto md:block"><table className="data-table"><thead><tr><th scope="col">#</th>{[['playerName', 'Player'], ...columns].map(([key, label]) => <th key={key} scope="col" aria-sort={sort === key ? dir === 'asc' ? 'ascending' : 'descending' : 'none'}><Link className="inline-flex min-h-10 items-center gap-1" href={href({ sort: key, dir: sort === key && dir === 'desc' ? 'asc' : 'desc' })}>{label}{sort === key && <span className="text-brand-hover">{dir === 'desc' ? '↓' : '↑'}</span>}</Link></th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={r.playerId}><td><RankBadge rank={i + 1} /></td><td><Link href={'/players/' + r.playerId + '?season=' + filter.seasonId} className="flex items-center gap-2"><PlayerAvatar name={r.playerName} role={r.role} size={28} /><span className="whitespace-nowrap font-semibold">{r.playerName}<span className="block text-xs font-normal text-text-secondary">{r.role}</span></span></Link></td>{columns.map(([key]) => <td key={key} className={'text-right ' + (key === 'runs' ? 'text-teal-bright' : key === 'wickets' ? 'text-ball' : key === 'economy' && 'economy' in r && r.economy !== null ? r.economy < 4 ? 'text-win' : r.economy > 6 ? 'text-loss' : '' : '')}>{display(r, key)}</td>)}</tr>)}</tbody></table></div>
    <div className="flex items-center justify-between bg-surface-secondary p-3 text-xs text-text-secondary md:hidden"><span>Player</span><Link className="min-h-10 py-3 text-brand-hover" href={href({ sort: defaultSort, dir: dir === 'desc' ? 'asc' : 'desc' })}>{bat ? 'Runs' : 'Wickets'} {dir === 'desc' ? '↓' : '↑'}</Link></div><ol className="divide-y divide-separator md:hidden">{rows.filter((r) => !(sort === defaultSort && dir === 'desc' && r.playerId === leaders[0]?.playerId)).map((r) => <li key={r.playerId}><Link href={'/players/' + r.playerId + '?season=' + filter.seasonId} className="flex min-h-20 items-center gap-3 p-2"><RankBadge rank={rows.indexOf(r) + 1} /><PlayerAvatar name={r.playerName} role={r.role} size={28} /><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{r.playerName}</strong><span className="text-xs text-text-secondary">{bat ? 'Avg ' : 'Econ '}{display(r, bat ? 'average' : 'economy')} · SR {display(r, 'strikeRate')}</span></span><strong className={bat ? 'text-xl text-teal-bright' : 'text-xl text-ball'}>{display(r, defaultSort)}</strong></Link></li>)}</ol><p className="p-3 text-xs text-text-secondary">{bat ? '* not out. Avg = runs ÷ dismissals. SR = runs per 100 balls. Tap a column header to sort.' : 'Economy colour: green under 4.00, red above 6.00. SR = balls per wicket. Tap a column header to sort.'}</p></section></> : <EmptyState title="No qualifying players" message="Try another format, season, search or minimum." />}
  </div>
}
