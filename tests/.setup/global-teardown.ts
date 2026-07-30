import { existsSync } from 'node:fs';

import { chromium } from '@playwright/test';

import { removeGeneratedServices } from '@helpers/generated-services';

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
  } finally {
    await browser.close();
  }
}
