"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ShortcutHint } from "@/components/whiteboard/ShortcutHint";
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

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

export function InkCanvas({ strokes, onStrokesChange, onLayout, children }: InkCanvasProps) {
  const [tool, setTool] = useState<Tool>("pen");
  const [shiftHeld, setShiftHeld] = useState(false);
  const [history, setHistory] = useState<Stroke[][]>([]);
  const [redo, setRedo] = useState<Stroke[][]>([]);
  const activeIdRef = useRef<string | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const strokesRef = useRef(strokes);
  const toolRef = useRef<Tool>(tool);
  const shiftHeldRef = useRef(false);
  const shiftGestureHistoryRef = useRef(false);
  const handlersRef = useRef({
    undo: () => {},
    redo: () => {},
    finishShiftGesture: () => {},
  });

  const canUndo = history.length > 0;
  const canRedo = redo.length > 0;

  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);

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
      strokesRef.current = next;
      onStrokesChange(next);
    }
  }, [onStrokesChange]);

  const startPenStroke = useCallback((point: Point) => {
    const id = crypto.randomUUID();
    activeIdRef.current = id;
    const next = [...strokesRef.current, { id, points: [point] }];
    strokesRef.current = next;
    onStrokesChange(next);
  }, [onStrokesChange]);

  const extendPenStroke = useCallback((point: Point) => {
    const activeId = activeIdRef.current;
    if (!activeId) return;
    const next = strokesRef.current.map((stroke) => (
      stroke.id === activeId ? { ...stroke, points: [...stroke.points, point] } : stroke
    ));
    strokesRef.current = next;
    onStrokesChange(next);
  }, [onStrokesChange]);

  const finishActiveStroke = useCallback(() => {
    activeIdRef.current = null;
    shiftGestureHistoryRef.current = false;
  }, []);

  const ensureShiftGestureHistory = useCallback(() => {
    if (shiftGestureHistoryRef.current) return;
    pushHistory();
    shiftGestureHistoryRef.current = true;
  }, [pushHistory]);

  const drawAtPoint = useCallback((point: Point, currentTool: Tool) => {
    if (currentTool === "eraser") {
      ensureShiftGestureHistory();
      eraseAt(point);
      return;
    }
    if (!activeIdRef.current) {
      ensureShiftGestureHistory();
      startPenStroke(point);
      return;
    }
    extendPenStroke(point);
  }, [ensureShiftGestureHistory, eraseAt, extendPenStroke, startPenStroke]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (shiftHeldRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    pushHistory();
    shiftGestureHistoryRef.current = false;
    if (toolRef.current === "eraser") {
      eraseAt(point);
      return;
    }
    startPenStroke(point);
  }, [eraseAt, pointFromEvent, pushHistory, startPenStroke]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const point = pointFromEvent(event);
    if (shiftHeldRef.current) {
      drawAtPoint(point, toolRef.current);
      return;
    }
    if (event.buttons !== 1) return;
    if (toolRef.current === "eraser") {
      eraseAt(point);
      return;
    }
    extendPenStroke(point);
  }, [drawAtPoint, eraseAt, extendPenStroke, pointFromEvent]);

  const endStroke = useCallback(() => {
    if (shiftHeldRef.current) return;
    finishActiveStroke();
  }, [finishActiveStroke]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedo((prev) => [...prev, copyStrokes(strokesRef.current)]);
    setHistory((prev) => prev.slice(0, -1));
    strokesRef.current = previous;
    onStrokesChange(previous);
    finishActiveStroke();
  }, [finishActiveStroke, history, onStrokesChange]);

  const redoStroke = useCallback(() => {
    if (redo.length === 0) return;
    const next = redo[redo.length - 1];
    setHistory((prev) => [...prev, copyStrokes(strokesRef.current)]);
    setRedo((prev) => prev.slice(0, -1));
    strokesRef.current = next;
    onStrokesChange(next);
    finishActiveStroke();
  }, [finishActiveStroke, onStrokesChange, redo]);

  const clear = useCallback(() => {
    if (strokesRef.current.length === 0) return;
    pushHistory();
    strokesRef.current = [];
    onStrokesChange([]);
    finishActiveStroke();
  }, [finishActiveStroke, onStrokesChange, pushHistory]);

  useEffect(() => {
    handlersRef.current = {
      undo,
      redo: redoStroke,
      finishShiftGesture: finishActiveStroke,
    };
  }, [finishActiveStroke, redoStroke, undo]);

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
      if (isEditableTarget(event.target)) return;

      if (event.key === "Shift") {
        shiftHeldRef.current = true;
        setShiftHeld(true);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setTool("pen");
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setTool("eraser");
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) handlersRef.current.redo();
        else handlersRef.current.undo();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        handlersRef.current.redo();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        shiftHeldRef.current = false;
        setShiftHeld(false);
        handlersRef.current.finishShiftGesture();
      }
    };

    const onBlur = () => {
      shiftHeldRef.current = false;
      setShiftHeld(false);
      handlersRef.current.finishShiftGesture();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

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
        <button className={`toolBtn ${tool === "pen" ? "active" : ""}`} onClick={() => setTool("pen")} type="button" aria-label="Pen tool" aria-pressed={tool === "pen"}>Pen</button>
        <button className={`toolBtn ${tool === "eraser" ? "active" : ""}`} onClick={() => setTool("eraser")} type="button" aria-label="Eraser tool" aria-pressed={tool === "eraser"}>Eraser</button>
        <button className="toolBtn" disabled={!canUndo} onClick={undo} type="button" aria-label="Undo">Undo</button>
        <button className="toolBtn" disabled={!canRedo} onClick={redoStroke} type="button" aria-label="Redo">Redo</button>
        <button className="toolBtn clearBtn" onClick={clear} type="button" aria-label="Clear canvas">Clear</button>
      </div>
      <ShortcutHint />
      <div
        ref={wrapRef}
        className={`canvasSurface ${tool}${shiftHeld ? " shiftHeld" : ""}`}
        data-testid="whiteboard-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        onPointerLeave={() => {
          if (shiftHeldRef.current) handlersRef.current.finishShiftGesture();
        }}
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
