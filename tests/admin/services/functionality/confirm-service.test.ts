import { getServicePages, registerServiceCleanup } from '@helpers/service-test-helpers';
import { test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';
import { createServiceName, createValidServiceData } from '@utils/test-data/service-data';

const serviceName = createServiceName('confirmservice');

test.describe('[services] [functional] Confirm service test', () => {
  registerServiceCleanup(test, serviceName);

  test('[services] [functional] Confirm service test', async ({ page }) => {
    const { nsp, sop } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.createNewService(createValidServiceData({ title: serviceName }));

    await sop.clickEdit(serviceName);
    await nsp.confirmService();
    await nsp.returnToServicesOverview();
    await sop.assertServiceRowVisible(serviceName);
    await sop.assertStatusReady(serviceName);
  });
});
