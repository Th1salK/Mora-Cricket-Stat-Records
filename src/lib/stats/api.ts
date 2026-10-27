import type { BattingSummary } from '@/lib/stats/batting'
import type { BowlingSummary } from '@/lib/stats/bowling'
import { fmtFigures, fmtOvers } from '@/lib/stats/format'

// Keep existing API field names while the UI and calculations share the new summaries.
export function battingApi(s: BattingSummary) {
  return { totalInnings: s.innings, totalRuns: s.runs, totalBalls: s.balls, average: s.average, strikeRate: s.strikeRate,
    highScore: s.highScore, highScoreNotOut: s.highScoreNotOut, notOuts: s.notOuts, ducks: s.ducks,
    fours: s.fours, sixes: s.sixes, fifties: s.fifties, hundreds: s.hundreds }
}
export function bowlingApi(s: BowlingSummary) {
  return { totalBalls: s.balls, totalRuns: s.runs, totalWickets: s.wickets, totalWides: s.wides, totalNoBalls: s.noBalls,
    overs: fmtOvers(s.balls), average: s.average, economy: s.economy, strikeRate: s.strikeRate,
    bestFigures: fmtFigures(s.best), fiveWickets: s.fiveWickets }
}
export function battingTableApi(s: BattingSummary & { playerId: string; playerName: string }) {
  return { playerId: s.playerId, playerName: s.playerName, innings: s.innings, runs: s.runs, average: s.average,
    strikeRate: s.strikeRate, highScore: s.highScore, notOuts: s.notOuts, ducks: s.ducks,
    fifties: s.fifties, hundreds: s.hundreds, fours: s.fours, sixes: s.sixes }
}
export function bowlingTableApi(s: BowlingSummary & { playerId: string; playerName: string }) {
  return { playerId: s.playerId, playerName: s.playerName, wickets: s.wickets, overs: fmtOvers(s.balls),
    average: s.average, economy: s.economy, strikeRate: s.strikeRate, bestFigures: fmtFigures(s.best),
    fiveWickets: s.fiveWickets, wides: s.wides, noBalls: s.noBalls }
}
