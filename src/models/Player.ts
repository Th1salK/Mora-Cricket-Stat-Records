import mongoose, { Document, Model } from 'mongoose'

export interface IPlayer extends Document {
  fullName: string
  shortName: string
  battingStyle?: 'Right Hand Bat' | 'Left Hand Bat'
  bowlingStyle?: string | null
  role: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const PlayerSchema = new mongoose.Schema<IPlayer>(
  {
    fullName: { type: String, required: true },
    shortName: { type: String, required: true },
    battingStyle: {
      type: String,
      enum: ['Right Hand Bat', 'Left Hand Bat'],
    },
    bowlingStyle: { type: String, default: null },
    role: {
      type: String,
      enum: ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const Player: Model<IPlayer> =
  (mongoose.models.Player as Model<IPlayer>) ||
  mongoose.model<IPlayer>('Player', PlayerSchema)

export default Player
