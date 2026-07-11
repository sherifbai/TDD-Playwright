import { NewServicePage } from '@page-objects/services';

import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';

test('[services] [visibility] Multichoice node elements visibility', async ({ page }) => {
  await page.goto(URLS.admin + 'services/newService');
  await page.waitForLoadState('domcontentloaded');

  const nsp = new NewServicePage(page);
  const nodeTitle = 'Multi-choice question - 1';

  await test.step('Add multichoice node from picker (picker closes, canvas visible)', async () => {
    await nsp.clickAddNodeAtEdgeIndex(0);

    // picker is open (dropdown)
    await nsp.assertNodePickerVisible();

    // pick the node type and return to canvas (new behavior)
    await nsp.pickNodeTypeAndReturnToCanvas(nsp.pickerMultichoiceBtn);

    // node should now exist on canvas
    await expect(nsp.getFlowNodeByTitle(nodeTitle)).toBeVisible();
  });

  await test.step('Open multichoice node dialog via edit button', async () => {
    await nsp.openNodeDialogByTitle(nodeTitle);

    // node editor popup (NOT the picker)
    await nsp.assertNodeEditorVisible();
  });

  await test.step('Multichoice dialog base elements visible', async () => {
    // common popup UI
    await nsp.assertTabsVisible();
    await nsp.assertNodeEditorButtonsVisible();

    // multichoice-specific UI (scoped to the opened popup)
    const popup = nsp.nodeEditorPopup;

    // Question is entered via the rich-text (message) editor now, not a plain textarea
    await expect(nsp.quillEditor).toBeVisible();

    // default options
    await expect(popup.getByRole('button', { name: 'Jah', exact: true })).toBeVisible();
    await expect(popup.getByRole('button', { name: 'Ei', exact: true })).toBeVisible();

    // add option button
    await expect(popup.getByRole('button', { name: 'Add button +', exact: true })).toBeVisible();

    // optional: verify the title is the right dialog
    await expect(nsp.nodeEditorTitle).toContainText('Multi-choice question');
  });
});
