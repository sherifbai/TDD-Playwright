import { WorkingTimeSettings } from '@utils/interfaces';

export const OPEN_TO_CHAT: Partial<WorkingTimeSettings> = {
  organizationWorkingAllTime: 'true',
  organizationUseCSA: 'true',
};

// Both switches go off together, and it is Use customer service that decides the answer:
// with it off the bot shows the "bot cannot answer" notice whatever the hours say. What a
// closed office does on its own, with customer service still on, no test here measures.
export const CLOSED_TO_CHAT: Partial<WorkingTimeSettings> = {
  organizationWorkingAllTime: 'false',
  organizationUseCSA: 'false',
};

export const CHAT_FLAGS = ['organizationWorkingAllTime', 'organizationUseCSA'] as const;
