import mongoose, { Document, Model, Types } from 'mongoose'

export interface IImportDraft extends Document {
  status: 'draft' | 'published'
  matchDetails: unknown
  extraction: unknown
  edited: unknown | null
  modelUsed: string | null
  createdBy: Types.ObjectId
  publishedMatchId: Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

const ImportDraftSchema = new mongoose.Schema<IImportDraft>(
  {
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    matchDetails: { type: mongoose.Schema.Types.Mixed, required: true },
    extraction: { type: mongoose.Schema.Types.Mixed, required: true },
    edited: { type: mongoose.Schema.Types.Mixed, default: null },
    modelUsed: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publishedMatchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', default: null },
  },
  { timestamps: true }
)

ImportDraftSchema.index(
  { updatedAt: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24 * 30,
    partialFilterExpression: { status: 'draft' },
  }
)

const ImportDraft: Model<IImportDraft> =
  (mongoose.models.ImportDraft as Model<IImportDraft>) ||
  mongoose.model<IImportDraft>('ImportDraft', ImportDraftSchema)

export default ImportDraft
