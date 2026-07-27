import { getServicePages, registerServiceCleanup } from '@helpers/service-test-helpers';
import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';
import { createServiceName } from '@utils/test-data/service-data';

const serviceName = createServiceName('negativeservice');

test.describe('[services] [functional] Service negative path test', () => {
  registerServiceCleanup(test, serviceName);

  test('[services] [functional] Service negative path test', async ({ page }) => {
    const { nsp, sop } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await test.step('Saving without required title shows validation error', async () => {
      await nsp.saveService({ expectedToast: 'Title is mandatory' });
      await expect(page.locator('.toast__content')).toHaveText('Title is mandatory');
      await expect(nsp.confirmServiceBtn).toBeDisabled();
    });

    await test.step('No service row is created in overview', async () => {
      await nsp.returnToServicesOverview();
      await expect(await sop.findServiceRow(serviceName, { pageSize: '50' })).toHaveCount(0);
    });
  });
});
