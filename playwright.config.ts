import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "python3 -m http.server 4173",
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 20_000,
  },
  projects: [
    { name: "mobile", use: { ...devices["iPhone 12"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
});
