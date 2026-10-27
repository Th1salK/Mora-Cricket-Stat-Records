# DESIGN.md — Mora Cricket Stats

The single source of truth for how the Mora Cricket Stats UI looks and behaves.
Every UI change (by a person or an AI agent) must follow this file.

- **Figma:** "Mora Cricket Stats new UI" — https://www.figma.com/design/nojZeIQzhhwyTojBm2QHGZ/Mora-Cricket-Stats-new-UI
- **Built with:** Next.js 16 App Router · React 19 · Tailwind CSS 4 · **HeroUI v3** (`@heroui/react`, `@heroui/styles`)
- **Last updated:** 27 Oct 2026 (after Phase 1: seasons + stats module)

### How to use this file

- **Visual detail** (exact spacing, a colour, how a card looks): Figma wins if this file and Figma disagree. Copy what the screen shows.
- **Data and behaviour** (what a number means, what to show when data is missing, what is allowed): **this file wins over Figma.** Some Figma screens show data the app does not store (see §10). Never invent data to fill a design.
- Agents: read this whole file before any UI task. If a task needs something this file does not cover, follow the closest existing pattern and list the gap in your summary.

---

## 1. Design principles

1. **Stats first.** Numbers are the content. Big, clear figures; supporting text is quiet.
2. **Honest data.** If we don't have a number, show "–" or hide the item. Never show 0 for "unknown". Say how many matches a figure is based on when not all matches have the data.
3. **Match type is always visible.** Every match, record and split shows its format badge (Div 3, Practice, …).
4. **One dark theme.** Deep black surfaces, shark-blue actions, pitch-teal highlights, ball-red for wickets. No light mode.
5. **Mobile is first-class.** Players check stats on their phones. Every screen works at 360px width.
6. **Calm, not flashy.** No glassmorphism, blur, glows or gradients on content. Flat surfaces separated by spacing and subtle borders.

---

## 2. Colour

All colours are CSS variables defined once in `src/app/globals.css`. **Never write raw hex values in components.** Use the Tailwind classes generated from these variables.

### 2.1 HeroUI theme variables (dark theme)

| Variable | Value | Figma token | Used for |
| --- | --- | --- | --- |
| `--background` | `#000000` | bg/app, bg/sidebar | Page and sidebar background |
| `--foreground` | `#ecedee` | text/primary | Main text |
| `--surface` | `#18181b` | bg/surface | Cards, panels |
| `--surface-secondary` | `#27272a` | bg/raised | Tiles inside cards, table header row, chips |
| `--surface-tertiary` | `#3f3f46` | bg/hover | Hover on raised items |
| `--overlay` | `#18181b` | — | Popovers, menus, drawer, modal |
| `--default` | `#27272a` | hero-ui/default | Default/secondary buttons |
| `--default-foreground` | `#ecedee` | — | Text on default buttons |
| `--field-background` | `#27272a` | bg/input | Inputs, selects |
| `--field-foreground` | `#ecedee` | — | Input text |
| `--field-placeholder` | `#71717a` | text/muted | Placeholder |
| `--muted` | `#71717a` | text/muted | Captions, units, table head |
| `--accent` | `#3b7bf0` | brand/primary | Primary buttons, links, focus, active states |
| `--accent-foreground` | `#ffffff` | text/on-brand | Text on primary |
| `--success` | `#17c964` | status/win | Won, positive |
| `--warning` | `#f5a524` | status/draw, accent/gold | Draw/tie, "check" states, trophies |
| `--danger` | `#f31260` | status/loss, accent/ball | Lost, errors, wickets, destructive |
| `--border` | `#3f3f46` | border/strong | Input borders, outlined buttons |
| `--separator` | `rgba(255,255,255,0.15)` | border/subtle | Dividers, card outlines, sidebar edge |
| `--focus` | `#3b7bf0` | — | Focus ring |
| `--radius` | `0.75rem` (12px) | — | Base radius |
| `--field-radius` | `0.75rem` | — | Inputs |

### 2.2 Mora tokens (exposed to Tailwind via `@theme inline` as `--color-*`)

