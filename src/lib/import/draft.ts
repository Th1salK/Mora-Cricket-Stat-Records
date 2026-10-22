import { z } from "zod"
import { MATCH_TYPES } from "@/lib/constants"
import {
  InningsSchema,
  BattingRowSchema,
  BowlingRowSchema,
  type BattingRow,
  type BowlingRow,
  type Extraction,
  type Innings,
} from "./schema"
import { checkExtraction, type Warning } from "./checks"
import { matchName, normalise, similarity, type NameMatch, type PlayerLite } from "./matchPlayers"

export type Side = "mora" | "opposition"

export type DraftBattingRow = BattingRow & {
  match: NameMatch | null
  playerId: string | null
}

export type DraftBowlingRow = BowlingRow & {
  match: NameMatch | null
  playerId: string | null
}

export type DraftInnings = Omit<Innings, "batting" | "bowling"> & {
  side: Side
  batting: DraftBattingRow[]
  bowling: DraftBowlingRow[]
}

export type Draft = {
  innings: DraftInnings[]
  unreadable: string[]
}

export type DraftWarning = Warning & { blocking: boolean }

export const MatchDetailsSchema = z.object({
  matchType: z.enum(MATCH_TYPES),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((value) => !isNaN(Date.parse(value)), { message: "Invalid date format" }),
  opponent: z.string().trim().min(1, "Opponent is required").max(100),
  venue: z.enum(["Home", "Away"]),
  overs: z.number().int().min(1).max(100),
  venueName: z.string().trim().max(100).optional(),
  toss: z
    .object({
      wonBy: z.enum(["mora", "opposition"]),
      decision: z.enum(["bat", "bowl"]),
    })
    .optional(),
  result: z
    .object({
      outcome: z.enum(["won", "lost", "draw", "tie", "no result"]),
    })
    .optional(),
})

export type MatchDetails = z.infer<typeof MatchDetailsSchema>

const NameMatchSchema = z.object({
  raw: z.string(),
  cleaned: z.string(),
  status: z.enum(["exact", "confirm", "unmatched"]),
  playerId: z.string().nullable(),
  reason: z.string(),
  suggestions: z.array(z.string()),
})

const DraftBattingRowSchema = BattingRowSchema.extend({
  match: NameMatchSchema.nullable(),
  playerId: z.string().nullable(),
})

const DraftBowlingRowSchema = BowlingRowSchema.extend({
  match: NameMatchSchema.nullable(),
  playerId: z.string().nullable(),
})

const DraftInningsSchema = InningsSchema.extend({
  side: z.enum(["mora", "opposition"]),
  batting: z.array(DraftBattingRowSchema),
  bowling: z.array(DraftBowlingRowSchema),
})

export const DraftSchema = z.object({
  innings: z.array(DraftInningsSchema).min(1).max(2),
  unreadable: z.array(z.string()),
})

function isConfirmedMatch(match: NameMatch): boolean {
  return match.status === "exact" || match.status === "confirm"
}

function autoMatch<T extends BattingRow | BowlingRow>(
  row: T,
  players: PlayerLite[],
  teamNames: string[]
): T & { match: NameMatch | null; playerId: string | null } {
  const match = matchName(row.name, players, teamNames)
  return {
    ...row,
    match,
    playerId: isConfirmedMatch(match) ? match.playerId : null,
  }
}

function withoutMatch<T extends BattingRow | BowlingRow>(
  row: T
): T & { match: null; playerId: null } {
  return { ...row, match: null, playerId: null }
}

export function detectSides(
  innings: Innings[],
  opponent: string
): { sides: Side[]; confident: boolean } {
  const opponentKey = normalise(opponent)

  const looksMoras = innings.map((inn) => inn.battingTeam.toLowerCase().includes("mora"))
  const looksOpponents = innings.map((inn) => {
    const team = normalise(inn.battingTeam)
    if (!team || !opponentKey) return false
    return (
      team.includes(opponentKey) ||
      opponentKey.includes(team) ||
      similarity(team, opponentKey) >= 0.6
    )
  })

  if (innings.length === 1) {
    const isMora = looksMoras[0]
    return {
      sides: [isMora ? "mora" : "opposition"],
      confident: isMora || looksOpponents[0],
    }
  }

  const moraCount = looksMoras.filter(Boolean).length
  if (moraCount === 1) {
    return {
      sides: looksMoras.map((isMora) => (isMora ? "mora" : "opposition")),
      confident: true,
    }
  }

  return {
    sides: innings.map((_, index) => (index % 2 === 0 ? "mora" : "opposition")),
    confident: false,
  }
}

