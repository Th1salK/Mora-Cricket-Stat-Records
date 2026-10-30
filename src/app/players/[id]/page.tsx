import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPlayer } from '@/lib/queries/players'
import { getPlayerStats, resolveFilter } from '@/lib/queries/stats'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'
import { RoleChip } from '@/components/ui/RoleChip'
import { MatchTypeBadge } from '@/components/ui/MatchTypeBadge'
import { SectionCard } from '@/components/ui/SectionCard'
import { StatTile } from '@/components/ui/StatTile'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { RunsChart } from '@/components/ui/RunsChart'
import { fmtNumber, fmtFigures, fmtHighScore, fmtOvers } from '@/lib/stats/format'
import { formatDate } from '@/lib/ui/dates'
import { pageHref, scalar, type PageParams } from '@/lib/ui/url'
import type { MatchTypeValue } from '@/lib/constants'
export default async function PlayerPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<PageParams> }) {
  const { id } = await params, query = await searchParams
  const player = await getPlayer(id)
  if (!player) notFound()
  const filter = await resolveFilter({ season: scalar(query.season), matchType: scalar(query.matchType) })
  const [stats, all] = await Promise.all([getPlayerStats(id, filter), getPlayerStats(id, { ...filter, matchType: 'All' })])
  const b = stats.batting, w = stats.bowling, label = filter.seasonName ? filter.seasonName + ' Season' : 'All seasons'
  const batting = [{ label: 'Innings', value: b.innings }, { label: 'Runs', value: b.runs, tone: 'teal' as const }, { label: 'Average', value: fmtNumber(b.average), hint: b.innings > 0 && b.average === null ? 'Not out in every innings' : undefined }, { label: 'Strike rate', value: fmtNumber(b.strikeRate, 1) }, { label: 'High score', value: fmtHighScore(b.highScore, b.highScoreNotOut), tone: 'teal' as const }, { label: '50s', value: b.fifties }, { label: '100s', value: b.hundreds }, { label: 'Ducks', value: b.ducks }]
  const bowling = [{ label: 'Wickets', value: w.wickets, tone: 'ball' as const }, { label: 'Overs', value: fmtOvers(w.balls) }, { label: 'Average', value: fmtNumber(w.average) }, { label: 'Economy', value: fmtNumber(w.economy) }, { label: 'Strike rate', value: fmtNumber(w.strikeRate) }, { label: 'Best', value: fmtFigures(w.best), tone: 'ball' as const }, { label: 'Wides', value: w.wides }, { label: 'No balls', value: w.noBalls }]
  return <div className="space-y-5"><Link href={'/players?season=' + filter.seasonId} className="inline-block min-h-10 py-2 text-sm text-text-secondary">← Back to players</Link><section className="rounded-[14px] border border-separator bg-surface p-5"><div className="flex flex-wrap items-center gap-5"><PlayerAvatar name={player.fullName} role={player.role} size={72} /><div className="min-w-0 flex-1"><h1 className="font-display text-4xl uppercase md:text-[52px]">{player.fullName}</h1><div className="mt-3 flex flex-wrap items-center gap-2"><RoleChip role={player.role} />{[player.battingStyle, player.bowlingStyle].filter(Boolean).map((style) => <span key={style} className="rounded-full bg-surface-secondary px-3 py-1 text-xs">{style}</span>)}</div><p className="mt-3 text-xs text-text-secondary">{label}{!player.isActive ? ' · Inactive' : ''}</p></div></div><div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">{[{ label: 'Matches', value: stats.matches }, { label: 'Runs', value: b.runs }, { label: 'Wickets', value: w.wickets }, { label: 'High score', value: fmtHighScore(b.highScore, b.highScoreNotOut) }].map((tile) => <StatTile key={tile.label} {...tile} />)}</div></section>
    <div className="flex flex-wrap items-center gap-3"><span className="text-sm text-text-secondary">Showing stats for</span><FilterTabs label="Player formats" options={['All', ...Object.keys(all.byMatchType)].map((type) => ({ label: type, active: filter.matchType === type, href: pageHref('/players/' + id, query, { matchType: type }) }))} /></div>
    <div className="grid gap-5 xl:grid-cols-2"><SectionCard title="Batting" subtitle={label}>{b.innings ? <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{batting.map((tile) => <StatTile key={tile.label} {...tile} />)}</div> : <p className="text-sm text-text-secondary">No batting innings for these filters.</p>}</SectionCard><SectionCard title="Bowling" subtitle={label}>{w.innings ? <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{bowling.map((tile) => <StatTile key={tile.label} {...tile} />)}</div> : <p className="text-sm text-text-secondary">No bowling innings for these filters.</p>}</SectionCard></div>
    <div className="grid gap-5 xl:grid-cols-2"><SectionCard title="Runs by innings" subtitle="Last 12 innings"><RunsChart rows={stats.runsByInnings} /></SectionCard><SectionCard title="Recent performances"><div className="overflow-x-auto"><table className="data-table"><thead><tr>{['Date', 'Opponent', 'Bat', 'Bowl'].map((s) => <th key={s} scope="col">{s}</th>)}</tr></thead><tbody>{stats.recentPerformances.map((row) => <tr key={row.matchId}><td>{formatDate(row.date, 'compact')}</td><td><Link className="inline-flex min-h-10 items-center" href={'/matches/' + row.matchId}>{row.opponent}</Link></td><td className="whitespace-nowrap">{row.bat ? row.bat.runs + ' (' + row.bat.balls + ')' : '–'}</td><td>{fmtFigures(row.bowl)}</td></tr>)}</tbody></table></div></SectionCard></div>
    <SectionCard title="By match type"><div className="overflow-x-auto"><table className="data-table"><thead><tr>{['Type', 'Inns', 'Runs', 'Avg', 'SR', 'HS', 'Wkts', 'Econ', 'Best'].map((s) => <th scope="col" key={s}>{s}</th>)}</tr></thead><tbody>{Object.entries(stats.byMatchType).map(([type, { batting: b, bowling: w }]) => <tr key={type}><td><MatchTypeBadge matchType={type as MatchTypeValue} /></td><td>{b.innings}</td><td>{b.runs}</td><td>{fmtNumber(b.average)}</td><td>{fmtNumber(b.strikeRate, 1)}</td><td>{fmtHighScore(b.highScore, b.highScoreNotOut)}</td><td>{w.wickets}</td><td>{fmtNumber(w.economy)}</td><td>{fmtFigures(w.best)}</td></tr>)}</tbody></table></div></SectionCard>
  </div>
}
