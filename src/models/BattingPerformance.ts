import mongoose, { Document, Model } from 'mongoose'

export interface IBattingPerformance extends Document {
  matchId: mongoose.Types.ObjectId
  playerId: mongoose.Types.ObjectId
  runs: number
  balls: number
  fours: number
  sixes: number
  out: boolean
  createdAt: Date
  updatedAt: Date
}

const BattingPerformanceSchema = new mongoose.Schema<IBattingPerformance>(
  {
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    out: { type: Boolean, default: false },
  },
  { timestamps: true }
)

BattingPerformanceSchema.index({ matchId: 1, playerId: 1 }, { unique: true })

const BattingPerformance: Model<IBattingPerformance> =
  (mongoose.models.BattingPerformance as Model<IBattingPerformance>) ||
  mongoose.model<IBattingPerformance>('BattingPerformance', BattingPerformanceSchema)

export default BattingPerformance
