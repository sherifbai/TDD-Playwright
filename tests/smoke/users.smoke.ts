import { openAdminPage } from '@helpers/smoke-helpers';
import { expect, test } from '@setup/test-setup';

test('[smoke] Users page loads the user list from the backend', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/users');

  await expect(page.getByRole('button', { name: 'Add user' })).toBeVisible();
  await expect(page.getByRole('table').first().locator('tbody tr').first()).toBeVisible();

  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});
