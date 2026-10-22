"use server"

import mongoose from "mongoose"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import ImportDraft from "@/models/ImportDraft"
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
import type { Extraction } from "@/lib/import/schema"

const ImagesSchema = z
  .array(
    z.object({
      mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
      data: z.string().min(1),
    })
  )
  .min(1)
  .max(4)

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
    return { ok: false, error: "Add one to four JPEG, PNG or WebP screenshots." }
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
