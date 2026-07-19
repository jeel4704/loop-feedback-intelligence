import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace isolated for session" }, { status: 400 });
    }

    // 1. Query database counts
    const feedbackCount = await prisma.feedback.count({ where: { workspaceId } });
    const negativeFeedbackCount = await prisma.feedback.count({ 
      where: { workspaceId, sentiment: { lt: 0.0 } } 
    });
    
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newThisWeek = await prisma.feedback.count({ 
      where: { workspaceId, createdAt: { gte: lastWeek } } 
    });

    const activeThemesCount = await prisma.theme.count({ where: { workspaceId } });
    const reportCount = await prisma.report.count({ where: { workspaceId } });
    const membersCount = await prisma.workspaceMembership.count({ where: { workspaceId } });
    const csvCount = await prisma.feedback.count({ where: { workspaceId, source: "CSV" } });

    // 2. Map Onboarding Checklist statuses
    const onboardingTasks = [
      { id: "verifyEmail", label: "Verify Email", completed: true },
      { id: "inviteMembers", label: "Invite Team Members", completed: membersCount > 1 },
      { id: "addFeedback", label: "Add First Feedback", completed: feedbackCount > 0 },
      { id: "uploadCsv", label: "Upload CSV", completed: csvCount > 0 },
      { id: "exploreAnalytics", label: "Explore Analytics", completed: activeThemesCount > 0 },
      { id: "generateReport", label: "Generate First Report", completed: reportCount > 0 },
      { id: "askLoop", label: "Ask LOOP", completed: feedbackCount > 0 && activeThemesCount > 0 }
    ];

    const completedCount = onboardingTasks.filter((t) => t.completed).length;
    const progressPercentage = Math.round((completedCount / onboardingTasks.length) * 100);

    // 3. Query Sentiment Distribution
    const positiveCount = await prisma.feedback.count({
      where: { workspaceId, sentiment: { gt: 0.1 } }
    });
    const negativeCount = await prisma.feedback.count({
      where: { workspaceId, sentiment: { lt: -0.1 } }
    });
    const neutralCount = await prisma.feedback.count({
      where: { 
        workspaceId, 
        sentiment: { gte: -0.1, lte: 0.1 } 
      }
    });

    const resolvedCount = await prisma.feedback.count({
      where: { workspaceId, status: { in: ["Resolved", "Closed"] } }
    });

    const openCount = await prisma.feedback.count({
      where: { workspaceId, status: { notIn: ["Resolved", "Closed", "Duplicate", "Spam"] } }
    });

    const duplicateCount = await prisma.feedback.count({
      where: { workspaceId, status: "Duplicate" }
    });

    // 4. Generate Volume Trend for the last 7 days
    const volumeTrend: { name: string; value: number }[] = [];
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 5, 59, 999));
      
      const count = await prisma.feedback.count({
        where: {
          workspaceId,
          createdAt: { gte: startOfDay, lte: endOfDay }
        }
      });
      volumeTrend.push({ name: daysOfWeek[startOfDay.getDay()], value: count });
    }

    // 5. Query Top Themes
    const feedbackThemes = await prisma.feedbackTheme.findMany({
      where: { feedback: { workspaceId } },
      include: { theme: true }
    });

    const themeMap: Record<string, number> = {};
    feedbackThemes.forEach((ft) => {
      const name = ft.theme.name;
      themeMap[name] = (themeMap[name] || 0) + 1;
    });

    const topThemes = Object.entries(themeMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      feedbackCount,
      negativeFeedbackCount,
      newThisWeek,
      activeThemesCount,
      reportCount,
      membersCount,
      onboarding: {
        tasks: onboardingTasks,
        progress: progressPercentage
      },
      sentiment: {
        positive: positiveCount,
        negative: negativeCount,
        neutral: neutralCount
      },
      resolutionsCount: resolvedCount,
      openCount: openCount,
      duplicateCount: duplicateCount,
      volumeTrend,
      topThemes
    }, { status: 200 });
  } catch (error) {
    console.error("Dashboard summary API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
