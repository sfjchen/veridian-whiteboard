import { expect, test } from "@playwright/test";

test.describe("production deployment", () => {
  test.use({ baseURL: "https://sfjc.dev" });

  test("loads whiteboard shell", async ({ page }) => {
    await page.goto("/veridian");
    await expect(page.getByTestId("whiteboard-app")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Veridian" })).toBeVisible();
    await expect(page.getByTestId("analyze-work")).toHaveText("Analyze work");
  });

  test("demo mode shows video banner", async ({ page }) => {
    await page.goto("/veridian?demo=1");
    await expect(page.getByTestId("video-demo-banner")).toBeVisible();
    await expect(page.getByTestId("reference-tex")).toContainText("2x + 5 = 13");
  });

  test("API routes validate bad requests", async ({ request }) => {
    const health = await request.get("https://sfjc.dev/veridian/api/health");
    await expect(health).toBeOK();
    await expect(health.json()).resolves.toEqual({ status: "ok", app: "veridian-whiteboard" });

    const chat = await request.post("https://sfjc.dev/veridian/api/chat", { data: {} });
    expect(chat.status()).toBe(400);

    const analyze = await request.post("https://sfjc.dev/veridian/api/analyze", { data: {} });
    expect(analyze.status()).toBe(400);
  });
});
