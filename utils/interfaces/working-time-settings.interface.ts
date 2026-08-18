export interface WorkingTimeSettings {
  readonly organizationWorkingAllTime: string;
  readonly organizationUseCSA: string;
  readonly organizationNoCsaAvailableMessage: string;
  readonly organizationBotCannotAnswerMessage: string;
  readonly [setting: string]: string;
}
