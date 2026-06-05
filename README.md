# Veridian Whiteboard

Solo local-first AI math whiteboard. Standalone Next.js app — separate from the [Jon-fun](https://sfjc.dev) game hub.

**Live:** [veridian-whiteboard.vercel.app](https://veridian-whiteboard.vercel.app) · **Custom domain (pending DNS):** [veridian.sfjc.dev](https://veridian.sfjc.dev)

**Repo:** [github.com/sfjchen/veridian-whiteboard](https://github.com/sfjchen/veridian-whiteboard) · **Agent standards:** [WORKING.md](WORKING.md) · **Remotes:** [REMOTES.md](REMOTES.md)

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

- **Production URL:** [veridian-whiteboard.vercel.app](https://veridian-whiteboard.vercel.app)
- **Custom domain (after Cloudflare DNS):** `https://veridian.sfjc.dev`
- **Vercel project:** `veridian-whiteboard` (team `sfjchen-projects`)
- **GitHub:** `sfjchen/veridian-whiteboard`

```bash
npm run build
vercel link --project veridian-whiteboard
vercel env pull .env.local   # optional — sync prod secrets locally
vercel --prod
```

Set on Vercel (Production + Preview): `OPENROUTER_API_KEY`, `OPENROUTER_SITE_URL=https://veridian.sfjc.dev`, model overrides as needed. Never commit secrets.

**Custom domain (`veridian.sfjc.dev`):** `sfjc.dev` DNS is on Cloudflare. Add one record in Cloudflare → DNS:

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| `A` | `veridian` | `76.76.21.21` | DNS only (grey cloud) recommended |

Or `CNAME` `veridian` → `cname.vercel-dns.com`. Vercel verifies automatically after propagation.

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
- `npm run smoke:api` — verify route contracts without live AI keys
- `npm run smoke:deploy` — verify production deployment (default URL above)
- `npm run smoke:deploy:live` — production smoke plus one live chat call
- `npm run test:e2e:deployment` — Playwright against production (no local dev server)

## Changelog

**2026-06**

- Strengthened API request validation so malformed analyze/chat requests return `400` before AI-key checks, and expanded Playwright coverage for exact validation errors plus mistake-hint chat handoff.
- Added production deploy smoke (`npm run smoke:deploy`) and Playwright deployment spec (`npm run test:e2e:deployment`) against `veridian-whiteboard.vercel.app`.
- Switched OCR to OpenRouter Gemini when `OPENROUTER_API_KEY` is set (single-key deploy). Vercel project `veridian-whiteboard` live at [veridian-whiteboard.vercel.app](https://veridian-whiteboard.vercel.app); custom domain `veridian.sfjc.dev` pending Cloudflare DNS.
- Refactored from the original teacher/student EdTech platform into a clean Next.js App Router whiteboard app. Kept the core canvas → OCR → mistake analysis → coordinate overlay → chat workflow, removed Supabase/auth/classroom/platform code for v1, and added local-first browser persistence.
