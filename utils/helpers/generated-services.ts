import { Page, expect } from '@playwright/test';

import { URLS } from '@utils/env/urls';

const GENERATED_SERVICE = /\d{14}/;

export async function removeGeneratedServices(page: Page): Promise<number> {
  const rows = page.locator('table tbody tr');
  const generatedRows = rows.filter({ hasText: GENERATED_SERVICE });

  await page.goto(URLS.admin + 'services/overview');
  await expect(rows.first(), 'Services overview never rendered any rows').toBeVisible({ timeout: 30000 });

  await showAllRowsOnOnePage(page);

  let removed = 0;
  const remainingCount = await generatedRows.count();

  for (let remaining = remainingCount; remaining > 0; remaining -= 1) {
    await generatedRows.first().getByRole('button', { name: 'Delete', exact: true }).click();

    const confirmDialog = page.getByRole('dialog').filter({ hasText: /delete this service/i });
    await confirmDialog.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(generatedRows, 'Confirming the dialog did not remove the service').toHaveCount(remaining - 1, {
      timeout: 15000,
    });

    removed += 1;
  }

  return removed;
}

async function showAllRowsOnOnePage(page: Page): Promise<void> {
  const pageSize = page.locator('select').first();

  if (await pageSize.count()) {
    await pageSize.selectOption('50');
    await expect(pageSize).toHaveValue('50');
  }
}
