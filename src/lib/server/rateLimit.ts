/**
 * Public demo caps for the AI routes: per-IP burst and daily limits held in instance memory.
 * Counts reset on cold start, so the OpenRouter key's daily spend limit is the hard backstop.
 */

type Cap = { max: number; windowMs: number; label: string };

const MIN = 60_000;
const DAY = 24 * 60 * MIN;

/** Analyze runs 3 model calls (OCR, analysis, coordinates), so it gets the tighter caps. */
const DEMO_CAPS = {
  analyze: [
    { max: 3, windowMs: 5 * MIN, label: "3 analyses per 5 minutes" },
    { max: 8, windowMs: DAY, label: "8 analyses per day" },
  ],
  chat: [
    { max: 8, windowMs: 5 * MIN, label: "8 messages per 5 minutes" },
    { max: 25, windowMs: DAY, label: "25 messages per day" },
  ],
} satisfies Record<string, Cap[]>;

const hits = new Map<string, number[]>();

/**
 * Records one request for this IP and route, and returns an error message when any cap is exceeded, else null.
 * Rejected requests are not recorded, so waiting out the window always frees a slot.
 */
export function checkDemoLimit(request: Request, route: keyof typeof DEMO_CAPS): string | null {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") || "unknown";
  const key = `${route}:${ip}`;
  const now = Date.now();
  const caps = DEMO_CAPS[route];
  const ts = (hits.get(key) ?? []).filter((t) => now - t < DAY);
  for (const c of caps) {
    const inWin = ts.filter((t) => now - t < c.windowMs);
    if (inWin.length >= c.max) {
      const mins = Math.ceil((inWin[0] + c.windowMs - now) / MIN);
      const wait = mins >= 120 ? `${Math.ceil(mins / 60)} hours` : `${mins} minutes`;
      return `Public demo limit reached (${c.label}). Try again in ${wait}.`;
    }
  }
  ts.push(now);
  hits.set(key, ts);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (now - v[v.length - 1] >= DAY) hits.delete(k);
  }
  return null;
}
