import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';
import { BOTH_REMOVALS_ON } from '@utils/constants';
import { deleteConversationsCleanup } from '@utils/helpers';
import { DeleteConversationSettings } from '@utils/interfaces';
import { createLongerPeriod, createShiftedDeletionTime } from '@utils/test-data';

test.describe(
  '[administration] [functional] "Delete Conversations" saves the rules it is given',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/178/' } },
  () => {
    let settingsBeforeRun: DeleteConversationSettings | undefined;

    test.beforeEach(async ({ page }) => {
      const dcp = new AdminPageFactory(page).getDeleteConversationsPage();

      await dcp.open();
      settingsBeforeRun = await dcp.readFormSettings();
    });

    test.afterEach(deleteConversationsCleanup(() => settingsBeforeRun));

    test('A longer period and a shifted deletion time are confirmed and survive a reload', async ({ page }) => {
      const dcp = new AdminPageFactory(page).getDeleteConversationsPage();

      await test.step('The form is brought to both removals switched on', async () => {
        await dcp.applySettings({ ...settingsBeforeRun, ...BOTH_REMOVALS_ON });
        await dcp.assertPeriodFieldsOffered();
      });

      const wanted = await test.step('A longer period and a shifted deletion time are entered', async () => {
        const current = await dcp.readFormSettings();

        const next: DeleteConversationSettings = {
          ...BOTH_REMOVALS_ON,
          authenticatedPeriod: createLongerPeriod(current.authenticatedPeriod),
          anonymousPeriod: createLongerPeriod(current.anonymousPeriod),
          deletionTime: createShiftedDeletionTime(current.deletionTime),
        };

        await dcp.applySettings(next);

        return next;
      });

      await test.step('Saving reports the update went through', async () => {
        await dcp.save();
        await dcp.assertSaveWasConfirmed();
      });

      await test.step('The new periods and time come back after a reload', async () => {
        await dcp.open();
        await dcp.assertStoredSettings(wanted);
      });
    });

    test('A removal switched off is confirmed and stays off after a reload', async ({ page }) => {
      const dcp = new AdminPageFactory(page).getDeleteConversationsPage();

      const authenticatedRemoval = settingsBeforeRun?.authenticatedRemoval ?? true;

      await test.step('Anonymous removal is switched off', async () => {
        await dcp.setAnonymousRemoval(false);
        await dcp.assertAnonymousPeriodHidden();
      });

      await test.step('Saving reports the update went through', async () => {
        await dcp.save();
        await dcp.assertSaveWasConfirmed();
      });

      await test.step('The removal is still off after a reload and asks for no period', async () => {
        await dcp.open();

        await dcp.assertStoredSettings({ authenticatedRemoval, anonymousRemoval: false });
        await dcp.assertAnonymousPeriodHidden();
      });
    });
  },
);
