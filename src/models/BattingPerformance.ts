import mongoose, { Document, Model } from 'mongoose'
import { DISMISSAL_TYPES, type DismissalType } from '@/lib/import/parse'

export interface IBattingPerformance extends Document {
  matchId: mongoose.Types.ObjectId
  playerId: mongoose.Types.ObjectId
  runs: number
  balls: number
  fours: number
  sixes: number
  position?: number
  dismissal?: {
    type: DismissalType
    fielder: string | null
    bowler: string | null
  }
  out: boolean
  createdAt: Date
  updatedAt: Date
}

const DismissalSchema = new mongoose.Schema(
  {
    type: { type: String, enum: [...DISMISSAL_TYPES] },
    fielder: { type: String, default: null },
    bowler: { type: String, default: null },
  },
  { _id: false }
)

const BattingPerformanceSchema = new mongoose.Schema<IBattingPerformance>(
  {
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    position: { type: Number, min: 1, max: 11 },
    dismissal: { type: DismissalSchema },
    out: { type: Boolean, default: false },
  },
  { timestamps: true }
)

BattingPerformanceSchema.index({ matchId: 1, playerId: 1 }, { unique: true })

const BattingPerformance: Model<IBattingPerformance> =
  (mongoose.models.BattingPerformance as Model<IBattingPerformance>) ||
  mongoose.model<IBattingPerformance>('BattingPerformance', BattingPerformanceSchema)

export default BattingPerformance
