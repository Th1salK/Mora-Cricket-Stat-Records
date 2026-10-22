"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DraftSchema,
  MatchDetailsSchema,
  type Draft,
  type MatchDetails,
} from "@/lib/import/draft"
import type { PlayerLite } from "@/lib/import/matchPlayers"
import type { PublishProblem } from "@/lib/import/publish"
import {
  publishAction,
  saveDraftAction,
  type PublishActionResult,
} from "@/lib/actions/importActions"
import DraftReview from "./DraftReview"

type SavedDraftClientProps = {
  draftId: string
  initialDetails: unknown
  initialDraft: unknown
  players: PlayerLite[]
}

export default function SavedDraftClient({
  draftId,
  initialDetails,
  initialDraft,
  players,
}: SavedDraftClientProps) {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft | null>(() => {
    const parsed = DraftSchema.safeParse(initialDraft)
    return parsed.success ? parsed.data : null
  })
  const [details, setDetails] = useState<MatchDetails | null>(() => {
    const parsed = MatchDetailsSchema.safeParse(initialDetails)
    return parsed.success ? parsed.data : null
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [publishProblems, setPublishProblems] = useState<PublishProblem[] | null>(null)
  const [duplicate, setDuplicate] = useState<{ message: string } | null>(null)
  const [publishedMatchId, setPublishedMatchId] = useState<string | null>(null)

  if (!draft || !details) {
    return (
      <div className="glass space-y-3 p-6">
        <h1 className="text-xl font-bold text-yellow-400">Draft not ready</h1>
        <p className="text-sm text-slate-400">
          This draft has no reviewed stats yet. Open the import page to read the screenshots
          again.
        </p>
        <Link href="/admin/import" className="text-sm text-blue-400 hover:text-blue-300">
          Back to import
        </Link>
      </div>
    )
  }

  async function save() {
    if (!draft || !details) return

    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const result = await saveDraftAction(draftId, details, draft)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setNotice("Draft saved. You can come back to it for 30 days.")
      router.refresh()
    } catch {
      setError("Could not save the draft. Try again.")
    } finally {
      setBusy(false)
    }
  }

  function handlePublishFailure(result: Extract<PublishActionResult, { ok: false }>) {
    if (result.code === "duplicate") {
      setDuplicate({ message: result.error })
      return
    }

    if (result.code === "problems") {
      setPublishProblems(result.problems ?? [])
    }

    setError(result.error)
  }

  async function publish() {
    if (!draft || !details) return

    setPublishing(true)
    setError(null)
    setNotice(null)
    setPublishProblems(null)
    setDuplicate(null)
    try {
      const saved = await saveDraftAction(draftId, details, draft)
      if (!saved.ok) {
        setError(saved.error)
        return
      }

      const result = await publishAction(draftId)
      if (result.ok) {
        setPublishedMatchId(result.matchId)
        return
      }

      handlePublishFailure(result)
    } catch {
      setError("Could not publish the match. Try again.")
    } finally {
      setPublishing(false)
    }
  }

  async function publishAnyway() {
    setPublishing(true)
    setError(null)
    setPublishProblems(null)
    try {
      const result = await publishAction(draftId, { force: true })
      if (result.ok) {
        setPublishedMatchId(result.matchId)
        return
      }

      handlePublishFailure(result)
    } catch {
      setError("Could not publish the match. Try again.")
    } finally {
      setPublishing(false)
    }
  }

  if (publishedMatchId) {
    return (
      <div className="glass space-y-4 p-6">
        <h1 className="text-2xl font-bold text-emerald-400">Match published</h1>
        <p className="text-sm text-slate-400">
          The match, performances and player aliases are now saved.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/matches" className="text-blue-400 hover:text-blue-300">
            Matches
          </Link>
          <Link href="/stats/batting" className="text-blue-400 hover:text-blue-300">
            Batting stats
          </Link>
          <Link href="/stats/bowling" className="text-blue-400 hover:text-blue-300">
            Bowling stats
          </Link>
        </div>
        <Link
          href="/admin/import"
          className="inline-block rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black"
        >
          Import another match
        </Link>
      </div>
    )
  }

  return (
    <DraftReview
      draft={draft}
      players={players}
      details={details}
      onDraftChange={setDraft}
      onDetailsChange={setDetails}
      onSave={save}
      saveLabel="Save changes"
      saving={busy}
      onPublish={publish}
      publishing={publishing}
      problems={publishProblems}
      duplicate={
        duplicate
          ? { message: duplicate.message, onPublishAnyway: publishAnyway }
          : null
      }
      error={error}
      notice={notice ?? "Screenshots aren't stored — only the reviewed draft is kept."}
      backHref="/admin/import"
    />
  )
}
