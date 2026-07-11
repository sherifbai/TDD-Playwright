import { test, expect } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';

test('[smoke] Services overview page', async ({ page }) => {
  await page.goto(URLS.admin + 'services/overview');
  await expect(page.getByRole('heading', { name: 'Services', exact: true })).toBeVisible();
});

test('[smoke] New service page', async ({ page }) => {
  await page.goto(URLS.admin + 'services/newService');
  await expect(page.getByRole('button', { name: 'Settings', exact: true }).first()).toBeVisible();
  await expect(page.getByText('...')).toBeVisible();
});

test('[smoke] Faulty services page', async ({ page }) => {
  await page.goto(URLS.admin + 'services/faultyServices');
  await expect(page.getByRole('heading', { name: 'Faulty Services' })).toBeVisible();
});
