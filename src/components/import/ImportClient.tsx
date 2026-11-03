"use client"
import { SeasonField, type SeasonOption } from "@/components/ui/SeasonField"
import { Button } from '@heroui/react'

import Link from "next/link"
import { OptionalMatchDetails } from "@/components/import/OptionalMatchDetails"
import { Stepper } from "@/components/ui/Stepper"
import { Banner } from "@/components/ui/Banner"
import { PublishedSummary } from "@/components/import/PublishedSummary"
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
import DraftReview from "@/components/import/DraftReview"

const MAX_TOTAL_BYTES = 4.5 * 1024 * 1024
const MAX_FILES = 10

const inputClass =
  "ui-field"

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

export default function ImportClient({ players, draftCount = 0, initialDetails, replaceMatchId, seasons, currentSeasonId }: { seasons: SeasonOption[]; currentSeasonId?: string; players: PlayerLite[]; draftCount?: number; initialDetails?: MatchDetails; replaceMatchId?: string }) {
  const router = useRouter()
  const [step, setStep] = useState<"upload" | "review">("upload")
  const [details, setDetails] = useState<MatchDetails>(() => initialDetails ?? { ...emptyDetails(), season: currentSeasonId })
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [draftId, setDraftId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [reading, setReading] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfStage, setPdfStage] = useState<'reading' | 'saving' | null>(null)
  const pdfController = useRef<AbortController | null>(null)
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
      pdfController.current?.abort()
      screenshotsRef.current.forEach((screenshot) => URL.revokeObjectURL(screenshot.url))
    }
  }, [])

  function validateDetails(): MatchDetails | null {
    const parsed = MatchDetailsSchema.safeParse(details)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the match details.")
      return null
    }
    if (!parsed.data.season) { setError("Choose a season before continuing."); return null }
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
    setReading(true)
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
      setReading(false)
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
      router.push(`/admin/import/${result.draftId}${replaceMatchId ? `?replace=${encodeURIComponent(replaceMatchId)}` : ""}`)
    } catch {
      setError("Could not save the draft. Try again.")
    } finally {
      setBusy(false)
    }
  }

  async function extractPdf() {
    setError(null)
    const parsedDetails = validateDetails()
    if (!parsedDetails) return
    if (!pdfFile) { setError('Choose a scorecard PDF first.'); return }
    const controller = new AbortController()
    pdfController.current = controller
    setBusy(true); setReading(true); setPdfStage('reading')
    try {
      const { readScorecardPdf } = await import('@/lib/import/readPdf')
      const extraction = await readScorecardPdf(pdfFile, controller.signal)
      controller.signal.throwIfAborted()
      const nextDraft: Draft = { ...buildDraft(extraction, players, parsedDetails.opponent), moraOnly: true }
      setPdfStage('saving')
      const result = await createManualDraftAction(parsedDetails, nextDraft)
      if (!result.ok) { setError(result.error); return }
      setDraftId(result.draftId)
      setDraft(nextDraft)
      setNotice('Read from PDF without AI. Only Mora batting and Mora bowling were imported. Confirm the team totals, match details and player links before publishing.')
      setStep('review')
    } catch (error) {
      setError(controller.signal.aborted ? 'PDF reading cancelled.' : error instanceof Error ? error.message : 'Could not read the PDF. Use a complete text-based SL Cricket Scorers export.')
    } finally {
      pdfController.current = null
      setReading(false); setBusy(false); setPdfStage(null)
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
      router.push(`/admin/import/${result.draftId}${replaceMatchId ? `?replace=${encodeURIComponent(replaceMatchId)}` : ""}`)
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
    if (!draftId) return

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

  function resetImport() {
    screenshots.forEach((screenshot) => URL.revokeObjectURL(screenshot.url))
    setScreenshots([])
    setPdfFile(null)
    setStep("upload")
    setDetails({ ...emptyDetails(), season: currentSeasonId })
    setDraftId(null)
    setDraft(null)
    setNotice(null)
    setError(null)
    setPublishProblems(null)
    setDuplicate(null)
    setPublishedMatchId(null)
  }

  if (reading) return <div className="space-y-5"><h1 className="font-display text-4xl uppercase md:text-[52px]">Import match</h1><Stepper step={2} /><section role="status" className="max-w-3xl space-y-5 rounded-[14px] border border-separator bg-surface p-6"><h2 className="text-2xl font-semibold">{pdfStage === 'saving' ? 'Preparing draft…' : pdfStage ? 'Reading scorecard PDF…' : `Reading ${screenshots.length} screenshots…`}</h2><p className="text-sm text-text-secondary">{pdfStage ? 'The PDF is read in your browser without AI. Only Mora batting and Mora bowling are imported.' : 'The scorecard is read in one request. Keep this tab open.'}</p><progress aria-label="Reading scorecard" className="h-2 w-full accent-accent" /><p className="text-sm text-text-secondary">Next: link player names and review the totals.</p>{pdfStage === 'reading' && <Button variant="secondary" onPress={() => pdfController.current?.abort()}>Cancel reading</Button>}</section></div>

  if (publishedMatchId && draft) return <PublishedSummary matchId={publishedMatchId} draft={draft} details={details} players={players} />


  if (step === "review" && draft) {
    return (
      <DraftReview
        draft={draft}
        players={players}
        details={details}
        seasons={seasons}
        existingSeasonId={replaceMatchId ? initialDetails?.season : undefined}
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
            ? { message: duplicate.message, onPublishAnyway: publishAnyway, onDismiss: () => setDuplicate(null) }
            : null
        }
        error={error}
        notice={notice}
        onBack={resetImport}
      />
    )
  }

  return (
    <div className="space-y-5 import-upload">
      <div className="flex flex-wrap items-center justify-between gap-3"><div>
        <h1 className="font-display text-4xl uppercase md:text-[52px]">Import match</h1>
        <p className="text-sm text-text-secondary">
          Upload scorecard screenshots or a PDF, check the players, then save the draft.
        </p>
      </div><Link href="/admin/drafts" className="button button--secondary">Saved drafts · {draftCount}</Link></div>
      {replaceMatchId && initialDetails && <Banner>Replacing the old match vs {initialDetails.opponent} on {initialDetails.date}</Banner>}
      <Stepper step={1} />
      {reading && <Banner>Reading {screenshots.length} screenshots… Keep this tab open. The scorecard is read in one request. You will review player names and totals before publishing.</Banner>}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]"><div className="min-w-0 space-y-5">
      <section className="rounded-[14px] border border-separator bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Match details</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SeasonField compact seasons={seasons} value={details.season} existingSeasonId={replaceMatchId ? initialDetails?.season : undefined} onChange={(season) => setDetails({ ...details, season })} />
          <label className="block text-xs text-text-secondary">
            Match type
            <select
              className={`${inputClass} ui-field mt-1`}
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

          <label className="block text-xs text-text-secondary">
            Date
            <input
              type="date"
              className={`${inputClass} mt-1`}
              value={details.date}
              onChange={(event) => setDetails({ ...details, date: event.target.value })}
            />
          </label>

          <label className="block text-xs text-text-secondary">
            Opponent
            <input
              className={`${inputClass} mt-1`}
              value={details.opponent}
              onChange={(event) => setDetails({ ...details, opponent: event.target.value })}
            />
          </label>

          <label className="block text-xs text-text-secondary">
            Venue
            <select
              className={`${inputClass} ui-field mt-1`}
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

          <label className="block text-xs text-text-secondary">
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

          <label className="block text-xs text-text-secondary">
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
        <OptionalMatchDetails details={details} onChange={setDetails} />
      </section>

      <section onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files) }} className="rounded-[14px] border border-separator bg-surface p-5">
        <h2 className="mb-1 text-sm font-semibold text-foreground">Scorecard screenshots</h2>
        <p className="mb-3 text-xs text-text-secondary">
          Up to {MAX_FILES} CricHeroes or SL Cricket Scorers screenshots. Screenshots are not
          stored.
        </p>

        <input
          type="file"
          aria-label="Scorecard screenshots"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => {
            addFiles(event.target.files)
            event.target.value = ""
          }}
          className="block min-h-10 w-full text-sm text-text-secondary file:mr-3 file:min-h-10 file:rounded-[12px] file:border-0 file:bg-brand-pressed file:px-3 file:py-2 file:text-sm file:text-accent-foreground"
        />

        {screenshots.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {screenshots.map((screenshot, index) => (
              <div key={screenshot.url} className="overflow-hidden rounded-lg border border-separator">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={screenshot.url} alt={screenshot.file.name} className="h-32 w-full object-cover" />
                <div className="flex items-center justify-between gap-2 p-2">
                  <span className="truncate text-xs text-text-secondary">{screenshot.file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    aria-label={`Remove screenshot ${screenshot.file.name}`}
                    className="min-h-10 shrink-0 px-2 text-xs text-danger hover:text-danger"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <div className="text-xs text-text-secondary">{screenshots.length} of 10 screenshots · {(screenshots.reduce((sum, shot) => sum + shot.file.size, 0) / 1024 / 1024).toFixed(1)} MB of 4.5 MB<progress aria-label="Screenshot size" className="mt-2 h-2 w-full accent-accent" max={MAX_TOTAL_BYTES} value={screenshots.reduce((sum, shot) => sum + shot.file.size, 0)} /></div>
      <section className="space-y-4 rounded-[14px] border border-separator bg-surface p-5" aria-labelledby="pdf-scorecard-heading">
        <div><h2 id="pdf-scorecard-heading" className="text-sm font-semibold">Scorecard PDF</h2><p id="pdf-scorecard-help" className="mt-1 text-xs text-text-secondary">Use a text-based SL Cricket Scorers export, up to 10 MB and 12 pages. Reads only Mora batting and Mora bowling without AI. Fill in the match details above first.</p></div>
        <input type="file" accept="application/pdf,.pdf" aria-label="Scorecard PDF" aria-describedby="pdf-scorecard-help" disabled={busy} onChange={(event) => { setPdfFile(event.target.files?.[0] ?? null); setError(null) }} className="block min-h-10 w-full text-sm text-text-secondary file:mr-3 file:min-h-10 file:rounded-[12px] file:border-0 file:bg-default file:px-3 file:py-2 file:text-sm file:text-default-foreground" />
        <Button variant="secondary" isDisabled={busy || !pdfFile} onPress={extractPdf}>Read PDF without AI</Button>
      </section>
</div>      <aside className="space-y-5"><section className="rounded-[14px] bg-surface p-5"><h2 className="font-semibold">How importing works</h2><ol className="mt-3 space-y-2 text-sm text-text-secondary"><li>1. Fill in match details</li><li>2. Add screenshots or a PDF</li><li>3. Review and fix names</li><li>4. Publish the scorecard</li></ol></section><section className="rounded-[14px] bg-surface p-5"><h2 className="font-semibold">Privacy</h2><p className="mt-3 text-sm text-text-secondary">Screenshots are never stored. Screenshot names and scores are sent to Google Gemini. PDFs stay in your browser; only the parsed draft is saved.</p></section><section className="rounded-[14px] bg-surface p-5"><h2 className="font-semibold">Already imported?</h2><p className="mt-3 text-sm text-text-secondary">Publishing checks for the same opponent and date. Use Manage matches to replace an older scorecard.</p></section></aside></div>
      {error ? (
        <p role="alert" className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="sticky bottom-0 z-10 flex flex-wrap gap-3 border-t border-separator bg-background py-4 md:static">
        <button
          type="button"
          onClick={extract}
          disabled={busy}
          className="min-h-10 rounded-[12px] bg-brand-pressed px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50"
        >
          {busy ? "Reading screenshots…" : "Read screenshots with AI"}
        </button>

        <button
          type="button"
          onClick={startManual}
          disabled={busy}
          className="min-h-10 rounded-[12px] border border-separator px-4 py-2 text-sm text-foreground hover:bg-surface-secondary disabled:opacity-50"
        >
          Enter stats manually
        </button>
      </div>
    </div>
  )
}
