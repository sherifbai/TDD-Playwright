import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';
import { sessionLengthCleanup } from '@utils/helpers';
import { SessionLengthSettings } from '@utils/interfaces';
import { createSessionLengthMessage, nextResponseTime, nextSessionLength } from '@utils/test-data';

const outOfRangeMinutes = '481';

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

test.describe('[administration] [functional] Times outside their range are refused and nothing is stored', () => {
  test.afterEach(sessionLengthCleanup(() => settingsBeforeRun));

  test(
    'Every invalid time is named in a notification and the stand keeps the settings it ran on',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/185/' } },
    async ({ page }) => {
      const slp = new AdminPageFactory(page).getSessionLengthPage();

      let storedSettings: SessionLengthSettings;

      await slp.open();

      await test.step('The page opens holding the settings the stand runs on', async () => {
        await slp.assertPageIsShown();

        storedSettings = await slp.readSettings();
        settingsBeforeRun = storedSettings;
      });

      await test.step('An empty session length is refused as empty', async () => {
        await slp.fillSessionLength('');
        await slp.saveSettings();

        await slp.assertSaveWasRejected("Session length can't be empty");
      });

      await test.step('A session length outside 30-480 minutes is refused with its range', async () => {
        await slp.fillSessionLength(outOfRangeMinutes);
        await slp.saveSettings();

        await slp.assertSaveWasRejected('Session length must be between 30 and 480 minutes');
      });

      await test.step('An empty response time is refused as empty', async () => {
        await slp.fillSessionLength(storedSettings.sessionLength);
        await slp.fillResponseTime('');
        await slp.saveSettings();

        await slp.assertSaveWasRejected("Time for user to respond can't be empty");
      });

      await test.step('A response time outside 5-480 minutes is refused with its range', async () => {
        await slp.fillResponseTime(outOfRangeMinutes);
        await slp.saveSettings();

        await slp.assertSaveWasRejected('Conversation timeout duration must be between 5 and 480 minutes');
      });

      await test.step('The settings the page opened on survive the refused saves', async () => {
        await slp.open();

        await slp.assertSettingsStored(storedSettings);
      });
    },
  );
});
