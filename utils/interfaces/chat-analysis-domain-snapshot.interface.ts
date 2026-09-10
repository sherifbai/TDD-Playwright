import { ChatAnalysisConfig } from '@utils/interfaces/chat-analysis-config.interface';

export interface ChatAnalysisDomainSnapshot {
  readonly domainId: string;
  readonly config: ChatAnalysisConfig;
}