| Variable | Value | Use |
| --- | --- | --- |
| `--text-secondary` | `#a1a1aa` | Secondary text, idle nav items, sub-labels |
| `--brand-hover` | `#6a9df5` | Hover on primary; active nav icon; sort arrow |
| `--brand-pressed` | `#2459c9` | Pressed primary |
| `--brand-deep` | `#1d4ab0` | Match header panel base colour |
| `--brand-soft` | `rgba(59,123,240,0.20)` | Active nav background, soft brand chips, avatar fill |
| `--brand-row` | `rgba(59,123,240,0.08)` | Highlighted table row (e.g. top scorer) |
| `--teal` | `#36ada3` | Eyebrow labels, icons in the season selector |
| `--teal-bright` | `#4fd1c5` | "Stats Hub", not-out names, runs highlights |
| `--gold` | `#f5a524` | Rank 1, trophies, milestones, "check" warnings |
| `--ball` | `#f31260` | Wickets numbers, bowling icons |
| `--win` / `--loss` / `--draw` | `#17c964` / `#f31260` / `#f5a524` | Result badges and bars |

Soft fills use the colour at 12–20% opacity with the full colour as text (e.g. Won = green text on green 20%).

### 2.3 Match format colours

Each format has one colour. The badge is a pill with a dot in this colour; the pill border is the colour at ~50%, the text is `--foreground`.

| Format (`MATCH_TYPES`) | Variable | Value |
| --- | --- | --- |
| Div 3 | `--format-div-3` | `#6a9df5` |
| Home and Home | `--format-home-and-home` | `#4fd1c5` |
| Practice | `--format-practice` | `#a1a1aa` |
| Inter Uni | `--format-inter-uni` | `#f5c04a` |
| SLUG | `--format-slug` | `#9353d3` |
| Friendly | `--format-friendly` | `#f07378` |

### 2.4 Meaningful colour rules

- **Runs** column/number highlight: `--teal-bright`. **Wickets**: `--ball`.
- **Economy** in tables: green (`--win`) under 4.00, red (`--loss`) above 6.00, otherwise normal text.
- **Rank badges** (leaderboards): 1 = gold soft, 2 = default/grey, 3 = ball soft; 4+ = plain muted number in a raised square.
- **Role colours** (avatars, player card tint, role chip dot): Batsman = teal, Bowler = ball red, All-rounder = brand blue, Wicket-keeper = gold.
- Colour is never the only signal: badges always have text, active nav also has a filled background.

### 2.5 Primitive palette (reference only — do not use directly)

Navy 950–400: `#060a1f #0a1130 #0f173c #141e4a #1c2859 #27356e #3a4a8c #5a6aa8` · Shark blue 700–300: `#1d4ab0 #2459c9 #3b7bf0 #6a9df5 #a3c2fa` · Pitch teal 600–300: `#2a8f87 #36ada3 #4fd1c5 #8be5dc` · Ball red 600–400: `#c7363b #e5484d #f07378` · Trophy gold: `#e8a93a #f5c04a` · Win green: `#2fbf71 #5ad894` · Slug purple: `#8b6cf0 #a893f5` · Slate 400–50: `#8c97bd #a7b1d3 #cdd3ea #f3f5fc`.

---

## 3. Typography

Fonts load with `next/font/google`:
- **Inter** (400, 500, 600, 700) → `--font-inter` → Tailwind `font-sans` (default everywhere, including tables and stat numbers).
- **Jersey 25** (400) → `--font-jersey` → Tailwind `font-display`. **Only** for page titles, the hero title and the sidebar wordmark. Always uppercase.

| Style | Font | Size / line height | Letter spacing | Use |
| --- | --- | --- | --- | --- |
| Display/Hero | Jersey 25 | 96px / 1.0 (mobile 48px) | 0.01em | Dashboard hero title |
| Display/H1 | Jersey 25 | 52px / 1.0 (mobile 36px) | 0.01em | Page titles ("BATTING STATS") |
| Stat L | Inter 600 | 36px / 1.2 | -0.015em | Hero numbers (412 runs, 214/8) |
| Stat M | Inter 600 | 24px / 1.25 | -0.01em | Stat tiles, leader values |
| Heading/H2 | Inter 700 | 22px / 1.28 | -0.01em | Section titles on big pages |
| Heading/H3 | Inter 600 | 17px / 1.4 | -0.005em | Card titles |
| Body/L | Inter 400 | 16px / 1.5 | 0 | Hero paragraph |
| Body/M | Inter 400 | 14px / 1.43 | 0 | Default text |
| Body/M Strong | Inter 600 | 14px / 1.43 | 0 | Names in lists |
| Body/S | Inter 400 | 12px / 1.33 | 0 | Captions, sub-lines |
| Label/Small | Inter 500 | 12px / 1.33 | 0 | Field labels, chips, eyebrows |
| Table/Head | Inter 600 | 12px / 1.33 | 0 | Column headers (muted) |
| Table/Cell | Inter 500 | 14px / 1.43 | 0 | Table values |

