import { ConversationAnalysis } from '@utils/interfaces/conversation-analysis.interface';

export interface AnalysedConversation {
  readonly conversationId: string;
  readonly analysis: ConversationAnalysis;
}
