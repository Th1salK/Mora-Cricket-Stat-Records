# UI revamp handoff — resumed verification

Recorded: 28 October 2026. Branch: feature/ui-revamp.

## Current continuation

### 30 October: resumed browser and accessibility checklist

The owner explicitly requested completion of the remaining checklist. This supersedes the earlier code-only scope below. R8 must still not be described as complete until the outstanding authenticated and browser checks are actually verified.

Verified in the preceding 30 October production-browser pass (before the contrast/overlay rebuild):
- Matches, Players, profiles, batting, bowling and Records were inspected at 1440px and 390px; login at both widths. Missing assets/data use the documented fallbacks.
- The older scorecard measured viewport 390px and document 390px. Bowling table width 418px was contained by a 325px scrolling wrapper; batting fit its wrapper.
- A real mobile leader link opened its profile with season=all retained.
- /career?season=all navigated to /records?season=all. Production /design, invalid match/player IDs and valid-but-missing IDs showed not-found content.
- Signed-out /admin/import, /admin/import/<id>, /admin/drafts, /admin/matches, /admin/players and /stats/enter all navigated to /login. Login hid public navigation.
- Bowling qualifier keyboard Tab/Space/Down/Enter selected Min. 5 overs, updated min=30, and restored focus. Sample season keyboard selection changed the preview URL to season=preview-2025; current/count/check indicators were visible.

Source fixes carried over from that pass:
- ShareButton: accessible name for copying a scorecard link.
- UrlControls: 40px search field and input.
- Player profile: 40px recent-performance links.
- ConfirmDialog/EditDrawer: controlled state on Backdrop without an unused trigger root; Drawer.Body for scrolling.

Additional fixes in this continuation:
- globals.css, DraftReview, ImportClient, ShellFooter and Stepper: accessible primary action fills, placeholders, muted/red text and destructive button fills. DESIGN.md documents the deliberate accessibility overrides to the original colours.
- globals.css, DraftInningsEditor and LeaderCard: 40px mobile table links, review-name inputs and mobile leader-name links. The duplicate warning's View matches link also has a 40px target.
- PlayerAvatar: readable all-rounder initials using brand-hover while preserving the blue fill.
- PageError: use Next.js 16.4 retry() so Try again re-fetches failed page data, following the installed framework guide.
- ImportReviewPreview (new), DesignPreview: clearly labelled local-only import-review/duplicate/publish fixtures and an error/retry preview. They import no server actions and never save sample team records.

Numerical contrast checks: primary white labels 6.27:1, primary hover 7.90:1, placeholders 5.81:1, error text on raised surface 5.55:1, destructive labels 5.83:1 and hover 6.92:1. These checks cover the specified pairs, not a claim of exhaustive all-screen accessibility certification.

Current code verification: lint passed with the existing importer _ignored warning; typecheck passed; all 224 tests across 40 files passed unchanged; production build passed with the two existing HeroUI CSS warnings and parent lockfile warning. git diff --check passed and all 18 verification files use LF. Final browser checks remain in progress. Do not replace pending items with a passing claim without new evidence.

Still pending: rebuilt browser checks for the five earlier fixes; modal/drawer Tab/Shift+Tab trapping, Escape and focus return; reduced-motion checks; empty/error/loading recovery; import-review tabs and fixed phone actions in the safe preview; real authenticated drafts, publish, aliases, active undo, guarded deletion and re-import with disposable fixtures. No credentials, authentication bypasses, database writes, packages, commits or deployments have been used in these verification passes.

### Earlier scope (historical): finish code checks only

The owner requested completion, then explicitly selected **“Finish code checks only”** when asked about further shared-desktop browser testing. Browser testing has therefore been excluded from this continuation by the owner. Do not represent the remaining visual, keyboard-in-browser, authenticated or destructive workflows as verified.

Additional source fixes:
- `src/components/import/DraftReview.tsx`: keep save/publish actions fixed to the phone viewport, reserve bottom space for content and the safe area, retain desktop placement, distinguish secondary Save from primary Publish, enforce 40px action targets, and announce errors and publish readiness.
- `src/components/import/ImportClient.tsx`: name the screenshot upload and individual remove controls, give upload/remove/action controls 40px targets, and announce upload errors.
- `docs/UI_REVAMP_HANDOFF.md`: record the owner's scope decision and this code-only review.

