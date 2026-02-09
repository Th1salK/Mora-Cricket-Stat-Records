import mongoose, { Document, Model } from 'mongoose'

export interface IBowlingPerformance extends Document {
  matchId: mongoose.Types.ObjectId
  playerId: mongoose.Types.ObjectId
  balls: number
  runs: number
  wickets: number
  wides: number
  noBalls: number
  createdAt: Date
  updatedAt: Date
}

const BowlingPerformanceSchema = new mongoose.Schema<IBowlingPerformance>(
  {
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    balls: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    wides: { type: Number, default: 0 },
    noBalls: { type: Number, default: 0 },
  },
  { timestamps: true }
)

BowlingPerformanceSchema.index({ matchId: 1, playerId: 1 }, { unique: true })

const BowlingPerformance: Model<IBowlingPerformance> =
  (mongoose.models.BowlingPerformance as Model<IBowlingPerformance>) ||
  mongoose.model<IBowlingPerformance>('BowlingPerformance', BowlingPerformanceSchema)

export default BowlingPerformance
