import Link from 'next/link'
import Image from 'next/image'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { getTeamOverview, getBreakdownByMatchType, getRecords, resolveFilter } from '@/lib/queries/stats'
import { listMatches, getLatestMatch } from '@/lib/queries/matches'
import { INTERNAL_MATCH_TYPES } from '@/lib/stats/config'
import { fmtNumber, fmtFigures } from '@/lib/stats/format'
import { seasonLabel } from '@/lib/stats/seasons'
import { formatDate } from '@/lib/ui/dates'
import { formatCount } from '@/lib/ui/numbers'
import { SectionCard } from '@/components/ui/SectionCard'
import { StatTile } from '@/components/ui/StatTile'
import { MatchTypeBadge } from '@/components/ui/MatchTypeBadge'
import { ResultBadge } from '@/components/ui/ResultBadge'
import { ResultBar } from '@/components/ui/ResultBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { DashboardLastMatch } from '@/components/ui/DashboardLastMatch'
import { DashboardLeaders } from '@/components/ui/DashboardLeaders'
import { Bat, Ball, Calendar, Trophy, ChevronRight } from '@/components/ui/icons'
import type { MatchTypeValue } from '@/lib/constants'

export default async function Home({ searchParams }: { searchParams: Promise<{ season?: string | string[] }> }) {
  const params = await searchParams
  const filter = await resolveFilter({ season: Array.isArray(params.season) ? params.season[0] : params.season })
  const [overview, breakdown, records, matches, latest] = await Promise.all([
    getTeamOverview(filter), getBreakdownByMatchType(filter), getRecords(filter), listMatches(filter), getLatestMatch(filter),
  ])
  const label = filter.seasonName ? seasonLabel(filter.seasonName) : 'All seasons'
  const query = `?season=${encodeURIComponent(filter.seasonId)}`
  const hasPhoto = existsSync(join(process.cwd(), 'public', 'images', 'team-huddle.jpg'))
  const { batting, bowling, results } = overview
  const partial = results.coverage.used < results.coverage.total
  const intro = <header className="hidden md:block">
    <p className="text-xs text-text-secondary">{formatDate(new Date(), 'long')}</p>
    <h2 className="mt-1 text-[22px] leading-[1.28] font-bold tracking-[-0.01em]">Welcome to the stats hub</h2>
  </header>

  if (overview.matchCount === 0) return <div className="space-y-5">
    {intro}<PageHeader eyebrow={label} title="Dashboard" />
    <EmptyState icon={<Calendar size={22} />} title="No matches in this season yet"
      message="Choose another season to explore the team's matches and statistics."
      action={<Link href="/?season=all" className="button button--primary">View all seasons</Link>} />
  </div>

  return <div className="space-y-4 md:space-y-6">
    {intro}
    <div className="relative grid gap-4 md:gap-5">
      <section aria-label="Mora Cricket" className="relative flex min-h-[240px] overflow-hidden rounded-[20px] bg-brand-deep md:min-h-[366px]">
        {hasPhoto ? <Image src="/images/team-huddle.jpg" alt="" fill priority sizes="(min-width: 768px) calc(100vw - 336px), calc(100vw - 32px)" className="object-cover" />
          : <div aria-hidden="true" className="absolute inset-0 bg-linear-to-br from-brand-deep to-background" />}
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-r from-background/80 to-background/35" />
        <div className="relative flex w-full flex-col justify-end p-5 md:justify-center md:p-10 xl:pr-[390px]">
          <p className="mb-3 w-fit rounded-full bg-transparent py-1 md:bg-teal/20 md:px-3 text-xs font-medium text-teal-bright">
            <span className="md:hidden">Official team · UOM</span><span className="hidden md:inline">● &nbsp;Official team · University of Moratuwa</span>
          </p>
          <h1 className="font-display text-5xl leading-none tracking-[0.01em] uppercase md:text-[72px] xl:text-[clamp(64px,6.5vw,96px)]">Mora Cricket</h1>
          <p className="mt-3 text-sm leading-5 text-text-secondary md:hidden">{filter.seasonName ? `${filter.seasonName} season stats` : 'All-time stats'}, scorecards and records.</p>
          <p className="mt-5 hidden max-w-[560px] text-base leading-6 text-text-secondary md:block">
            Every run, wicket and match {filter.seasonName ? `from the ${filter.seasonName} season` : 'across every season'} — batting and bowling leaderboards by format, player profiles and all-time career records.
          </p>
          <div className="mt-5 hidden flex-wrap gap-3 md:flex">
            <Link href={`/matches${query}`} className="button button--primary">View matches</Link>
            <Link href={`/stats/batting${query}`} className="button button--secondary">Season stats</Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        <StatTile layout="dashboard" label="Matches played" compactLabel="Matches" value={formatCount(overview.matchCount)} hint={`Across ${formatCount(Object.keys(breakdown).length)} formats`} icon={<Calendar />} tone="brand" />
        <StatTile layout="dashboard" label="Team runs" compactLabel="Runs" value={formatCount(batting.innings ? batting.runs : null)}
          hint={batting.innings ? `Avg ${fmtNumber(batting.average)} · SR ${fmtNumber(batting.strikeRate, 1)}` : 'No batting records'} icon={<Bat />} tone="teal" />
        <StatTile layout="dashboard" label="Wickets" value={formatCount(bowling.innings ? bowling.wickets : null)}
          hint={bowling.innings ? `Econ ${fmtNumber(bowling.economy)} · Best ${fmtFigures(bowling.best)}` : 'No bowling records'} icon={<Ball />} tone="ball" />
        <StatTile layout="dashboard" label="Win rate" value={results.winRate === null ? '–' : `${fmtNumber(results.winRate, 0)}%`}
          hint={results.winRate === null ? 'No recorded results' : `${formatCount(results.won)} won · ${formatCount(results.lost)} lost`} icon={<Trophy />} tone="gold" />
      </div>
      {latest && <DashboardLastMatch match={latest} className="xl:absolute xl:top-[140px] xl:right-8 xl:w-[326px]" />}
    </div>

    {partial && <p className="text-xs text-text-secondary">Win rate: Based on {formatCount(results.coverage.used)} of {formatCount(results.coverage.total)} matches. Internal games are excluded.</p>}

    <div className="grid items-start gap-4 md:gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="order-2 min-w-0 xl:order-1">
        <SectionCard title="Recent matches" subtitle="Latest fixtures in this season" action={
          <Link href={`/matches${query}`} className="inline-flex min-h-10 shrink-0 items-center gap-2 text-sm font-semibold text-brand-hover">All matches<ChevronRight size={16} /></Link>
        }>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="hidden rounded-[10px] bg-surface-secondary text-xs text-text-secondary sm:table-header-group">
                <tr>{['Date', 'Opponent', 'Format', 'Result'].map((text) => <th key={text} scope="col" className="px-3 py-2.5 font-semibold">{text}</th>)}</tr>
              </thead>
              <tbody>{matches.slice(0, 6).map((match) => <tr key={match.id} className="border-b border-separator last:border-0 hover:bg-brand-row">
                <td className="py-4 pr-3 text-xs whitespace-nowrap text-text-secondary sm:px-3"><time dateTime={match.date}>{formatDate(match.date, 'compact')}</time></td>
                <th scope="row" className="py-4 pr-3 text-sm font-semibold sm:px-3">{match.opponent}<span className="mt-1 block sm:hidden"><MatchTypeBadge matchType={match.matchType} /></span></th>
                <td className="hidden px-3 py-4 sm:table-cell"><MatchTypeBadge matchType={match.matchType} /></td>
                <td className="py-4 text-right sm:px-3"><ResultBadge outcome={match.outcome} internal={match.isInternal} /></td>
              </tr>)}</tbody>
            </table>
          </div>
        </SectionCard>
      </div>
      <div className="order-1 space-y-4 md:space-y-5 xl:order-2">
        <DashboardLeaders records={records} seasonId={filter.seasonId} seasonLabel={label} />
        <div className="hidden xl:block"><FormatResults breakdown={breakdown} /></div>
      </div>
      <div className="order-3 xl:hidden"><FormatResults breakdown={breakdown} /></div>
    </div>

    <div className="grid gap-3 md:grid-cols-3 md:gap-5">
      {[
        { title: 'Batting stats', description: 'Runs, averages and strike rates by format', href: `/stats/batting${query}`, Icon: Bat, tone: 'bg-teal/20 text-teal-bright' },
        { title: 'Bowling stats', description: 'Wickets, economy and figures by format', href: `/stats/bowling${query}`, Icon: Ball, tone: 'bg-ball/20 text-ball' },
        { title: 'Records', description: 'Team results, individual records and all-time leaders', href: '/records', Icon: Trophy, tone: 'bg-gold/20 text-gold' },
      ].map(({ title, description, href, Icon, tone }) => <Link key={title} href={href} className="flex min-h-20 items-center gap-3 rounded-[14px] border border-separator bg-surface p-4 hover:bg-surface-secondary md:p-5">
        <span className={`inline-flex size-11 shrink-0 items-center justify-center rounded-[10px] ${tone}`}><Icon size={22} /></span>
        <span className="min-w-0 flex-1"><span className="block text-base font-semibold">{title}</span><span className="mt-1 block text-xs leading-4 text-text-secondary">{description}</span></span>
        <ChevronRight className="shrink-0 text-text-secondary" />
      </Link>)}
    </div>
  </div>
}

function FormatResults({ breakdown }: { breakdown: Awaited<ReturnType<typeof getBreakdownByMatchType>> }) {
  return <SectionCard title="Results by format" subtitle="Won – lost · internal games excluded">
    <ul className="space-y-4">{Object.entries(breakdown).map(([type, entry]) => {
      const internal = INTERNAL_MATCH_TYPES.includes(type as MatchTypeValue)
      return <li key={type}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <MatchTypeBadge matchType={type as MatchTypeValue} />
          <span className="text-xs tabular-nums text-text-secondary">{internal ? `${formatCount(entry.matchCount)} internal` : entry.results.coverage.used === 0 ? '–' : `${formatCount(entry.results.won)}–${formatCount(entry.results.lost)}`}</span>
        </div>
        {!internal && <ResultBar {...entry.results} />}
        {!internal && entry.results.coverage.used < entry.results.coverage.total && <p className="mt-1 text-xs text-text-secondary">Results recorded for {formatCount(entry.results.coverage.used)} of {formatCount(entry.results.coverage.total)} matches</p>}
      </li>
    })}</ul>
  </SectionCard>
}
