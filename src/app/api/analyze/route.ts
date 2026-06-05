import { NextResponse } from "next/server";
import { analyzeWhiteboard } from "@/lib/server/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

function isConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export async function POST(request: Request) {
  try {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json({ error: "multipart form data is required." }, { status: 400 });
    }

    const file = form.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "image file is required." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "image must be an image file." }, { status: 400 });
    }
    if (!isConfigured()) {
      return NextResponse.json(
        { error: "AI is not configured. Set OPENROUTER_API_KEY." },
        { status: 503 },
      );
    }

    const imageBytes = Buffer.from(await file.arrayBuffer());
    const result = await analyzeWhiteboard({
      imageBytes,
      mimeType: file.type || "image/png",
      referenceTex: String(form.get("reference_tex") ?? ""),
      contextTex: String(form.get("context_tex") ?? ""),
      includeSolution: String(form.get("include_solution") ?? "true") !== "false",
    });
    return NextResponse.json({
      ...result,
      mistakeCount: result.mistakes.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
