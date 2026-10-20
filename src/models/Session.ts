import mongoose, { Document, Model } from 'mongoose'

export interface ISession extends Document {
  tokenHash: string
  userId: mongoose.Types.ObjectId
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const SessionSchema = new mongoose.Schema<ISession>(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
)

const Session: Model<ISession> =
  (mongoose.models.Session as Model<ISession>) ||
  mongoose.model<ISession>('Session', SessionSchema)

export default Session
