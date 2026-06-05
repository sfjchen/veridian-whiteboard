"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatPanel } from "@/components/whiteboard/ChatPanel";
import { ForestBackground } from "@/components/whiteboard/ForestBackground";
import { InkCanvas } from "@/components/whiteboard/InkCanvas";
import { MistakeOverlay } from "@/components/whiteboard/MistakeOverlay";
import { apiPath } from "@/lib/whiteboard/api-path";
import { strokesToPngBlob } from "@/lib/whiteboard/capture";
import { loadSnapshot, saveSnapshot } from "@/lib/whiteboard/storage";
import type { AnalysisResult, ChatMessage, Mistake, Stroke } from "@/lib/whiteboard/types";

const DEFAULT_REFERENCE = "Use valid algebra steps and preserve equality on both sides.";
const DEFAULT_CONTEXT = "Give brief hints. Do not reveal the final answer unless the student has already found it.";

type ApiAnalysisResult = AnalysisResult & {
  error?: string;
};

type ChatResponse = {
  role?: "assistant";
  content?: string;
  createdAt?: string;
  error?: string;
};

function nowMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

function describeAnalysis(analysis: AnalysisResult | null): string {
  if (!analysis) return "";
  return JSON.stringify({
    studentTex: analysis.studentTex,
    mistakes: analysis.mistakes.map((mistake) => ({
      tag: mistake.tag,
      severity: mistake.severity,
      explanation: mistake.explanation,
      erroneousLatex: mistake.erroneousLatex,
    })),
    continuationTex: analysis.continuationTex,
  });
}

export function WhiteboardApp() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [referenceTex, setReferenceTex] = useState(DEFAULT_REFERENCE);
  const [contextTex, setContextTex] = useState(DEFAULT_CONTEXT);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const snapshot = loadSnapshot();
    const id = window.setTimeout(() => {
      if (snapshot) {
        setStrokes(Array.isArray(snapshot.strokes) ? snapshot.strokes : []);
        setAnalysis(snapshot.analysis);
        setMessages(Array.isArray(snapshot.chatMessages) ? snapshot.chatMessages : []);
        setReferenceTex(snapshot.referenceTex || DEFAULT_REFERENCE);
        setContextTex(snapshot.contextTex || DEFAULT_CONTEXT);
      }
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveSnapshot({ strokes, analysis, chatMessages: messages, referenceTex, contextTex });
  }, [analysis, contextTex, loaded, messages, referenceTex, strokes]);

  const analysisText = useMemo(() => {
    if (!analysis) return "No analysis yet.";
    if (analysis.mistakeCount === 0) return "No mistakes found.";
    return `Found ${analysis.mistakeCount} mistake${analysis.mistakeCount === 1 ? "" : "s"}.`;
  }, [analysis]);

  const analyze = useCallback(async () => {
    if (strokes.length === 0) {
      setAnalysisError("Write some work on the whiteboard first.");
      return;
    }
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const blob = await strokesToPngBlob(strokes, canvasSize.width, canvasSize.height);
      const form = new FormData();
      form.append("image", blob, "whiteboard.png");
      form.append("reference_tex", referenceTex);
      form.append("context_tex", contextTex);
      form.append("include_solution", "true");
      const response = await fetch(apiPath("/api/analyze"), { method: "POST", body: form });
      const payload = await response.json() as ApiAnalysisResult;
      if (!response.ok) throw new Error(payload.error || `Analysis failed (${response.status}).`);
      setAnalysis(payload);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }, [canvasSize.height, canvasSize.width, contextTex, referenceTex, strokes]);

  const sendMessage = useCallback(async (message: string) => {
    const studentMessage = nowMessage("student", message);
    const nextMessages = [...messages, studentMessage];
    setMessages(nextMessages);
    setChatLoading(true);
    setChatError(null);
    try {
      const response = await fetch(apiPath("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: messages,
          analysisSummary: describeAnalysis(analysis),
          referenceTex,
          contextTex,
        }),
      });
      const payload = await response.json() as ChatResponse;
      if (!response.ok || !payload.content) throw new Error(payload.error || `Chat failed (${response.status}).`);
      setMessages([...nextMessages, nowMessage("assistant", payload.content)]);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "Chat failed.");
    } finally {
      setChatLoading(false);
    }
  }, [analysis, contextTex, messages, referenceTex]);

  const askAboutMistake = useCallback((mistake: Mistake) => {
    void sendMessage(`Help me understand this ${mistake.tag} mistake: ${mistake.explanation}`);
  }, [sendMessage]);

  return (
    <div className="veridianApp">
      <ForestBackground />
      <main className="pageShell" data-testid="whiteboard-app">
        <header className="appHeader">
          <h1 className="wordmark">Veridian</h1>
          <p className="tagline">Write your work, analyze mistakes, ask for hints.</p>
        </header>

        {analyzing && (
          <div className="analyzingBar" role="status">
            Analyzing your work…
          </div>
        )}

        <section className="workspaceGrid">
          <div className="whiteboardColumn">
            <InkCanvas strokes={strokes} onStrokesChange={setStrokes} onLayout={setCanvasSize}>
              {analysis && (
                <MistakeOverlay
                  mistakes={analysis.mistakes}
                  canvasSize={canvasSize}
                  onAsk={askAboutMistake}
                />
              )}
            </InkCanvas>
            <div className="actionRow">
              <button className="primaryButton" data-testid="analyze-work" disabled={analyzing} onClick={analyze} type="button">
                {analyzing ? "Analyzing…" : "Done"}
              </button>
              <span data-testid="analysis-status">{analysisText}</span>
            </div>
            {analysisError && <p className="errorText">{analysisError}</p>}
          </div>

          <aside className="sidePanel">
            <section className="card">
              <p className="cardTitle">Context</p>
              <label>
                Reference / grading note
                <textarea data-testid="reference-tex" value={referenceTex} onChange={(event) => setReferenceTex(event.target.value)} rows={4} />
              </label>
              <label>
                Tutor behavior
                <textarea data-testid="context-tex" value={contextTex} onChange={(event) => setContextTex(event.target.value)} rows={4} />
              </label>
            </section>

            <section className="card">
              <p className="cardTitle">Latest analysis</p>
              {analysis ? (
                <>
                  <p>{analysisText}</p>
                  <pre>{analysis.studentTex}</pre>
                  {analysis.continuationTex && <p className="muted">Next step: {analysis.continuationTex}</p>}
                </>
              ) : (
                <p className="muted">Analysis results will appear here.</p>
              )}
            </section>
          </aside>
        </section>

        <ChatPanel messages={messages} loading={chatLoading} error={chatError} onSend={sendMessage} />
      </main>
    </div>
  );
}
