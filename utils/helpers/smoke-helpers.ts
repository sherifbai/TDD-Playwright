import { Page, expect } from '@playwright/test';

import { URLS } from '@utils/env/urls';
import { AdminPageVisit, ServerError } from '@utils/interfaces';

export async function openAdminPage(page: Page, path: string): Promise<AdminPageVisit> {
  const serverErrors: ServerError[] = [];

  page.on('response', (response) => {
    if (response.status() >= 500) {
      serverErrors.push({ status: response.status(), url: response.url() });
    }
  });

  const response = await page.goto(URLS.admin + path);

  expect(response?.status(), `GET ${path} should serve the admin app`).toBeLessThan(400);

  return {
    assertBackendAnswered(): void {
      expect(serverErrors, `${path} made requests that failed on the server`).toEqual([]);
    },
  };
}
