import type { WhiteboardSnapshot } from "@/lib/whiteboard/types";

const STORAGE_KEY = "veridian-whiteboard:v1";

export function loadSnapshot(): WhiteboardSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WhiteboardSnapshot;
  } catch {
    return null;
  }
}

export function saveSnapshot(snapshot: WhiteboardSnapshot): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}
