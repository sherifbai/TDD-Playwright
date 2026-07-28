import { getServicePages, registerServiceCleanup } from '@helpers/service-test-helpers';
import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';
import { createServiceName } from '@utils/test-data/service-data';

const serviceName = createServiceName('confirmdisabled');

test.describe('[services] [functional] Confirm is gated on the service being saved', () => {
  registerServiceCleanup(test, serviceName);

  test('[services] [functional] Confirm stays disabled on an unsaved draft and becomes enabled once the service saves', async ({
    page,
  }) => {
    const { nsp } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await test.step('Confirm is disabled on a draft that has never been saved', async () => {
      await expect(nsp.confirmServiceBtn).toBeDisabled();
    });

    await test.step('A rejected save leaves Confirm disabled', async () => {
      await nsp.saveService({ expectedToast: 'Title is mandatory' });
      await expect(nsp.confirmServiceBtn).toBeDisabled();
    });

    await test.step('Once the title is supplied and the service saves, Confirm becomes enabled', async () => {
      await nsp.setTitle(serviceName);
      await nsp.saveService();

      await expect(nsp.confirmServiceBtn).toBeEnabled();
    });
  });
});
