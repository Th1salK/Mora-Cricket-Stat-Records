import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import { getMatchDetail } from "@/lib/queries/matches"
import { matchPrefill } from "@/lib/queries/reimport"
import { listDrafts } from "@/lib/queries/drafts"
import { scalar, type PageParams } from "@/lib/ui/url"
import ImportClient from "@/components/import/ImportClient"
import { isAdmin } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Player from "@/models/Player"

export const maxDuration = 60

export default async function ImportPage({ searchParams }: { searchParams: Promise<PageParams> }) {
  if (!(await isAdmin())) redirect("/login")

  const query = await searchParams
  const replaceMatchId = scalar(query.replace)
  const replacement = replaceMatchId ? await getMatchDetail(replaceMatchId) : null
  if (replaceMatchId && !replacement) notFound()
  const drafts = await listDrafts()
  await connectDB()
  const players = await Player.find({ isActive: true })
    .select("fullName shortName aliases")
    .sort({ fullName: 1 })
    .lean()

  return (
    <ImportClient
      draftCount={drafts.length}
      replaceMatchId={replaceMatchId}
      initialDetails={replacement ? matchPrefill(replacement.match) : undefined}
      players={players.map((player) => ({
        id: String(player._id),
        fullName: player.fullName,
        shortName: player.shortName,
        aliases: player.aliases ?? [],
      }))}
    />
  )
}
