const baseUrl = process.env.SMOKE_BASE_URL ?? "https://veridian-whiteboard.vercel.app";
const liveAi = process.env.SMOKE_LIVE_AI === "1";

async function expectStatus(path: string, init: RequestInit, status: number): Promise<void> {
  const response = await fetch(`${baseUrl}${path}`, init);
  if (response.status !== status) {
    const body = await response.text();
    throw new Error(`${path} expected ${status}, got ${response.status}: ${body.slice(0, 200)}`);
  }
}

async function main(): Promise<void> {
  const health = await fetch(`${baseUrl}/api/health`);
  if (!health.ok) throw new Error(`health failed: ${health.status}`);
  const healthJson = await health.json() as { status?: string; app?: string };
  if (healthJson.status !== "ok" || healthJson.app !== "veridian-whiteboard") {
    throw new Error("health payload mismatch");
  }

  const home = await fetch(`${baseUrl}/`);
  if (!home.ok) throw new Error(`home failed: ${home.status}`);

  await expectStatus("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "", history: [] }),
  }, 400);

  await expectStatus("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  }, 400);

  if (liveAi) {
    const chat = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Reply with exactly: deploy-ok", history: [] }),
    });
    if (chat.status !== 200) {
      throw new Error(`live chat failed: ${chat.status}`);
    }
    const payload = await chat.json() as { content?: string };
    if (!payload.content?.trim()) throw new Error("live chat returned empty content");
  }

  process.stdout.write(`Deploy smoke passed (${baseUrl})\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
