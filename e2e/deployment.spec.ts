import { expect, test } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "https://veridian-whiteboard.vercel.app";

test.describe("production deployment", () => {
  test.use({ baseURL });

  test("loads whiteboard shell", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("whiteboard-app")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Local-first AI math whiteboard" })).toBeVisible();
  });

  test("API routes validate bad requests", async ({ request }) => {
    const health = await request.get("/api/health");
    await expect(health).toBeOK();
    await expect(health.json()).resolves.toEqual({ status: "ok", app: "veridian-whiteboard" });

    const chat = await request.post("/api/chat", { data: {} });
    expect(chat.status()).toBe(400);

    const analyze = await request.post("/api/analyze", { data: {} });
    expect(analyze.status()).toBe(400);
  });
});