The original browser connector still reports an unavailable host. The supported native `@oai/sky` runtime became available and opened a separate private Brave window. Its closure was detected, and no further browser input was issued after the owner's code-only selection. A temporary production server on `127.0.0.1:3303` initially timed out inside the sandbox; restarting with approved escalation restored HTTP responses (`/api/auth/me` and `/login`: 200). These are HTTP diagnostics, not completed browser navigation checks. The temporary server was stopped. The owner's original Brave window was preserved.

**Code-only scope completed.** Final checks passed in order: lint (the existing importer `_ignored` warning), typecheck, **224 tests across 40 files**, and production build. The two upstream HeroUI CSS warnings and parent-directory lockfile warning remain. `git diff --check` passed, and all three files changed in this follow-up use LF. No new packages, database writes, authentication bypasses, test changes, commits or deployments were used. The existing design/data differences remain; visual verification is deferred at the owner's request. Full R8 visual/accessibility sign-off is still pending the browser checklist below.

### Previous continuation

The owner explicitly resumed this work. The original stop record below is historical; it no longer prohibits continuation.

Source fixes in this continuation:
- `src/components/ui/LeaderboardPage.tsx`: preserve the selected season when opening the mobile top player's profile.
- `src/components/import/DraftInningsEditor.tsx`: add Left/Right arrow wrapping, Home/End, a single tab stop for the selected innings, unique tab/panel IDs, and a focusable panel. Enter/Space retain native button activation.
- `src/app/matches/[id]/page.tsx`: pass `?replace=<matchId>` from the older-scorecard admin re-import link so the existing validated prefill/replacement flow is used.
- `docs/UI_REVAMP_HANDOFF.md`: record resumed work, current verification and remaining browser checks.

The final continuation checks after all three source fixes passed, in order: `npm run lint` (the existing `_ignored` warning), `npm run typecheck`, `npm test` (**224 tests across 40 files**), and `npm run build`. `git diff --check` also passed. This includes the previously unrun date-parts test and the latest mobile layout refinements. The production build retained the two upstream HeroUI `@property` warnings and parent-directory lockfile warning. All four files changed in this continuation use LF line endings. No tests were changed, skipped or removed.

**Browser verification is blocked in this session.** Browser inventory reported `The browser access host is unavailable`. The native Brave fallback then stopped Computer Use because it could not determine the current browser URL on Windows confidently enough to enforce policy. No further UI automation was attempted. No isolated server/browser was started, and no authenticated, destructive, or real-data write checks were performed. Source inspection confirms the admin guards, `/career` season-preserving redirect and production `/design` guard exist, but this does not verify their browser behavior.

Pending manual/browser checklist:
- At **1440px and 390px**, compare Matches, Players (including desktop), batting, bowling, Records, match detail and profile with the reference images. Confirm the older-scorecard document stays within 390px and wide tables scroll inside cards.
- Navigate `/career?season=all` to Records; confirm production `/design` and invalid/missing match/player routes show not-found content; check signed-out redirects for `/admin/import`, `/admin/import/<draftId>`, `/admin/drafts`, `/admin/matches`, `/admin/players` and `/stats/enter`.
- In development `/design`, check season selection, current/count/check state, modal/drawer focus, Escape, focus return, and visible keyboard focus.
- With an authorized admin session, check import review tabs using Tab, Shift+Tab, Left/Right (including wrapping), Home, End, Enter and Space. Check mobile action placement, review/publish confirmations, drafts, management drawers, aliases, active undo and blocked player deletion using disposable fixtures rather than real team records.
- Check re-import from an older scorecard prefills that match, and a mobile leader profile retains `season=all` or the selected season.
- Complete contrast, reduced-motion, tap-target, empty/loading/error and all-screen visual review. These remain unverified; R8 is not complete.

No packages, database records, environment files, branches, commits or deployments were changed in this continuation. No new DESIGN.md conflict was introduced; the known differences below still apply.

## Original state at stop

The owner requested: “stop the work for now and record what is done until now.” Implementation and verification stopped until the owner's later explicit resume request. No commits, pushes, branch changes, package installations, migrations, production deployments, or real-data delete/re-import tests were performed during R2–R8.

The working tree was already dirty with the shell/R1 work and owner-provided AGENTS.md, DESIGN.md and design images when this task began. Those changes were preserved. package.json, package-lock.json, layout/font/theme setup, and the old Sidebar deletion were already present from the earlier shell task; do not mistake them for new dependency changes in this task.