- Numbers in tables use `tabular-nums` and are right-aligned.
- Eyebrow above a page title: Label/Small in `--teal` (e.g. "Statistics", "2026 Season", "Admin").

---

## 4. Layout, spacing, shape

### 4.1 Spacing scale
Use multiples of 4px. Common values: 4, 8, 12, 16, 20, 24, 32, 40.
- Card padding: **20px** (16px on mobile).
- Gap between cards/sections: **20px** (desktop), 16px (mobile).
- Gap inside a card between blocks: 16px; between rows in a list: 8–12px.

### 4.2 Radius
- Cards and panels: **14px**. Match/hero header panels: **20px**.
- Inputs, selects, buttons, nav items, tiles inside cards: **12px**.
- Table header row and small tiles: 10px. Chips/badges/avatars: full (pill/circle).

### 4.3 Borders and elevation
- Cards: `--surface` background, **no shadow**, optional 1px `--separator` outline.
- Raised content inside cards uses `--surface-secondary` instead of borders.
- Only overlays (menus, drawer, modal) get a shadow.

### 4.4 Page layout
- **Desktop (≥ 768px, `md`):** sidebar 256px fixed on the left; main content padding **32px top/bottom, 40px left/right**, max content width **1200px**.
- **Mobile (< 768px):** top bar 56px, content padding 16px, bottom tab bar 64px + safe area.
- Two-column pages (e.g. Match detail, Records) use a main column + a **340px** side column on ≥ 1280px; below that the side column stacks under the main one.
- Grids of stat tiles: 4 across on desktop, 2 across on mobile.

### 4.5 Breakpoints
Tailwind defaults: `sm` 640, `md` 768 (sidebar appears), `lg` 1024, `xl` 1280 (side columns appear).

---

## 5. Icons

- Inline SVG components in `src/components/ui/icons.tsx` (no icon packages).
- 24×24 viewBox, `stroke="currentColor"`, stroke width 1.75, round caps/joins, `aria-hidden` by default.
- Default size 18px (nav, buttons), 16px in dense rows, 22px in the mobile tab bar.
- Icon "badges" (icon in a soft square, 36px, radius 10px) tint by meaning: runs = teal soft, wickets = ball soft, trophy/best = gold soft, matches = brand soft.

Icons in use: Grid (dashboard), Calendar (matches/season), Users (players), Bat, Ball, Trophy (records), Upload (import), Edit (drafts), List, UserCog, Logout, Menu, Close, ChevronDown, ChevronRight, ArrowLeft, Check, Lock, Shield, Info, Alert, Search, Sort, Filter, Star, Flag, Home, Chart, Trash, Eye, X.

---

## 6. Components

Shared components live in `src/components/ui/` (generic) and `src/components/shell/` (app frame). Build on HeroUI v3 where a component exists; check its API in `node_modules/@heroui/react` first (v3 is compound: `Card.Header`, `Card.Content`…; use `onPress` not `onClick`).

