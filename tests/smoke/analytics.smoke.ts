import { test, expect } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';

test('[smoke] Analytics overview Page', async ({ page }) => {
  await page.goto(URLS.admin + 'analytics/overview');
  await expect(page.getByText('Total number of chats')).toBeVisible();
});

test('[smoke] Chats analytics page', async ({ page }) => {
  await page.goto(URLS.admin + 'analytics/chats');
  await expect(page.getByRole('heading', { name: 'Chats', exact: true })).toBeVisible();
});

test('[smoke] Feedback analytics page', async ({ page }) => {
  await page.goto(URLS.admin + 'analytics/feedback');
  await expect(page.getByRole('heading', { name: 'Feedback' })).toBeVisible();
});