## Implemented so far

- R2: server-filtered Matches list, pagination and CSV; public match-detail route; real batting/bowling tables; dismissal/result descriptions, highlights, share action, missing-score state; replace the performances API stub.
- R3: player cards/grid/list, role/name/alias filters, sort/limit/inactive controls; server-rendered profiles, distinct match totals, 12-innings chart, recent performances and format breakdown.
- R4: shared batting/bowling leaderboards; qualifiers, tested null-last sorting, podium cards, mobile lists, CSV, aria-sort. Existing stats APIs remain.
- R5: /records, /career permanent redirect preserving season; result coverage, individual/team records, top-five totals and tested milestones; nav/link migration.
- R6: full-screen login with unchanged login API; upload/reading/review/published presentation, shared stepper, real review fields, optional toss/result controls, confirmations, saved drafts list/status/expiry and guarded deletion. Extraction/validation maths were not rewritten.
- R7: protected management pages, edit drawers, sequential match deletion, player aliases, active-state undo, deletion blocked for players with performances; validated re-import prefill/context and deletion/replacement inside the same publish transaction. Transaction ordering and duplicate safeguards have mocked tests.
- R8: unused legacy components/classes and unused /api/batting and /api/bowling removed after reference searches; loading/error boundaries and not-found UI; shared preview expanded; DESIGN.md updated. Final visual/accessibility pass is INCOMPLETE.

## Original verification — superseded by the continuation above

- Latest lint: PASS after the final mobile-layout edits. One existing warning remains: src/lib/import/schema.ts, unused _ignored.
- TypeScript: PASS before the last mobile-layout refinements; not rerun after those refinements.
- Tests: 223 PASS across 40 files before the last mobile-layout refinements. A further date-parts test was added afterward and has NOT been run. Do not report 224 tests passed.
- Production build: PASS before the last mobile-layout refinements. It reports two upstream HeroUI scroll-shadow @property CSS optimization warnings and the existing parent-directory package-lock warning.
- git diff --check passed earlier; final diff check after the last refinements remains.
- All pre-existing importer tests passed unchanged in the 223-test run.
- A prior build failed because source was changed during that build; a subsequent clean build passed. Use only the later successful build as the baseline above.

## Browser observations

Production browser review used an isolated Chrome profile and a temporary Next server on port 3303. The owner’s existing dev server on port 3000 was left running. The temporary production server and isolated browser were stopped at the owner’s request; no review server should need keeping alive.

Verified on the earlier production build:
- Login at 1440px and 390px; password Show/Hide works; client hydration attached; login shell is hidden.
- Matches at both widths; real database data loads; no fabricated team scores/results.
- Older-match scorecard at both widths; no admin re-import link for a signed-out visitor.
- Players phone view, profile at both widths, batting at both widths, bowling at both widths, Records desktop.
- Keyboard opening/choosing leaderboard qualifier works and updates ?min=3.
- No browser runtime exceptions were collected during these public-page checks.
- Invalid /api/matches/bad-id/performances returns HTTP 404.

A mobile older-scorecard overflow was found (document width 480 at viewport 390). The latest source adds min-w-0 to SectionCard and its content to address it. This fix has NOT been rebuilt/rechecked in a browser.

The latest source also adds date blocks, compact mobile match/player/leader cards, collapsed secondary filters, mobile Records results grouping, and Home/Chart tab icons. These refinements passed lint but await typecheck/tests/build and browser verification.

Do NOT claim redirect/protection browser checks are complete: raw fetches for /career, /design and protected admin pages returned streaming HTML with status 200. Next’s streamed redirect/not-found handling must be verified by actual browser navigation and final destination/content. The API invalid-ID 404 above was a direct JSON response.

## Remaining work when explicitly resumed

