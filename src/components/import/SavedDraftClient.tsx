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
import { saveDraftAction } from "@/lib/actions/importActions"
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
      error={error}
      notice={notice ?? "Screenshots aren't stored — only the reviewed draft is kept."}
      backHref="/admin/import"
    />
  )
}
