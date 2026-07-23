import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request,  context: { params: { id: string } }) {
  const params = context?.params || ({} as any);
  const session = await auth();
  try {
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

    // Since this is a live BI dashboard, we fetch the snapshot
    if (report.snapshot && typeof report.snapshot === "object") {
      const snapshot = report.snapshot as any;
      return NextResponse.json({
        report: {
          id: report.id,
          title: report.title,
          summary: report.summary,
          date: new Date(report.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          status: report.status,
        },
        insights: snapshot.insights || [],
        recommendations: snapshot.recommendations || [],
        kpis: snapshot.kpis || { totalFeedback: 0, positiveFeedback: 0, negativeFeedback: 0, neutralFeedback: 0 },
        themes: (snapshot.themes || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          count: t._count?.feedback || 0,
          growth: 0
        })),
        trend: snapshot.trend || [],
        quotes: snapshot.quotes || []
      }, { status: 200 });
    }

    // Fallback for legacy reports without snapshot
    const [totalFeedback, positiveFeedback, negativeFeedback, neutralFeedback] = await Promise.all([
      prisma.feedback.count({ where: { workspaceId } }),
      prisma.feedback.count({ where: { workspaceId, sentimentLabel: { equals: "Positive", mode: "insensitive" } } }),
      prisma.feedback.count({ where: { workspaceId, sentimentLabel: { equals: "Negative", mode: "insensitive" } } }),
      prisma.feedback.count({ where: { workspaceId, sentimentLabel: { equals: "Neutral", mode: "insensitive" } } }),
    ]);

    const themesData = await prisma.theme.findMany({
      where: { workspaceId },
      include: {
        _count: { select: { feedback: true } }
      },
      orderBy: { feedback: { _count: "desc" } },
      take: 6
    });

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
      insights: [],
      recommendations: [],
      kpis: { totalFeedback, positiveFeedback, negativeFeedback, neutralFeedback },
      themes: themesData.map(t => ({ id: t.id, name: t.name, count: t._count.feedback, growth: 0 })),
      trend: [],
      quotes
    }, { status: 200 });
  } catch (error) {
    console.error("Fetch report detail API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request,  context: { params: { id: string } }) {
  const params = context?.params || ({} as any);
  const session = await auth();
  try {
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

    // Only delete the Report itself, leaving Feedback, Imports, Themes intact
    await prisma.report.delete({
      where: { id: reportId }
    });

    return NextResponse.json({ message: "Report deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
