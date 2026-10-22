"use client"

import Link from "next/link"
import { useState } from "react"
import { MATCH_TYPES } from "@/lib/constants"
import { buildPublishPayload, type PublishProblem } from "@/lib/import/publish"
import {
  canPublish,
  draftWarnings,
  setPlayer,
  swapSides,
  type Draft,
  type MatchDetails,
} from "@/lib/import/draft"
import type { NameMatch, PlayerLite } from "@/lib/import/matchPlayers"

const inputClass =
  "w-full rounded border border-blue-500/30 bg-white/5 px-2 py-1 text-sm text-white outline-none focus:border-blue-400"

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
  duplicate?: { message: string; onPublishAnyway: () => void } | null
  error?: string | null
  notice?: string | null
  backHref?: string
  onBack?: () => void
}

function playerLabel(player: PlayerLite): string {
  return player.shortName ? `${player.fullName} (${player.shortName})` : player.fullName
}

function MatchChip({ match }: { match: NameMatch | null }) {
  if (!match) {
    return <span className="text-xs text-slate-500">opponent player</span>
  }

  const style =
    match.status === "exact"
      ? "text-emerald-400"
      : match.status === "confirm"
        ? "text-amber-400"
        : "text-red-400"
  const label =
    match.status === "exact" ? "matched" : match.status === "confirm" ? "check" : "not linked"

  return (
    <span className={`text-xs ${style}`} title={match.reason}>
      {label} · {match.reason}
    </span>
  )
}

