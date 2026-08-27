import { Page } from '@playwright/test';

import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { CHAT_ANALYSIS_LABEL_SECTIONS } from '@utils/test-data';

import { asUniqueNames } from './shared-helpers';

type Labels = string | string[];
type LabelsResolver = Labels | (() => Labels | Promise<Labels>);

export function chatAnalysisCleanup(resolveLabels: LabelsResolver) {
  return async ({ page }: { page: Page }): Promise<void> => {
    const labels = asUniqueNames(typeof resolveLabels === 'function' ? await resolveLabels() : resolveLabels);

    if (!labels.length) {
      return;
    }

    const cap = new AdminPageFactory(page).getChatAnalysisPage();

    await cap.open();
    await cap.enableAnalysis();

    let removedAny = false;

    for (const section of CHAT_ANALYSIS_LABEL_SECTIONS) {
      for (const label of labels) {
        if (await cap.hasLabel(section, label)) {
          await cap.deleteLabel(section, label);
          removedAny = true;
        }
      }
    }

    if (removedAny) {
      await cap.saveSettings();
      await cap.assertSaveWasConfirmed();
    }
  };
}
