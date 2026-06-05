# Veridian Whiteboard — working doc

Mirrors Jon-fun agent standards. **Scope:** local-first Next.js whiteboard only — not EdTech, not Jon-fun games.

**Canonical public URL:** [https://sfjc.dev/veridian](https://sfjc.dev/veridian) — not `www.veridian.fyi/document/default-algebra` (legacy Expo on Desktop/Veridian).

## Product principles (from Jon-fun)

- **Audience:** Personal / small-group use; low cognitive load; no growth funnels.
- **Local-first:** Drawing, analysis snapshot, chat history in browser storage; works offline for drawing; AI routes need keys.
- **No mandatory accounts** in v1.
- **Direct UI:** Every control earns its place; original Veridian org design — DM Sans, green primary, forest backdrop (`src/app/globals.css`).

## Tech stack

- Next.js App Router, TypeScript strict, Tailwind v4
- Server routes: `POST /api/analyze`, `POST /api/chat`, `GET /api/health`
- AI: OpenAI OCR + OpenRouter Gemini (see `.env.example`)
- **No Supabase** in v1

## Env

```bash
cp .env.example .env.local
# OPENAI_API_KEY, OPENROUTER_API_KEY
```

Never commit `.env.local`. Do not copy Jon-fun or EdTech Supabase keys here.

## Commands (run from this directory)

```bash
npm run dev          # :3000 — stop Jon-fun dev first if both on one machine
npm run build
npm run lint
npm run type-check
npm run smoke:api
npm run test:e2e     # PLAYWRIGHT_WEB_PORT=3011 by default
```

## Code layout

- `src/components/whiteboard/` — UI
- `src/lib/whiteboard/` — types, capture, localStorage
- `src/lib/server/ai.ts` — server-only AI (never import from client)

## Agent rules

1. **Minimize scope** — whiteboard-only diffs; no classroom/teacher/student/Expo resurrections.
2. **Match conventions** — reuse Jon-fun patterns: strict TS, `exactOptionalPropertyTypes`, spread for optional Playwright `webServer` (see parent `playwright.config.ts`).
3. **Validate requests** — malformed analyze/chat → `400` before AI key checks.
4. **Changelog** — significant changes → `README.md` Changelog (YYYY-MM).
5. **Parent isolation** — nested repo must stay out of Jon-fun `npm run build` (parent excludes `Veridian/**`).
6. **Secrets** — never PR/commit API keys or JWT material.
7. **Remotes** — read `REMOTES.md` before any `git push`.

## Mistakes to avoid (from Jon-fun + this refactor)

| Mistake | Fix |
|---------|-----|
| Parent `next build` fails on `Veridian/playwright.config.ts` | Parent `tsconfig` excludes `Veridian/**` |
| Pushing whiteboard to `sfjchen/Veridian` | Use a dedicated remote (see `REMOTES.md`) |
| Mixing Supabase projects | Whiteboard has no DB; EdTech uses `tpqasmpieyteutvdntda`; Jon-fun uses `nzviiorrlsdtwzvzodpg` |
| `webServer: condition ? undefined : {...}` with `exactOptionalPropertyTypes` | Use `...(skip ? {} : { webServer: {...} })` |
| Port clash with Jon-fun | Run one dev server at a time, or whiteboard on another port |

## Reference (parent repo)

- [Jon-fun README](../README.md) — core design principles
- [docs/DESIGN-SYSTEM.md](../docs/DESIGN-SYSTEM.md) — ink/notebook tokens
- [docs/VERIDIAN_WORKSPACE.md](../docs/VERIDIAN_WORKSPACE.md) — three-project separation
