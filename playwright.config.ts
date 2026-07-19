import { defineConfig, devices } from '@playwright/test'

const collectCoverage = !!process.env.COVERAGE

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  /* Blob reports from each CI shard are merged into a single HTML report */
  reporter: process.env.CI ? 'blob' : 'html',
  use: {
    baseURL: 'http://localhost:8001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:8001',
    reuseExistingServer: !process.env.CI && !collectCoverage,
    timeout: 120 * 1000,
    env: { ...process.env } as Record<string, string>,
  },
})
