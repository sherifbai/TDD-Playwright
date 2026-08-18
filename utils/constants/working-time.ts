import { WorkingTimeSettings } from '@utils/interfaces';

export const OPEN_TO_CHAT: Partial<WorkingTimeSettings> = {
  organizationWorkingAllTime: 'true',
  organizationUseCSA: 'true',
};

export const CLOSED_TO_CHAT: Partial<WorkingTimeSettings> = {
  organizationWorkingAllTime: 'false',
  organizationUseCSA: 'false',
};

export const CHAT_FLAGS = ['organizationWorkingAllTime', 'organizationUseCSA'] as const;
