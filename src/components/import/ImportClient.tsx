"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  buildDraft,
  MatchDetailsSchema,
  type Draft,
  type MatchDetails,
} from "@/lib/import/draft"
import type { PlayerLite } from "@/lib/import/matchPlayers"
import type { PublishProblem } from "@/lib/import/publish"
import { resizeImage } from "@/lib/import/resizeImage"
import {
  createManualDraftAction,
  extractAction,
  publishAction,
  saveDraftAction,
  type PublishActionResult,
} from "@/lib/actions/importActions"
import DraftReview from "./DraftReview"

const MAX_TOTAL_BYTES = 4.5 * 1024 * 1024
const MAX_FILES = 10

const inputClass =
  "w-full rounded border border-blue-500/30 bg-white/5 px-2 py-1 text-sm text-white outline-none focus:border-blue-400"

type Screenshot = { file: File; url: string }

function emptyDetails(): MatchDetails {
  return {
    matchType: "Friendly",
    date: "",
    opponent: "",
    venue: "Home",
    overs: 20,
  }
}

function blankDraft(): Draft {
  return {
    innings: [
      {
        battingTeam: "Mora Titans",
        total: { runs: 0, wickets: 0, overs: "0.0" },
        extras: { byes: 0, legByes: 0, wides: 0, noBalls: 0, penalty: 0 },
        batting: [],
        bowling: [],
        didNotBat: [],
        side: "mora",
      },
    ],
    unreadable: [],
  }
}

