export const dynamic = "force-dynamic";
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

    // Run count queries in parallel
    const [membersCount, feedbackCount, csvCount, activeThemesCount, reportCount] = await Promise.all([
      prisma.workspaceMembership.count({ where: { workspaceId } }),
      prisma.feedback.count({ where: { workspaceId } }),
      prisma.feedback.count({ where: { workspaceId, source: "CSV" } }),
      prisma.theme.count({ where: { workspaceId } }),
      prisma.report.count({ where: { workspaceId } })
    ]);

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

    return NextResponse.json({
      tasks: onboardingTasks,
      progress: progressPercentage
    }, { status: 200 });
  } catch (error) {
    console.error("Dashboard onboarding API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