| Component | HeroUI base | Spec |
| --- | --- | --- |
| **Button** | `Button` | Sizes sm (32px) / md (40px) / lg (48px), radius 12px. Variants: **primary** (accent bg, white text) for the one main action; **secondary** (default bg) for other actions ("Export CSV", "Save draft"); **ghost/light** for low emphasis ("Back", "Cancel"); **outline** (border `--border`) for "Load more", "Publish anyway"; **danger** for delete. Icon-only buttons need `aria-label`. |
| **PageHeader** | — | Eyebrow (teal Label/Small) · Title (Display/H1, uppercase) · Subtitle (Body/M secondary) · actions on the right (wrap under on mobile). |
| **SectionCard** | `Card` | `--surface`, radius 14px, padding 20px. Header: title (H3) + subtitle (Body/S muted) + optional action on the right. |
| **StatTile** | — | Raised tile (or card on the dashboard): optional icon badge, label (Body/S muted), value (Stat M or Stat L), hint (Body/S muted). Optional tone tint (teal/ball/gold/brand) for "featured" tiles like Runs, Wickets, High score, Best. |
| **MatchTypeBadge** | `Chip` | Pill, height 24px, dot 6px in format colour, text 12px. Always shown next to matches and records. |
| **ResultBadge** | `Chip` | Soft fill: Won (win), Lost (loss), Draw / Tie (draw), No result (muted). Internal matches show the text "Internal" in muted, no badge. |
| **RoleChip** | `Chip` | Dark pill with a role-colour dot: Batsman, Bowler, All-rounder, Wicket-keeper. |
| **Avatar** | `Avatar` | Circle with 2-letter initials; fill = role colour soft, text = role colour. Sizes 28 (tables), 40, 56, 72 (profile). |
| **FilterTabs** | `Tabs` or `ToggleButtonGroup` | Segmented control on `--surface-secondary`, active segment `--surface-tertiary`. Optional count after the label ("Div 3 5"). Used for match-type and role filters. Scrolls horizontally on mobile. |
| **SearchField** | `SearchField` | 40px, radius 12px, search icon, placeholder "Search players". |
| **Select / Dropdown** | `Select` / `Dropdown` | 40px trigger, radius 12px, chevron. Used for sort ("Newest first", "Most runs"), qualifier ("Min. 3 inns"), season. |
| **DataTable** | `Table` | Header row: `--surface-secondary`, radius 10px, Table/Head muted. Rows: 52–56px, no zebra, hover `--brand-row`. Player cell = Avatar 28 + name (Body/M Strong) + role (Body/S muted). Numbers right-aligned, tabular. Sortable headers show an arrow in `--brand-hover`. Footnote under the table (Body/S muted with info icon) explains abbreviations. On mobile: horizontal scroll with the first column sticky, or a card list (see screen specs). |
| **RankBadge** | — | 24px square, radius 6px; colours per §2.4. |
| **LeaderCard** | `Card` | Top-3 podium cards above leaderboards: rank badge, name + role/innings, avatar right, big value (Stat L) + unit, then 3 mini stats. Rank 1 card uses `--surface-secondary`. |
| **MatchRow** | — | Date block (day number Stat-M-ish 18px over month caps 11px, in a raised square) · weekday · "vs Opponent" (Body/M Strong) + venue with pin icon (Body/S muted) · format badge · overs · Mora score · opposition score · result badge · chevron. Whole row is a link to the match. Mobile: becomes a **MatchCard** (date + format top, teams/scores middle, result bottom). |
| **PlayerCard** | `Card` | Top area 160px tinted by role colour (soft) with role chip top-left and the avatar centred (photo if one day available); name (Body/M Strong), "14 matches · 2026" (Body/S), 3 mini stats (Runs, Wkts, Mat) in a raised strip. |
| **EmptyState** | — | Icon in a soft square, title (H3), one-line message, optional action. Used when a filter has no results. |
| **Alert / Banner** | `Alert` | Tinted (10% fill, 35% border) by meaning: info (accent), warning (gold), error (danger), success (win). Icon + title + message + optional actions. |
| **Dialog** | `Modal` / `AlertDialog` | 460px wide, radius 16px, padding 24px: icon badge + title, body text, actions right-aligned (secondary then primary). |
| **Stepper** | — | Admin import flow: 4 steps in a card; done = green check circle, current = blue numbered circle, upcoming = grey; connecting lines green when done. |
| **Skeleton** | `Skeleton` | Same size as the content it replaces; used for loading. |
| **Pagination / Load more** | `Pagination` | Tables: "Showing 1–15 of 15" left, Previous/Next right. Card grids: one outline "Load 20 more players" button. |

---

## 7. App shell

### 7.1 Desktop sidebar (≥ `md`)
- 256px wide, full height, sticky; background `--background`; right border `--separator`; padding 24px 16px; gap 24px.
- **Brand:** logo (`/brand/mora-logo.png`, 36×30) + "MORA CRICKET" (Jersey 25, 22px) + "Stats Hub" (12px, `--teal-bright`).
- **Season selector:** full-width button, `--surface-secondary`, radius 12px, padding 10px 12px: calendar icon (teal) · "2026 Season" · chevron. Opens a list of seasons ("Current" shown under the current one) plus "All seasons". Sets `?season=<id|all>` on the current URL and keeps other params.
- **Nav groups** with small muted group labels:
  - Overview: Dashboard `/`, Matches `/matches`, Players `/players`
  - Statistics: Batting `/stats/batting`, Bowling `/stats/bowling`, Records `/records`
  - Admin (signed in only): Import match `/admin/import`, Saved drafts `/admin/drafts`, Manage matches `/admin/matches`, Manage players `/admin/players`
  - **Only show links to routes that exist.** Until a route is built, leave its item out (Records points to `/career` until Phase 3 creates `/records`).
