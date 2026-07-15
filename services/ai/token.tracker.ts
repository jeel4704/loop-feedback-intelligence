import { prisma } from "@/lib/prisma";

export interface TokenUsageData {
  workspaceId: string;
  userId: string;
  conversationId?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
}

export class TokenTracker {
  /**
   * Logs token usage into the AIUsage table for billing and rate limiting.
   */
  static async logUsage(data: TokenUsageData) {
    try {
      await prisma.aIUsage.create({
        data: {
          workspaceId: data.workspaceId,
          userId: data.userId,
          conversationId: data.conversationId,
          promptTokens: data.promptTokens,
          completionTokens: data.completionTokens,
          totalTokens: data.totalTokens,
          model: data.model,
        }
      });
    } catch (error) {
      console.error("[TokenTracker] Failed to log AI usage:", error);
      // We don't throw here to avoid failing the user's request just because logging failed
    }
  }
}
