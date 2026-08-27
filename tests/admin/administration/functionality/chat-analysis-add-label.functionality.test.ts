import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';
import { CHAT_ANALYSIS_LABEL_SECTIONS, createChatAnalysisLabel } from '@utils/test-data';

const [fieldSection] = CHAT_ANALYSIS_LABEL_SECTIONS;

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
