import { connectDB } from '@/lib/mongodb'
import { draftStatus } from '@/lib/queries/draftRows'
import ImportDraft from '@/models/ImportDraft'
export async function listDrafts() {
  await connectDB()
  const docs = await ImportDraft.find({ status: 'draft' }).sort({ updatedAt: -1 }).lean()
  const now = Date.now()
  return docs.map((doc) => {
    const details = (doc.matchDetails ?? {}) as { opponent?: string; date?: string; venue?: string; matchType?: string }
    return { id: String(doc._id), opponent: details.opponent ?? 'Untitled match', date: details.date ?? null, venue: details.venue ?? null, matchType: details.matchType ?? null, savedAt: doc.updatedAt.toISOString(), kind: doc.modelUsed ? 'AI import' as const : 'Manual draft' as const, expiresSoon: doc.updatedAt.getTime() + 30 * 86400000 - now <= 3 * 86400000, ...draftStatus(doc.edited, doc.matchDetails, doc.updatedAt, !doc.modelUsed) }
  })
}
