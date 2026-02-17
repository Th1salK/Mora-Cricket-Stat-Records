import mongoose, { Document, Model } from 'mongoose'

export interface IMatch extends Document {
  date: Date
  opponent: string
  venue: 'Home' | 'Away'
  overs: number,
  matchType: 'Home and Home' | 'Practice' | 'Div 3'|'Inter Uni' | 'SLUG'
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
      enum: ['Home and Home','Practice','Div 3','Inter Uni','SLUG'],
      required: true,
    },
  },
  { timestamps: true }
)

const Match: Model<IMatch> =
  (mongoose.models.Match as Model<IMatch>) ||
  mongoose.model<IMatch>('Match', MatchSchema)

export default Match
