const baseUrl = process.env.SMOKE_BASE_URL
  ?? (process.env.SMOKE_LOCAL === "1" ? "http://localhost:3000/veridian" : "https://sfjc.dev/veridian");

async function main(): Promise<void> {
  const health = await fetch(`${baseUrl}/api/health`);
  if (!health.ok) {
    throw new Error(`health failed: ${health.status}`);
  }

  const chat = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "", history: [] }),
  });
  if (chat.status !== 400) {
    throw new Error(`chat contract failed: ${chat.status}`);
  }

  const analyze = await fetch(`${baseUrl}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (analyze.status !== 400) {
    throw new Error(`analyze contract failed: ${analyze.status}`);
  }

  process.stdout.write("API smoke passed\n");
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
