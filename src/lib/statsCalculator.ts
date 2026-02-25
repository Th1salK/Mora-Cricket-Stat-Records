import { console } from 'inspector'
import BattingPerformance from '../models/BattingPerformance'
import BowlingPerformance from '../models/BowlingPerformance'
import Match from '../models/Match'

export const MATCH_TYPES = ['Home and Home', 'Practice', 'Div 3', 'Inter Uni', 'SLUG'] as const
export type MatchType = typeof MATCH_TYPES[number] | 'All'

export interface PlayerBattingRow{
  playerId: string
  playerName:string
  innings: number
  runs: number
  balls: number
  average: number
  strikeRate: number
  highScore: number
  notOuts: number
  ducks: number
  totalFours: number
  totalSixes: number
  fifties: number
  hundreds: number
}

export interface PlayerBowlingRow {
  playerId:string
  playerName:string
  matches: number
  wickets: number
  overs: string
  runs: number
  wides: number
  noBalls: number
  average: number
  economy: number
  strikeRate: number
  bestFigures: string
  fiveWickets: number
}



export async function getPlayerBattingStats(matchType:MatchType = 'All'):Promise<PlayerBattingRow[]>{

  const matchFilter = matchType === 'All'?{}:{matchType}

  const matches = await Match.find(matchFilter).lean()

  const matchIds = matches.map((m) =>m._id)


  const performances = await BattingPerformance.find({matchId: {$in:matchIds}}).populate('playerId').lean()

  //group by playerId
  const grouped: Record<string,{name:string; perfs:typeof performances}> ={}

  for(const p of performances){
    const player= p.playerId as any
    if(!player || !player._id) continue
    const pid = player._id.toString()

    if(!grouped[pid]) grouped[pid] = {name:player.fullName, perfs:[]}
    grouped[pid].perfs.push(p)
} 

    const rows: PlayerBattingRow[] = Object.entries(grouped).map(([pid, { name, perfs }]) => {
    const innings = perfs.length
    const runs = perfs.reduce((s, p) => s + (p.runs || 0), 0)
    const balls = perfs.reduce((s, p) => s + (p.balls || 0), 0)
    const dismissals = perfs.filter((p) => p.out).length
    const notOuts = innings - dismissals
    const average = dismissals === 0 ? 0 : Number((runs / dismissals).toFixed(2))
    const strikeRate = balls === 0 ? 0 : Number(((runs / balls) * 100).toFixed(2))
    const highScore = innings === 0 ? 0 : Math.max(...perfs.map((p) => p.runs || 0))
    const ducks = perfs.filter((p) => p.runs === 0 && p.out).length
    const fifties = perfs.filter((p) => (p.runs || 0) >= 50 && (p.runs || 0) < 100).length
    const hundreds = perfs.filter((p) => (p.runs || 0) >= 100).length
    const fours = perfs.reduce((s, p) => s + (p.fours || 0), 0)
    const sixes = perfs.reduce((s, p) => s + (p.sixes || 0), 0)
    return { playerId: pid, playerName: name, innings, runs, balls, average, strikeRate, highScore, notOuts, ducks, fifties, hundreds, totalFours: fours, totalSixes: sixes }
  })

  return rows.sort((a,b)=> b.runs -a.runs)
}

export async function getPlayerBowlingStats(matchType: MatchType = 'All'): Promise<PlayerBowlingRow[]> {
  const matchFilter = matchType === 'All' ? {} : { matchType }
  const matches = await Match.find(matchFilter).lean()
  const matchIds = matches.map((m) => m._id)

  const performances = await BowlingPerformance.find({ matchId: { $in: matchIds } })
    .populate('playerId')
    .lean()

  // Group by playerId
  const grouped: Record<string, { name: string; perfs: typeof performances }> = {}
  for (const p of performances) {
    const player = p.playerId as any
    if (!player || !player._id) continue
    const pid = player._id.toString()
    if (!grouped[pid]) grouped[pid] = { name: player.fullName, perfs: [] }
    grouped[pid].perfs.push(p)
  }

  const rows: PlayerBowlingRow[] = Object.entries(grouped).map(([pid, { name, perfs }]) => {
    const totalBalls = perfs.reduce((s, p) => s + (p.balls || 0), 0)
    const totalRuns = perfs.reduce((s, p) => s + (p.runs || 0), 0)
    const wickets = perfs.reduce((s, p) => s + (p.wickets || 0), 0)
    const wides = perfs.reduce((s, p) => s + (p.wides || 0), 0)
    const noBalls = perfs.reduce((s, p) => s + (p.noBalls || 0), 0)
    const overs = `${Math.floor(totalBalls / 6)}.${totalBalls % 6}`
    const average = wickets === 0 ? 0 : Number((totalRuns / wickets).toFixed(2))
    const economy = totalBalls === 0 ? 0 : Number(((totalRuns / totalBalls) * 6).toFixed(2))
    const strikeRate = wickets === 0 ? 0 : Number((totalBalls / wickets).toFixed(2))
    const fiveWickets = perfs.filter((p) => (p.wickets || 0) >= 5).length
    const best = [...perfs].sort((a, b) =>
      (b.wickets || 0) !== (a.wickets || 0)
        ? (b.wickets || 0) - (a.wickets || 0)
        : (a.runs || 0) - (b.runs || 0)
    )[0]
    const bestFigures = best ? `${best.wickets || 0}/${best.runs || 0}` : '-'
    return { playerId: pid, playerName: name, matches: perfs.length, runs: totalRuns, wickets, overs, average, economy, strikeRate, bestFigures, fiveWickets, wides, noBalls }
  })

  return rows.sort((a, b) => b.wickets - a.wickets)
}