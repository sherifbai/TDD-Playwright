export interface ChatAnalysisSettings {
  readonly enabled: boolean;
  readonly labels: Record<string, string[]>;
}

export interface ChatAnalysisConfig {
  readonly chatAnalysisEnabled: boolean;
  readonly chatAnalysisTheme: string;
  readonly chatAnalysisBykResponseQuality: string;
  readonly chatAnalysisFollowUpAction: string;
}

export interface ChatAnalysisDomainSnapshot {
  readonly domainId: string;
  readonly config: ChatAnalysisConfig;
}
