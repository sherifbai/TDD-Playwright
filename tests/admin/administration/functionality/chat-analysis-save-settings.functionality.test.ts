import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';
import { chatAnalysisCleanup } from '@utils/helpers';
import { CHAT_ANALYSIS_LABEL_SECTIONS, createChatAnalysisLabel } from '@utils/test-data';

const [fieldSection] = CHAT_ANALYSIS_LABEL_SECTIONS;
const savedLabel = createChatAnalysisLabel('autotestsavedfield');

test.describe('[administration] [functional] Chat analysis settings are saved for the selected domain', () => {
  test.afterEach(chatAnalysisCleanup(() => savedLabel));

  test(
    'A saved label is confirmed and read back after a reload',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/190/' } },
    async ({ page }) => {
      const cap = new AdminPageFactory(page).getChatAnalysisPage();

      await cap.open();

      await test.step('The page opens on a domain of its own', async () => {
        await cap.assertPageIsShown();
        await cap.selectFirstDomainTab();
      });

      await test.step(`Chat analysis is on and "${fieldSection.title}" takes a label of the run's own`, async () => {
        await cap.enableAnalysis();
        await cap.addLabel(fieldSection, savedLabel);
        await cap.assertLabelIsShownAsChip(fieldSection, savedLabel);
      });

      await test.step('Saving reports the settings went through', async () => {
        await cap.saveSettings();
        await cap.assertSaveWasConfirmed();
      });

      await test.step('The label is still listed after a reload', async () => {
        await cap.open();

        await cap.assertLabelIsShownAsChip(fieldSection, savedLabel);
      });
    },
  );
});
