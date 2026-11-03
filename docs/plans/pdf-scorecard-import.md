# Mora-only PDF scorecard import

Implemented on `feature/read-scorecard-pdf`, following the owner's updated scope. The owner explicitly authorised `pdfjs-dist` and this branch name, overriding AGENTS.md's default package and branch restrictions. No style-guide changes or new import pages.

## User flow

1. Open the existing `/admin/import` page and enter match details, including the season, date, opponent, Home/Away and scheduled overs.
2. In **Scorecard PDF**, select a text-based Sri Lanka Cricket Scorers Association scorecard. Click **Read PDF without AI**. Screenshot import retains its separate AI button.
3. The browser reads only Mora batting and Mora bowling into the draft. It retains both teams' innings totals and extras for the scorecard. No opposition player-statistic rows are imported. Opponent names inside Mora dismissal descriptions remain part of those dismissals.
4. Link Mora players in the existing review screen, check the figures, then save or publish through the existing actions. Unmatched players still block publication.

The PDF is not uploaded to an AI service or stored. Only the structured draft is saved. Normal authentication, rate limits, duplicate checks, ended-season restrictions and transactional publication remain in force. This feature avoids Gemini dependency; login and draft saving still need the app's database services.

## Format and limits

- Uses `pdfjs-dist` 6.5.438, dynamically loaded only for PDF reading, with a worker bundled by Next.js. The installed release requires Node 22.13 or newer.
- One PDF, up to 10 MB and 12 pages; bounded text-item count and a 30-second read deadline. Reading can be cancelled before draft preparation.
- Intended for text-based SLC scorer exports containing two innings and an unambiguous Mora team. Scans, encrypted files, unknown layouts, incomplete tables and ambiguous Mora-vs-Mora teams are rejected rather than guessed.
- Reconstructs rows from positioned text and recognised column headers, including wrapped names and repeated headers. It does not use fixed page numbers or the print footer as match data.
- Normalises captain/keeper/handedness markers for player matching and preserves dismissal details, including run-out fielders and not-outs.
- Reuses base-six overs conversion. Required numeric cells must be readable; it does not invent missing runs, balls or figures.
- Scheduled overs, Home/Away, season, date and opponent come from the existing match-details form. The importer does not infer a 50-over allocation from the tournament heading.

## Sample and expected output

Analysed `Scorecard_25332663.pdf`, a four-page, selectable-text export for Uni Moratuwa C C vs Old Joes S C on 7 June 2026. Its relevant text positions are retained as a small test fixture; the original PDF and page screenshots are not committed.

- Mora batting: 11 rows, 123/10 in 42.1 overs (253 legal balls).
- Mora bowling: seven rows against 124/4 in 26.5 overs (161 legal balls).
- Opposition batting and opposition bowling arrays: empty.
- Mora extras: 1 leg bye, 8 wides, 3 no-balls; opposition extras: 2 byes, 1 leg bye, 9 wides.
- Mora batting runs 111 + extras 12 = 123. Mora bowling runs 121 + byes/leg byes 3 = 124.
- Kevindu Perera's 3.5 overs becomes 23 legal balls. The opposition's Kavindu Perera is not imported or matched to him.

The first-innings bowler WD sum discussed in the earlier plan is irrelevant to this updated scope: those opposition bowling rows are not imported.

## Integration and validation

`parseSlcPdf.ts` produces the existing extraction shape, with only Mora's relevant tables. `readPdf.ts` handles browser PDF reading, limits, cancellation and worker cleanup. `ImportClient.tsx` uses the existing draft action and review UI rather than a new route.

An optional `moraOnly: true` flag travels with the draft and survives save/resume. It tells validation which tables were deliberately omitted; it does not disable checks on Mora's figures. Existing AI/manual drafts without the flag keep full-table checks. Swapping sides is unavailable for Mora-only drafts because the other player tables were not imported.

No match/performance schema migration is needed. The existing publish builder writes only Mora batting and bowling records and retains both teams' totals.

## Verification

- Check every sample batting and bowling number, player identity, extras and dismissal interpretation.
- Verify opposition tables can be absent without affecting parsing; verify Mora batting second, wrapped names and continuation-page headers.
- Reject missing innings, missing Mora rows, bad overs, invalid extras, ambiguous teams and impossible bowler-wicket totals.
- Verify worker cleanup on success, failures and cancellation; reject fake, empty, oversized, image-only and encrypted PDFs.
- Test draft round-trip, Mora-only validation, publishing counts, run-out handling and fractional overs.
- Confirm PDF draft creation makes no AI request and still rejects signed-out and rate-limited requests.
- Finish `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`.
- Manual checks on `/admin/import` at 1440px and 390px: both reading buttons, PDF file control, keyboard focus, cancellation/errors, review, player linking, save/resume and publication confirmation. Verify the worker loads in production.

Only the supplied scoring format has been verified. OCR and additional PDF providers remain outside this feature.
