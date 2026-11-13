import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /pages\.spec\.ts/,
  fullyParallel: false,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.PAGES_URL ?? 'http://127.0.0.1:4174/moving_ba/',
    ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
    trace: 'retain-on-failure',
  },
  webServer: process.env.PAGES_URL ? undefined : {
    command: 'npm exec vite -- preview --host 127.0.0.1 --port 4174 --strictPort --base=/moving_ba/',
    url: 'http://127.0.0.1:4174/moving_ba/',
    reuseExistingServer: false,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 3000 },
  },
});
