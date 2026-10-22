import {z} from "zod"

const count =z.number().int().min(0).nullable()

export const BattingRowSchema = z.object({
    name:z.string(),
    howOut:z.string(),
    runs:count,
    balls:count,
    fours:count,
    sixes:count,
})

export const BowlingRowSchema= z.object({
    name:z.string(),
    overs:z.string(),
    maidens:count,
    runs:count,
    wickets:count,
    wides:count,
    noBalls:count,
})

export const InningsSchema = z.object({
  battingTeam: z.string(),
  total: z.object({ runs: count, wickets: count, overs: z.string() }),
  extras: z.object({ byes: count, legByes: count, wides: count, noBalls: count, penalty: count }),
  batting: z.array(BattingRowSchema),
  bowling: z.array(BowlingRowSchema),
  didNotBat: z.array(z.string()),
})

export const ExtractionSchema = z.object({
  innings: z.array(InningsSchema).min(1).max(2),
  unreadable: z.array(z.string()),
})

// TypeScript types made from the schema, so they can never drift apart
export type Extraction = z.infer<typeof ExtractionSchema>
export type Innings = z.infer<typeof InningsSchema>
export type BattingRow = z.infer<typeof BattingRowSchema>
export type BowlingRow = z.infer<typeof BowlingRowSchema>

// The same schema as JSON Schema, for Gemini. "$schema" is removed because Gemini doesn't need it.
const { $schema: _ignored, ...jsonSchema } = z.toJSONSchema(ExtractionSchema)
export const extractionJsonSchema = jsonSchema