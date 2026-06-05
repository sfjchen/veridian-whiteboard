# Veridian Whiteboard

**Live demo:** [sfjc.dev/veridian](https://sfjc.dev/veridian) · **Video take:** [sfjc.dev/veridian?demo=1](https://sfjc.dev/veridian?demo=1)

Local-first AI math whiteboard — write by hand, analyze mistakes, get Socratic hints. No login, no database.

**Repo:** [sfjchen/veridian-whiteboard](https://github.com/sfjchen/veridian-whiteboard) · **Domain:** **[2] Application / Product**

---

## Rubric (Q1–Q4)

### Q1 — Why build this?

**Bottlenecks:** handwritten feedback is slow; tutors/apps often leak full answers; LaTeX editors ≠ paper workflow; LMS bloat slows iteration.

**Solution:** draw → analyze → red mistake dots → hint-only chat on the same canvas.

> “Write math like on paper, get mistake-specific feedback in seconds, without the app doing your homework.”

### Q2 — How it works

**Pipeline (browser → Vercel → OpenRouter Gemini):**

1. **OCR** — canvas PNG → LaTeX  
2. **Mistake analysis** — JSON tags + severity vs. reference/context  
3. **Coordinates** — red dots on the image  
4. **Chat** — Socratic tutor with analysis in context  

**Stack:** Next.js 16 (App Router) · Vercel serverless `/api/*` · OpenRouter · `localStorage` only · deployed at [sfjc.dev/veridian](https://sfjc.dev/veridian) via path proxy

*Not custom model training — prompted multimodal LLM (Large Language Model).*

**4-min video script + diagram:** [docs/VIDEO_DEMO_RUBRIC.md](docs/VIDEO_DEMO_RUBRIC.md)

### Q3 — Use cases & impact

| Who | Use |
|-----|-----|
| Students | Check homework before class; ask “why is this wrong?” without full solutions |
| TAs / tutors | First pass on handwritten drafts in office hours |
| Step-heavy courses | Algebra, calculus, linear algebra |

**Impact:** faster formative feedback loops; scales routine mistake detection beyond 1:1 tutoring.

### Q4 — Roadmap

- Teacher rubrics and assignment templates  
- Stronger handwriting OCR  
- Confidence scores + human escalation  
- Classroom analytics; on-device analysis for privacy-sensitive schools  

---

## Demo flow (live recording)

1. Open [?demo=1](https://sfjc.dev/veridian?demo=1) — problem + context pre-filled  
2. Draw `2x + 5 = 13`, then an intentional balance error  
3. **Analyze work** → dots + LaTeX  
4. **Explain this mistake** in chat → Socratic reply (no spoiler answer)

**Canvas shortcuts:** ← pen · → eraser · Shift+move draw/erase · ⌘Z / ⌘⇧Z / ⌘Y undo/redo

---

## Quick start

```bash
npm install && cp .env.example .env.local
# set OPENROUTER_API_KEY
npm run dev   # http://localhost:3000/veridian
```

| Script | Purpose |
|--------|---------|
| `npm run build` / `lint` / `type-check` | CI checks |
| `npm run test:e2e` | Playwright (local) |
| `npm run smoke:deploy` | Prod health + API contracts |
| `npm run test:e2e:deployment` | Playwright vs prod |

**Deploy:** Vercel project `veridian-whiteboard` → `vercel --prod` → `npm run smoke:deploy`. Details: [WORKING.md](WORKING.md) · [REMOTES.md](REMOTES.md)

---

## Layout

```
src/components/whiteboard/   InkCanvas, ChatPanel, MistakeOverlay
src/app/api/                 analyze, chat, health
src/lib/server/ai.ts         OpenRouter (OCR + analysis + chat)
src/lib/whiteboard/          capture, types, localStorage
```

---

## Changelog

**2026-06**

- README tightened to rubric Q1–Q4; full video script stays in `docs/VIDEO_DEMO_RUBRIC.md`.
- Canvas shortcuts from original Veridian (←/→ tools, Shift+move, undo/redo).
- Original org UI (DM Sans, green palette, forest backdrop); OpenRouter Gemini on Vercel at sfjc.dev/veridian.
- Refactored from EdTech monorepo to solo Next.js whiteboard (no Supabase/auth in v1).
