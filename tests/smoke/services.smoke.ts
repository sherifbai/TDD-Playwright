import { openAdminPage } from '@helpers/smoke-helpers';
import { expect, test } from '@setup/test-setup';

test('[smoke] Services overview page loads the services table', async ({ page }) => {
  const visit = await openAdminPage(page, 'services/overview');

  await expect(page.getByRole('heading', { name: 'Services', exact: true })).toBeVisible();
  await expect(page.getByRole('table').first().locator('tbody tr').first()).toBeVisible();

  visit.assertBackendAnswered();
});

test('[smoke] New service page loads the flow editor', async ({ page }) => {
  const visit = await openAdminPage(page, 'services/newService');

  await expect(page.getByRole('button', { name: 'Settings', exact: true }).first()).toBeVisible();
  await expect(page.locator('.react-flow__node').first()).toBeVisible();

  visit.assertBackendAnswered();
});

test('[smoke] Faulty services page loads', async ({ page }) => {
  const visit = await openAdminPage(page, 'services/faultyServices');

  await expect(page.getByRole('heading', { name: 'Faulty Services' })).toBeVisible();
  visit.assertBackendAnswered();
});
