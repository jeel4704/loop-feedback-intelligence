import { prisma } from "@/lib/prisma";

export class ContextService {
  /**
   * Fetches rich workspace data including aggregations and recent feedback 
   * to inject as RAG context. This provides the LLM with factual analytics
   * and customer data to answer statistics accurately without hallucinating.
   */
  static async getWorkspaceContext(workspaceId: string): Promise<string> {
    try {
      // 1. Fetch exact total counts for accuracy
      const totalFeedback = await prisma.feedback.count({
        where: { workspaceId }
      });

      // 2. Fetch Sentiment Breakdown
      const positiveCount = await prisma.feedback.count({
        where: { workspaceId, sentimentLabel: "positive" }
      });
      const negativeCount = await prisma.feedback.count({
        where: { workspaceId, sentimentLabel: "negative" }
      });
      const neutralCount = await prisma.feedback.count({
        where: { workspaceId, sentimentLabel: "neutral" }
      });

      // 3. Fetch Top Active Themes (Group by status to simulate themes for this schema)
      const feedbackByStatus = await prisma.feedback.groupBy({
        by: ['status'],
        where: { workspaceId },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      });

      // 4. Fetch the most recent feedback content
      const recentFeedback = await prisma.feedback.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: 30, // Limit take to prevent token limit overload, but use aggregate for totals
        select: {
          title: true,
          content: true,
          sentimentLabel: true,
          status: true,
          source: true,
          createdAt: true
        }
      });

      if (totalFeedback === 0) {
        return "No customer feedback data is available for this workspace yet.";
      }

      // Serialize into a compact, readable markdown format for the LLM
      let contextString = `### WORKSPACE AGGREGATED STATISTICS\n`;
      contextString += `- Total Feedback Items: ${totalFeedback}\n`;
      contextString += `- Positive Feedback: ${positiveCount}\n`;
      contextString += `- Negative Feedback: ${negativeCount}\n`;
      contextString += `- Neutral Feedback: ${neutralCount}\n\n`;

      contextString += `### ACTIVE THEMES / STATUS COUNTS\n`;
      feedbackByStatus.forEach(status => {
        contextString += `- ${status.status || 'Uncategorized'}: ${status._count.id} items\n`;
      });
      contextString += `\n`;

      contextString += `### RECENT FEEDBACK SAMPLES (LAST 30 ITEMS)\n`;
      recentFeedback.forEach((fb, index) => {
        contextString += `--- Item ${index + 1} ---\n`;
        contextString += `Title: ${fb.title}\n`;
        contextString += `Date: ${fb.createdAt.toLocaleDateString()}\n`;
        contextString += `Sentiment: ${fb.sentimentLabel || "Neutral"}\n`;
        contextString += `Status/Theme: ${fb.status || "None"}\n`;
        contextString += `Source: ${fb.source}\n`;
        contextString += `Content: "${fb.content}"\n\n`;
      });

      return contextString;
    } catch (error) {
      console.error("[ContextService] Failed to fetch workspace context:", error);
      return "Error: Could not retrieve workspace data.";
    }
  }
}
