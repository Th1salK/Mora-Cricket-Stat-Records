import mongoose from "mongoose"
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
    ImportDraft.findOne({ _id: draftId, status: "draft" }).lean(),
    Player.find({ isActive: true })
      .select("fullName shortName aliases")
      .sort({ fullName: 1 })
      .lean(),
  ])

  if (!draft) notFound()

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
