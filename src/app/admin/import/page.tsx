import { redirect } from "next/navigation"
import ImportClient from "@/components/import/ImportClient"
import { isAdmin } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Player from "@/models/Player"

export const maxDuration = 60

export default async function ImportPage() {
  if (!(await isAdmin())) redirect("/login")

  await connectDB()
  const players = await Player.find({ isActive: true })
    .select("fullName shortName aliases")
    .sort({ fullName: 1 })
    .lean()

  return (
    <ImportClient
      players={players.map((player) => ({
        id: String(player._id),
        fullName: player.fullName,
        shortName: player.shortName,
        aliases: player.aliases ?? [],
      }))}
    />
  )
}
