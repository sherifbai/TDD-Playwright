import { getServicePages, registerServiceCleanup } from '@helpers/service-test-helpers';
import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';
import { createServiceName } from '@utils/test-data/service-data';

const serviceName = createServiceName('negativeservice');

test.describe('[services] [functional] A service without a title is rejected', () => {
  registerServiceCleanup(test, serviceName);

  test('[services] [functional] A titleless save creates no service, and the same draft saves once the title is supplied', async ({
    page,
  }) => {
    const { nsp, sop } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    // A saved service gets an id and the editor moves to /services/edit/<id>, so the
    // url is the product's own evidence of whether a record was created.
    await test.step('Saving a titleless draft is refused and creates no service', async () => {
      await nsp.saveService({ expectedToast: 'Title is mandatory' });

      await expect(page.locator('.toast__content')).toHaveText('Title is mandatory');
      await expect(page).toHaveURL(/services\/newService/i);
      await expect(nsp.confirmServiceBtn).toBeDisabled();
    });

    // Positive control: the same draft saves as soon as the title rule is satisfied, so
    // the refusal above is the validation rule at work and not a broken editor.
    await test.step('Supplying a title lets the same draft save and create the service', async () => {
      await nsp.setTitle(serviceName);
      await nsp.saveService();

      await expect(page).toHaveURL(/services\/edit\//i);
    });

    await test.step('Only the titled service reaches the overview', async () => {
      await nsp.returnToServicesOverview();
      await sop.assertServiceRowVisible(serviceName);
    });
  });
});
