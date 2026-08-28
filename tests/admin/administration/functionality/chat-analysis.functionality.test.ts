import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';
import { chatAnalysisCleanup } from '@utils/helpers';
import {
  CHAT_ANALYSIS_LABEL_SECTIONS,
  createChatAnalysisLabel,
  createOverlongChatAnalysisLabel,
} from '@utils/test-data';

const [fieldSection, qualitySection] = CHAT_ANALYSIS_LABEL_SECTIONS;
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

test.describe('[administration] [functional] A value entered in a label section is listed as a chip', () => {
  test(
    'Every section takes a value, by the add control and by the Enter key',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/192/' } },
    async ({ page }) => {
      const cap = new AdminPageFactory(page).getChatAnalysisPage();

      await cap.open();

      await test.step('The page opens with chat analysis turned on', async () => {
        await cap.assertPageIsShown();
        await cap.enableAnalysis();
      });

      for (const section of CHAT_ANALYSIS_LABEL_SECTIONS) {
        await test.step(`"${section.title}" lists the value its add control was given`, async () => {
          const label = createChatAnalysisLabel('autotestadded');

          await cap.addLabel(section, label);
          await cap.assertLabelIsShownAsChip(section, label);
        });
      }

      await test.step(`"${fieldSection.title}" lists a value entered with the Enter key just as well`, async () => {
        const label = createChatAnalysisLabel('autotestentered');

        await cap.addLabelWithEnter(fieldSection, label);
        await cap.assertLabelIsShownAsChip(fieldSection, label);
      });
    },
  );
});

test.describe('[administration] [functional] A label over the length limit is refused', () => {
  test(
    'A value longer than 50 characters is reported and left out of the section',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/193/' } },
    async ({ page }) => {
      const cap = new AdminPageFactory(page).getChatAnalysisPage();

      await cap.open();

      await test.step('The page opens with chat analysis turned on', async () => {
        await cap.assertPageIsShown();
        await cap.enableAnalysis();
      });

      await test.step(`"${fieldSection.title}" refuses the value its add control was given`, async () => {
        const label = createOverlongChatAnalysisLabel();

        await cap.addLabel(fieldSection, label);

        await cap.assertLabelTooLongWasReported();
        await cap.assertLabelIsNotListed(fieldSection, label);
      });

      await test.step(`"${qualitySection.title}" refuses it through the Enter key just as well`, async () => {
        const label = createOverlongChatAnalysisLabel();

        await cap.addLabelWithEnter(qualitySection, label);

        await cap.assertLabelTooLongWasReported();
        await cap.assertLabelIsNotListed(qualitySection, label);
      });
    },
  );
});
