import { z } from "zod"

const MATCH_TYPES = ["Home and Home", "Practice", "Div 3", "Inter Uni", "SLUG"] as const
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
  venue: z.enum(VENUES, { errorMap: () => ({ message: "Venue must be Home or Away" }) }),
  overs: z.number().positive("Overs must be a positive number"),
  matchType: z.enum(MATCH_TYPES, { errorMap: () => ({ message: "Invalid match type" }) }),
})

export const matchUpdateSchema = matchSchema

export const playerSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  shortName: z.string().trim().min(1, "Short name is required").max(20),
  battingStyle: z.enum(BATTING_STYLES).optional(),
  bowlingStyle: z.string().trim().max(50).nullable().optional(),
  role: z.enum(ROLES, { errorMap: () => ({ message: "Invalid role" }) }),
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
  out: z.boolean().optional().default(false),
})

export const bowlingPerformanceSchema = z.object({
  matchId: z.string().min(1, "Match ID is required"),
  playerId: z.string().min(1, "Player ID is required"),
  balls: z.number().int().min(0).optional().default(0),
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
