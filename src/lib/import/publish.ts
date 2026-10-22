import type { MatchTypeValue } from "@/lib/constants"
import { draftWarnings, type Draft, type MatchDetails } from "./draft"
import { normalise, type PlayerLite } from "./matchPlayers"
import { cleanName, countsAsOut, oversToBalls, parseHowOut, type DismissalType } from "./parse"

export type PublishPayload = {
  match: {
    date: string
    opponent: string
    venue: "Home" | "Away"
    overs: number
    matchType: MatchTypeValue
    venueName?: string
    toss?: { wonBy: "mora" | "opposition"; decision: "bat" | "bowl" }
    result?: {
      outcome: "won" | "lost" | "draw" | "tie" | "no result"
      margin?: number
      marginType?: "runs" | "wickets"
    }
    innings: {
      team: "mora" | "opposition"
      teamName: string
      runs: number
      wickets: number
      balls: number
      extras: {
        byes: number
        legByes: number
        wides: number
        noBalls: number
        penalty: number
      }
    }[]
    source: "import"
  }
  batting: {
    playerId: string
    runs: number
    balls: number
    fours: number
    sixes: number
    out: boolean
    position: number
    dismissal: { type: DismissalType; fielder: string | null; bowler: string | null }
  }[]
  bowling: {
    playerId: string
    balls: number
    runs: number
    wickets: number
    maidens: number
    wides: number
    noBalls: number
  }[]
  aliases: { playerId: string; alias: string }[]
}

export type PublishProblem = { blocking: boolean; message: string }

type AliasCandidate = { playerId: string; rawName: string }

