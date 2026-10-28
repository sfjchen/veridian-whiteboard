/*
 * Renders model or OCR text with inline and display math through KaTeX.
 * Plain text stays React text nodes, so only KaTeX output (trust off) reaches innerHTML.
 */
"use client";

import katex from "katex";
import "katex/dist/katex.min.css";
import { useMemo } from "react";

/** Matches $$...$$, \[...\], \(...\) and $...$ (no space just inside the dollars, so "$5 and $10" stays text). */
const MATH_RE = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^\s$](?:[^$\n]*?[^\s$])?\$)/g;

/**
 * Splits text on math delimiters and renders each math segment with KaTeX.
 * Invalid LaTeX renders as KaTeX's escaped error text instead of throwing.
 */
export function MathText({ text }: { text: string }) {
  const parts = useMemo(() => text.split(MATH_RE).map((part, i) => {
    if (i % 2 === 0) return part;
    const display = part.startsWith("$$") || part.startsWith("\\[");
    const len = display || part.startsWith("\\(") ? 2 : 1;
    const html = katex.renderToString(part.slice(len, -len), {
      displayMode: display,
      throwOnError: false,
      trust: false,
      strict: "ignore",
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} key={i} />;
  }), [text]);
  return <>{parts}</>;
}
