import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  projects: [
    { name: 'core', testMatch: /(?:content|core)\.spec\.ts/ },
    { name: 'chromium', testMatch: /smoke\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'PORT=4173 npm start', url: 'http://127.0.0.1:4173',
    reuseExistingServer: false, gracefulShutdown: { signal: 'SIGTERM', timeout: 3000 },
  },
});
