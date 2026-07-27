import { getServicePages, registerServiceCleanup } from '@helpers/service-test-helpers';
import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';
import { createServiceName, createValidServiceData } from '@utils/test-data/service-data';

const serviceName = createServiceName('clientmessage');

test.describe('[services] [functional] New service test (TEST widget variable resolution)', () => {
  registerServiceCleanup(test, serviceName);

  test('[services] [functional] Create service + add nodes + configure via node edit + verify widget resolves variables', async ({
    page,
  }) => {
    const { nsp } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await nsp.setTitle(createValidServiceData({ title: serviceName }).title);

    await nsp.clickAddNodeAtEdgeIndex(0);
    await nsp.pickNodeTypeAndReturnToCanvas(nsp.buttonDefine);

    const assignNodeTitle = 'Assign - 1';
    await expect(nsp.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();
    await nsp.openNodeDialogByTitle(assignNodeTitle);
    await nsp.assignSetVariableAndSave('greeting', 'Hello');

    await nsp.clickAddNodeOnLastEdge();

    await nsp.pickNodeTypeAndReturnToCanvas(nsp.buttonMessageForCustomer);

    const msgNodeTitle = 'Send message to client - 1';
    await expect(nsp.getFlowNodeByTitle(msgNodeTitle)).toBeVisible();
    await nsp.openNodeDialogByTitle(msgNodeTitle);
    await nsp.messageSetTextAndSave('{greeting}, world!');

    await nsp.saveService();
    await expect(nsp.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();
    await expect(nsp.getFlowNodeByTitle(msgNodeTitle)).toBeVisible();

    await expect(nsp.widget).toBeVisible();
    await nsp.openWidget();

    await nsp.widgetSendText('test');
    await expect(nsp.widgetDialog.getByText('test', { exact: true })).toBeVisible();
    await nsp.expectWidgetToContainText('{greeting}, world!');
  });
});
