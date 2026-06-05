import { NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/server/ai";
import type { ChatMessage } from "@/lib/whiteboard/types";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatPayload = {
  message?: unknown;
  history?: unknown;
  analysisSummary?: unknown;
  referenceTex?: unknown;
  contextTex?: unknown;
};

function parseHistory(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const item = row as Record<string, unknown>;
    if (item.role !== "student" && item.role !== "assistant") return [];
    if (typeof item.content !== "string") return [];
    return [{
      id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
      role: item.role,
      content: item.content,
      createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    }];
  });
}

export async function POST(request: Request) {
  try {
    let payload: ChatPayload;
    try {
      payload = await request.json() as ChatPayload;
    } catch {
      return NextResponse.json({ error: "valid JSON body is required." }, { status: 400 });
    }

    const message = typeof payload.message === "string" ? payload.message.trim() : "";
    if (!message) {
      return NextResponse.json({ error: "message is required." }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: "message is too long." }, { status: 400 });
    }
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "AI chat is not configured. Set OPENROUTER_API_KEY." },
        { status: 503 },
      );
    }

    const content = await generateChatResponse({
      message,
      history: parseHistory(payload.history),
      analysisSummary: typeof payload.analysisSummary === "string" ? payload.analysisSummary : "",
      referenceTex: typeof payload.referenceTex === "string" ? payload.referenceTex : "",
      contextTex: typeof payload.contextTex === "string" ? payload.contextTex : "",
    });
    return NextResponse.json({
      role: "assistant",
      content,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
