"use server"

import mongoose from "mongoose"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import BattingPerformance from "@/models/BattingPerformance"
import BowlingPerformance from "@/models/BowlingPerformance"
import ImportDraft from "@/models/ImportDraft"
import Match from "@/models/Match"
import Player from "@/models/Player"
import { checkExtraction, type Warning } from "@/lib/import/checks"
import {
  DraftSchema,
  MatchDetailsSchema,
  detectSides,
  type Draft,
  type MatchDetails,
  type Side,
} from "@/lib/import/draft"
import { ExtractionError, extractScorecard } from "@/lib/import/extract"
import { buildPublishPayload, type PublishProblem } from "@/lib/import/publish"
import type { Extraction } from "@/lib/import/schema"

const ImagesSchema = z
  .array(
    z.object({
      mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
      data: z.string().min(1),
    })
  )
  .min(1)
  .max(10)

export type ExtractActionResult =
  | {
      ok: true
      draftId: string
      extraction: Extraction
      warnings: Warning[]
      sides: Side[]
      confident: boolean
      modelUsed: string
    }
  | { ok: false; error: string }

export type SaveDraftResult =
  | { ok: true; draftId: string }
  | { ok: false; error: string }

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input"
}

export async function extractAction(
  input: unknown,
  opponent?: string
): Promise<ExtractActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "Not authorised" }

  const images = ImagesSchema.safeParse(input)
  if (!images.success) {
    return { ok: false, error: "Add 1-10 JPEG, PNG or WebP screenshots." }
  }

  const bytes = images.data.reduce(
    (total, image) => total + Math.ceil((image.data.length * 3) / 4),
    0
  )
  if (bytes > 4.5 * 1024 * 1024) {
    return { ok: false, error: "Screenshots must total less than 4.5 MB." }
  }

  try {
    const { data, modelUsed } = await extractScorecard(images.data)
    const { sides, confident } = detectSides(data.innings, opponent ?? "")

    await connectDB()
    const draft = await ImportDraft.create({
      matchDetails: {},
      extraction: data,
      modelUsed,
      createdBy: user._id,
    })

    return {
      ok: true,
      draftId: String(draft._id),
      extraction: data,
      warnings: checkExtraction(data),
      sides,
      confident,
      modelUsed,
    }
  } catch (err) {
    if (err instanceof ExtractionError) {
      return { ok: false, error: err.message }
    }

    console.error("Scorecard extraction failed", err)
    return {
      ok: false,
      error: "Something went wrong while reading the screenshots. Try again.",
    }
  }
}

export async function saveDraftAction(
  draftId: string,
  details: MatchDetails,
  draft: Draft
): Promise<SaveDraftResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "Not authorised" }

  if (!mongoose.isValidObjectId(draftId)) {
    return { ok: false, error: "Draft not found" }
  }

  const parsedDetails = MatchDetailsSchema.safeParse(details)
  if (!parsedDetails.success) {
    return { ok: false, error: firstIssue(parsedDetails.error) }
  }

  const parsedDraft = DraftSchema.safeParse(draft)
  if (!parsedDraft.success) {
    return { ok: false, error: firstIssue(parsedDraft.error) }
  }

  await connectDB()
  const result = await ImportDraft.updateOne(
    { _id: draftId, status: "draft" },
    {
      $set: {
        matchDetails: parsedDetails.data,
        edited: parsedDraft.data,
      },
    }
  )

  if (result.matchedCount === 0) {
    return { ok: false, error: "Draft not found or already published" }
  }

  return { ok: true, draftId }
}

export async function createManualDraftAction(
  details: MatchDetails,
  draft: Draft
): Promise<SaveDraftResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "Not authorised" }

  const parsedDetails = MatchDetailsSchema.safeParse(details)
  if (!parsedDetails.success) {
    return { ok: false, error: firstIssue(parsedDetails.error) }
  }

  const parsedDraft = DraftSchema.safeParse(draft)
  if (!parsedDraft.success) {
    return { ok: false, error: firstIssue(parsedDraft.error) }
  }

  await connectDB()
  const created = await ImportDraft.create({
    matchDetails: parsedDetails.data,
    extraction: parsedDraft.data,
    edited: parsedDraft.data,
    modelUsed: null,
    createdBy: user._id,
  })

  return { ok: true, draftId: String(created._id) }
}

