import mongoose, { Document, Model } from 'mongoose'
import { MATCH_TYPES, type MatchTypeValue } from '@/lib/constants'

export interface IMatch extends Document {
  date: Date
  opponent: string
  venue: 'Home' | 'Away'
  overs: number,
  matchType: MatchTypeValue
  createdAt: Date
  updatedAt: Date
}

const MatchSchema = new mongoose.Schema<IMatch>(
  {
    date: { type: Date, required: true },
    opponent: { type: String, required: true },
    venue: { type: String, enum: ['Home', 'Away'], required: true },
    overs: { type: Number, required: true,min:1 },
    matchType: {
      type: String,
      enum: [...MATCH_TYPES],
      required: true,
    },
  },
  { timestamps: true }
)

const Match: Model<IMatch> =
  (mongoose.models.Match as Model<IMatch>) ||
  mongoose.model<IMatch>('Match', MatchSchema)

export default Match