function PlayerPicker({
  row,
  players,
  onChange,
}: {
  row: { match: NameMatch | null; playerId: string | null; name: string }
  players: PlayerLite[]
  onChange: (playerId: string | null) => void
}) {
  return (
    <div className="min-w-44">
      <select
        aria-label={`Player for ${row.name}`}
        className="glass-select w-full py-1 text-xs"
        value={row.playerId ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value="">— pick player —</option>
        {players.map((player) => (
          <option key={player.id} value={player.id}>
            {playerLabel(player)}
          </option>
        ))}
      </select>
      <div className="mt-1">
        <MatchChip match={row.match} />
      </div>
    </div>
  )
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
  const blockingMessages = [
    ...warnings.filter((warning) => warning.blocking).map((warning) => warning.message),
    ...previewBlocking.map((problem) => problem.message),
  ]
  const ready = canPublish(draft) && preview.payload !== null
  const battingCount = preview.payload?.batting.length ?? 0
  const bowlingCount = preview.payload?.bowling.length ?? 0
  const busy = saving || publishing

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">Review match</h1>
          <p className="text-sm text-slate-400">
            Check every Mora player is linked before publishing.
          </p>
        </div>
        {backHref ? (
          <Link href={backHref} className="text-sm text-blue-400 hover:text-blue-300">
            Back to import
          </Link>
        ) : null}
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Start over
          </button>
        ) : null}
      </div>

      {notice ? (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-200">
          {notice}
        </div>
      ) : null}

      <section className="glass p-4">
        <h2 className="mb-3 text-sm font-semibold text-white">Match details</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-xs text-slate-400">
            Match type
            <select
              className={`${inputClass} glass-select mt-1`}
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

          <label className="block text-xs text-slate-400">
            Date
            <input
              type="date"
              className={`${inputClass} mt-1`}
              value={details.date}
              onChange={(event) => onDetailsChange({ ...details, date: event.target.value })}
            />
          </label>

          <label className="block text-xs text-slate-400">
            Opponent
            <input
              className={`${inputClass} mt-1`}
              value={details.opponent}
              onChange={(event) => onDetailsChange({ ...details, opponent: event.target.value })}
            />
          </label>

          <label className="block text-xs text-slate-400">
            Venue
            <select
              className={`${inputClass} glass-select mt-1`}
              value={details.venue}
              onChange={(event) =>
                onDetailsChange({ ...details, venue: event.target.value as MatchDetails["venue"] })
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
              onChange={(event) =>
                onDetailsChange({ ...details, overs: Number(event.target.value) })
              }
            />
          </label>

          <label className="block text-xs text-slate-400">
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
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white">Warnings</h2>
          <button
            type="button"
            onClick={() => onDraftChange(swapSides(draft, players))}
            className="rounded border border-blue-500/30 px-3 py-1 text-xs text-blue-300 hover:bg-blue-500/10"
          >
            Swap sides
          </button>
        </div>

        {warnings.length === 0 ? (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            All checks passed.
          </p>
        ) : (
          <ul className="space-y-1">
            {warnings.map((warning, index) => (
              <li
                key={`${warning.code}-${warning.innings}-${index}`}
                className={`rounded px-3 py-2 text-sm ${
                  warning.blocking
                    ? "border border-red-500/30 bg-red-500/10 text-red-200"
                    : "border border-amber-500/30 bg-amber-500/10 text-amber-200"
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

      {draft.innings.map((inn, inningsIndex) => {
        const battingEditable = inn.side === "mora"
        const bowlingEditable = inn.side === "opposition"

        return (
          <section key={inningsIndex} className="glass p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-white">
                Innings {inningsIndex + 1}
                <span className="ml-2 text-sm font-normal text-slate-400">{inn.battingTeam}</span>
              </h2>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  inn.side === "mora"
                    ? "bg-yellow-400/15 text-yellow-300"
                    : "bg-slate-400/15 text-slate-300"
                }`}
              >
                {inn.side === "mora" ? "Mora batting" : "Opposition batting"}
              </span>
            </div>

            <p className="mb-2 text-xs text-slate-400">
              {inn.total.runs ?? "?"}/{inn.total.wickets ?? "?"} in {inn.total.overs} overs
            </p>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-1 pr-2">Batter</th>
                    <th className="py-1 pr-2">How out</th>
                    <th className="py-1 pr-2">R</th>
                    <th className="py-1 pr-2">B</th>
                    <th className="py-1 pr-2">4s</th>
                    <th className="py-1 pr-2">6s</th>
                    {battingEditable ? <th className="py-1">Player</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {inn.batting.map((row, rowIndex) => (
                    <tr key={`${row.name}-${rowIndex}`} className="border-t border-white/5">
                      <td className="py-2 pr-2 text-white">{row.name}</td>
                      <td className="py-2 pr-2 text-slate-300">{row.howOut}</td>
                      <td className="py-2 pr-2">{row.runs ?? "—"}</td>
                      <td className="py-2 pr-2">{row.balls ?? "—"}</td>
                      <td className="py-2 pr-2">{row.fours ?? "—"}</td>
                      <td className="py-2 pr-2">{row.sixes ?? "—"}</td>
                      {battingEditable ? (
                        <td className="py-2">
                          <PlayerPicker
                            row={row}
                            players={players}
                            onChange={(playerId) =>
                              onDraftChange(
                                setPlayer(draft, inningsIndex, "batting", rowIndex, playerId)
                              )
                            }
                          />
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {inn.didNotBat.length > 0 ? (
              <p className="mt-2 text-xs text-slate-400">
                Did not bat: {inn.didNotBat.join(", ")}
              </p>
            ) : null}

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-1 pr-2">Bowler</th>
                    <th className="py-1 pr-2">O</th>
                    <th className="py-1 pr-2">M</th>
                    <th className="py-1 pr-2">R</th>
                    <th className="py-1 pr-2">W</th>
                    <th className="py-1 pr-2">Wd</th>
                    <th className="py-1 pr-2">Nb</th>
                    {bowlingEditable ? <th className="py-1">Player</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {inn.bowling.map((row, rowIndex) => (
                    <tr key={`${row.name}-${rowIndex}`} className="border-t border-white/5">
                      <td className="py-2 pr-2 text-white">{row.name}</td>
                      <td className="py-2 pr-2">{row.overs}</td>
                      <td className="py-2 pr-2">{row.maidens ?? "—"}</td>
                      <td className="py-2 pr-2">{row.runs ?? "—"}</td>
                      <td className="py-2 pr-2">{row.wickets ?? "—"}</td>
                      <td className="py-2 pr-2">{row.wides ?? "—"}</td>
                      <td className="py-2 pr-2">{row.noBalls ?? "—"}</td>
                      {bowlingEditable ? (
                        <td className="py-2">
                          <PlayerPicker
                            row={row}
                            players={players}
                            onChange={(playerId) =>
                              onDraftChange(
                                setPlayer(draft, inningsIndex, "bowling", rowIndex, playerId)
                              )
                            }
                          />
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}

      {draft.unreadable.length > 0 ? (
        <section className="glass p-4">
          <h2 className="mb-2 text-sm font-semibold text-white">The AI could not read</h2>
          <ul className="list-inside list-disc text-sm text-amber-200">
            {draft.unreadable.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {problems && problems.length > 0 ? (
        <ul className="space-y-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {problems.map((problem, index) => (
            <li key={`${problem.message}-${index}`}>{problem.message}</li>
          ))}
        </ul>
      ) : null}

      {duplicate ? (
        <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          <p>{duplicate.message}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/matches" className="text-blue-300 hover:text-blue-200">
              View matches
            </Link>
            <button
              type="button"
              onClick={duplicate.onPublishAnyway}
              disabled={busy}
              className="rounded border border-amber-400/40 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/10 disabled:opacity-50"
            >
              Publish anyway
            </button>
          </div>
        </div>
      ) : null}

      {confirming && ready ? (
        <div className="glass-blue space-y-3 p-4">
          <p className="text-sm text-blue-100">
            Mora vs {details.opponent}, {details.date}, {details.matchType}: {battingCount}{" "}
            batting and {bowlingCount} bowling records will be saved
          </p>

          {nonBlocking.length > 0 ? (
            <ul className="list-inside list-disc text-xs text-amber-200">
              {nonBlocking.map((problem, index) => (
                <li key={`${problem.message}-${index}`}>{problem.message}</li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={publishing}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                await onPublish()
                setConfirming(false)
              }}
              disabled={busy}
              className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              {publishing ? "Publishing…" : "Confirm publish"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
          className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {saving ? "Saving…" : saveLabel}
        </button>

        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={!ready || busy}
          title={ready ? undefined : "Fix the blocking warnings first"}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          Publish match
        </button>

        <span className={`text-xs ${ready ? "text-emerald-400" : "text-red-300"}`}>
          {ready
            ? "No blocking warnings."
            : `${blockingMessages.length} blocking warning${
                blockingMessages.length === 1 ? "" : "s"
              }.`}
        </span>
      </div>

      {!ready && blockingMessages.length > 0 ? (
        <ul className="list-inside list-disc space-y-1 text-xs text-red-300">
          {Array.from(new Set(blockingMessages)).map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
