import { NextResponse } from 'next/server'
import { connectDB } from '../../../../../lib/mongodb'
import BattingPerformance from '../../../../../models/BattingPerformance'
import BowlingPerformance from '../../../../../models/BowlingPerformance'
import Match from '../../../../../models/Match'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params
    await connectDB()

    const { searchParams } = new URL(req.url)
    const matchType = searchParams.get('matchType') || 'All'

    // Resolve match IDs filtered by matchType
    const matchFilter = matchType === 'All' ? {} : { matchType }
    const matches = await Match.find(matchFilter).lean()
    const matchIds = matches.map((m) => m._id)

    // ---- Batting ----
    const battingPerfs = await BattingPerformance.find({
      playerId: id,
      matchId: { $in: matchIds },
    })
      .populate('matchId')
      .lean()

    const bTotalInnings = battingPerfs.length
    const bTotalRuns = battingPerfs.reduce((s, p) => s + (p.runs || 0), 0)
    const bTotalBalls = battingPerfs.reduce((s, p) => s + (p.balls || 0), 0)
    const bDismissals = battingPerfs.filter((p) => p.out).length
    const bNotOuts = bTotalInnings - bDismissals
    const bAverage = bDismissals === 0 ? 0 : Number((bTotalRuns / bDismissals).toFixed(2))
    const bStrikeRate = bTotalBalls === 0 ? 0 : Number(((bTotalRuns / bTotalBalls) * 100).toFixed(2))
    const bHighScore = battingPerfs.length === 0 ? 0 : Math.max(...battingPerfs.map((p) => p.runs || 0))
    const bDucks = battingPerfs.filter((p) => p.runs === 0 && p.out).length
    const bFours = battingPerfs.reduce((s, p) => s + (p.fours || 0), 0)
    const bSixes = battingPerfs.reduce((s, p) => s + (p.sixes || 0), 0)
    const bFifties = battingPerfs.filter((p) => (p.runs || 0) >= 50 && (p.runs || 0) < 100).length
    const bHundreds = battingPerfs.filter((p) => (p.runs || 0) >= 100).length

    // Recent batting: sort newest first
    const recentBatting = [...battingPerfs]
      .sort((a, b) => {
        const dateA = (a.matchId as any)?.date ? new Date((a.matchId as any).date).getTime() : 0
        const dateB = (b.matchId as any)?.date ? new Date((b.matchId as any).date).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 10)
      .map((p) => ({
        matchId: (p.matchId as any)?._id,
        opponent: (p.matchId as any)?.opponent ?? '—',
        date: (p.matchId as any)?.date ?? null,
        matchType: (p.matchId as any)?.matchType ?? '—',
        runs: p.runs,
        balls: p.balls,
        fours: p.fours,
        sixes: p.sixes,
        out: p.out,
      }))

    // ---- Bowling ----
    const bowlingPerfs = await BowlingPerformance.find({
      playerId: id,
      matchId: { $in: matchIds },
    })
      .populate('matchId')
      .lean()

    const wTotalBalls = bowlingPerfs.reduce((s, p) => s + (p.balls || 0), 0)
    const wTotalRuns = bowlingPerfs.reduce((s, p) => s + (p.runs || 0), 0)
    const wTotalWickets = bowlingPerfs.reduce((s, p) => s + (p.wickets || 0), 0)
    const wTotalWides = bowlingPerfs.reduce((s, p) => s + (p.wides || 0), 0)
    const wTotalNoBalls = bowlingPerfs.reduce((s, p) => s + (p.noBalls || 0), 0)
    const wOversDecimal = wTotalBalls / 6
    const wOvers = `${Math.floor(wTotalBalls / 6)}.${wTotalBalls % 6}`
    const wAverage = wTotalWickets === 0 ? 0 : Number((wTotalRuns / wTotalWickets).toFixed(2))
    const wEconomy = wOversDecimal === 0 ? 0 : Number((wTotalRuns / wOversDecimal).toFixed(2))
    const wStrikeRate = wTotalWickets === 0 ? 0 : Number((wTotalBalls / wTotalWickets).toFixed(2))
    const wFiveWickets = bowlingPerfs.filter((p) => (p.wickets || 0) >= 5).length

    let wBestFigures = '-'
    if (bowlingPerfs.length > 0) {
      const best = [...bowlingPerfs].sort((a, b) => {
        if ((b.wickets || 0) !== (a.wickets || 0)) return (b.wickets || 0) - (a.wickets || 0)
        return (a.runs || 0) - (b.runs || 0)
      })[0]
      wBestFigures = `${best.wickets || 0}/${best.runs || 0}`
    }

    // Recent bowling: sort newest first
    const recentBowling = [...bowlingPerfs]
      .sort((a, b) => {
        const dateA = (a.matchId as any)?.date ? new Date((a.matchId as any).date).getTime() : 0
        const dateB = (b.matchId as any)?.date ? new Date((b.matchId as any).date).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 10)
      .map((p) => ({
        matchId: (p.matchId as any)?._id,
        opponent: (p.matchId as any)?.opponent ?? '—',
        date: (p.matchId as any)?.date ?? null,
        matchType: (p.matchId as any)?.matchType ?? '—',
        balls: p.balls,
        runs: p.runs,
        wickets: p.wickets,
        wides: p.wides,
        noBalls: p.noBalls,
      }))

    return NextResponse.json({
      batting: {
        totalInnings: bTotalInnings,
        totalRuns: bTotalRuns,
        totalBalls: bTotalBalls,
        average: bAverage,
        strikeRate: bStrikeRate,
        highScore: bHighScore,
        notOuts: bNotOuts,
        ducks: bDucks,
        fours: bFours,
        sixes: bSixes,
        fifties: bFifties,
        hundreds: bHundreds,
      },
      bowling: {
        totalBalls: wTotalBalls,
        totalRuns: wTotalRuns,
        totalWickets: wTotalWickets,
        totalWides: wTotalWides,
        totalNoBalls: wTotalNoBalls,
        overs: wOvers,
        average: wAverage,
        economy: wEconomy,
        strikeRate: wStrikeRate,
        bestFigures: wBestFigures,
        fiveWickets: wFiveWickets,
      },
      recentBatting,
      recentBowling,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch player stats' }, { status: 500 })
  }
}
