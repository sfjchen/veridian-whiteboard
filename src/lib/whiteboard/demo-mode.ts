/** URL ?demo=1 — consistent problem + context for video / grading demos. */

export const DEMO_REFERENCE = `Problem: Solve 2x + 5 = 13.

Correct solution:
2x + 5 = 13
2x = 8
x = 4`;

export const DEMO_CONTEXT = `Socratic tutor for a grading demo.
Give brief hints only. Do not state x = 4 unless the student has already derived it.
Flag procedural errors when operations are not applied to both sides of an equation.`;

export const DEMO_PROBLEM_TITLE = "Practice: 2x + 5 = 13";
export const DEMO_PROBLEM_HINT =
  "For the video: write the first step correctly, then make a sign/balance error on the next line (e.g. subtract 5 from only one side).";

export function isVideoDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("demo") === "1";
}