export default function ImportClient({ players }: { players: PlayerLite[] }) {
  const router = useRouter()
  const [step, setStep] = useState<"upload" | "review">("upload")
  const [details, setDetails] = useState<MatchDetails>(emptyDetails)
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [draftId, setDraftId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishProblems, setPublishProblems] = useState<PublishProblem[] | null>(null)
  const [duplicate, setDuplicate] = useState<{ message: string } | null>(null)
  const [publishedMatchId, setPublishedMatchId] = useState<string | null>(null)

  const screenshotsRef = useRef(screenshots)
  useEffect(() => {
    screenshotsRef.current = screenshots
  }, [screenshots])

  useEffect(() => {
    return () => {
      screenshotsRef.current.forEach((screenshot) => URL.revokeObjectURL(screenshot.url))
    }
  }, [])

  function validateDetails(): MatchDetails | null {
    const parsed = MatchDetailsSchema.safeParse(details)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the match details.")
      return null
    }
    return parsed.data
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return

    const allowed = Array.from(fileList).filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )

    setScreenshots((current) => {
      const room = MAX_FILES - current.length
      const added = allowed.slice(0, room).map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }))
      return [...current, ...added]
    })
    setError(null)
  }

  function removeFile(index: number) {
    setScreenshots((current) => {
      const removed = current[index]
      if (removed) URL.revokeObjectURL(removed.url)
      return current.filter((_, itemIndex) => itemIndex !== index)
    })
  }

  async function extract() {
    setError(null)
    const parsedDetails = validateDetails()
    if (!parsedDetails) return

    if (screenshots.length === 0) {
      setError("Add at least one screenshot.")
      return
    }

    const totalBytes = screenshots.reduce((total, shot) => total + shot.file.size, 0)
    if (totalBytes > MAX_TOTAL_BYTES) {
      setError("Screenshots must total less than 4.5 MB.")
      return
    }

    setBusy(true)
    try {
      const images = await Promise.all(
        screenshots.map((screenshot) => resizeImage(screenshot.file))
      )
      const result = await extractAction(images, parsedDetails.opponent)

      if (!result.ok) {
        setError(result.error)
        return
      }

      setDraftId(result.draftId)
      setDraft(
        buildDraft(
          result.extraction,
          players,
          parsedDetails.opponent,
          result.sides
        )
      )
      setNotice(
        result.confident
          ? `Read by ${result.modelUsed}.`
          : `Read by ${result.modelUsed}. We could not tell which innings Mora batted in — check the sides.`
      )
      setStep("review")
    } catch {
      setError("Could not read the screenshots. Try again or enter the stats manually.")
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    const parsedDetails = validateDetails()
    if (!parsedDetails || !draft || !draftId) return

    setBusy(true)
    setError(null)
    try {
      const result = await saveDraftAction(draftId, parsedDetails, draft)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.push(`/admin/import/${result.draftId}`)
    } catch {
      setError("Could not save the draft. Try again.")
    } finally {
      setBusy(false)
    }
  }

  async function startManual() {
    const parsedDetails = validateDetails()
    if (!parsedDetails) return

    setBusy(true)
    setError(null)
    try {
      const result = await createManualDraftAction(parsedDetails, blankDraft())
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.push(`/admin/import/${result.draftId}`)
    } catch {
      setError("Could not create the draft. Try again.")
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
    const parsedDetails = validateDetails()
    if (!parsedDetails || !draft || !draftId) return

    setPublishing(true)
    setError(null)
    setPublishProblems(null)
    setDuplicate(null)
    try {
      const saved = await saveDraftAction(draftId, parsedDetails, draft)
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
    if (!draftId) return

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

  function resetImport() {
    screenshots.forEach((screenshot) => URL.revokeObjectURL(screenshot.url))
    setScreenshots([])
    setStep("upload")
    setDetails(emptyDetails())
    setDraftId(null)
    setDraft(null)
    setNotice(null)
    setError(null)
    setPublishProblems(null)
    setDuplicate(null)
    setPublishedMatchId(null)
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
        <button
          type="button"
          onClick={resetImport}
          className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black"
        >
          Import another match
        </button>
      </div>
    )
  }

  if (step === "review" && draft) {
    return (
      <DraftReview
        draft={draft}
        players={players}
        details={details}
        onDraftChange={setDraft}
        onDetailsChange={setDetails}
        onSave={save}
        saveLabel="Save draft"
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
        notice={notice}
        onBack={resetImport}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-yellow-400">Import match</h1>
        <p className="text-sm text-slate-400">
          Upload scorecard screenshots, check the players, then save the draft.
        </p>
      </div>

      <section className="glass p-4">
        <h2 className="mb-3 text-sm font-semibold text-white">Match details</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-xs text-slate-400">
            Match type
            <select
              className={`${inputClass} glass-select mt-1`}
              value={details.matchType}
              onChange={(event) =>
                setDetails({
                  ...details,
                  matchType: event.target.value as MatchDetails["matchType"],
                })
              }
            >
              {["Home and Home", "Practice", "Friendly", "Div 3", "Inter Uni", "SLUG"].map(
                (type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                )
              )}
            </select>
          </label>

          <label className="block text-xs text-slate-400">
            Date
            <input
              type="date"
              className={`${inputClass} mt-1`}
              value={details.date}
              onChange={(event) => setDetails({ ...details, date: event.target.value })}
            />
          </label>

          <label className="block text-xs text-slate-400">
            Opponent
            <input
              className={`${inputClass} mt-1`}
              value={details.opponent}
              onChange={(event) => setDetails({ ...details, opponent: event.target.value })}
            />
          </label>

          <label className="block text-xs text-slate-400">
            Venue
            <select
              className={`${inputClass} glass-select mt-1`}
              value={details.venue}
              onChange={(event) =>
                setDetails({
                  ...details,
                  venue: event.target.value as MatchDetails["venue"],
                })
              }
            >
              <option value="Home">Home</option>
              <option value="Away">Away</option>
            </select>
          </label>

          <label className="block text-xs text-slate-400">
            Overs
            <input
              type="number"
              min={1}
              max={100}
              className={`${inputClass} mt-1`}
              value={details.overs}
              onChange={(event) => setDetails({ ...details, overs: Number(event.target.value) })}
            />
          </label>

          <label className="block text-xs text-slate-400">
            Ground name (optional)
            <input
              className={`${inputClass} mt-1`}
              value={details.venueName ?? ""}
              onChange={(event) =>
                setDetails({ ...details, venueName: event.target.value || undefined })
              }
            />
          </label>
        </div>
      </section>

      <section className="glass p-4">
        <h2 className="mb-1 text-sm font-semibold text-white">Screenshots</h2>
        <p className="mb-3 text-xs text-slate-400">
          Up to {MAX_FILES} CricHeroes or SL Cricket Scorers screenshots. Screenshots are not
          stored.
        </p>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => {
            addFiles(event.target.files)
            event.target.value = ""
          }}
          className="block w-full text-sm text-slate-300 file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-sm file:text-white"
        />

        {screenshots.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {screenshots.map((screenshot, index) => (
              <div key={screenshot.url} className="overflow-hidden rounded-lg border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={screenshot.url} alt={screenshot.file.name} className="h-32 w-full object-cover" />
                <div className="flex items-center justify-between gap-2 p-2">
                  <span className="truncate text-xs text-slate-400">{screenshot.file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-xs text-red-300 hover:text-red-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={extract}
          disabled={busy}
          className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {busy ? "Reading screenshots…" : "Read screenshots"}
        </button>

        <button
          type="button"
          onClick={startManual}
          disabled={busy}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50"
        >
          Enter manually
        </button>
      </div>
    </div>
  )
}