1. Read AGENTS.md and DESIGN.md again, inspect current diff, and preserve the working tree. Do not commit/reset/stash.
2. Run npm run lint, npm run typecheck, npm test, npm run build in order. Fix genuine failures without weakening tests.
3. Rebuild/restart an isolated production server and verify the mobile scorecard width is <=390, with table scrolling contained inside cards.
4. Recheck the newest mobile Matches/Players/leaderboard/Records refinements against the images at 1440 and 390. Desktop Players also needs a final screenshot comparison.
5. Verify actual /career?season=all navigation, /design being unavailable in production, bad/missing match/player pages, and signed-out redirects for all admin routes.
6. Verify /design in development: all new shared components, Modal/Drawer keyboard focus/escape, and sample season selector options/current/count/check state. Current real DB has no Season documents, so real selector is disabled All seasons; no backfill was run.
7. Authenticated manual check remains for draft list/delete, import review/publish dialogs and full-scorecard state, saved-draft resume, management drawers, alias editing, active undo, blocked player deletion and re-import. Do not use real team records as destructive QA fixtures. Check mobile import action-bar placement and keyboard operation of review innings tabs.
8. Continue the R8 accessibility pass: focus visibility, tab order, icon labels, table headers, chart text alternatives, reduced motion, contrast, overflow and empty/loading/error states. Final all-screen image matching has not been completed.
9. Update this record with the final results and any remaining deviations, then give the owner a concise summary and suggested commit message. The owner commits.

## Known design/data differences

- public/brand/mora-logo.png and the team photos are absent; MC/navy-gradient fallbacks are intentional.
- Real database matches currently lack team innings/results; show Score not recorded / en dash and coverage instead of the design’s sample scores.
- No seasons exist in the current database. All seasons is the honest fallback; this task did not write season data.
- No photos, shirt numbers, bios, captain tags, player of the match, partnerships, fall of wickets, umpires or scorer were invented.
- Import winning margins remain calculated from reviewed totals, consistent with the existing importer schema; no new independent margin input/validation behavior was introduced.
- R4 explicitly requests compact mobile lists; this takes precedence over DESIGN.md’s older mobile horizontal-table description.
- Native semantic tables/fields/navigation are used where simple; HeroUI v3 controls use the inspected installed compound API. Context7 tools were unavailable; local types and official HeroUI docs were consulted.

## Complete R2–R8 file inventory

Each entry below is a file created or changed in this continuation, including the unfinished final refinements. The pre-existing R1-only files are not listed as new work here.