- **Nav item:** 40px, radius 12px, padding 10px 12px, icon 18 + label 14px. Idle: `--text-secondary`, hover `--surface-secondary`. Active: `--brand-soft` background, `--foreground` text, icon `--brand-hover`, `aria-current="page"`. Active matching: `/` exact; others match the path or any sub-path.
- **Footer** (bottom): signed out → card "Team admin?" / "Sign in to add matches and update scorecards." / primary "Admin login" with lock icon. Signed in → row with avatar "AD", "Team Admin", "Signed in" (win green) and a logout icon button.

### 7.2 Mobile
- **Top bar** (56px, fixed): logo + "MORA CRICKET" (Jersey 25, 20px) left; menu button right. No search until search exists.
- **Drawer** (from left): same brand, season selector, nav and footer as the sidebar. Closes on navigation; focus trapped while open.
- **Bottom tab bar** (64px + safe area): Home `/`, Matches `/matches`, Players `/players`, Stats `/stats/*`, Records. Icon 22px + 11px label; active uses `--brand-hover`. Hidden on `/login` and `/admin/*`.
- Admin pages on mobile use a bottom **action bar** for the main actions (e.g. "Read scorecard", "Save draft / Publish").

---

## 8. Screens

Figma frame names are in brackets. "Data" names the function in `src/lib/queries/stats.ts` (or other source) that provides it. Every stats screen respects `?season=` and, where shown, `?matchType=`.

### 8.1 Dashboard `/` [Desktop / Dashboard, Mobile / Dashboard]
- Top row: date (Body/S muted) + "Welcome to the stats hub" (H2).
- **Hero panel** (radius 20px, team photo with dark overlay): chip "Official team · University of Moratuwa", "MORA CRICKET" (Display/Hero), one-line intro, buttons "View matches" (primary) and "Season stats" (secondary). Right: **Last match** card (date, result badge, both scores with overs, margin line, format badge). Hide the last-match card if no match has innings data; show the latest match with "Score not recorded" otherwise.
- **4 KPI tiles:** Matches played (with "Across N formats"), Team runs (avg · SR), Wickets (econ · best), Win rate (W won · L lost). Win rate uses only matches with a result, excluding internal formats; show "Based on X of Y matches" when not all have results; "–" when none do.
- **Recent matches** card (6 rows: date, opponent, format badge, result) + "All matches" link.
- **Season leaders** card: Most runs, Most wickets, Best figures, Best economy (qualifier applies).
- **Results by format** card: per format W–L with a green/red bar; internal formats show "N internal".
- Bottom: 3 link cards (Batting stats, Bowling stats, Records).
- Mobile: hero, 2×2 tiles, last match, season leaders, then the rest stacked.
- Data: `getTeamOverview`, `getBreakdownByMatchType`, `getRecords`, latest matches.

### 8.2 Matches `/matches` [Desktop / Matches, Mobile / Matches]
- PageHeader: eyebrow "2026 Season", "MATCHES", "15 fixtures across …". Action: Export CSV (optional; only if built).
- 4 small tiles: Played, Won, Lost, Internal games.
- Toolbar: FilterTabs by format with counts · SearchField (opponent/venue) · sort Select (Newest first / Oldest first).
- Table of **MatchRow**s; result column shows "Internal" for internal formats and **"–" when no result was recorded** (old matches). Scores show "–" when innings were not recorded.
- Pagination footer. Empty state when a filter has no matches.
- Mobile: filter chips scroll horizontally; rows become MatchCards.

### 8.3 Match detail `/matches/[id]` [Desktop / Match Detail, Mobile / Match Detail]
- Back link "Back to matches" + Share button (copies URL).
- **Match header** panel (radius 20px, deep-navy gradient from Figma): format badge, date, venue, toss line · Mora (avatar, name, score Stat L, overs + run rate) vs Opposition (same, right-aligned) · result strip ("Mora CC won by 16 runs").
- Tabs: "Mora CC innings" · "<Opponent> innings" · "Match info".
  - **Mora innings:** Batting table (Batter + dismissal line, R, B, 4s, 6s, SR; not-out names in teal with "not out"), extras line ("Extras 19 (w 11, nb 4, lb 4)") and total; then **Did not bat** list.
  - **Opponent innings:** their total, extras and **Mora's bowling** (Bowler, O, M, R, W, Econ, Wd, NB). We do **not** store opposition batters — show a one-line note instead of a table.
