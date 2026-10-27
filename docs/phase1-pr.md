# Phase 1: seasons + stats module

## What changed

- Added optional match seasons, calendar/university season calculations, automatic assignment on creation/date edits, and a dry-run-first backfill.
- Replaced duplicated statistics maths with tested pure batting, bowling, results, records, streaks, qualifiers, and formatting functions.
- Added one server query layer that filters by season and match type, skips orphan performances, and feeds both pages and APIs.
- Added season filters to the batting/bowling tables and player profiles. Both filters survive URL changes and refreshes.
- Added a player profile breakdown by match type and a note when a batter has never been dismissed.
- Kept career statistics at `/career` across all seasons. Kept existing API response field names.
- Redirected `/stats/enter` to `/admin/import`, removed the unused manual entry component, and updated admin navigation.
- Removed `src/lib/statsCalculator.ts`. Kept a frozen pure legacy copy for comparison only.

## Behaviour changes

- Undefined averages/rates show “–”; real zero values show 0.00. Not-out high scores show a star.
- Did-not-bat rows no longer count as batting innings.
- Stats pages and profiles default to the current season, falling back to the newest season with matches, or all seasons when none exist.
- Inactive players are hidden only on current-season leaderboards; their profiles and historical/all-time totals remain available.
- Team results/streaks exclude internal matches as configured. Records expose coverage rather than treating missing historic scorecards as zero.
- Until seasons are backfilled, existing matches remain unassigned. Run the migration promptly after merging.

## Validation

- Lint: passes with the existing unused `_ignored` warning in the importer schema.
- TypeScript: passes.
- Vitest: 161 tests across 18 files pass.
- Production build: passes (23 routes/pages generated; Google Fonts required network access).
- Real MongoDB comparison on 2026-10-27: 29 unique players, 107 player/scope comparisons, 1,562 legacy fields compared, 55 expected differences, **0 unexpected differences**, and 0 orphan rows skipped.
- HTTP smoke checks: homepage, batting/bowling pages with filters, career, player profile shell and stats API, season and breakdown APIs all return 200; malformed player IDs return 400; invalid/nonexistent season and invalid match-type filters safely fall back; /stats/enter returns 307 to /admin/import. The signed-out homepage hides Import Match.
- The real database currently has no Season documents, so the default correctly resolves to all seasons before backfill. Browser hydration/interactions, assigned current-season filtering, inactive current-season leaderboards and signed-in writes remain preview checks.
- Every actual difference is explained in the ignored local report at `scripts/output/compare-stats-2026-10-27.md`. The approved changes are undefined rates becoming null and exclusion of did-not-bat rows. This dataset's observed differences are undefined-rate changes.
- The comparison disables automatic collection/index creation and performs no database writes.

## After merging

Run against the intended database:

```powershell
npm run assign:seasons
npm run assign:seasons -- --apply
npm run assign:seasons
npm run compare:stats
```

Review the dry-run table before applying. The last dry run should show zero pending assignments. The pre-migration dry run found 15 matches for season 2026, all awaiting assignment.

## Vercel preview test plan

1. Open batting and bowling. Check the season label, default season, all seasons, and each match type; change each filter and confirm the other stays selected. Refresh and use back/forward.
2. Sort averages/rates in both directions. Nulls stay last, real zero values remain visible, and high scores show not-out stars.
3. Open a player profile, switch seasons/types, and inspect its totals, recent performances and “By match type” table. Find a never-dismissed batter and check the explanatory note.
4. Open an inactive player's profile. Verify it remains available and check that current-season leaderboards hide inactive players, while all-time/history shows them.
5. Open career and confirm “All seasons” and its totals/breakdown.
6. Visit `/stats/enter` and confirm redirection to the importer (or its login guard when signed out).
7. Signed out, confirm the homepage hides “Import Match”; signed in, confirm it and the sidebar Import Match link are present.
8. Try malformed/nonexistent season IDs, an unknown match type, and malformed player IDs. Confirm safe fallback/400 responses, not a database cast error.
9. Check `/api/stats/batting`, `/api/stats/bowling`, `/api/stats/breakdown` and a player's stats with season/type parameters. Confirm legacy field names and null rates.
10. After backfill, edit a match date or publish an import through the normal admin UI and verify the season follows the date.

## Still manual

No database backfill has been applied. No commit, push, PR, merge or deployment has been performed. Current-season filtering with assigned production matches and signed-in mutation flows need the preview checks above.

See [phase1-changes.md](phase1-changes.md) for the per-file change list and learning notes.
