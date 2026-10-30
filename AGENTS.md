# AGENTS.md — rules for AI coding agents (Codex, OpenCode, etc.)

Read this file and `DESIGN.md` before every task. If a task prompt conflicts with this file, follow the prompt and say so in your summary.

## Project
Mora Cricket Stats — a stats site for the University of Moratuwa cricket team, live on Vercel.
The owner is a student who is learning: keep code simple and readable, and explain what you did in plain words.

## Stack
- Next.js 16 App Router, React 19 (React Compiler on), TypeScript strict
- Tailwind CSS 4 (`@tailwindcss/postcss`) + **HeroUI v3** (`@heroui/react`, `@heroui/styles`) — NOT HeroUI v2/NextUI: no provider, compound components (`Card.Header`), `onPress` not `onClick`. Check a component's real API in `node_modules/@heroui/react` before using it; never invent props.
- Mongoose 9 on MongoDB Atlas, zod 4 (`import { z } from "zod"`), Vitest, ESLint 9
- Path alias `@/*` → `./src/*`
- Commands: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`
- Scripts run with `npx tsx --env-file=.env.local scripts/<name>.ts`

## Where things live
- Design rules: `DESIGN.md`; design images: `docs/design/screens/`
- Pure stats maths: `src/lib/stats/` (tested). Formatting: `src/lib/stats/format.ts`
- Database reads for pages: `src/lib/queries/` (server only)
- Server actions: `src/lib/actions/`
- Importer logic: `src/lib/import/` and `src/components/import/`
- Models: `src/models/`
- Shared UI: `src/components/ui/`; app frame: `src/components/shell/`; pure UI helpers: `src/lib/ui/`
- Seasons: `src/lib/seasonsServer.ts`, `src/lib/stats/seasons.ts`, `src/lib/stats/config.ts`
- Auth: `isAdmin()`, `getCurrentUser()`, `requireAdmin()`, `assertCanWrite()` in `src/lib/auth.ts`

## Hard rules
1. **No new npm packages** unless the task prompt names them.
2. **Database changes are additive only**: new fields optional or defaulted; never rename/remove fields. Never write to the database except through the app's normal actions/routes, or scripts that need an explicit `--apply` flag.
3. Model export pattern (name spelt correctly):
   `const X: Model<IX> = (mongoose.models.X as Model<IX>) || mongoose.model<IX>("X", XSchema)`
4. **Await every async call** (DB, `cookies()`, `params`, `searchParams`, rate limit helpers).
5. `populate()` always passes the model: `populate({ path, model })`.
6. Admin pages: server component checks `isAdmin()` and `redirect("/login")` if not. Admin mutations (server actions or API routes) check the user/`assertCanWrite` and the rate limit like existing write routes do.
7. Pages are server components; only interactive pieces are client components with plain serialisable props.
8. Watch for junk auto-imports: never import from `"console"`, `"next/dist/..."`, `"zod/mini"`, `"zod/locales"`, or an unused `Model` from `"mongoose"`.
9. Use `@/...` imports in files you create or edit.
10. Pure logic gets a `*.test.ts` next to it. **Never loosen, skip or delete a test to make it pass.** If a test seems wrong, stop and explain.
11. Never show invented data. Follow `DESIGN.md` §9 (display rules) and §10 (things the data does not support).
12. No raw hex colours in components — use the theme tokens from `DESIGN.md` §2.
13. Keep **LF line endings**. Don't reformat or re-save files you weren't asked to change.
14. Don't touch `.env*`, `scripts/samples/`, `.github/` unless asked.
15. **No git commits, pushes, checkouts, resets, stashes or branch changes.** The owner commits.

## Finish every task with
1. `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` — fix anything you broke.
2. A reply containing:
   - every file created / changed / deleted, one line each on why
   - results of the four commands (pass/fail, test count)
   - anything unsure, skipped, or in conflict with DESIGN.md
   - a manual test checklist (pages, desktop 1440px and phone 390px, keyboard checks)
   - "What to learn": 3–6 short, simple bullet points about the main ideas used
   - a one-line commit message

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
