import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';
import { AnonymizerSettings } from '@utils/interfaces';
import { createAnonymizerWord, nextAnonymizerApproach, toggledAnonymizerEntities } from '@utils/test-data';

test.describe('[administration] [functional] Anonymizer settings are saved for the selected domain', () => {
  test(
    'Approach, entities, both word lists and both toggles come back from a reload as they were saved',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/172/' } },
    async ({ page }) => {
      const ap = new AdminPageFactory(page).getAnonymizerPage();

      await ap.open();

      await test.step('The settings are opened on the first domain offered', async () => {
        await ap.selectFirstDomain();
      });

      await ap.withSettingsRestored(async (settingsBefore) => {
        const settings: AnonymizerSettings = {
          approach: nextAnonymizerApproach(settingsBefore.approach),
          entities: toggledAnonymizerEntities(settingsBefore.entities),
          allowlist: [createAnonymizerWord('allow')],
          denylist: [createAnonymizerWord('deny')],
          anonymizationBeforeLlm: !settingsBefore.anonymizationBeforeLlm,
          recordAnonymously: !settingsBefore.recordAnonymously,
        };

        await test.step('Saving the changed settings is confirmed on the page', async () => {
          await ap.applySettings(settings);
          await ap.saveSettings();
          await ap.assertSaveWasConfirmed();
        });

        await test.step('The page reopens holding the settings that were saved', async () => {
          await ap.open();
          await ap.assertSettingsStored(settings);
        });
      });
    },
  );
});
