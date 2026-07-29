import { openAdminPage } from '@helpers/smoke-helpers';
import { expect, test } from '@setup/test-setup';

test('[smoke] Unanswered chats page loads its chat tabs', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/unanswered');

  await expect(page.getByRole('tablist')).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[smoke] Active chats page loads its chat tabs', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/active');

  await expect(page.getByRole('tablist')).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[smoke] Pending chats page loads its chat tabs', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/pending');

  await expect(page.getByRole('tablist')).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[smoke] Chat history page loads a result count from the backend', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/history');
  await expect(page.getByText(/Result count:?\s*\d+/i)).toBeVisible();

  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});
