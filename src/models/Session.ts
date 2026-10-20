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
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
)

// NOTE: MongoDB cannot convert an existing non-TTL index into a TTL index.
// Before deploying, drop the old `expiresAt_1` index on the sessions collection
// in the Atlas UI (or run `db.sessions.dropIndex("expiresAt_1")`). Mongoose only
// creates the TTL index below when an index with that name does not already exist.
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const Session: Model<ISession> =
  (mongoose.models.Session as Model<ISession>) ||
  mongoose.model<ISession>('Session', SessionSchema)

export default Session
