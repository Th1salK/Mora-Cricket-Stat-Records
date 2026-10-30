import { z } from "zod"
import { MATCH_TYPES } from "@/lib/constants"
import { DISMISSAL_TYPES } from "@/lib/import/parse"
import { normalizeAliases } from "@/lib/ui/aliases"

const VENUES = ["Home", "Away"] as const
const BATTING_STYLES = ["Right Hand Bat", "Left Hand Bat"] as const
const ROLES = ["Batsman", "Bowler", "All-rounder", "Wicket-keeper"] as const

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required").max(50),
  password: z.string().min(1, "Password is required").max(128),
})

export const matchSchema = z.object({
  date: z.string().min(1, "Date is required").refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  opponent: z.string().trim().min(1, "Opponent is required").max(100),
  venue: z.enum(VENUES, { message: "Venue must be Home or Away" }),
  overs: z.number().positive("Overs must be a positive number"),
  matchType: z.enum(MATCH_TYPES, { message: "Invalid match type" }),
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
      margin: z.number().int().min(0).optional(),
      marginType: z.enum(["runs", "wickets"]).optional(),
    })
    .optional(),
  innings: z
    .array(
      z.object({
        team: z.enum(["mora", "opposition"]),
        teamName: z.string().trim().min(1).max(100),
        runs: z.number().int().min(0),
        wickets: z.number().int().min(0).max(10),
        balls: z.number().int().min(0),
        extras: z
          .object({
            byes: z.number().int().min(0).optional().default(0),
            legByes: z.number().int().min(0).optional().default(0),
            wides: z.number().int().min(0).optional().default(0),
            noBalls: z.number().int().min(0).optional().default(0),
            penalty: z.number().int().min(0).optional().default(0),
          })
          .optional()
          .default({ byes: 0, legByes: 0, wides: 0, noBalls: 0, penalty: 0 }),
      })
    )
    .optional(),
  source: z.enum(["manual", "import"]).optional(),
})

export const matchUpdateSchema = matchSchema

export const playerSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  shortName: z.string().trim().min(1, "Short name is required").max(20),
  aliases: z.array(z.string().trim().max(100)).max(20).transform(normalizeAliases).optional(),
  battingStyle: z.enum(BATTING_STYLES).optional(),
  bowlingStyle: z.string().trim().max(50).nullable().optional(),
  role: z.enum(ROLES, { message: "Invalid role" }),
  isActive: z.boolean().optional().default(true),
})

export const playerUpdateSchema = playerSchema.partial().extend({
  id: z.string().min(1, "Player ID is required"),
})

export const battingPerformanceSchema = z.object({
  matchId: z.string().min(1, "Match ID is required"),
  playerId: z.string().min(1, "Player ID is required"),
  runs: z.number().int().min(0).optional().default(0),
  balls: z.number().int().min(0).optional().default(0),
  fours: z.number().int().min(0).optional().default(0),
  sixes: z.number().int().min(0).optional().default(0),
  position: z.number().int().min(1).max(11).optional(),
  dismissal: z
    .object({
      type: z.enum(DISMISSAL_TYPES),
      fielder: z.string().nullable().optional().default(null),
      bowler: z.string().nullable().optional().default(null),
    })
    .optional(),
  out: z.boolean().optional().default(false),
})

export const bowlingPerformanceSchema = z.object({
  matchId: z.string().min(1, "Match ID is required"),
  playerId: z.string().min(1, "Player ID is required"),
  balls: z.number().int().min(0).optional().default(0),
  maidens: z.number().int().min(0).optional().default(0),
  runs: z.number().int().min(0).optional().default(0),
  wickets: z.number().int().min(0).optional().default(0),
  wides: z.number().int().min(0).optional().default(0),
  noBalls: z.number().int().min(0).optional().default(0),
})

export type LoginInput = z.infer<typeof loginSchema>
export type MatchInput = z.infer<typeof matchSchema>
export type PlayerInput = z.infer<typeof playerSchema>
export type BattingPerformanceInput = z.infer<typeof battingPerformanceSchema>
export type BowlingPerformanceInput = z.infer<typeof bowlingPerformanceSchema>
