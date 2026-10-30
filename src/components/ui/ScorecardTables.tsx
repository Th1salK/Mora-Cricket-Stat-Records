import Link from 'next/link'
import type { getMatchDetail } from '@/lib/queries/matches'
import { SectionCard } from '@/components/ui/SectionCard'
import { fmtNumber, fmtOvers } from '@/lib/stats/format'
import { formatDismissal } from '@/lib/stats/dismissal'
import { runRate } from '@/lib/stats/matchHighlights'
type Detail = NonNullable<Awaited<ReturnType<typeof getMatchDetail>>>
export function BattingScorecard({ detail }: { detail: Detail }) {
  const { batting, match, extras } = detail
  return <SectionCard title="Batting" subtitle={!match.mora ? 'Mora CC · batting order not recorded' : 'Mora CC innings'}><div className="overflow-x-auto"><table className="data-table"><thead><tr>{['Batter', 'R (B)', '4s', '6s', 'SR'].map((s, i) => <th key={s} scope="col" className={i > 1 ? 'hidden sm:table-cell' : ''}>{s}</th>)}</tr></thead><tbody>{batting.filter((row) => row.dismissal?.type !== 'did not bat').map((row) => <tr key={row.playerId}><td><Link className={!row.out ? 'font-semibold text-teal-bright' : 'font-semibold'} href={`/players/${row.playerId}`}>{row.playerName}</Link><p className="text-xs text-text-secondary">{formatDismissal(row)}</p></td><td className="whitespace-nowrap tabular-nums"><strong>{row.runs}</strong> <span className="text-text-secondary">({row.balls})</span></td><td className="hidden sm:table-cell">{row.fours}</td><td className="hidden sm:table-cell">{row.sixes}</td><td className="hidden sm:table-cell">{fmtNumber(row.balls ? row.runs / row.balls * 100 : null, 1)}</td></tr>)}</tbody></table></div>{match.mora && <div className="mt-3 flex justify-between gap-4 rounded-[10px] bg-surface-secondary p-3 text-sm"><span className="text-text-secondary">Extras {extras.mora ? Object.values(extras.mora).reduce((a, b) => a + b, 0) : '–'}{extras.mora && ` (w ${extras.mora.wides}, nb ${extras.mora.noBalls}, b ${extras.mora.byes}, lb ${extras.mora.legByes}, p ${extras.mora.penalty})`}</span><strong>Total {match.mora.runs}/{match.mora.wickets}</strong></div>}</SectionCard>
}
export function BowlingScorecard({ detail }: { detail: Detail }) {
  return <SectionCard title="Bowling" subtitle={!detail.match.mora ? 'Maidens were not recorded for older matches' : 'Mora CC bowling'}><div className="overflow-x-auto"><table className="data-table"><thead><tr>{['Bowler', 'O', 'M', 'R', 'W', 'Econ', 'Wd', 'NB'].map((s) => <th key={s} scope="col">{s}</th>)}</tr></thead><tbody>{detail.bowling.map((row) => <tr key={row.playerId}><td><Link href={`/players/${row.playerId}`}>{row.playerName}</Link></td><td>{fmtOvers(row.balls)}</td><td>{fmtNumber(row.maidens, 0)}</td><td>{row.runs}</td><td className="text-ball">{row.wickets}</td><td>{fmtNumber(runRate(row.runs, row.balls))}</td><td>{row.wides}</td><td>{row.noBalls}</td></tr>)}</tbody></table></div></SectionCard>
}