| File | Why |
| --- | --- |
| DESIGN.md | Update built routes, CSV availability, cleanup notes and changelog. |
| docs/UI_REVAMP_HANDOFF.md | Record the stopped task, verification state and complete file inventory. |
| src/app/admin/drafts/error.tsx | Add a friendly retry boundary. |
| src/app/admin/drafts/loading.tsx | Add a route-specific loading skeleton. |
| src/app/admin/drafts/page.tsx | List unpublished drafts with status, expiry and actions. |
| src/app/admin/import/[draftId]/page.tsx | Preserve re-import target while reviewing a saved draft. |
| src/app/admin/import/error.tsx | Add a friendly retry boundary. |
| src/app/admin/import/loading.tsx | Add a route-specific loading skeleton. |
| src/app/admin/import/page.tsx | Load draft counts and validated re-import prefill. |
| src/app/admin/matches/error.tsx | Add a friendly retry boundary. |
| src/app/admin/matches/loading.tsx | Add a route-specific loading skeleton. |
| src/app/admin/matches/page.tsx | Add protected match management and filters. |
| src/app/admin/players/error.tsx | Add a friendly retry boundary. |
| src/app/admin/players/loading.tsx | Add a route-specific loading skeleton. |
| src/app/admin/players/page.tsx | Add protected player management and filters. |
| src/app/api/matches/[id]/performances/route.ts | Return the public scorecard instead of the stub. |
| src/app/api/matches/[id]/route.ts | Validate IDs and support clearing optional toss/result fields. |
| src/app/api/players/[id]/route.ts | Add guarded deletion only when no performances exist. |
| src/app/career/page.tsx | Permanently redirect to Records while preserving season. |
| src/app/error.tsx | Add a friendly retry boundary. |
| src/app/globals.css | Add shared table/field rules and remove legacy glass/badge styles. |
| src/app/loading.tsx | Add a route-specific loading skeleton. |
| src/app/login/LoginForm.tsx | Restyle existing login behavior and add password visibility. |
| src/app/login/page.tsx | Build split login screen with photo fallback. |
| src/app/matches/[id]/error.tsx | Add a friendly retry boundary. |
| src/app/matches/[id]/loading.tsx | Add a route-specific loading skeleton. |
| src/app/matches/[id]/page.tsx | Add public scorecards with full and older-match states. |
| src/app/matches/error.tsx | Add a friendly retry boundary. |
| src/app/matches/loading.tsx | Add a route-specific loading skeleton. |
| src/app/matches/page.tsx | Build filtered, paginated desktop/mobile match listing and CSV export. |
| src/app/not-found.tsx | Add a styled missing-page state. |
| src/app/page.tsx | Point the Dashboard Records link to the new route. |
| src/app/players/[id]/error.tsx | Add a friendly retry boundary. |
| src/app/players/[id]/loading.tsx | Add a route-specific loading skeleton. |
| src/app/players/[id]/page.tsx | Replace client fetching with server profile, chart and performance tables. |
| src/app/players/error.tsx | Add a friendly retry boundary. |
| src/app/players/loading.tsx | Add a route-specific loading skeleton. |
| src/app/players/page.tsx | Build searchable player grid/list with roles and season totals. |
| src/app/records/error.tsx | Add a friendly retry boundary. |
| src/app/records/loading.tsx | Add a route-specific loading skeleton. |
| src/app/records/page.tsx | Build records, result coverage, leaders and milestones. |
| src/app/stats/batting/error.tsx | Add a friendly retry boundary. |
| src/app/stats/batting/loading.tsx | Add a route-specific loading skeleton. |
| src/app/stats/batting/page.tsx | Use the shared batting leaderboard. |
| src/app/stats/bowling/error.tsx | Add a friendly retry boundary. |
| src/app/stats/bowling/loading.tsx | Add a route-specific loading skeleton. |
| src/app/stats/bowling/page.tsx | Use the shared bowling leaderboard. |
| src/components/admin/ManageMatches.tsx | Build editing, selection, sequential deletion and re-import actions. |
| src/components/admin/ManagePlayers.tsx | Build add/edit drawers, aliases, active undo and guarded deletion. |
| src/components/import/DraftInningsEditor.tsx | Build editable innings and mobile player review cards. |
| src/components/import/DraftReview.tsx | Restyle review/warnings and use confirmation modals. |
| src/components/import/ImportClient.tsx | Restyle upload/reading states and pass replacement context. |
| src/components/import/OptionalMatchDetails.tsx | Render optional toss/result controls using the existing schema. |
| src/components/import/PublishedSummary.tsx | Show real saved totals, record counts and learned names. |
| src/components/import/SavedDraftClient.tsx | Retain saved-draft behavior and replacement context. |
| src/components/shell/AppShell.tsx | Render login without sidebar, top bar or bottom tabs. |
| src/components/shell/SeasonSelector.tsx | Allow Records to default its selector to all seasons. |
| src/components/ui/Banner.tsx | Show accessible semantic notices. |
| src/components/ui/ConfirmDialog.tsx | Wrap HeroUI confirmation modals. |
| src/components/ui/DateBlock.tsx | Render match day/month date squares. |
| src/components/ui/DeleteDraftButton.tsx | Confirm and perform draft deletion. |
| src/components/ui/DesignPreview.tsx | Preview new shared controls, cards, charts, overlays and loading state. |
| src/components/ui/EditDrawer.tsx | Wrap accessible right-side editing panels. |
| src/components/ui/ExportCsv.tsx | Download client-side CSV. |
| src/components/ui/FilterTabs.tsx | Render URL-based filter navigation. |
| src/components/ui/LeaderboardPage.tsx | Share filtering, sorting, cards, lists and exports. |
| src/components/ui/LeaderCard.tsx | Render leaderboard podium cards. |
| src/components/ui/MatchList.tsx | Render desktop match rows and mobile cards. |
| src/components/ui/PageError.tsx | Render friendly retry controls. |
| src/components/ui/PageSkeleton.tsx | Render page-shaped loading placeholders. |
| src/components/ui/PlayerCard.tsx | Render role-tinted cards with real totals. |
| src/components/ui/ResponsiveFilters.tsx | Collapse secondary filters on phones while retaining desktop controls. |
| src/components/ui/RunsChart.tsx | Render runs bars with a text alternative. |
| src/components/ui/ScorecardTables.tsx | Render batting and bowling scorecard tables. |
| src/components/ui/SectionCard.tsx | Constrain cards and content so mobile tables scroll inside their cards. |
| src/components/ui/ShareButton.tsx | Copy the current scorecard URL with feedback. |
| src/components/ui/Stepper.tsx | Show the actual import step. |
| src/components/ui/UrlControls.tsx | Debounce search and preserve filters on selects. |
| src/lib/actions/importActions.test.ts | Mock DB mutations to verify replacement ordering and duplicate safeguards. |
| src/lib/actions/importActions.ts | Add draft deletion and transactional match replacement. |
| src/lib/queries/draftRows.test.ts | Test ready, blocking, check, empty and expiry states. |
| src/lib/queries/draftRows.ts | Calculate pure draft status and expiry. |
| src/lib/queries/drafts.ts | Load unpublished draft rows with status and expiry. |
| src/lib/queries/mapping.ts | Carry optional player role through pure mappings. |
| src/lib/queries/matches.ts | Load and serialize full scorecards. |
| src/lib/queries/playerCards.test.ts | Test empty-season players and distinct appearances. |
| src/lib/queries/playerCards.ts | Merge players, totals and distinct match appearances. |
| src/lib/queries/players.ts | Load players and merge season appearances with existing stats tables. |
| src/lib/queries/reimport.test.ts | Verify prefill without invented results. |
| src/lib/queries/reimport.ts | Build prefill from the original match UTC date and details. |
| src/lib/queries/stats.ts | Supply player matches/roles, chart series, recent rows, Records leaders and milestones. |
| src/lib/stats/dismissal.test.ts | Test dismissal coverage and caught-and-bowled formatting. |
| src/lib/stats/dismissal.ts | Format every supported dismissal and older-row fallbacks. |
| src/lib/stats/matchHighlights.test.ts | Test figures ordering, empty rows and base-six run rate. |
| src/lib/stats/matchHighlights.ts | Select real match highlights and calculate run rate. |
| src/lib/stats/milestones.test.ts | Test thresholds, seasons, ordering and internal-result exclusions. |
| src/lib/stats/milestones.ts | Detect centuries, five-fors, totals and winning-run milestones. |
| src/lib/ui/aliases.test.ts | Test trimming, blanks and duplicates. |
| src/lib/ui/aliases.ts | Normalize alias spelling and case-insensitive uniqueness. |
| src/lib/ui/csv.test.ts | Test commas, quotes, newlines and nulls. |
| src/lib/ui/csv.ts | Escape CSV cells and represent missing values as empty cells. |
| src/lib/ui/dates.test.ts | Add date-square formatting coverage. |
| src/lib/ui/dates.ts | Add Colombo date parts for match date squares. |
| src/lib/ui/leaderboard.test.ts | Test both sort directions, qualifiers and bowling figures. |
| src/lib/ui/leaderboard.ts | Filter qualifiers and sort values with nulls last. |
| src/lib/ui/nav.test.ts | Update explicit route expectations and admin visibility checks. |
| src/lib/ui/nav.ts | Enable Records and all three new admin routes. |
| src/lib/ui/request.test.ts | Test that server validation failures reach the UI. |
| src/lib/ui/request.ts | Share JSON mutation handling and server error reporting. |
| src/lib/ui/url.test.ts | Test URL parameter preservation and removal. |
| src/lib/ui/url.ts | Preserve URL parameters while changing filters. |
| src/lib/validations.ts | Trim, deduplicate and limit player aliases. |

### Deleted after checking repository references

- src/components/StatCard.tsx — replaced and no longer used.
- src/components/MatchTypeDropdown.tsx — replaced and no longer used.
- src/components/SeasonDropdown.tsx — replaced and no longer used.
- src/components/MatchesClient.tsx — replaced and no longer used.
- src/components/PlayersClient.tsx — replaced and no longer used.
- src/components/BattingStatsClient.tsx — replaced and no longer used.
- src/components/BowlingStatsClient.tsx — replaced and no longer used.
- src/lib/matchTypeBadge.ts — replaced and no longer used.
- src/app/api/batting/route.ts — replaced and no longer used.
- src/app/api/bowling/route.ts — replaced and no longer used.

## What to learn

- Server pages load data; small client components handle interactions.
- URL parameters make filters survive refreshes and shared links.
- Null means missing data; zero is a real recorded number.
- A transaction keeps match replacement together so failures roll it back.
- Pure helpers can be tested without accessing the real database.
- Responsive cards must constrain wide tables to avoid phone overflow.

Suggested commit message, AFTER remaining checks: feat(ui): rebuild public stats screens and admin management
