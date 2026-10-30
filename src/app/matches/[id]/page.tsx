import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMatchDetail } from '@/lib/queries/matches'
import { isAdmin } from '@/lib/auth'
import { MatchTypeBadge } from '@/components/ui/MatchTypeBadge'
import { SectionCard } from '@/components/ui/SectionCard'
import { ShareButton } from '@/components/ui/ShareButton'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { BattingScorecard, BowlingScorecard } from '@/components/ui/ScorecardTables'
import { formatDate } from '@/lib/ui/dates'
import { fmtFigures, fmtNumber, fmtOvers } from '@/lib/stats/format'
import { describeResult } from '@/lib/stats/describeResult'
import { matchHighlights, runRate } from '@/lib/stats/matchHighlights'
import { scalar, type PageParams } from '@/lib/ui/url'
export default async function MatchPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<PageParams> }) {
  const { id } = await params, query = await searchParams
  const detail = await getMatchDetail(id)
  if (!detail) notFound()
  const { match, batting, bowling, toss, extras } = detail
  const tab = ['mora', 'opposition', 'info'].includes(scalar(query.tab) ?? '') ? scalar(query.tab)! : 'mora'
  const old = !match.mora && !match.opposition
  const admin = await isAdmin(), result = describeResult(match), highlights = matchHighlights(batting, bowling)
  const tossText = toss ? `${toss.wonBy === 'mora' ? 'Mora CC' : match.opponent} won the toss · chose to ${toss.decision}` : 'Not recorded'
  const info = <dl className="space-y-4 text-sm">{[['Format', `${match.matchType} · ${match.overs} overs`], ['Venue', match.venueName ?? match.venue], ['Toss', tossText], ['Source', match.source === 'import' ? 'Imported scorecard' : 'Manual entry']].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt className="text-text-secondary">{label}</dt><dd className="text-right">{value}</dd></div>)}</dl>
  const highlightRows = [
    { label: 'Top scorer', row: highlights.topScorer, value: highlights.topScorer ? `${highlights.topScorer.runs} (${highlights.topScorer.balls})` : '' },
    { label: 'Best bowling', row: highlights.bestBowling, value: fmtFigures(highlights.bestBowling) },
    { label: 'Most sixes', row: highlights.mostSixes, value: String(highlights.mostSixes?.sixes ?? '') },
  ]
  return <div className="space-y-5"><div className="flex items-center justify-between"><Link href="/matches" className="min-h-10 py-2 text-sm text-text-secondary">← <span className="hidden md:inline">Back to matches</span><span className="md:hidden">Scorecard</span></Link><ShareButton /></div>
    <section className="rounded-[20px] border border-separator bg-linear-to-br from-brand-deep/60 to-background p-5 md:p-8"><div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary"><MatchTypeBadge matchType={match.matchType} />{formatDate(match.date, 'long')} · {match.venueName ?? match.venue}</div><div className="my-6 grid gap-5 md:grid-cols-2">{[{ name: 'Mora CC', innings: match.mora }, { name: match.opponent, innings: match.opposition }].map(({ name, innings }) => <div key={name} className="flex items-center justify-between gap-3"><strong>{name}</strong><div className="text-right">{innings ? <><p className="text-3xl font-semibold tabular-nums">{innings.runs}/{innings.wickets}</p><p className="text-xs text-text-secondary">{fmtOvers(innings.balls)} overs · RR {fmtNumber(runRate(innings.runs, innings.balls))}</p></> : <p className="text-text-secondary">Score not recorded</p>}</div></div>)}</div>
      {result && <p className="rounded-[12px] bg-surface-secondary p-3 text-sm font-semibold">{result}</p>}{old && <div className="rounded-[12px] bg-foreground/10 p-4 text-sm"><strong>Added before the scorecard importer</strong><p className="mt-1 text-text-secondary">Team totals, toss, result and how each batter got out were not recorded. Player runs, balls and wickets still count in every stat.</p>{admin && <Link className="mt-2 inline-block text-brand-hover" href={`/admin/import?replace=${id}`}>Admin: re-import →</Link>}</div>}
    </section>
    {!old && <FilterTabs label="Scorecard sections" options={[['mora', 'Mora CC innings'], ['opposition', `${match.opponent} innings`], ['info', 'Match info']].map(([key, label]) => ({ label, active: tab === key, href: `/matches/${id}?tab=${key}` }))} />}
    <div className={old ? 'grid gap-5 xl:grid-cols-2' : 'grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]'}><div className="min-w-0 space-y-5">{old || tab === 'mora' ? <BattingScorecard detail={detail} /> : tab === 'info' ? <SectionCard title="Match info">{info}</SectionCard> : <><SectionCard title={`${match.opponent} innings`}><p className="text-2xl font-semibold">{match.opposition ? `${match.opposition.runs}/${match.opposition.wickets} (${fmtOvers(match.opposition.balls)})` : 'Score not recorded'}</p><p className="mt-3 text-sm text-text-secondary">Opposition batting is not recorded.</p>{extras.opposition && <p className="mt-2 text-sm">Extras {Object.values(extras.opposition).reduce((a, b) => a + b, 0)}</p>}</SectionCard><BowlingScorecard detail={detail} /></>}</div>{old ? <BowlingScorecard detail={detail} /> : <aside className="space-y-5"><SectionCard title="Match highlights">{highlightRows.map(({ label, row, value }) => row && <div key={label} className="mb-4"><p className="text-xs text-text-secondary">{label}</p><p className="font-semibold">{row.playerName}</p><p className="text-sm text-text-secondary">{value}</p></div>)}</SectionCard><SectionCard title="Match info">{info}</SectionCard></aside>}</div>
  </div>
}
