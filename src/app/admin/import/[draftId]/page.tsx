import mongoose from "mongoose"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import SavedDraftClient from "@/components/import/SavedDraftClient"
import { isAdmin } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import ImportDraft from "@/models/ImportDraft"
import Player from "@/models/Player"

export default async function DraftPage({
  params,
}: {
  params: Promise<{ draftId: string }>
}) {
  if (!(await isAdmin())) redirect("/login")

  const { draftId } = await params
  if (!mongoose.isValidObjectId(draftId)) notFound()

  await connectDB()
  const [draft, players] = await Promise.all([
    ImportDraft.findById(draftId).lean(),
    Player.find({ isActive: true })
      .select("fullName shortName aliases")
      .sort({ fullName: 1 })
      .lean(),
  ])

  if (!draft) notFound()

  if (draft.status === "published") {
    return (
      <div className="glass space-y-3 p-6">
        <h1 className="text-xl font-bold text-yellow-400">This draft was already published</h1>
        <p className="text-sm text-slate-400">
          Its match and performances are already saved.
        </p>
        <Link href="/matches" className="text-sm text-blue-400 hover:text-blue-300">
          View matches
        </Link>
      </div>
    )
  }

  return (
    <SavedDraftClient
      draftId={draftId}
      initialDetails={draft.matchDetails}
      initialDraft={draft.edited}
      players={players.map((player) => ({
        id: String(player._id),
        fullName: player.fullName,
        shortName: player.shortName,
        aliases: player.aliases ?? [],
      }))}
    />
  )
}
