// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

// E2E_PORT: run the local build on another port when 3000 is taken — with reuseExistingServer the
// suite would otherwise test whatever already answers there.
const PORT = Number(process.env.E2E_PORT ?? 3000);
// Set E2E_BASE_URL to run the suite against a deployed preview instead of a local build.
const external = process.env.E2E_BASE_URL;
const baseURL = external ?? `http://localhost:${PORT}`;
// Bounded everywhere, so a hang fails with output instead of eating the CI job's timeout in silence.
const TEST_TIMEOUT_MS = 30_000;
const EXPECT_TIMEOUT_MS = 5_000;
const CI_GLOBAL_TIMEOUT_MS = 15 * 60_000; // the whole run, all projects and retries
const SERVER_START_TIMEOUT_MS = 120_000;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  timeout: TEST_TIMEOUT_MS,
  expect: { timeout: EXPECT_TIMEOUT_MS },
  globalTimeout: process.env.CI ? CI_GLOBAL_TIMEOUT_MS : undefined,
  // `list` prints each test as it starts and ends: the only live progress in the CI log.
  reporter: process.env.CI ? [['list'], ['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    // On main / nightly: firefox and webkit (run with --project).
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: external
    ? undefined
    : [
        {
          command: 'pnpm mock-api',
          url: 'http://localhost:4010/health',
          reuseExistingServer: !process.env.CI,
          // pnpm does not pass Playwright's default kill on to the server, so the run never ends in CI.
          gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
          timeout: SERVER_START_TIMEOUT_MS,
        },
        {
          command: `pnpm exec vite preview --port ${PORT} --strictPort`,
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          // pnpm does not pass Playwright's default kill on to the server, so the run never ends in CI.
          gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
          timeout: SERVER_START_TIMEOUT_MS,
        },
      ],
});
