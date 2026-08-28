import { ChatAnalysisLabelSection } from '@utils/interfaces';

import { uniqueSuffix } from './shared-data';

export const CHAT_ANALYSIS_LABEL_SECTIONS: ChatAnalysisLabelSection[] = [
  {
    title: 'Add field',
    placeholder: 'Enter field name',
    hint: 'Enter one or more names (separated by commas) and press "Add".',
  },
  {
    title: 'Add response quality',
    placeholder: 'Enter quality level',
    hint: 'Enter one or more quality levels (separated by commas) and press "Add".',
  },
  {
    title: 'Add follow-up action status',
    placeholder: 'Enter follow-up action',
    hint: 'Enter one or more follow-up actions (separated by commas) and press "Add".',
  },
];

export const CHAT_ANALYSIS_LABEL_MAX_LENGTH = 50;

export function createChatAnalysisLabel(prefix = 'autotestlabel'): string {
  return `${prefix}${uniqueSuffix()}`;
}

export function createOverlongChatAnalysisLabel(prefix = 'autotestlong'): string {
  return createChatAnalysisLabel(prefix).padEnd(CHAT_ANALYSIS_LABEL_MAX_LENGTH + 1, 'x');
}
