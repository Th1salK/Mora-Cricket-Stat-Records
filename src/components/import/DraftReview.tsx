"use client"

import Link from "next/link"
import { OptionalMatchDetails } from "@/components/import/OptionalMatchDetails"
import { useState } from "react"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { Stepper } from "@/components/ui/Stepper"
import { Banner } from "@/components/ui/Banner"
import { DraftInningsEditor } from "@/components/import/DraftInningsEditor"
import { MATCH_TYPES } from "@/lib/constants"
import { buildPublishPayload, type PublishProblem } from "@/lib/import/publish"
import {
  canPublish,
  draftWarnings,
  swapSides,
  type Draft,
  type MatchDetails,
} from "@/lib/import/draft"
import type { PlayerLite } from "@/lib/import/matchPlayers"

const inputClass =
  "ui-field"

type DraftReviewProps = {
  draft: Draft
  players: PlayerLite[]
  details: MatchDetails
  onDraftChange: (draft: Draft) => void
  onDetailsChange: (details: MatchDetails) => void
  onSave: () => void
  saveLabel: string
  saving: boolean
  onPublish: () => Promise<void> | void
  publishing: boolean
  problems?: PublishProblem[] | null
  duplicate?: { message: string; onPublishAnyway: () => void; onDismiss?: () => void } | null
  error?: string | null
  notice?: string | null
  backHref?: string
  onBack?: () => void
}

