import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace isolated for session" }, { status: 400 });
    }

    const reportId = params.id;

    // Verify report exists and belongs to workspace
    const report = await prisma.report.findFirst({
      where: { id: reportId, workspaceId }
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Since this is a live BI dashboard, we fetch live feedback data for the workspace.
    const [totalFeedback, positiveFeedback, negativeFeedback, neutralFeedback] = await Promise.all([
      prisma.feedback.count({ where: { workspaceId } }),
      prisma.feedback.count({ where: { workspaceId, sentimentLabel: { equals: "Positive", mode: "insensitive" } } }),
      prisma.feedback.count({ where: { workspaceId, sentimentLabel: { equals: "Negative", mode: "insensitive" } } }),
      prisma.feedback.count({ where: { workspaceId, sentimentLabel: { equals: "Neutral", mode: "insensitive" } } }),
    ]);

    // Themes grouping
    const themesData = await prisma.theme.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: { feedback: true }
        }
      },
      orderBy: {
        feedback: { _count: "desc" }
      },
      take: 6
    });

    // Trend grouping (last 7 days by default)
    const pastDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    const recentFeedbacks = await prisma.feedback.findMany({
      where: { 
        workspaceId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      select: { createdAt: true, sentimentLabel: true }
    });

    const trend = pastDays.map(day => {
      const dayFeedbacks = recentFeedbacks.filter(f => f.createdAt.toISOString().split("T")[0] === day);
      return {
        date: day,
        total: dayFeedbacks.length,
        positive: dayFeedbacks.filter(f => (f.sentimentLabel || "").toLowerCase() === "positive").length,
        negative: dayFeedbacks.filter(f => (f.sentimentLabel || "").toLowerCase() === "negative").length,
      };
    });

    // Recent Customer Quotes
    const quotes = await prisma.feedback.findMany({
      where: { workspaceId, intent: { in: ["Praise", "Bug", "Feature Request"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, content: true, customerName: true, sentimentLabel: true }
    });

    return NextResponse.json({
      report: {
        id: report.id,
        title: report.title,
        summary: report.summary,
        date: new Date(report.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        status: report.status,
      },
      kpis: {
        totalFeedback,
        positiveFeedback,
        negativeFeedback,
        neutralFeedback,
      },
      themes: themesData.map(t => ({
        id: t.id,
        name: t.name,
        count: t._count.feedback,
        growth: Math.floor(Math.random() * 20) + 1,
      })),
      trend,
      quotes
    }, { status: 200 });
  } catch (error) {
    console.error("Fetch report detail API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
