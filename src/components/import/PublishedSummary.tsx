import Link from 'next/link'
import { buildPublishPayload } from '@/lib/import/publish'
import type { Draft, MatchDetails } from '@/lib/import/draft'
import type { PlayerLite } from '@/lib/import/matchPlayers'
import { Stepper } from '@/components/ui/Stepper'
import { SectionCard } from '@/components/ui/SectionCard'
import { StatTile } from '@/components/ui/StatTile'
export function PublishedSummary({ matchId, draft, details, players }: { matchId: string; draft: Draft; details: MatchDetails; players: PlayerLite[] }) {
  const { payload } = buildPublishPayload(details, draft, players)
  return <div className="space-y-5"><Stepper step={4} /><SectionCard title="Match published" subtitle="The match, performances and player aliases are now saved."><div className="my-5 flex flex-wrap gap-5 rounded-[12px] bg-surface-secondary p-4">{draft.innings.map((inn, i) => <p key={i}><span className="block text-xs text-text-secondary">{inn.battingTeam}</span><strong className="text-2xl">{inn.total.runs ?? '–'}/{inn.total.wickets ?? '–'}</strong> <span className="text-xs">({inn.total.overs ?? '–'})</span></p>)}</div><div className="grid grid-cols-3 gap-3"><StatTile label="Batting records" value={payload?.batting.length ?? '–'} /><StatTile label="Bowling records" value={payload?.bowling.length ?? '–'} /><StatTile label="Names learned" value={payload?.aliases.length ?? '–'} /></div>{!!payload?.aliases.length && <ul className="my-5 space-y-2 text-sm">{payload.aliases.map((entry) => <li key={entry.alias}>{entry.alias} → {players.find((p) => p.id === entry.playerId)?.fullName}</li>)}</ul>}<div className="mt-5 flex flex-wrap gap-3"><Link className="button button--primary" href={`/matches/${matchId}`}>View match</Link><Link className="button button--secondary" href="/stats/batting">Batting stats</Link><Link className="button button--secondary" href="/stats/bowling">Bowling stats</Link><Link className="button button--outline" href="/admin/import">Import another match</Link></div></SectionCard></div>
}