export function buildDraft(
  extraction: Extraction,
  players: PlayerLite[],
  opponent: string,
  sides?: Side[]
): Draft {
  const resolvedSides = sides ?? detectSides(extraction.innings, opponent).sides
  const teamNames = [
    ...extraction.innings.map((innings) => innings.battingTeam),
    "Mora Cricket",
  ]

  return {
    unreadable: [...extraction.unreadable],
    innings: extraction.innings.map((inn, index) => {
      const side = resolvedSides[index] ?? (index === 0 ? "mora" : "opposition")

      return {
        ...inn,
        side,
        batting: inn.batting.map((row) =>
          side === "mora" ? autoMatch(row, players, teamNames) : withoutMatch(row)
        ),
        bowling: inn.bowling.map((row) =>
          side === "opposition" ? autoMatch(row, players, teamNames) : withoutMatch(row)
        ),
      }
    }),
  }
}

function rematchRow<T extends DraftBattingRow | DraftBowlingRow>(
  row: T,
  players: PlayerLite[],
  teamNames: string[]
): T {
  const match = matchName(row.name, players, teamNames)
  return {
    ...row,
    match,
    playerId: isConfirmedMatch(match) ? match.playerId : null,
  }
}

export function swapSides(draft: Draft, players: PlayerLite[]): Draft {
  const teamNames = [
    ...draft.innings.map((innings) => innings.battingTeam),
    "Mora Cricket",
  ]

  return {
    ...draft,
    innings: draft.innings.map((inn) => {
      const side: Side = inn.side === "mora" ? "opposition" : "mora"

      return {
        ...inn,
        side,
        batting: inn.batting.map((row) =>
          side === "mora" ? rematchRow(row, players, teamNames) : withoutMatch(row)
        ),
        bowling: inn.bowling.map((row) =>
          side === "opposition" ? rematchRow(row, players, teamNames) : withoutMatch(row)
        ),
      }
    }),
  }
}

function setRowPlayer<T extends DraftBattingRow | DraftBowlingRow>(
  row: T,
  playerId: string | null
): T {
  return {
    ...row,
    playerId,
    match: playerId
      ? {
          raw: row.name,
          cleaned: row.name,
          status: "exact",
          playerId,
          reason: "picked manually",
          suggestions: [],
        }
      : null,
  }
}

export function setPlayer(
  draft: Draft,
  inningsIndex: number,
  table: "batting" | "bowling",
  rowIndex: number,
  playerId: string | null
): Draft {
  return {
    ...draft,
    innings: draft.innings.map((inn, index) => {
      if (index !== inningsIndex) return inn

      if (table === "batting") {
        return {
          ...inn,
          batting: inn.batting.map((row, rowIdx) =>
            rowIdx === rowIndex ? setRowPlayer(row, playerId) : row
          ),
        }
      }

      return {
        ...inn,
        bowling: inn.bowling.map((row, rowIdx) =>
          rowIdx === rowIndex ? setRowPlayer(row, playerId) : row
        ),
      }
    }),
  }
}

export function draftWarnings(draft: Draft): DraftWarning[] {
  const warnings: DraftWarning[] = checkExtraction(draft).map((warning) => ({
    ...warning,
    blocking: false,
  }))

  draft.innings.forEach((inn, index) => {
    const moraRows = inn.side === "mora" ? inn.batting : inn.bowling

    for (const row of moraRows) {
      if (!row.playerId) {
        warnings.push({
          innings: index + 1,
          code: "unmatched-player",
          message: `"${row.name || "Unnamed player"}" is not linked to a player`,
          blocking: true,
        })
      } else if (row.match?.status === "confirm") {
        warnings.push({
          innings: index + 1,
          code: "confirm-player",
          message: `"${row.name}" is a probable match — confirm or pick the player`,
          blocking: false,
        })
      }
    }

    for (const [table, rows] of [
      ["batting", inn.batting],
      ["bowling", inn.bowling],
    ] as const) {
      const seen = new Set<string>()
      for (const row of rows) {
        if (!row.playerId) continue
        if (seen.has(row.playerId)) {
          warnings.push({
            innings: index + 1,
            code: "duplicate-player",
            message: `The same player appears twice in the ${table} table`,
            blocking: true,
          })
        }
        seen.add(row.playerId)
      }
    }
  })

  return warnings
}

export function canPublish(draft: Draft): boolean {
  return !draftWarnings(draft).some((warning) => warning.blocking)
}
