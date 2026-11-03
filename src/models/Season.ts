import mongoose, { Document, Model } from 'mongoose'

export interface ISeason extends Document {
  name: string
  startDate: Date
  endDate: Date
  endedAt?: Date | null
  writeVersion?: number
  isCurrent: boolean
  createdAt: Date
  updatedAt: Date
}

const SeasonSchema = new mongoose.Schema<ISeason>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCurrent: { type: Boolean, default: false },
    endedAt: { type: Date, default: null },
    writeVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
)

SeasonSchema.index({ startDate: 1 })
SeasonSchema.index({ isCurrent: 1 }, { unique: true, partialFilterExpression: { isCurrent: true } })

const Season: Model<ISeason> = (mongoose.models.Season as Model<ISeason>) || mongoose.model<ISeason>('Season', SeasonSchema)

export default Season