export default function DraftReview({
  draft,
  players,
  details,
  onDraftChange,
  onDetailsChange,
  onSave,
  saveLabel,
  saving,
  onPublish,
  publishing,
  problems,
  duplicate,
  error,
  notice,
  backHref,
  onBack,
}: DraftReviewProps) {
  const [confirming, setConfirming] = useState(false)
  const warnings = draftWarnings(draft)
  const preview = buildPublishPayload(details, draft, players)
  const previewBlocking = preview.problems.filter((problem) => problem.blocking)
  const nonBlocking = preview.problems.filter((problem) => !problem.blocking)
  const blockingMessages = Array.from(new Set([
    ...warnings.filter((warning) => warning.blocking).map((warning) => warning.message),
    ...previewBlocking.map((problem) => problem.message),
  ]))
  const ready = canPublish(draft) && preview.payload !== null
  const battingCount = preview.payload?.batting.length ?? 0
  const bowlingCount = preview.payload?.bowling.length ?? 0
  const busy = saving || publishing

  return (
    <div className="space-y-6 pb-[calc(144px+env(safe-area-inset-bottom))] md:pb-0">
      <Stepper step={3} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl uppercase md:text-[52px]">Review match</h1>
          <p className="text-sm text-text-secondary">
            Check every Mora player is linked before publishing.
          </p>
        </div>
        {backHref ? (
          <Link href={backHref} className="inline-flex min-h-10 items-center text-sm text-brand-hover hover:text-brand-hover">
            Back to import
          </Link>
        ) : null}
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="min-h-10 text-sm text-brand-hover hover:text-brand-hover"
          >
            Start over
          </button>
        ) : null}
      </div>

      {notice ? (
        <Banner>{notice}</Banner>
      ) : null}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]"><div className="min-w-0 space-y-5">      <section className="rounded-[14px] border border-separator bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Match details</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-xs text-text-secondary">
            Match type
            <select
              className={`${inputClass} ui-field mt-1`}
              value={details.matchType}
              onChange={(event) =>
                onDetailsChange({ ...details, matchType: event.target.value as MatchDetails["matchType"] })
              }
            >
              {MATCH_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs text-text-secondary">
            Date
            <input
              type="date"
              className={`${inputClass} mt-1`}
              value={details.date}
              onChange={(event) => onDetailsChange({ ...details, date: event.target.value })}
            />
          </label>

          <label className="block text-xs text-text-secondary">
            Opponent
            <input
              className={`${inputClass} mt-1`}
              value={details.opponent}
              onChange={(event) => onDetailsChange({ ...details, opponent: event.target.value })}
            />
          </label>

          <label className="block text-xs text-text-secondary">
            Venue
            <select
              className={`${inputClass} ui-field mt-1`}
              value={details.venue}
              onChange={(event) =>
                onDetailsChange({ ...details, venue: event.target.value as MatchDetails["venue"] })
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
              onChange={(event) =>
                onDetailsChange({ ...details, overs: Number(event.target.value) })
              }
            />
          </label>

          <label className="block text-xs text-text-secondary">
            Ground name (optional)
            <input
              className={`${inputClass} mt-1`}
              value={details.venueName ?? ""}
              onChange={(event) =>
                onDetailsChange({ ...details, venueName: event.target.value || undefined })
              }
            />
          </label>
        </div>
        <OptionalMatchDetails details={details} onChange={onDetailsChange} />
      </section>

      <DraftInningsEditor draft={draft} players={players} onChange={onDraftChange} />

</div><aside className="space-y-5">      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">Warnings</h2>
          <button
            type="button"
            onClick={() => onDraftChange(swapSides(draft, players))}
            className="min-h-10 rounded-[12px] border border-border px-3 py-2 text-xs text-brand-hover hover:bg-accent/10"
          >
            Swap sides
          </button>
        </div>

        {warnings.length === 0 ? (
          <p className="rounded-lg border border-win/35 bg-accent/10 px-3 py-2 text-sm text-win">
            All checks passed.
          </p>
        ) : (
          <ul className="space-y-1">
            {warnings.map((warning, index) => (
              <li
                key={`${warning.code}-${warning.innings}-${index}`}
                className={`rounded px-3 py-2 text-sm ${
                  warning.blocking
                    ? "border border-danger/35 bg-danger/10 text-danger"
                    : "border border-gold/35 bg-gold/10 text-gold"
                }`}
              >
                <span className="mr-2 text-xs opacity-70">Innings {warning.innings}</span>
                {warning.message}
                {warning.blocking ? (
                  <span className="ml-2 text-xs font-semibold">blocks publishing</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {draft.unreadable.length > 0 ? (
        <section className="rounded-[14px] border border-separator bg-surface p-4">
          <h2 className="mb-2 text-sm font-semibold text-foreground">The AI could not read</h2>
          <ul className="list-inside list-disc text-sm text-gold">
            {draft.unreadable.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {problems && problems.length > 0 ? (
        <ul role="alert" className="space-y-1 rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger">
          {problems.map((problem, index) => (
            <li key={`${problem.message}-${index}`}>{problem.message}</li>
          ))}
        </ul>
      ) : null}

      <div role="group" aria-label="Save or publish match" className="fixed inset-x-0 bottom-0 z-20 flex flex-wrap items-center gap-3 border-t border-separator bg-surface p-4 pb-[calc(16px+env(safe-area-inset-bottom))] md:static md:rounded-[14px] md:border md:pb-4">
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
          className="min-h-10 flex-1 rounded-[12px] bg-default px-4 py-2 text-sm font-semibold text-default-foreground disabled:opacity-50"
        >
          {saving ? "Saving…" : saveLabel}
        </button>

        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={!ready || busy}
          title={ready ? undefined : "Fix the blocking warnings first"}
          className="min-h-10 flex-1 rounded-[12px] bg-brand-pressed px-4 py-2 text-sm font-semibold text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          Publish match
        </button>

        <span role="status" className={`w-full text-xs ${ready ? "text-win" : "text-danger"}`}>
          {ready
            ? "No blocking warnings."
            : `${blockingMessages.length} blocking warning${
                blockingMessages.length === 1 ? "" : "s"
              }.`}
        </span>
      </div>

      {!ready && blockingMessages.length > 0 ? (
        <ul className="list-inside list-disc space-y-1 text-xs text-danger">
          {blockingMessages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}
</aside></div>      <ConfirmDialog open={!!duplicate} title="Possible duplicate match" confirmLabel="Publish anyway" busy={busy} onClose={() => duplicate?.onDismiss?.()} onConfirm={() => duplicate?.onPublishAnyway()}><p>{duplicate?.message}</p><p className="mt-3">If this is a second game on the same day, publish anyway.</p><Link href="/matches" className="mt-3 inline-flex min-h-10 items-center text-brand-hover">View matches</Link></ConfirmDialog>
      <ConfirmDialog open={confirming && ready} title="Publish this match?" confirmLabel="Confirm publish" busy={busy} onClose={() => setConfirming(false)} onConfirm={async () => { await onPublish(); setConfirming(false) }}><p>Mora vs {details.opponent}, {details.date}, {details.matchType}: {battingCount} batting and {bowlingCount} bowling records will be saved.</p>{nonBlocking.length > 0 && <ul className="mt-4 list-inside list-disc rounded-[12px] bg-surface-secondary p-3 text-gold">{nonBlocking.map((problem, i) => <li key={i}>{problem.message}</li>)}</ul>}</ConfirmDialog>

    </div>
  )
}
