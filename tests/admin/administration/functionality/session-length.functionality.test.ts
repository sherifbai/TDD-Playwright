import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';
import { sessionLengthCleanup } from '@utils/helpers';
import { SessionLengthSettings } from '@utils/interfaces';
import { createSessionLengthMessage, nextResponseTime, nextSessionLength } from '@utils/test-data';

let settingsBeforeRun: SessionLengthSettings | undefined;

test.describe('[administration] [functional] Session length settings are saved for the stand', () => {
  test.afterEach(sessionLengthCleanup(() => settingsBeforeRun));

  test(
    'The saved settings are confirmed and read back after a reload',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/184/' } },
    async ({ page }) => {
      const slp = new AdminPageFactory(page).getSessionLengthPage();

      let updatedSettings: SessionLengthSettings;

      await slp.open();

      await test.step('The page opens holding the settings the stand runs on', async () => {
        await slp.assertPageIsShown();

        settingsBeforeRun = await slp.readSettings();

        updatedSettings = {
          sessionLength: nextSessionLength(settingsBeforeRun.sessionLength),
          responseTime: nextResponseTime(settingsBeforeRun.responseTime),
          displayMessage: true,
          idleWarningMessage: createSessionLengthMessage('autotest idle warning'),
          showEndMessage: true,
          endMessage: createSessionLengthMessage('autotest end message'),
        };
      });

      await test.step('Both times, both toggles and both messages are given new values', async () => {
        await slp.applySettings(updatedSettings);
      });

      await test.step('Saving reports the change went through', async () => {
        await slp.saveSettings();
        await slp.assertSaveWasConfirmed();
      });

      await test.step('The settings come back unchanged after a reload', async () => {
        await slp.open();

        await slp.assertSettingsStored(updatedSettings);
      });
    },
  );
});
