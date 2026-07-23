import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NEXT_BUILD_PHASE === "true" || process.env.npm_lifecycle_event === "build") return NextResponse.json([]);

  const session = await auth();
  try {
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

    // Fetch stats in parallel to save execution time
    const [total, positiveCount, negativeCount, neutralCount, activeThemesCount, reportCount] = await Promise.all([
      prisma.feedback.count({ where: { workspaceId } }),
      prisma.feedback.count({ where: { workspaceId, sentimentLabel: "Positive" } }),
      prisma.feedback.count({ where: { workspaceId, sentimentLabel: "Negative" } }),
      prisma.feedback.count({ where: { workspaceId, sentimentLabel: "Neutral" } }),
      prisma.theme.count({ where: { workspaceId } }),
      prisma.report.count({ where: { workspaceId } })
    ]);

    const positivePercentage = total > 0 ? Math.round((positiveCount / total) * 100) : 0;
    const negativePercentage = total > 0 ? Math.round((negativeCount / total) * 100) : 0;
    const neutralPercentage = total > 0 ? Math.round((neutralCount / total) * 100) : 0;

    const resolutionsCount = await prisma.feedback.count({
      where: {
        workspaceId,
        status: {
          in: ["Resolved", "Closed", "Completed", "Done"]
        }
      }
    });

    // Calculate real duplicates directly from the database
    // duplicates = (total occurrences) - (unique feedback rows)
    const feedbackAgg = await prisma.feedback.aggregate({
      _sum: {
        occurrenceCount: true
      },
      _count: {
        _all: true
      },
      where: { workspaceId }
    });

    const totalOccurrences = feedbackAgg._sum.occurrenceCount || 0;
    const uniqueRows = feedbackAgg._count._all || 0;
    let trueDuplicates = totalOccurrences > uniqueRows ? totalOccurrences - uniqueRows : 0;

    // VALIDATION: Duplicate count can NEVER exceed total unique feedback count (as per rules)
    if (trueDuplicates > total) {
      console.error(`Validation Error: Duplicates (${trueDuplicates}) exceeded Total Feedback (${total}). Returning 0.`);
      trueDuplicates = 0;
    }

    const duplicateRate = (total + trueDuplicates) > 0 
      ? Number(((trueDuplicates / (total + trueDuplicates)) * 100).toFixed(1)) 
      : 0;

    return NextResponse.json({
      feedbackCount: total,
      positive: positivePercentage,
      negative: negativePercentage,
      neutral: neutralPercentage,
      activeThemesCount,
      resolutionsCount,
      duplicatesCount: trueDuplicates,
      duplicateRate
    }, { status: 200 });
  } catch (error) {
    console.error("Dashboard stats API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
