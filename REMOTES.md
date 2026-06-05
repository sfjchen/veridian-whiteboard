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

- **Vercel:** project `veridian-whiteboard` → `https://veridian.sfjc.dev`
- **Jon-fun hub:** `sfjc.dev` only — no whiteboard routes under parent `src/`

## EdTech work

Use `/Users/jchen04mac/Desktop/Veridian/` — not this folder.
