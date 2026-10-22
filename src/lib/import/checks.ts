import type { Extraction, Innings } from "./schema"
import { countsAsOut, creditsBowler, oversToBalls, parseHowOut } from "./parse"

export type Warning = {
  innings: number
  code: string
  message: string
}

function orZero(value: number | null): number {
  return value ?? 0
}

export function checkInnings(inn: Innings, n: number): Warning[] {
  const warnings: Warning[] = []

  const battingRuns = inn.batting.reduce((sum, row) => sum + orZero(row.runs), 0)
  const extras = inn.extras
  const extrasTotal =
    orZero(extras.byes) +
    orZero(extras.legByes) +
    orZero(extras.wides) +
    orZero(extras.noBalls) +
    orZero(extras.penalty)

  if (inn.total.runs != null && battingRuns + extrasTotal !== inn.total.runs) {
    warnings.push({
      innings: n,
      code: "batting-total",
      message: `Batters ${battingRuns} + extras ${extrasTotal} = ${battingRuns + extrasTotal}, but the total is ${inn.total.runs}`,
    })
  }

  const battersOut = inn.batting.filter((row) => {
    const dismissal = parseHowOut(row.howOut)
    return dismissal.type !== "other" && countsAsOut(dismissal.type)
  }).length

  if (inn.total.wickets != null && battersOut !== inn.total.wickets) {
    warnings.push({
      innings: n,
      code: "wickets",
      message: `${battersOut} batter(s) are out, but the total says ${inn.total.wickets} wicket(s)`,
    })
  }

  for (const bowler of inn.bowling) {
    if (oversToBalls(bowler.overs) == null) {
      warnings.push({
        innings: n,
        code: "bad-overs",
        message: `${bowler.name} has unreadable overs "${bowler.overs}"`,
      })
    }
  }

  const bowlerBalls = inn.bowling.reduce(
    (sum, bowler) => sum + (oversToBalls(bowler.overs) ?? 0),
    0
  )
  const allBowlerOversValid = inn.bowling.every(
    (bowler) => oversToBalls(bowler.overs) != null
  )
  const totalBalls = oversToBalls(inn.total.overs)

  if (allBowlerOversValid && bowlerBalls !== totalBalls) {
    warnings.push({
      innings: n,
      code: "overs",
      message:
        totalBalls == null
          ? `The total overs "${inn.total.overs}" could not be read, but the bowlers add up to ${bowlerBalls} ball(s)`
          : `Bowlers add up to ${bowlerBalls} ball(s), but the total overs "${inn.total.overs}" is ${totalBalls} ball(s)`,
    })
  }

  if (inn.bowling.length > 0 && inn.total.runs != null) {
    const bowlingRuns = inn.bowling.reduce(
      (sum, bowler) => sum + orZero(bowler.runs),
      0
    )
    const extrasNotInBowlingRuns =
      orZero(extras.byes) + orZero(extras.legByes) + orZero(extras.penalty)

    if (bowlingRuns + extrasNotInBowlingRuns !== inn.total.runs) {
      warnings.push({
        innings: n,
        code: "bowling-total",
        message: `Bowlers ${bowlingRuns} + byes/leg byes/penalty ${extrasNotInBowlingRuns} = ${bowlingRuns + extrasNotInBowlingRuns}, but the total is ${inn.total.runs}`,
      })
    }
  }

  if (inn.bowling.length > 0) {
    const bowlerWickets = inn.bowling.reduce(
      (sum, bowler) => sum + orZero(bowler.wickets),
      0
    )
    const creditedWickets = inn.batting.filter((row) =>
      creditsBowler(parseHowOut(row.howOut).type)
    ).length

    if (bowlerWickets !== creditedWickets) {
      warnings.push({
        innings: n,
        code: "bowler-wickets",
        message: `Bowlers have ${bowlerWickets} wicket(s), but ${creditedWickets} dismissal(s) credit a bowler`,
      })
    }
  }

  for (const batter of inn.batting) {
    if (
      batter.runs != null &&
      batter.balls != null &&
      batter.runs > batter.balls * 6
    ) {
      warnings.push({
        innings: n,
        code: "impossible-runs",
        message: `${batter.name} has ${batter.runs} run(s) off ${batter.balls} ball(s), more than the ${batter.balls * 6} possible`,
      })
    }
  }

  for (const batter of inn.batting) {
    const dismissal = parseHowOut(batter.howOut)
    if (dismissal.type === "other") {
      warnings.push({
        innings: n,
        code: "unknown-dismissal",
        message: `${batter.name} has an unrecognised dismissal: "${batter.howOut}"`,
      })
    }
  }

  return warnings
}

export function checkExtraction(data: Extraction): Warning[] {
  return data.innings.flatMap((inn, index) => checkInnings(inn, index + 1))
}