- Side column: **Match highlights** (Top scorer, Best bowling, plus one more stat we can compute, e.g. Most sixes) and **Match info** (Format, Venue, Toss, Source: imported/manual).
- **Older match state** [State / Match Detail — older match, stats only]: header shows "Score not recorded" for both sides, no result strip; an info banner "Added before the scorecard importer…" with an admin-only "Re-import" link; batting shows only "out"/"not out"; maidens show "–".
- Data: match document + its batting/bowling rows (Phase 3 replaces the stub `/api/matches/[id]/performances`).

### 8.4 Players `/players` [Desktop / Players, Mobile / Players]
- PageHeader: eyebrow "2026 Squad", "PLAYERS", "32 registered players · tap a player…".
- Toolbar: role FilterTabs with counts · SearchField · sort Select ("Most runs", "Most wickets", "Name A–Z") · grid/list toggle.
- Grid of **PlayerCard**s (4 across desktop, 2 tablet, 1–2 mobile); list view = compact table.
- Inactive players: hidden by default for the current season; a "Show inactive" toggle reveals them with an "Inactive" chip.
- "Load 20 more players" button at the bottom.

### 8.5 Player profile `/players/[id]` [Desktop / Player Profile, Mobile / Player Profile]
- Back link. **Header card:** avatar (72) or photo area, name (Display/H1 style, uppercase), role/batting style/bowling style chips, 4 headline tiles (Matches, Runs, Wickets, High score).
- "Showing stats for" FilterTabs: All + each format the player has played. Season comes from the sidebar.
- **Batting** card (8 tiles: Innings, Runs, Average, Strike rate, High score, 50s, 100s, Ducks) and **Bowling** card (Wickets, Overs, Average, Economy, Strike rate, Best, Wides, No balls). Featured tiles tinted (Runs/HS teal, Wickets/Best ball).
- If never out: Average "–" with "Not out in every innings".
- **Runs by innings** bar chart (last 12 innings; 50+ bars in teal, others blue).
- **Recent performances** table (Date, Opponent, Bat "72 (88)", Bowl "3/32").
- **By match type** table (Type, Inns, Runs, Avg, SR, HS, Wkts, Econ, Best).
- Data: `getPlayerStats`.

### 8.6 Batting stats `/stats/batting` [Desktop / Batting Stats, Mobile / Batting Stats]
- PageHeader: eyebrow "Statistics", "BATTING STATS", "Per-player batting performance · 2026 season". Action: Export CSV (optional).
- Toolbar: format FilterTabs · SearchField · qualifier Select ("Min. 3 inns" / "Min. 5 inns" / "All").
- **Top 3 LeaderCards** (by runs): runs big, then Avg, SR, HS.
- Leaderboard table: #, Player, Mat, Inns, NO, **Runs** (teal, default sort), HS (with *), Avg, SR, 50s, 100s, 4s, 6s, 0s.
- Footnote: "* not out. Avg = runs ÷ dismissals. SR = runs per 100 balls. Tap a column header to sort."
- Sorting a nullable column puts "–" rows last.
- Mobile: top-3 as a horizontal scroller; table scrolls horizontally with the player column sticky.

### 8.7 Bowling stats `/stats/bowling` [Desktop / Bowling Stats]
- Same structure as batting. Qualifier Select "Min. 5 overs" etc.
- Top 3 by wickets: Wickets big, then Econ, Avg, Best.
- Table: #, Player, **Wkts** (ball red, default sort), Econ (coloured per §2.4), Avg, SR, 5W, Wd, NB, Overs, Best.
- Footnote: "Economy colour: green under 4.00, red above 6.00. SR = balls per wicket. Tap a column header to sort."

### 8.8 Records `/records` [Desktop / Records, Mobile / Records] — replaces `/career` (redirect `/career` → `/records`)
- PageHeader: eyebrow "All-time", "RECORDS", subtitle. Season Select on the right ("All seasons" default here).
- **Results row:** Overall W–L card + one card per format (W–L, % won, bar); internal formats show played count and "not counted in win rate".
- 3 columns: **Batting records** (Highest score, Most runs in a season, Best average (min. 5 inns), Best strike rate (min. 100 runs), Most sixes in a season), **Bowling records** (Best figures, Most wickets in a season, Best economy (min. 10 ov), Best average (min. 5 wkts), Best strike rate (min. 5 wkts)), **Team records** (Highest total, Biggest win (runs), Lowest total (all out), Longest winning run).
- Each record: label with qualifier · name/team · detail line with **format and date** · big value. Team records show "From X of Y matches with team totals".
- Bottom: Most runs top 5, Most wickets top 5, Recent milestones (first 100, first five-for, streaks…).
- A record with no data is **hidden** (never "0").
- Data: `getRecords`, `getBreakdownByMatchType`.