export type PublishActionResult =
  | { ok: true; matchId: string }
  | {
      ok: false
      error: string
      code?: "duplicate" | "problems" | "not-found" | "already-published"
      existingMatchId?: string
      problems?: PublishProblem[]
    }

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export async function publishAction(
  draftId: string,
  options?: { force?: boolean }
): Promise<PublishActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "Not authorised" }

  if (!mongoose.isValidObjectId(draftId)) {
    return { ok: false, code: "not-found", error: "Draft not found" }
  }

  await connectDB()
  const importDraft = await ImportDraft.findById(draftId)

  if (!importDraft) {
    return { ok: false, code: "not-found", error: "Draft not found" }
  }

  if (importDraft.status === "published") {
    return {
      ok: false,
      code: "already-published",
      error: "This draft was already published",
      existingMatchId: importDraft.publishedMatchId
        ? String(importDraft.publishedMatchId)
        : undefined,
    }
  }

  if (importDraft.edited == null) {
    return { ok: false, error: "Save the draft before publishing" }
  }

  const parsedDetails = MatchDetailsSchema.safeParse(importDraft.matchDetails)
  if (!parsedDetails.success) {
    return {
      ok: false,
      error: `The saved match details are invalid: ${firstIssue(parsedDetails.error)}`,
    }
  }

  const parsedDraft = DraftSchema.safeParse(importDraft.edited)
  if (!parsedDraft.success) {
    return {
      ok: false,
      error: `The saved draft is invalid: ${firstIssue(parsedDraft.error)}`,
    }
  }

  const playerDocs = await Player.find({})
    .select("fullName shortName aliases")
    .lean()
  const players = playerDocs.map((player) => ({
    id: String(player._id),
    fullName: player.fullName,
    shortName: player.shortName,
    aliases: player.aliases ?? [],
  }))
  const playerIds = new Set(players.map((player) => player.id))

  const usedPlayerIds = new Set<string>()
  for (const innings of parsedDraft.data.innings) {
    for (const row of [...innings.batting, ...innings.bowling]) {
      if (row.playerId) usedPlayerIds.add(row.playerId)
    }
  }
  for (const playerId of usedPlayerIds) {
    if (!playerIds.has(playerId)) {
      return { ok: false, error: "A selected player no longer exists" }
    }
  }

  const { payload, problems } = buildPublishPayload(
    parsedDetails.data,
    parsedDraft.data,
    players
  )

  if (!payload) {
    return {
      ok: false,
      code: "problems",
      error: "Fix the red warnings before publishing",
      problems,
    }
  }

  if (!options?.force) {
    const parsedDate = new Date(parsedDetails.data.date)
    const dayStart = new Date(
      Date.UTC(
        parsedDate.getUTCFullYear(),
        parsedDate.getUTCMonth(),
        parsedDate.getUTCDate()
      )
    )
    const dayEnd = new Date(dayStart)
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1)

    const existing = await Match.findOne({
      opponent: new RegExp(`^${escapeRegExp(parsedDetails.data.opponent)}$`, "i"),
      date: { $gte: dayStart, $lt: dayEnd },
    })
      .select("_id")
      .lean()

    if (existing) {
      return {
        ok: false,
        code: "duplicate",
        error: `A match against ${parsedDetails.data.opponent} on this date already exists`,
        existingMatchId: String(existing._id),
      }
    }
  }

  let matchId = ""

  try {
    const session = await mongoose.startSession()
    try {
      await session.withTransaction(async () => {
        const [match] = await Match.create(
          [{ ...payload.match, date: new Date(payload.match.date) }],
          { session }
        )

        if (payload.batting.length > 0) {
          await BattingPerformance.insertMany(
            payload.batting.map((row) => ({ ...row, matchId: match._id })),
            { session }
          )
        }

        if (payload.bowling.length > 0) {
          await BowlingPerformance.insertMany(
            payload.bowling.map((row) => ({ ...row, matchId: match._id })),
            { session }
          )
        }

        if (payload.aliases.length > 0) {
          await Player.bulkWrite(
            payload.aliases.map((entry) => ({
              updateOne: {
                filter: { _id: entry.playerId },
                update: { $addToSet: { aliases: entry.alias } },
              },
            })),
            { session }
          )
        }

        const marked = await ImportDraft.updateOne(
          { _id: draftId, status: "draft" },
          { $set: { status: "published", publishedMatchId: match._id } },
          { session }
        )

        if (marked.modifiedCount !== 1) {
          throw new Error("Draft was published by another request")
        }

        matchId = String(match._id)
      })
    } finally {
      await session.endSession()
    }
  } catch (err) {
    console.error("Failed to publish import draft", draftId, err)

    if (err instanceof Error && err.message === "Draft was published by another request") {
      return {
        ok: false,
        code: "already-published",
        error: "This draft was published by another request",
      }
    }

    return { ok: false, error: "Could not publish the match. Try again." }
  }

  revalidatePath("/", "layout")
  return { ok: true, matchId }
}
