import mongoose, { Document, Model } from 'mongoose'
import { MATCH_TYPES, type MatchTypeValue } from '@/lib/constants'

export type Toss = {
  wonBy: 'mora' | 'opposition'
  decision: 'bat' | 'bowl'
}

export type MatchResult = {
  outcome: 'won' | 'lost' | 'draw' | 'tie' | 'no result'
  margin?: number
  marginType?: 'runs' | 'wickets'
}

export type InningsExtras = {
  byes: number
  legByes: number
  wides: number
  noBalls: number
  penalty: number
}

export type MatchInnings = {
  team: 'mora' | 'opposition'
  teamName: string
  runs: number
  wickets: number
  balls: number
  extras: InningsExtras
}

export interface IMatch extends Document {
  date: Date
  season?: mongoose.Types.ObjectId
  opponent: string
  venue: 'Home' | 'Away'
  overs: number
  matchType: MatchTypeValue
  venueName?: string
  toss?: Toss
  result?: MatchResult
  innings: MatchInnings[]
  source: 'manual' | 'import'
  createdAt: Date
  updatedAt: Date
}

const ExtrasSchema = new mongoose.Schema(
  {
    byes: { type: Number, min: 0, default: 0 },
    legByes: { type: Number, min: 0, default: 0 },
    wides: { type: Number, min: 0, default: 0 },
    noBalls: { type: Number, min: 0, default: 0 },
    penalty: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
)

const InningsSchema = new mongoose.Schema(
  {
    team: { type: String, enum: ['mora', 'opposition'], required: true },
    teamName: { type: String, required: true },
    runs: { type: Number, min: 0, required: true },
    wickets: { type: Number, min: 0, max: 10, required: true },
    balls: { type: Number, min: 0, required: true },
    extras: { type: ExtrasSchema, default: () => ({}) },
  },
  { _id: false }
)

const MatchSchema = new mongoose.Schema<IMatch>(
  {
    date: { type: Date, required: true },
    season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', index: true },
    opponent: { type: String, required: true },
    venue: { type: String, enum: ['Home', 'Away'], required: true },
    overs: { type: Number, required: true,min:1 },
    matchType: {
      type: String,
      enum: [...MATCH_TYPES],
      required: true,
    },
    venueName: { type: String, trim: true },
    toss: {
      wonBy: { type: String, enum: ['mora', 'opposition'] },
      decision: { type: String, enum: ['bat', 'bowl'] },
    },
    result: {
      outcome: { type: String, enum: ['won', 'lost', 'draw', 'tie', 'no result'] },
      margin: { type: Number, min: 0 },
      marginType: { type: String, enum: ['runs', 'wickets'] },
    },
    innings: { type: [InningsSchema], default: [] },
    source: { type: String, enum: ['manual', 'import'], default: 'manual' },
  },
  { timestamps: true }
)

const Match: Model<IMatch> =
  (mongoose.models.Match as Model<IMatch>) ||
  mongoose.model<IMatch>('Match', MatchSchema)

export default Match
