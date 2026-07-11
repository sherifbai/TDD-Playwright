import { NewServicePage } from '@page-objects/services';

import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';

// Visibility of the "Create endpoint" modal.
// Opened from the API registry page (services/api-registry) instead of the
// service flow canvas: this is a stable entry point to the same modal that does
// not require creating/saving a service, so it is unaffected by the known
// newService -> overview redirect flake. The test only verifies UI/state and
// cancels without persisting, so it leaves no data in the shared registry.
test('[services] [visibility] Create new OpenAPI endpoint (visibility)', async ({ page }) => {
  const nsp = new NewServicePage(page);

  await page.goto(URLS.admin + 'services/api-registry');
  await page.waitForLoadState('domcontentloaded');

  await test.step('Open endpoint creation modal from API registry', async () => {
    await nsp.openCreateEndpointFromRegistry();
    await nsp.assertCreateEndpointModalVisible();
  });

  await test.step('Assert modal base UI visible', async () => {
    await expect(nsp.createEndpointTitle).toBeVisible();
    await expect(nsp.createEndpointTabEndpoint).toBeVisible();

    await expect(nsp.createEndpointServiceTypeCombo).toBeVisible();
    await expect(nsp.createEndpointCancel).toBeVisible();
    await expect(nsp.createEndpointCreate).toBeVisible();

    await expect(nsp.createEndpointCreate).toBeDisabled();
  });

  await test.step('Select Open API and assert fields become visible', async () => {
    await nsp.selectServiceType('Open API');

    await expect(nsp.createEndpointName).toBeVisible();
    await expect(nsp.createEndpointUrl).toBeVisible();
    await expect(nsp.createEndpointFetchEndpoints).toBeVisible();

    // fields are editable (endpoint name is alphanumeric-only, maxlength=30)
    await expect(nsp.createEndpointName).toBeEditable();
    await expect(nsp.createEndpointUrl).toBeEditable();
  });

  await test.step('Cancel without persisting', async () => {
    await nsp.createEndpointCancel.click();
    await expect(nsp.createEndpointModal).toBeHidden();
  });
});