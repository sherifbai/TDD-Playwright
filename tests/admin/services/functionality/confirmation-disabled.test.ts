import { getServicePages, registerServiceCleanup } from '@helpers/service-test-helpers';
import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';
import { createServiceName } from '@utils/test-data/service-data';

const serviceName = createServiceName('confirmdisabled');

test.describe('[services] [functional] Confirm service disabled test', () => {
  registerServiceCleanup(test, serviceName);

  test('[services] [functional] Confirm service disabled test', async ({ page }) => {
    const { nsp, sop } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await expect(nsp.buttonConfirm).toBeDisabled();
    await nsp.saveService({ expectedToast: 'Title is mandatory' });

    await expect(page.locator('.toast__content')).toHaveText('Title is mandatory');

    await nsp.createNewService(serviceName);
    await sop.assertServiceRowVisible(serviceName);
  });
});
