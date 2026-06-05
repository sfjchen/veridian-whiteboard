"use client";

import { useMemo, useState } from "react";
import type { Mistake } from "@/lib/whiteboard/types";

type MistakeOverlayProps = {
  mistakes: Mistake[];
  canvasSize: { width: number; height: number };
  onAsk: (mistake: Mistake) => void;
};

const DOT_RADIUS = 8;
const SEVERITY_RANK: Record<string, number> = {
  notational: 0,
  mechanical: 1,
  procedural: 2,
  conceptual: 3,
};

export function MistakeOverlay({ mistakes, canvasSize, onAsk }: MistakeOverlayProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const visibleMistakes = useMemo(() => (
    mistakes
      .map((mistake, index) => ({ mistake, index }))
      .sort((a, b) => {
        const rankDiff = (SEVERITY_RANK[b.mistake.severity] ?? 1) - (SEVERITY_RANK[a.mistake.severity] ?? 1);
        return rankDiff || a.index - b.index;
      })
  ), [mistakes]);

  if (canvasSize.width <= 0 || canvasSize.height <= 0 || mistakes.length === 0) return null;

  return (
    <div className="mistakeOverlay" aria-live="polite">
      {visibleMistakes.map(({ mistake }) => {
        const left = Math.min(canvasSize.width - DOT_RADIUS * 2, Math.max(0, mistake.dot.x - DOT_RADIUS));
        const top = Math.min(canvasSize.height - DOT_RADIUS * 2, Math.max(0, canvasSize.height - mistake.dot.y - DOT_RADIUS));
        const active = activeId === mistake.id;
        return (
          <div className="mistakeDotWrap" key={mistake.id} style={{ left, top }}>
            <button
              className="mistakeDot"
              type="button"
              aria-label={`Mistake: ${mistake.tag}`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                setActiveId(active ? null : mistake.id);
              }}
            />
            {active && (
              <div className="mistakeBubble" style={{ transform: left < 110 ? "translateX(90px)" : undefined }}>
                <strong>{mistake.tag.replace(/-/g, " ")}</strong>
                <p>{mistake.explanation}</p>
                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    onAsk(mistake);
                  }}
                >
                  Ask about this
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
