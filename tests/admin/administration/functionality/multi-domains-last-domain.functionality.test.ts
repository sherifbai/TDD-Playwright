import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';
import { URLS } from '@utils/env';

test.describe('[administration] [functional] The domain left last cannot be removed', () => {
  test('Removing domains down to the last one disables its delete control', async ({ page }) => {
    const mdp = new AdminPageFactory(page).getMultiDomainsPage();

    await page.goto(URLS.admin + 'chat/multi-domains');
    await mdp.waitForReady();

    await test.step('The page opens with more than one domain listed', async () => {
      await mdp.assertRowsAreComplete();

      if ((await mdp.domainRowCount()) === 1) {
        await mdp.addDomainRow();
      }
    });

    await test.step('Removing rows leaves a single domain in the form', async () => {
      await mdp.removeDomainRowsUntilOneLeft();
    });

    await test.step('The remaining row offers no way to delete itself', async () => {
      await mdp.assertOnlyDomainCannotBeDeleted();
    });
  });
});
