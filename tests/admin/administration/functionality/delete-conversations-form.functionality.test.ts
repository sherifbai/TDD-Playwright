import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';

test.describe(
  '[administration] [functional] "Delete Conversations" follows its removal toggles',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/156/' } },
  () => {
    test('A removal switched off takes its own fields off the page', async ({ page }) => {
      const dcp = new AdminPageFactory(page).getDeleteConversationsPage();

      await dcp.open();

      await test.step('Both removals start switched on', async () => {
        await dcp.setAuthenticatedRemoval(true);
        await dcp.setAnonymousRemoval(true);
        await dcp.assertPeriodFieldsOffered();
      });

      await test.step('Switching authenticated removal off takes its period away and leaves the rest', async () => {
        await dcp.setAuthenticatedRemoval(false);

        await dcp.assertAuthenticatedPeriodHidden();
        await dcp.assertDeletionTimeOffered();
        await dcp.assertExpiringRangeOffered();
      });

      await test.step('Switching anonymous removal off as well takes the whole expiring block away', async () => {
        await dcp.setAnonymousRemoval(false);

        await dcp.assertAnonymousPeriodHidden();
        await dcp.assertExpiringBlockHidden();
        await dcp.assertSaveOffered();
      });

      await test.step('Switching both back on brings the fields back', async () => {
        await dcp.setAuthenticatedRemoval(true);
        await dcp.setAnonymousRemoval(true);

        await dcp.assertPeriodFieldsOffered();
        await dcp.assertDeletionTimeOffered();
        await dcp.assertExpiringRangeOffered();
      });
    });
  },
);
