/**
 * Origin gate for the AI routes: the public demo is rate-limited at the sfjc.dev edge (Jon-fun `src/proxy.ts`),
 * which stamps VERIDIAN_PROXY_SECRET on forwarded requests, so direct calls to the Vercel origin are refused.
 */

import { timingSafeEqual } from "node:crypto";

/**
 * Returns an error message when the request did not come through the sfjc.dev proxy, else null.
 * Open when the secret is unset (local dev).
 */
export function checkProxyGate(request: Request): string | null {
  const want = process.env.VERIDIAN_PROXY_SECRET;
  if (!want) return null;
  const got = Buffer.from(request.headers.get("x-veridian-proxy") ?? "");
  const exp = Buffer.from(want);
  if (got.length === exp.length && timingSafeEqual(got, exp)) return null;
  return "Use the demo at https://sfjc.dev/veridian.";
}
