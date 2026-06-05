# Veridian Whiteboard

Solo local-first AI math whiteboard. Standalone Next.js app — separate from the [Jon-fun](https://sfjc.dev) game hub.

**Live:** [sfjc.dev/veridian](https://sfjc.dev/veridian) (proxied from main game hub — same pattern as other projects) · Direct: [veridian-whiteboard.vercel.app/veridian](https://veridian-whiteboard.vercel.app/veridian)

**Repo:** [github.com/sfjchen/veridian-whiteboard](https://github.com/sfjchen/veridian-whiteboard) · **Agent standards:** [WORKING.md](WORKING.md) · **Remotes:** [REMOTES.md](REMOTES.md)

## Video demo (grading rubric)

**Domain:** [2] Application / Product — deployed multimodal pipeline, not custom model training.

Full Q1–Q4 talking points, architecture diagram, and 4-minute shot list: **[docs/VIDEO_DEMO_RUBRIC.md](docs/VIDEO_DEMO_RUBRIC.md)**

Repeatable live demo URL: [sfjc.dev/veridian?demo=1](https://sfjc.dev/veridian?demo=1) (pre-fills problem + Socratic context).

## Scope

- Write math on a web whiteboard.
- Capture strokes as a PNG.
- `POST /api/analyze`: OpenRouter Gemini OCR → mistake analysis → coordinate detection.
- Show red mistake dots and short hints.
- `POST /api/chat`: Socratic tutoring using the latest local analysis and local chat history.
- No classrooms, teacher dashboard, Supabase, accounts, storage buckets, WebSockets, or Expo native shell in v1.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Visit `http://localhost:3000`.

Live AI requires:

- `OPENROUTER_API_KEY` (covers OCR, analysis, coordinates, and chat)

Optional legacy: `OPENAI_API_KEY` for OpenAI-only OCR if OpenRouter is unset.

## Deploy (Vercel)

Standalone project on [sfjc.dev](https://sfjc.dev) — **not** the Jon-fun game hub.

- **Primary URL:** [sfjc.dev/veridian](https://sfjc.dev/veridian) — proxied by the Jon-fun Vercel project (no extra DNS)
- **Direct origin:** [veridian-whiteboard.vercel.app/veridian](https://veridian-whiteboard.vercel.app/veridian)
- **Vercel project:** `veridian-whiteboard` (team `sfjchen-projects`)
- **GitHub:** `sfjchen/veridian-whiteboard`

```bash
npm run build
vercel link --project veridian-whiteboard
vercel env pull .env.local   # optional — sync prod secrets locally
vercel --prod
npm run smoke:deploy         # verify sfjc.dev/veridian after every deploy
```

**Agents must deploy** after user-facing changes — push to `origin main`, then `vercel --prod`, then smoke. See [WORKING.md](WORKING.md).

Set on Vercel (Production + Preview): `OPENROUTER_API_KEY`, `OPENROUTER_SITE_URL=https://sfjc.dev/veridian`, model overrides as needed. Never commit secrets.

Jon-fun `next.config.mjs` rewrites `/veridian` → this app (`VERIDIAN_ORIGIN`, default `https://veridian-whiteboard.vercel.app`). This app uses `basePath: '/veridian'` so assets and API routes work under the path.

## Structure

- `src/app/page.tsx` — single whiteboard route
- `src/components/whiteboard/` — canvas, overlay, chat, page app
- `src/app/api/analyze/route.ts` — analysis endpoint
- `src/app/api/chat/route.ts` — chat endpoint
- `src/app/api/health/route.ts` — health check
- `src/lib/server/ai.ts` — server-only AI calls
- `src/lib/whiteboard/` — types, capture, local storage

## Scripts

- `npm run dev` — start Next.js
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run type-check` — TypeScript
- `npm run smoke:api` — verify route contracts on prod (default `sfjc.dev/veridian`)
- `npm run smoke:api:local` — same checks against local dev server
- `npm run smoke:deploy` — verify production deployment (default URL above)
- `npm run smoke:deploy:live` — production smoke plus one live chat call
- `npm run test:e2e:deployment` — Playwright against production (no local dev server)

## Changelog

**2026-06**

- Canvas keyboard shortcuts from original Veridian org: ← pen, → eraser, Shift+move draw/erase without click, ⌘Z/⌘⇧Z/⌘Y undo/redo; hint under toolbar.
- Documented **always deploy** agent workflow (`WORKING.md`, `REMOTES.md`, README) — push → `vercel --prod` → `npm run smoke:deploy`.
- Added [docs/VIDEO_DEMO_RUBRIC.md](docs/VIDEO_DEMO_RUBRIC.md) (Q1–Q4 alignment, [2] Application/Product), `?demo=1` banner with seeded reference/context, and **Analyze work** CTA for grading videos.
- Restyled UI to match original Veridian org design: DM Sans + Dancing Script wordmark, green primary palette, forest backdrop, white cards — removed Jon-fun notebook/ink aesthetic.
- Strengthened API request validation so malformed analyze/chat requests return `400` before AI-key checks, and expanded Playwright coverage for exact validation errors plus mistake-hint chat handoff.
- Added production deploy smoke (`npm run smoke:deploy`) and Playwright deployment spec (`npm run test:e2e:deployment`) against `veridian-whiteboard.vercel.app`.
- Switched OCR to OpenRouter Gemini when `OPENROUTER_API_KEY` is set (single-key deploy). Vercel project `veridian-whiteboard` live at [sfjc.dev/veridian](https://sfjc.dev/veridian) via Jon-fun path proxy.
- Refactored from the original teacher/student EdTech platform into a clean Next.js App Router whiteboard app. Kept the core canvas → OCR → mistake analysis → coordinate overlay → chat workflow, removed Supabase/auth/classroom/platform code for v1, and added local-first browser persistence.
