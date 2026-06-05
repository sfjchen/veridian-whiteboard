import { expect, test, type Page } from "@playwright/test";

async function drawStroke(page: Page): Promise<void> {
  const canvas = page.getByTestId("whiteboard-canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas bounding box unavailable");
  await page.mouse.move(box.x + 80, box.y + 90);
  await page.mouse.down();
  await page.mouse.move(box.x + 170, box.y + 140, { steps: 6 });
  await page.mouse.move(box.x + 250, box.y + 110, { steps: 6 });
  await page.mouse.up();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("renders the local-first whiteboard shell", async ({ page }) => {
  await expect(page.getByTestId("whiteboard-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Local-first AI math whiteboard" })).toBeVisible();
  await expect(page.getByTestId("whiteboard-canvas")).toBeVisible();
  await expect(page.getByTestId("analysis-status")).toHaveText("No analysis yet.");
});

test("draws, undoes, redoes, and persists strokes", async ({ page }) => {
  await drawStroke(page);
  const paths = page.getByTestId("ink-svg").locator("path");
  await expect(paths).toHaveCount(1);

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(paths).toHaveCount(0);

  await page.getByRole("button", { name: "Redo" }).click();
  await expect(paths).toHaveCount(1);

  await page.reload();
  await expect(page.getByTestId("ink-svg").locator("path")).toHaveCount(1);
});

test("shows a helpful message when analyzing an empty canvas", async ({ page }) => {
  await page.getByTestId("analyze-work").click();
  await expect(page.getByText("Write some work on the whiteboard first.")).toBeVisible();
});

test("posts captured work, renders analysis, and asks about a mistake hint", async ({ page }) => {
  await page.route("**/api/analyze", async (route) => {
    const request = route.request();
    expect(request.method()).toBe("POST");
    const postData = request.postData() ?? "";
    expect(postData).toContain("reference_tex");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        studentTex: "2x + 5 = 14",
        annotatedTex: "{}",
        continuationTex: "Check the arithmetic after subtracting 5.",
        mistakeCount: 1,
        mistakes: [
          {
            id: "m1",
            tag: "arithmetic-slip",
            severity: "mechanical",
            explanation: "The subtraction step changes the right side incorrectly.",
            xMin: 80,
            yMin: 80,
            xMax: 180,
            yMax: 130,
            dot: { x: 130, y: 105 },
          },
        ],
      }),
    });
  });
  await page.route("**/api/chat", async (route) => {
    const body = route.request().postDataJSON() as { message: string; analysisSummary: string };
    expect(body.message).toContain("Help me understand this arithmetic-slip mistake");
    expect(body.analysisSummary).toContain("arithmetic-slip");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        role: "assistant",
        content: "Look closely at what subtracting 5 does to 14.",
        createdAt: new Date().toISOString(),
      }),
    });
  });

  await drawStroke(page);
  await page.getByTestId("analyze-work").click();

  await expect(page.getByTestId("analysis-status")).toHaveText("Found 1 mistake.");
  await expect(page.getByText("2x + 5 = 14")).toBeVisible();
  await page.getByRole("button", { name: "Mistake: arithmetic-slip" }).click();
  await expect(page.getByText("The subtraction step changes the right side incorrectly.")).toBeVisible();
  await page.getByRole("button", { name: "Ask about this" }).click();
  await expect(page.locator(".message.student", { hasText: "Help me understand this arithmetic-slip mistake" })).toBeVisible();
  await expect(page.getByText("Look closely at what subtracting 5 does to 14.")).toBeVisible();
});

test("sends chat with latest context and displays assistant response", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    const body = route.request().postDataJSON() as { message: string; contextTex: string };
    expect(body.message).toBe("Give me a hint");
    expect(body.contextTex).toContain("Give brief hints");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        role: "assistant",
        content: "What operation would undo adding 5?",
        createdAt: new Date().toISOString(),
      }),
    });
  });

  await page.getByRole("button", { name: "Give me a hint" }).click();
  await expect(page.locator(".message.student", { hasText: "Give me a hint" })).toBeVisible();
  await expect(page.getByText("What operation would undo adding 5?")).toBeVisible();
});

test("surfaces analyze API configuration failures", async ({ page }) => {
  await page.route("**/api/analyze", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "AI is not configured." }),
    });
  });

  await drawStroke(page);
  await page.getByTestId("analyze-work").click();
  await expect(page.getByText("AI is not configured.")).toBeVisible();
});

test("API routes validate bad requests without AI keys", async ({ request }) => {
  const health = await request.get("/api/health");
  await expect(health).toBeOK();

  const analyze = await request.post("/api/analyze", { multipart: {} });
  expect(analyze.status()).toBe(400);
  await expect(analyze.json()).resolves.toEqual({ error: "image file is required." });

  const analyzeJson = await request.post("/api/analyze", { data: {} });
  expect(analyzeJson.status()).toBe(400);
  await expect(analyzeJson.json()).resolves.toEqual({ error: "multipart form data is required." });

  const chat = await request.post("/api/chat", { data: {} });
  expect(chat.status()).toBe(400);
  await expect(chat.json()).resolves.toEqual({ error: "message is required." });

  const malformedChat = await request.post("/api/chat", {
    data: Buffer.from("{"),
    headers: { "Content-Type": "application/json" },
  });
  expect(malformedChat.status()).toBe(400);
  await expect(malformedChat.json()).resolves.toEqual({ error: "valid JSON body is required." });
});