### 8.9 Admin login `/login` [Desktop / Admin Login, Mobile / Admin Login]
- Split screen: left = team photo with "RUN THE SCOREBOOK." (Display), short text and 3 ticked benefits; right = form card: shield icon badge, "Admin login", subtitle, Username, Password (show/hide eye), primary "Sign in", error Alert, "Back to dashboard" link, "Mora Cricket © 2026".
- Mobile: photo becomes a short header, form below.
- Not in code (do not build unless asked): "Forgot password?", "Keep me signed in".

### 8.10 Admin — Import match `/admin/import` [section 05 in Figma]
Matches the real importer flow (`ImportClient`, `DraftReview`, `SavedDraftClient`):
1. **Upload** [Import — 1 Upload]: Stepper (step 1 current). Match details card (Match type*, Date*, Opponent*, Home/Away segmented, Overs, Venue name, Toss won by + Chose to, Result + Margin + Runs/Wickets). Screenshots card (dropzone, thumbnails with remove, "3 of 10 screenshots", "2.1 MB of 4.5 MB" bar). Side cards: How importing works, Privacy, Already imported? Actions: "Enter stats manually" (ghost) · "Read scorecard" (primary).
2. **Reading** [Import — 2 Reading]: progress card with checklist; error/notice banners use the exact texts the code returns.
3. **Review & fix** [Import — 3 Review & fix]: notice "Read by <model>…", match details summary, innings tabs + "Swap Mora / opposition", batting and bowling tables with a **player picker per row** showing match status (green "matched · reason", amber "check · reason", red "not linked · reason"), Did not bat chips, extras/total inputs; side: Warnings (blocking red / to-check amber, with innings tag), "The AI could not read", Publish card (blocking count, Save draft, Publish disabled while anything blocks).
4. **Dialogs:** Confirm publish (lists non-blocking warnings), Possible duplicate ("Publish anyway").
5. **Published** [Import — 4 Published]: success, scores summary, counts, names learned, links.
- Mobile [Mobile / Admin · Import — Upload / Review]: stacked cards; review uses one card per batter with the picker; bottom action bar.

### 8.11 Admin — Saved drafts `/admin/drafts` [Saved drafts (new page)] — not built yet
Table: Match (vs opponent + date/venue), Format, Saved (time + AI import/Manual), Status (dot + "1 blocking warning" / "3 names to check" / "Ready to publish"), Expires (amber when ≤ 3 days), Open + delete. Filter chips All / Ready / Needs fixes / Manual. Note that drafts expire after 30 days and screenshots are never saved.

### 8.12 Admin — Manage matches `/admin/matches` [Manage Matches v2 (matches code)] — not built yet
Use **v2**, not the original frame: header actions "Saved drafts · N" + "Import match"; filters (search, format, scorecard: full/stats only, season); table: checkbox, Date, Opponent, Format, Venue, Result ("–" if none), **Scorecard** (Full scorecard / Stats only), **Source** (Import / "Re-import" link for old matches), view/edit/delete. Bulk delete only. Delete uses the "Delete match" dialog and removes the match's performances too.

### 8.13 Admin — Manage players `/admin/players` [Desktop / Admin · Manage Players] — not built yet
Table with Player, Role, Bat, Bowl, Active switch, edit/more. Edit panel (right drawer): Full name, Short name, Role, Batting style, Bowling style, **Aliases** (add/remove chips — needed to fix name matching), Active switch. Leave out photo, jersey number and squad tag until the data model has them (§10).

---

## 9. Data display rules

| What | Rule | Example |
| --- | --- | --- |
| Missing number | `fmtNumber(null)` → "–" (en dash) | Average of a never-out batter |
| Averages, economy, bowling SR | 2 decimals | 31.69 · 3.64 · 21.68 |
| Batting strike rate | 1 decimal | 81.4 |
| Overs | from balls, base 6: `fmtOvers(53)` → "8.5" | |
| Bowling figures | wickets/runs | "3/32" |
| High score | asterisk if not out | "72*" |
| Score | runs/wickets + overs | "214/8 (50.0)"; "198/10" = all out |
| Batter line in scorecards | runs (balls) | "72 (88)" |
| Dates | long: "Sat, 28 Mar 2026"; table: "28 Mar 2026"; compact: "28 Mar" | Always Asia/Colombo, from the UTC match date |
| Large numbers | thousands separator | "1,899" |
| Percentages | whole number + % | "67%" |
| Season label | "2026 Season"; all: "All seasons" | |
| Coverage | when a figure uses only some matches | "Based on 9 of 15 matches" |
| Qualifier | shown in the record label or filter | "Best average (min. 5 inns)" |

