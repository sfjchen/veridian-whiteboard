import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_WEB_PORT ?? 3011);
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === "1";
const defaultLocalBase = `http://localhost:${port}/veridian/`;
const baseURL = (process.env.PLAYWRIGHT_BASE_URL ?? defaultLocalBase).replace(/\/?$/, "/");

export default defineConfig({
  testDir: "./e2e",
  testIgnore: process.env.PLAYWRIGHT_INCLUDE_DEPLOYMENT === "1" ? [] : ["**/deployment.spec.ts"],
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  ...(skipWebServer
    ? {}
    : {
        webServer: {
          command: `npm run dev -- --port ${port}`,
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
});
