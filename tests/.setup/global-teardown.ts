import { existsSync } from 'node:fs';

import { chromium } from '@playwright/test';

import { removeGeneratedServices } from '@utils/helpers';

const AUTH_FILE = 'tests/admin/.auth/user.json';

export default async function removeServicesLeftBehind(): Promise<void> {
  if (!existsSync(AUTH_FILE)) {
    return;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({ storageState: AUTH_FILE });

  try {
    const removed = await removeGeneratedServices(await context.newPage());

    if (removed) {
      console.log(`[teardown] removed ${removed} generated service(s) left behind by this run`);
    }
  } catch (error) {
    // Cleanup that cannot run must not turn a green run red: Playwright reports a throw
    // here as a run-level error even when every test passed. Report it and leave the
    // services behind — the next run removes them once the admin is reachable again.
    const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
    console.warn(`[teardown] left generated services behind: ${reason}`);
  } finally {
    await browser.close();
  }
}
