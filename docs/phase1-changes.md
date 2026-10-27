# Phase 1 change list

This list includes the existing Prompt 1 work and Prompts 2–6 completed together on feature/phase1-stats. No commits or database backfills were performed.

## Files

- `.gitignore` — Ignore generated comparison reports under scripts/output/.
- `package.json` — Add assign:seasons and compare:stats commands without changing dependencies.
- `src/app/api/matches/[id]/route.ts` — Reassign the season on date updates while preserving response fields.
- `src/app/api/matches/route.ts` — Assign seasons to new matches while preserving response fields.
- `src/app/api/players/[id]/route.ts` — Reject malformed player IDs before database queries.
- `src/app/api/players/[id]/stats/route.ts` — Use shared queries, keep existing field names, and add filtered breakdowns.
- `src/app/api/stats/batting/route.ts` — Serve season/type-filtered batting statistics through the query layer.
- `src/app/api/stats/bowling/route.ts` — Serve season/type-filtered bowling statistics through the query layer.
- `src/app/api/stats/breakdown/route.ts` — Keep the per-player breakdown API shape using shared calculations.
- `src/app/career/page.tsx` — Use the new summaries and formatting while retaining all-time statistics.
- `src/app/page.tsx` — Show the Import Match shortcut only to admins.
- `src/app/players/[id]/page.tsx` — Add season filters, match-type breakdowns, null formatting and guarded loading.
- `src/app/stats/batting/page.tsx` — Resolve URL filters and load season-aware batting table data.
- `src/app/stats/bowling/page.tsx` — Resolve URL filters and load season-aware bowling table data.
- `src/app/stats/enter/page.tsx` — Redirect the old entry URL to the importer.
- `src/components/BattingStatsClient.tsx` — Add season controls, preserve filters and keep nulls last when sorting.
- `src/components/BowlingStatsClient.tsx` — Add season controls, preserve filters and format bowling figures/overs.
- `src/components/Sidebar.tsx` — Remove the retired Stats Entry admin link.
- `src/components/StatsEntryClient.tsx` — Deleted: no imports remain after the entry-page redirect.
- `src/lib/actions/importActions.ts` — Assign the season before the publish transaction; no other importer changes.
- `src/lib/stats/batting.test.ts` — Retain original regression cases and test the expanded batting API.
- `src/lib/stats/batting.ts` — Replace the small helper with complete pure batting summaries/grouping.
- `src/lib/statsCalculator.ts` — Deleted: all production consumers now use the shared query layer.
- `src/models/Match.ts` — Add an optional, indexed season reference.
- `docs/phase1-pr.md` — Provide the PR description, comparison summary and preview/backfill checklist.
- `docs/phase1-changes.md` — List every file changed in Phase 1 and explain the main learning points.
- `scripts/assign-seasons.ts` — Preview and optionally apply season assignments; default mode never writes.
- `scripts/compare-stats.ts` — Read real data, compare legacy/new maths and write an ignored local report.
- `src/app/api/seasons/route.ts` — Expose the season list and resolved default season for player profiles.
- `src/components/SeasonDropdown.tsx` — Update the season URL parameter while retaining other filters.
- `src/lib/queries/mapping.ts` — Map plain database documents into stats rows and skip orphan performances.
- `src/lib/queries/stats.test.ts` — Test pure mapping of missing data, real zeros and orphan rows.
- `src/lib/queries/stats.ts` — Centralize database reads, filters, leaderboards, profiles, records and streaks.
- `src/lib/seasonsServer.ts` — Ensure/list seasons and choose the current-season fallback.
- `src/lib/stats/api.test.ts` — Protect existing API field names and null/zero semantics.
- `src/lib/stats/api.ts` — Translate new summaries into the existing API response fields.
- `src/lib/stats/bowling.test.ts` — Test base-six economy, null rates, best figures, maidens and grouping.
- `src/lib/stats/bowling.ts` — Calculate pure bowling summaries and compare figures consistently.
- `src/lib/stats/compare.test.ts` — Test expected classifications and rejection of unexplained differences.
- `src/lib/stats/compare.ts` — Compare every legacy field and classify only approved behaviour changes.
- `src/lib/stats/config.ts` — Centralize season mode, record qualifiers, inactive-player and internal-type settings.
- `src/lib/stats/fixtures.test-support.ts` — Provide complete plain row fixtures shared by the pure-function tests.
- `src/lib/stats/format.test.ts` — Verify nulls, real zeros, precision, overs, figures and not-out stars.
- `src/lib/stats/format.ts` — Provide shared display formatting with en dashes for undefined values.
- `src/lib/stats/golden.test.ts` — Compare frozen legacy/new maths on multi-player, multi-type fixtures.
- `src/lib/stats/group.ts` — Share small, pure grouping helpers across the stats modules.
- `src/lib/stats/legacy/statsCalculatorLegacy.ts` — Freeze the original per-player maths independently from the new implementation.
- `src/lib/stats/records.test.ts` — Test qualifiers, tied records, season grouping, missing history and coverage.
- `src/lib/stats/records.ts` — Compute player/team records with qualification thresholds and coverage.
- `src/lib/stats/results.test.ts` — Test internal matches, coverage and result-rate denominators.
- `src/lib/stats/results.ts` — Summarize results and group them by match type.
- `src/lib/stats/seasons.test.ts` — Test calendar/university boundaries, exclusive ends, UTC, leap days and invalid dates.
- `src/lib/stats/seasons.ts` — Calculate UTC season ranges and display labels without database dependencies.
- `src/lib/stats/sort.test.ts` — Verify nulls stay last in both sort directions.
- `src/lib/stats/sort.ts` — Compare nullable numeric columns consistently.
- `src/lib/stats/streaks.test.ts` — Test sorting, breaks, ignored results, mixed types and empty streaks.
- `src/lib/stats/streaks.ts` — Compute longest/current runs overall and per match type.
- `src/lib/stats/types.ts` — Define shared plain batting, bowling, match, figures and coverage types.
- `src/models/Season.ts` — Add the season model with unique names, date ranges and indexes.

## Generated local artifact

- `scripts/output/compare-stats-2026-10-27.md` — full real-data comparison report; deliberately ignored by Git.

## What to learn

- A pure function calculates from its inputs without querying the database or touching Next.js. That makes cricket rules easy to test with small fixtures.
- `null` means a rate cannot be calculated. Zero means the rate was calculated and really is zero; for example, a dismissed batter with no runs has an average of 0.00.
- Coverage reports how many matches actually contain the data a record needs. Missing old scorecards never become invented zero totals.
- Qualifiers require enough innings, runs, balls or wickets before a player can lead an average/rate record.
- Query functions load and normalize data; pure stats functions calculate; format helpers display. Pages and APIs therefore share the same definitions.
- URL search parameters carry season/type filters, making selections survive refreshes, links and back/forward.
- A golden test compares against a frozen independent baseline. Expected differences are explicit rule changes; unexpected differences need investigation.
- A read-only comparison checks real records without changing the evidence. Dry-run migrations preview changes before an explicit `--apply`.
- Additive schema fields preserve old records. Exclusive season end dates avoid overlaps, and upserts reuse existing season documents.
- Server redirects retire old URLs without breaking bookmarks. Hiding admin links improves navigation; server authentication still protects every mutation.
