import { getServicePages, registerServiceCleanup } from '@helpers/service-test-helpers';
import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';
import { createServiceName, createValidServiceData } from '@utils/test-data/service-data';

const serviceName = createServiceName('dynchoice');

const authoredValues: Record<string, string> = {
  'List': `list ${serviceName}`,
  'Service Name': `svc ${serviceName}`,
  'Key': `key ${serviceName}`,
  'Payload Keys': `payload ${serviceName}`,
};

const neverAuthored = `neverauthored ${serviceName}`;

const dynamicChoicesNodeTitle = 'Dynamic Choices - 1';

test.describe('[services] [functional] Dynamic Choices node persists the configuration it was given', () => {
  registerServiceCleanup(test, serviceName);

  test('[services] [functional] Authored key/value mappings survive save and reload', async ({ page }) => {
    const { nsp } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await test.step('Create a service with a title', async () => {
      await nsp.setTitle(createValidServiceData({ title: serviceName }).title);
    });

    await test.step('Add a "Dynamic Choices" node to the flow', async () => {
      await nsp.clickAddNodeAtEdgeIndex(0);
      await nsp.pickNodeTypeAndReturnToCanvas(nsp.buttonDynamicChoice);
      await expect(nsp.getFlowNodeByTitle(dynamicChoicesNodeTitle)).toBeVisible();
    });

    await test.step('Author a value for every key and save the service', async () => {
      await nsp.openNodeDialogByTitle(dynamicChoicesNodeTitle);
      await nsp.dynamicChoicesSetValuesAndSave(authoredValues);

      await nsp.saveService();
      await expect(nsp.getFlowNodeByTitle(dynamicChoicesNodeTitle)).toBeVisible();
    });

    await test.step('Reload the page so nothing is served from in-memory state', async () => {
      await page.reload();
      await nsp.waitForReady();
      await expect(nsp.getFlowNodeByTitle(dynamicChoicesNodeTitle)).toBeVisible();
    });

    await test.step('Every mapping comes back exactly as authored, and nothing spurious does', async () => {
      await nsp.openNodeDialogByTitle(dynamicChoicesNodeTitle);

      await nsp.assertDynamicChoicesValues(authoredValues);
      await expect(nsp.nodeEditorPopup).not.toContainText(neverAuthored);

      await nsp.closeNodeDialogWithoutSaving();
    });
  });
});
