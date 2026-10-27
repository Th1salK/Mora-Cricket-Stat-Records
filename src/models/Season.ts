import mongoose, { Document, Model } from 'mongoose'

export interface ISeason extends Document {
  name: string
  startDate: Date
  endDate: Date
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
  },
  { timestamps: true }
)

SeasonSchema.index({ startDate: 1 })

const Season: Model<ISeason> = (mongoose.models.Season as Model<ISeason>) || mongoose.model<ISeason>('Season', SeasonSchema)

export default Season
