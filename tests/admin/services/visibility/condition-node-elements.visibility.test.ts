import { getServicePages, registerServiceCleanup } from '@helpers/service-test-helpers';
import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';
import { createServiceName, createValidServiceData } from '@utils/test-data/service-data';

const serviceName = createServiceName('condition');

const successMessage = `success branch ${serviceName}`;
const failureMessage = `failure branch ${serviceName}`;
const neverAuthored = `neverauthored ${serviceName}`;

const ruleLiteral = `lit${serviceName}`;

const conditionNodeTitle = 'Condition - 1';
const successNodeTitle = 'Send message to client - 1';
const failureNodeTitle = 'Send message to client - 2';

test.describe('[services] [functional] Condition node routes the conversation down the branch its rule selects', () => {
  registerServiceCleanup(test, serviceName);

  test('[services] [functional] An always-true rule delivers the Success branch and not the Failure branch', async ({
    page,
  }) => {
    const { nsp } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await test.step('Create a service with a title', async () => {
      await nsp.setTitle(createValidServiceData({ title: serviceName }).title);
    });

    await test.step('Add a "Condition" node to the flow', async () => {
      await nsp.clickAddNodeAtEdgeIndex(0);
      await nsp.pickNodeTypeAndReturnToCanvas(nsp.buttonCondition);
      await expect(nsp.getFlowNodeByTitle(conditionNodeTitle)).toBeVisible();
    });

    await test.step('Author an always-true rule and save the condition node', async () => {
      await nsp.openNodeDialogByTitle(conditionNodeTitle);
      await nsp.conditionAddLiteralRule(ruleLiteral, '==', ruleLiteral);
      await nsp.conditionSaveNode();
    });

    await test.step('Wire a distinct message onto each branch', async () => {
      await nsp.addMessageOnConditionBranch('Success', successNodeTitle, successMessage);
      await nsp.addMessageOnConditionBranch('Failure', failureNodeTitle, failureMessage);
    });

    await test.step('Save the service and confirm both branch nodes persisted', async () => {
      await nsp.saveService();
      await expect(nsp.getFlowNodeByTitle(successNodeTitle)).toBeVisible();
      await expect(nsp.getFlowNodeByTitle(failureNodeTitle)).toBeVisible();
    });

    await test.step('Open the TEST widget and start a conversation', async () => {
      await expect(nsp.widget).toBeVisible();
      await nsp.openWidget();
      await nsp.widgetSendText('test');
      await expect(nsp.widgetDialog.getByText('test', { exact: true })).toBeVisible();
    });

    await test.step('The Success branch is delivered and the Failure branch is not', async () => {
      await nsp.expectWidgetToContainText(successMessage);
      await nsp.expectWidgetNotToContainText(failureMessage);
      await nsp.expectWidgetNotToContainText(neverAuthored);
    });
  });
});
