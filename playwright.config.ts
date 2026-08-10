import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

import { URLS } from '@utils/env';

export default defineConfig({
  timeout: 120000,
  testDir: './tests',
  globalTeardown: './tests/.setup/global-teardown.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: Number(process.env.PW_WORKERS) || (process.env.CI ? 4 : 2),
  reporter: 'html',

  use: {
    baseURL: URLS.admin,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1720, height: 1200 },
    video: {
      mode: 'retain-on-failure',
      size: { width: 1720, height: 1200 },
    },
  },

  outputDir: 'test-results/',

  projects: [
    {
      name: 'mock',
      testMatch: '**/*.mock.ts',
    },
    {
      name: 'setup',
      testMatch: '**/*.setup.ts',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1720, height: 1200 },
        contextOptions: { screen: { width: 1720, height: 1200 } },
        launchOptions: {
          args: ['--start-maximized'],
        },
      },
    },
    {
      name: 'smoke',
      testMatch: '**/*.smoke.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/admin/.auth/user.json',
        viewport: { width: 1720, height: 1200 },
        contextOptions: { screen: { width: 1720, height: 1200 } },
        launchOptions: {
          args: ['--incognito', '--start-maximized'],
        },
      },
      dependencies: ['setup'],
    },
    {
      name: 'flow',
      testMatch: '**/*.flow.ts',
      use: {
        ...devices['Desktop Chrome'],
        // The widget sometimes stops keeping its own conversation up to date, and a click
        // aimed at it then never settles: Playwright rechecks the button until the test's
        // whole budget is gone and reports a timeout that names no step. Capped here, the
        // same failure arrives in seconds and points at the click that could not land.
        actionTimeout: 15000,
        storageState: 'tests/admin/.auth/user.json',
        viewport: { width: 1720, height: 1200 },
        contextOptions: { screen: { width: 1720, height: 1200 } },
        launchOptions: {
          // A flow drives a customer and an operator at once, so one of the two windows is
          // always in the background, and both sides learn about the other's messages from a
          // pushed update rather than by polling. Chrome throttles exactly that in windows it
          // considers hidden, which leaves the backgrounded side rendering a stale chat.
          args: [
            '--incognito',
            '--start-maximized',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
          ],
        },
      },
      dependencies: ['setup'],
    },
    {
      name: 'tests',
      testMatch: '**/*.test.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/admin/.auth/user.json',
        viewport: { width: 1720, height: 1200 },
        contextOptions: { screen: { width: 1720, height: 1200 } },
        launchOptions: {
          args: ['--incognito', '--start-maximized'],
        },
      },
      dependencies: ['setup'],
    },
  ],
});

export { URLS };
