import BattingPerformance from '../models/BattingPerformance'
import BowlingPerformance from '../models/BowlingPerformance'
import Match from '../models/Match'

export const MATCH_TYPES = ['Home and Home', 'Practice', 'Div 3', 'Inter Uni', 'SLUG'] as const
export type MatchType = typeof MATCH_TYPES[number] | 'All'

export interface BattingStats {
  totalInnings: number
  totalRuns: number
  totalBalls: number
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

export interface BowlingStats {
  totalMatches: number
  totalWickets: number
  totalBalls: number
  totalRuns: number
  totalWides: number
  totalNoBalls: number
  overs: string
  average: number
  economy: number
  strikeRate: number
  bestFigures: string
  fiveWickets: number
}

export async function getBattingStats(matchType: MatchType = 'All'): Promise<BattingStats> {
  const matchFilter = matchType === 'All' ? {} : { matchType }
  const matches = await Match.find(matchFilter).lean()
  const matchIds = matches.map((m) => m._id)

  const performances = await BattingPerformance.find({ matchId: { $in: matchIds } }).lean()

  const totalInnings = performances.length
  const totalRuns = performances.reduce((s, p) => s + (p.runs || 0), 0)
  const totalBalls = performances.reduce((s, p) => s + (p.balls || 0), 0)
  const dismissals = performances.filter((p) => p.out).length
  const notOuts = totalInnings - dismissals
  const average = dismissals === 0 ? 0 : Number((totalRuns / dismissals).toFixed(2))
  const strikeRate = totalBalls === 0 ? 0 : Number(((totalRuns / totalBalls) * 100).toFixed(2))
  const highScore = performances.length === 0 ? 0 : Math.max(...performances.map((p) => p.runs || 0))
  const ducks = performances.filter((p) => p.runs === 0 && p.out).length
  const totalFours = performances.reduce((s, p) => s + (p.fours || 0), 0)
  const totalSixes = performances.reduce((s, p) => s + (p.sixes || 0), 0)
  const fifties = performances.filter((p) => (p.runs || 0) >= 50 && (p.runs || 0) < 100).length
  const hundreds = performances.filter((p) => (p.runs || 0) >= 100).length

  return {
    totalInnings,
    totalRuns,
    totalBalls,
    average,
    strikeRate,
    highScore,
    notOuts,
    ducks,
    totalFours,
    totalSixes,
    fifties,
    hundreds,
  }
}

export async function getBowlingStats(matchType: MatchType = 'All'): Promise<BowlingStats> {
  const matchFilter = matchType === 'All' ? {} : { matchType }
  const matches = await Match.find(matchFilter).lean()
  const matchIds = matches.map((m) => m._id)

  const performances = await BowlingPerformance.find({ matchId: { $in: matchIds } }).lean()

  const totalMatches = new Set(performances.map((p) => p.matchId.toString())).size
  const totalWickets = performances.reduce((s, p) => s + (p.wickets || 0), 0)
  const totalBalls = performances.reduce((s, p) => s + (p.balls || 0), 0)
  const totalRuns = performances.reduce((s, p) => s + (p.runs || 0), 0)
  const totalWides = performances.reduce((s, p) => s + (p.wides || 0), 0)
  const totalNoBalls = performances.reduce((s, p) => s + (p.noBalls || 0), 0)
  const oversInt = Math.floor(totalBalls / 6)
  const oversBalls = totalBalls % 6
  const overs = `${oversInt}.${oversBalls}`
  const totalOversDecimal = totalBalls / 6
  const average = totalWickets === 0 ? 0 : Number((totalRuns / totalWickets).toFixed(2))
  const economy = totalOversDecimal === 0 ? 0 : Number((totalRuns / totalOversDecimal).toFixed(2))
  const strikeRate = totalWickets === 0 ? 0 : Number((totalBalls / totalWickets).toFixed(2))
  const fiveWickets = performances.filter((p) => (p.wickets || 0) >= 5).length

  let bestFigures = '-'
  if (performances.length > 0) {
    const best = [...performances].sort((a, b) => {
      if ((b.wickets || 0) !== (a.wickets || 0)) return (b.wickets || 0) - (a.wickets || 0)
      return (a.runs || 0) - (b.runs || 0)
    })[0]
    bestFigures = `${best.wickets || 0}/${best.runs || 0}`
  }

  return {
    totalMatches,
    totalWickets,
    totalBalls,
    totalRuns,
    totalWides,
    totalNoBalls,
    overs,
    average,
    economy,
    strikeRate,
    bestFigures,
    fiveWickets,
  }
}
