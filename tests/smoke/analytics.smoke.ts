import { openAdminPage } from '@helpers/smoke-helpers';
import { expect, test } from '@setup/test-setup';

test('[smoke] Analytics overview page loads its chat metrics', async ({ page }) => {
  const visit = await openAdminPage(page, 'analytics/overview');

  await expect(page.getByText('Total number of chats')).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[smoke] Chats analytics page loads', async ({ page }) => {
  const visit = await openAdminPage(page, 'analytics/chats');

  await expect(page.getByRole('heading', { name: 'Chats', exact: true })).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[smoke] Feedback analytics page loads', async ({ page }) => {
  const visit = await openAdminPage(page, 'analytics/feedback');

  await expect(page.getByRole('heading', { name: 'Feedback' })).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});