export function buildPublishPayload(
  details: MatchDetails,
  draft: Draft,
  players: PlayerLite[]
): { payload: PublishPayload | null; problems: PublishProblem[] } {
  const problems: PublishProblem[] = []

  for (const warning of draftWarnings(draft)) {
    if (warning.blocking) {
      problems.push({ blocking: true, message: warning.message })
    }
  }

  if (draft.innings.length === 2) {
    const moraCount = draft.innings.filter((inn) => inn.side === "mora").length
    if (moraCount !== 1) {
      problems.push({ blocking: true, message: "Mark which innings is Mora's" })
    }
  }

  const innings: PublishPayload["match"]["innings"] = draft.innings.map((inn, index) => {
    const runs = inn.total.runs
    const wickets = inn.total.wickets
    const balls = oversToBalls(inn.total.overs)

    if (runs == null) {
      problems.push({ blocking: true, message: `Innings ${index + 1} total runs are missing` })
    }
    if (wickets == null) {
      problems.push({
        blocking: true,
        message: `Innings ${index + 1} total wickets are missing`,
      })
    }
    if (balls == null) {
      problems.push({
        blocking: true,
        message: `Innings ${index + 1} overs "${inn.total.overs}" are not valid`,
      })
    }

    return {
      team: inn.side,
      teamName: inn.battingTeam,
      runs: runs ?? 0,
      wickets: wickets ?? 0,
      balls: balls ?? 0,
      extras: {
        byes: inn.extras.byes ?? 0,
        legByes: inn.extras.legByes ?? 0,
        wides: inn.extras.wides ?? 0,
        noBalls: inn.extras.noBalls ?? 0,
        penalty: inn.extras.penalty ?? 0,
      },
    }
  })

  const batting: PublishPayload["batting"] = []
  const bowling: PublishPayload["bowling"] = []
  const aliasCandidates: AliasCandidate[] = []

  const moraInnings = draft.innings.find((inn) => inn.side === "mora")
  if (moraInnings) {
    let position = 0

    for (const row of moraInnings.batting) {
      const dismissal = parseHowOut(row.howOut)
      if (dismissal.type === "did not bat") continue

      if (row.runs == null || row.balls == null) {
        problems.push({
          blocking: true,
          message: `${row.name} is missing runs or balls`,
        })
        continue
      }

      if (!row.playerId) continue

      position += 1

      if (dismissal.type === "other") {
        problems.push({
          blocking: false,
          message: `Couldn't understand how ${row.name} was out; saved as 'other'`,
        })
      }

      batting.push({
        playerId: row.playerId,
        runs: row.runs,
        balls: row.balls,
        fours: row.fours ?? 0,
        sixes: row.sixes ?? 0,
        out: countsAsOut(dismissal.type),
        position,
        dismissal: {
          type: dismissal.type,
          fielder: dismissal.fielder,
          bowler: dismissal.bowler,
        },
      })
      aliasCandidates.push({ playerId: row.playerId, rawName: row.name })
    }
  }

  const oppositionInnings = draft.innings.find((inn) => inn.side === "opposition")
  if (oppositionInnings) {
    for (const row of oppositionInnings.bowling) {
      const balls = oversToBalls(row.overs)
      if (balls == null) {
        problems.push({
          blocking: true,
          message: `${row.name} has unreadable overs "${row.overs}"`,
        })
        continue
      }

      if (row.runs == null || row.wickets == null) {
        problems.push({
          blocking: true,
          message: `${row.name} is missing runs or wickets`,
        })
        continue
      }

      if (!row.playerId) continue

      bowling.push({
        playerId: row.playerId,
        balls,
        runs: row.runs,
        wickets: row.wickets,
        maidens: row.maidens ?? 0,
        wides: row.wides ?? 0,
        noBalls: row.noBalls ?? 0,
      })
      aliasCandidates.push({ playerId: row.playerId, rawName: row.name })
    }
  }

  let result: PublishPayload["match"]["result"]
  if (details.result && draft.innings.length === 2) {
    const moraIndex = innings.findIndex((inn) => inn.team === "mora")

    if (moraIndex >= 0) {
      const mora = innings[moraIndex]
      const opposition = innings[1 - moraIndex]
      const moraBattedFirst = moraIndex === 0
      const outcome = details.result.outcome
      let margin: number | undefined
      let marginType: "runs" | "wickets" | undefined

      if (outcome === "won") {
        if (mora.runs <= opposition.runs) {
          problems.push({
            blocking: false,
            message: "The result you picked doesn't match the scores",
          })
        } else if (moraBattedFirst) {
          margin = mora.runs - opposition.runs
          marginType = "runs"
        } else {
          margin = 10 - mora.wickets
          marginType = "wickets"
        }
      } else if (outcome === "lost") {
        if (mora.runs > opposition.runs) {
          problems.push({
            blocking: false,
            message: "The result you picked doesn't match the scores",
          })
        } else if (!moraBattedFirst) {
          margin = opposition.runs - mora.runs
          marginType = "runs"
        } else {
          margin = 10 - opposition.wickets
          marginType = "wickets"
        }
      }

      result = { outcome }
      if (margin != null && margin >= 0 && marginType) {
        result.margin = margin
        result.marginType = marginType
      }
    }
  }

  const aliases: PublishPayload["aliases"] = []
  const playersById = new Map(players.map((player) => [player.id, player]))
  const seenAliases = new Set<string>()

  for (const candidate of aliasCandidates) {
    const player = playersById.get(candidate.playerId)
    if (!player) continue

    const alias = cleanName(candidate.rawName).name
    const key = normalise(alias)
    if (!key) continue

    const known = [player.fullName, player.shortName, ...player.aliases].map(normalise)
    if (known.includes(key)) continue

    const dedupeKey = `${candidate.playerId}:${key}`
    if (seenAliases.has(dedupeKey)) continue

    seenAliases.add(dedupeKey)
    aliases.push({ playerId: candidate.playerId, alias })
  }

  const payload: PublishPayload = {
    match: {
      date: details.date,
      opponent: details.opponent,
      venue: details.venue,
      overs: details.overs,
      matchType: details.matchType,
      ...(details.venueName ? { venueName: details.venueName } : {}),
      ...(details.toss ? { toss: details.toss } : {}),
      ...(result ? { result } : {}),
      innings,
      source: "import",
    },
    batting,
    bowling,
    aliases,
  }

  return {
    payload: problems.some((problem) => problem.blocking) ? null : payload,
    problems,
  }
}
