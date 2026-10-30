"use client"

import Link from "next/link"
import { PublishedSummary } from "@/components/import/PublishedSummary"
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
import DraftReview from "@/components/import/DraftReview"

type SavedDraftClientProps = {
  draftId: string
  replaceMatchId?: string
  initialDetails: unknown
  initialDraft: unknown
  players: PlayerLite[]
}

export default function SavedDraftClient({
  draftId,
  replaceMatchId,
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
      <div className="rounded-[14px] border border-separator bg-surface space-y-3 p-6">
        <h1 className="text-xl font-bold text-foreground">Draft not ready</h1>
        <p className="text-sm text-text-secondary">
          This draft has no reviewed stats yet. Open the import page to read the screenshots
          again.
        </p>
        <Link href="/admin/import" className="text-sm text-brand-hover hover:text-brand-hover">
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

      const result = await publishAction(draftId, { replaceMatchId })
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
      const result = await publishAction(draftId, { force: true, replaceMatchId })
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

  if (publishedMatchId && draft && details) return <PublishedSummary matchId={publishedMatchId} draft={draft} details={details} players={players} />


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
          ? { message: duplicate.message, onPublishAnyway: publishAnyway, onDismiss: () => setDuplicate(null) }
          : null
      }
      error={error}
      notice={notice ?? "Screenshots aren't stored — only the reviewed draft is kept."}
      backHref="/admin/import"
    />
  )
}
