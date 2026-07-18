import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let workspaceId = (session.user as any).workspaceId;
    const membership = await prisma.workspaceMembership.findFirst({
      where: { userId: session.user.id }
    });
    if (membership) {
      workspaceId = membership.workspaceId;
    }

    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace isolated for session" }, { status: 400 });
    }

    const userName = session.user.name || "Arjun Sharma";

    // 1. Get sentiment counts in a single group-by query
    const sentimentGroups = await prisma.feedback.groupBy({
      by: ["sentimentLabel"],
      where: { workspaceId },
      _count: { _all: true }
    });

    const sentiment = {
      positive: 0,
      negative: 0,
      neutral: 0
    };

    sentimentGroups.forEach((g) => {
      const label = g.sentimentLabel?.toLowerCase();
      if (label === "positive") {
        sentiment.positive = g._count._all;
      } else if (label === "negative") {
        sentiment.negative = g._count._all;
      } else {
        sentiment.neutral += g._count._all;
      }
    });

    // 2. Volume trend (Removed - Now handled by /api/analytics/trends dynamically)

    // 3. Top themes using database aggregation and parallel name lookup
    const topThemeGroups = await prisma.feedbackTheme.groupBy({
      by: ["themeId"],
      where: { feedback: { workspaceId } },
      _count: { _all: true },
      orderBy: {
        _count: {
          themeId: "desc"
        }
      },
      take: 5
    });

    const topThemes = await Promise.all(
      topThemeGroups.map(async (tg) => {
        const theme = await prisma.theme.findUnique({
          where: { id: tg.themeId },
          select: { name: true }
        });
        return {
          name: theme?.name || "Unknown Theme",
          count: tg._count._all
        };
      })
    );

    // 4. Mapped channel data (dynamically aggregate counts of all unique channels)
    const channelGroups = await prisma.feedback.groupBy({
      by: ["source"],
      where: { workspaceId },
      _count: { _all: true }
    });

    const channelData = channelGroups.map((g) => ({
      name: g.source || "Unknown",
      value: g._count._all
    }));

    // 5. Recent feedback items (4 items)
    const recentFeedbacks = await prisma.feedback.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        content: true,
        source: true,
        sentimentLabel: true,
        createdAt: true
      }
    });

    const latestChannel = recentFeedbacks[0]?.source || "Email";

    // 6. Recent activities (fetch from database ActivityLog, fall back to default mock list if empty)
    // Fetch up to 20 logs so we can group duplicate reports and preserve other unique activities.
    const logs = await prisma.activityLog.findMany({
      where: { 
        workspaceId,
        NOT: {
          label: { startsWith: "DUPLICATE_AUDIT:" }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    const nonDuplicateActivities = [];
    let duplicateCount = 0;
    let latestDuplicateTime = "Just now";

    for (const log of logs) {
      if (log.label.startsWith("Duplicate feedback removed from")) {
        duplicateCount++;
        if (duplicateCount === 1) {
          latestDuplicateTime = log.timeLabel;
        }
      } else {
        nonDuplicateActivities.push({
          id: log.id,
          label: log.label,
          time: log.timeLabel
        });
      }
    }

    const recentActivity = [];
    if (duplicateCount > 0) {
      recentActivity.push({
        id: "aggregated-duplicates",
        label: `Automatically merged & skipped ${duplicateCount} duplicate feedback submissions across ingestion channels`,
        time: latestDuplicateTime
      });
    }
    recentActivity.push(...nonDuplicateActivities);

    const finalRecentActivity = recentActivity.slice(0, 5);

    // 6b. Generate dynamic AI Summary sentence with true duplicates count
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const dupWeekCount = await prisma.activityLog.count({
      where: {
        workspaceId,
        label: { startsWith: "Duplicate feedback" },
        createdAt: { gte: startOfWeek }
      }
    });

    // Dynamic top theme
    const topThemeName = topThemes.length > 0 ? topThemes[0].name : "General Queries";
    const secondThemeName = topThemes.length > 1 ? topThemes[1].name : "Usability";
    
    // Dynamic sentiment trend
    let sentimentTrend = "stable";
    if (sentiment.positive > sentiment.negative) sentimentTrend = "improving";
    else if (sentiment.negative > sentiment.positive) sentimentTrend = "trending negatively";

    let aiSummary = `Customer sentiment is ${sentimentTrend} this week. `;
    if (dupWeekCount > 0) {
      aiSummary += `${dupWeekCount} duplicate feedback entries were automatically merged. `;
    }
    aiSummary += `The most discussed themes are ${topThemeName} and ${secondThemeName}.`;

    // 7. Latest feedback list (5 items with theme relations)
    const latestFeedback = await prisma.feedback.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        themes: {
          include: {
            theme: true
          }
        }
      }
    });

    return NextResponse.json({
      sentiment,
      topThemes,
      channelData,
      recentFeedbacks,
      recentActivity: finalRecentActivity,
      latestFeedback,
      aiSummary
    }, { status: 200 });
  } catch (error) {
    console.error("Dashboard charts API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