Stat definitions (from `src/lib/stats/`): batting average = runs ÷ times out; SR = runs ÷ balls × 100; innings exclude "did not bat"; bowling average = runs ÷ wickets; economy = runs ÷ balls × 6; bowling SR = balls ÷ wickets; best figures = most wickets then fewest runs; internal formats (`INTERNAL_MATCH_TYPES`, currently Home and Home) don't count towards win rate.

Defaults: stats pages show the **current season**; Records shows **all seasons**; inactive players are hidden on the current season's leaderboards only.

---

## 10. Things the designs show that the data does NOT support

Do not build these until the data model has them. Hide the element or use the listed alternative.

| Design element | Why not | Instead |
| --- | --- | --- |
| Fall of wickets (Match detail) | Not extracted (scorer app garbles it) | Leave out |
| Best partnership (Match highlights) | Needs fall of wickets | Most sixes / Best economy |
| Player of the match, umpires, scorer | No fields on Match | Leave out |
| Opposition batting table | Only Mora rows are stored | Opposition total + extras + Mora bowling |
| Shirt number, player photo, bio, captain tag | No fields on Player | Initials avatar, role chip |
| Scores/results for old matches | Pre-importer matches lack innings/result | "–" / "Score not recorded" + re-import |
| Draft/Published status on matches | Drafts live in ImportDraft, not Match | Scorecard: full / stats only |
| Import CSV | Not a feature | Import match (screenshots) |
| Forgot password, keep me signed in | Not built | Leave out |
| Top-bar search, notifications bell | Not built | Leave out |
| Export CSV | Not built yet | Optional, client-side from the visible table |

If any of these become real (new optional fields), update this table first.

---

## 11. Accessibility

- Text contrast ≥ 4.5:1 (muted `#71717a` is only for secondary text on `--surface` or darker; never for essential content on `--surface-secondary`).
- Every interactive element is reachable by keyboard with a visible focus ring (`--focus`, 2px, offset 2px).
- Icon-only buttons have `aria-label`. Decorative icons are `aria-hidden`.
- Navigation uses `<nav aria-label>`; current page uses `aria-current="page"`.
- Tables use real `<table>` markup with `<th scope="col">`; sortable headers announce sort direction (`aria-sort`).
- Charts have a text alternative (e.g. a visually hidden list of values).
- "Skip to content" link targets `<main id="main">`.
- Respect `prefers-reduced-motion` (no slide/scale animations when set).
- Tap targets ≥ 40px on mobile.

---

## 12. Copy & tone

- Short, plain, friendly. Sentence case for everything except Jersey 25 titles (uppercase) and format names.
- Use cricket words the team uses: innings, wickets, overs, figures, not out, five-for.
- "Mora CC" for the team in match contexts; "Mora Cricket" for the site.
- Empty states say what's missing and what to do: "No Div 3 matches this season yet."
- Errors say what happened and the next step, in the importer's existing wording.

---

## 13. Implementation notes

- Theme variables and Mora tokens: `src/app/globals.css` (after `@import "tailwindcss"; @import "@heroui/styles";`). `<html class="dark" data-theme="dark">`.
- Generic UI: `src/components/ui/`. Shell: `src/components/shell/`. Pure UI helpers (nav, format colours, `cn`): `src/lib/ui/` with tests.
- Number formatting: always use `src/lib/stats/format.ts` (`fmtNumber`, `fmtOvers`, `fmtFigures`, `fmtHighScore`) — never format stats inline.
- Data for pages: `src/lib/queries/stats.ts`; pages are server components; only interactive parts are client components.
- Legacy classes (`.glass`, `.glass-blue`, `.glass-hover`, `.glass-select`, `.badge-*`) exist only until Phase 3 replaces the pages. Don't use them in new code.
- A dev-only `/design` page shows all shared components; update it when you add one.

---

## 14. Changelog

| Date | Change |
| --- | --- |
| 27 Oct 2026 | First version, written from the Figma file after Phase 1. |
