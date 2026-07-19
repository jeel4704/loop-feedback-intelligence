import { prisma } from "@/lib/prisma";

export class ContextService {
  /**
   * Fetches rich workspace data including full-table SQL aggregations
   * to inject as structured JSON RAG context. This provides the LLM with 
   * EXACT mathematical facts, entirely preventing hallucination.
   */
  static async getWorkspaceContext(workspaceId: string, userQuery?: string): Promise<string> {
    try {
      console.log(`[Ask LOOP AI] Processing Context for Workspace: ${workspaceId}`);
      console.log(`[Ask LOOP AI] User Query: "${userQuery || 'None'}"`);

      // 1. Fetch exact total counts for accuracy
      const totalFeedback = await prisma.feedback.count({
        where: { workspaceId }
      });

      // 2. Fetch Sentiment Breakdown (Case-insensitive)
      const positiveCount = await prisma.feedback.count({
        where: { workspaceId, sentimentLabel: { contains: "positive", mode: "insensitive" } }
      });
      const negativeCount = await prisma.feedback.count({
        where: { workspaceId, sentimentLabel: { contains: "negative", mode: "insensitive" } }
      });
      const neutralCount = await prisma.feedback.count({
        where: { workspaceId, sentimentLabel: { contains: "neutral", mode: "insensitive" } }
      });

      // 3. Average Rating / Sentiment Score
      const avgSentimentResult = await prisma.feedback.aggregate({
        _avg: { sentiment: true },
        where: { workspaceId }
      });
      const averageSentimentScore = avgSentimentResult._avg.sentiment 
        ? parseFloat(avgSentimentResult._avg.sentiment.toFixed(2)) 
        : null;

      // 4. Fetch Top Active Themes / Status Counts
      const feedbackByStatus = await prisma.feedback.groupBy({
        by: ['status'],
        where: { workspaceId },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      });

      // 5. Workspace entities count
      const reportCount = await prisma.report.count({
        where: { workspaceId }
      });
      
      const userCount = await prisma.workspaceMembership.count({
        where: { workspaceId }
      });

      // 6. Unresolved / Open Feedback
      const unresolvedCount = await prisma.feedback.count({
        where: { 
          workspaceId, 
          status: { in: ['Open', 'New', 'Unresolved'], mode: 'insensitive' } 
        }
      });

      // 7. Dynamic Intent Search
      let recentFeedback: any[] = [];
      let searchKeyword = null;
      let searchCount = 0;
      
      const queryLower = (userQuery || "").toLowerCase();

      // Check for keyword search intents
      const searchMatch = queryLower.match(/(?:mention|mentioning|about|related to|keyword)\s+['"]?([a-zA-Z0-9_-]+)['"]?/i);
      
      if (searchMatch && searchMatch[1]) {
        searchKeyword = searchMatch[1];
        console.log(`[Ask LOOP AI] Detected Search Intent: Keyword = "${searchKeyword}"`);
        
        searchCount = await prisma.feedback.count({
          where: { 
            workspaceId, 
            content: { contains: searchKeyword, mode: "insensitive" } 
          }
        });

        recentFeedback = await prisma.feedback.findMany({
          where: { 
            workspaceId,
            content: { contains: searchKeyword, mode: "insensitive" }
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            title: true,
            content: true, // provide snippet for context
            sentimentLabel: true,
            status: true,
            createdAt: true
          }
        });
      } 
      // Fallback: If asking for generic "latest" without specific keywords
      else if (queryLower.includes("recent") || queryLower.includes("latest") || queryLower.includes("last")) {
        console.log(`[Ask LOOP AI] Detected Recency Intent.`);
        recentFeedback = await prisma.feedback.findMany({
          where: { workspaceId },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            title: true,
            sentimentLabel: true,
            status: true,
            createdAt: true
          }
        });
      }

      if (totalFeedback === 0) {
        console.log(`[Ask LOOP AI] 0 feedbacks found for workspace ${workspaceId}`);
        return JSON.stringify({ error: "No customer feedback data is available for this workspace yet." });
      }

      // Structure exact factual data as JSON
      const contextData: any = {
        workspaceData: {
          totalFeedbacks: totalFeedback,
          sentiment: {
            positive: positiveCount,
            negative: negativeCount,
            neutral: neutralCount,
            averageSentimentScore: averageSentimentScore
          },
          statusCounts: feedbackByStatus.map(status => ({
            name: status.status || 'Uncategorized',
            count: status._count.id
          })),
          topTheme: feedbackByStatus.length > 0 ? feedbackByStatus[0].status : null,
          unresolvedFeedbacks: unresolvedCount,
          reportsGenerated: reportCount,
          activeUsers: userCount
        }
      };

      if (searchKeyword) {
        contextData.searchResults = {
          keywordSearched: searchKeyword,
          totalMatchingRecords: searchCount,
          samples: recentFeedback
        };
      } else if (recentFeedback.length > 0) {
        contextData.latestFeedbacks = recentFeedback;
      }

      const jsonString = JSON.stringify(contextData, null, 2);
      
      console.log(`[Ask LOOP AI] Context Generated Successfully:`);
      console.log(jsonString);

      return jsonString;

    } catch (error) {
      console.error("[Ask LOOP AI] [ContextService] Failed to fetch workspace context:", error);
      return JSON.stringify({ error: "Could not retrieve workspace data." });
    }
  }
}
