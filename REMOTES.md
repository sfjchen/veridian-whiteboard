# Git remotes — read before push

Whiteboard v1 is a **standalone** Next.js app — not the EdTech monorepo.

## Current remotes

| Remote | URL | Use |
|--------|-----|-----|
| `origin` | `https://github.com/sfjchen/veridian-whiteboard.git` | **Push whiteboard here** |
| `edtech-fork` | `https://github.com/sfjchen/Veridian.git` | Read-only legacy EdTech fork (optional) |

Verify: `git remote -v`

## Do not

- Push whiteboard code to `sfjchen/Veridian` (EdTech tree).
- Mix deploy env with Jon-fun (`sfjc.dev` root) or Desktop EdTech Supabase.

## Deploy

- **Primary URL:** [sfjc.dev/veridian](https://sfjc.dev/veridian) — proxied by Jon-fun (`next.config.mjs` rewrite)
- **Vercel origin:** project `veridian-whiteboard` → `veridian-whiteboard.vercel.app/veridian`
- **No Render, no Supabase, no subdomain DNS** for whiteboard v1 — all AI runs on Vercel serverless routes

## EdTech work (legacy, separate repo)

Use `/Users/jchen04mac/Desktop/Veridian/` — not this folder.
