import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for Werewolf Activity E2E tests
 * Includes desktop + mobile portrait viewport testing
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  retries: 1,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://werewolf-activity-production.up.railway.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile-portrait-iphone',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: process.env.LOCAL
    ? {
        command: 'cd .. && npm start',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 60000,
      }
    : undefined,
});
