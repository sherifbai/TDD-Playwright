import { AdminPageFactory } from '@page-objects/admin-page-factory';

import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';

test.describe('[services] [functional] Service title validation', () => {
  test('[services] [functional] Service title is required before save succeeds', async ({ page }) => {
    const nsp = new AdminPageFactory(page).getNewServicePage();

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await nsp.saveService({ expectedToast: 'Title is mandatory' });
    await expect(page.locator('.toast__content')).toHaveText('Title is mandatory');
  });
});
