"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Point, Stroke, Tool } from "@/lib/whiteboard/types";

type InkCanvasProps = {
  strokes: Stroke[];
  onStrokesChange: (strokes: Stroke[]) => void;
  onLayout: (size: { width: number; height: number }) => void;
  children?: ReactNode;
};

const ERASER_RADIUS = 18;

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pathFromPoints(points: Point[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    const point = points[0];
    return `M ${point.x} ${point.y} L ${point.x + 0.01} ${point.y + 0.01}`;
  }
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function copyStrokes(strokes: Stroke[]): Stroke[] {
  return strokes.map((stroke) => ({
    id: stroke.id,
    points: stroke.points.map((point) => ({ ...point })),
  }));
}

export function InkCanvas({ strokes, onStrokesChange, onLayout, children }: InkCanvasProps) {
  const [tool, setTool] = useState<Tool>("pen");
  const [history, setHistory] = useState<Stroke[][]>([]);
  const [redo, setRedo] = useState<Stroke[][]>([]);
  const activeIdRef = useRef<string | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const strokesRef = useRef(strokes);

  const canUndo = history.length > 0;
  const canRedo = redo.length > 0;

  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  const pushHistory = useCallback(() => {
    setHistory((prev) => [...prev, copyStrokes(strokesRef.current)]);
    setRedo([]);
  }, []);

  const pointFromEvent = useCallback((event: React.PointerEvent<HTMLDivElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }, []);

  const eraseAt = useCallback((point: Point) => {
    const next = strokesRef.current.filter((stroke) => (
      !stroke.points.some((strokePoint) => distance(strokePoint, point) <= ERASER_RADIUS)
    ));
    if (next.length !== strokesRef.current.length) {
      onStrokesChange(next);
    }
  }, [onStrokesChange]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    pushHistory();
    if (tool === "eraser") {
      eraseAt(point);
      return;
    }
    const id = crypto.randomUUID();
    activeIdRef.current = id;
    const next = [...strokesRef.current, { id, points: [point] }];
    strokesRef.current = next;
    onStrokesChange(next);
  }, [eraseAt, onStrokesChange, pointFromEvent, pushHistory, tool]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.buttons !== 1) return;
    const point = pointFromEvent(event);
    if (tool === "eraser") {
      eraseAt(point);
      return;
    }
    const activeId = activeIdRef.current;
    if (!activeId) return;
    const next = strokesRef.current.map((stroke) => (
      stroke.id === activeId ? { ...stroke, points: [...stroke.points, point] } : stroke
    ));
    strokesRef.current = next;
    onStrokesChange(next);
  }, [eraseAt, onStrokesChange, pointFromEvent, tool]);

  const endStroke = useCallback(() => {
    activeIdRef.current = null;
  }, []);

  const undo = useCallback(() => {
    if (!canUndo) return;
    const previous = history[history.length - 1];
    setRedo((prev) => [...prev, copyStrokes(strokesRef.current)]);
    setHistory((prev) => prev.slice(0, -1));
    strokesRef.current = previous;
    onStrokesChange(previous);
  }, [canUndo, history, onStrokesChange]);

  const redoStroke = useCallback(() => {
    if (!canRedo) return;
    const next = redo[redo.length - 1];
    setHistory((prev) => [...prev, copyStrokes(strokesRef.current)]);
    setRedo((prev) => prev.slice(0, -1));
    strokesRef.current = next;
    onStrokesChange(next);
  }, [canRedo, onStrokesChange, redo]);

  const clear = useCallback(() => {
    if (strokesRef.current.length === 0) return;
    pushHistory();
    strokesRef.current = [];
    onStrokesChange([]);
  }, [onStrokesChange, pushHistory]);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const resize = () => {
      const rect = node.getBoundingClientRect();
      onLayout({ width: rect.width, height: rect.height });
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    return () => observer.disconnect();
  }, [onLayout]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redoStroke();
        else undo();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redoStroke();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [redoStroke, undo]);

  const paths = useMemo(() => strokes.map((stroke) => (
    <path
      key={stroke.id}
      d={pathFromPoints(stroke.points)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
    />
  )), [strokes]);

  return (
    <section className="canvasPanel">
      <div className="canvasToolbar" aria-label="Whiteboard toolbar">
        <button className={`toolBtn ${tool === "pen" ? "active" : ""}`} onClick={() => setTool("pen")} type="button" aria-label="Pen tool">Pen</button>
        <button className={`toolBtn ${tool === "eraser" ? "active" : ""}`} onClick={() => setTool("eraser")} type="button" aria-label="Eraser tool">Eraser</button>
        <button className="toolBtn" disabled={!canUndo} onClick={undo} type="button" aria-label="Undo">Undo</button>
        <button className="toolBtn" disabled={!canRedo} onClick={redoStroke} type="button" aria-label="Redo">Redo</button>
        <button className="toolBtn clearBtn" onClick={clear} type="button" aria-label="Clear canvas">Clear</button>
      </div>
      <div
        ref={wrapRef}
        className={`canvasSurface ${tool}`}
        data-testid="whiteboard-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        role="application"
        aria-label="Writable math whiteboard"
      >
        <svg className="inkSvg" aria-hidden="true" data-testid="ink-svg">
          {paths}
        </svg>
        {children}
      </div>
    </section>
  );
}
