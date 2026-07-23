import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// 1. GET - Retrieve workspace reports list
export async function GET() {
  if (process.env.NEXT_BUILD_PHASE === "true" || process.env.npm_lifecycle_event === "build") return NextResponse.json([]);

  const session = await auth();
  try {
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace isolated for session" }, { status: 400 });
    }

    const items = await prisma.report.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" }
    });

    const formatted = await Promise.all(items.map(async (r) => {
      let totalFeedback = 0;
      let positivePercent = 0;
      let neutralPercent = 0;
      let negativePercent = 0;

      if (r.snapshot && typeof r.snapshot === "object" && (r.snapshot as any).kpis) {
        // Read strictly from snapshot
        const snapshot = r.snapshot as any;
        const kpis = snapshot.kpis;
        totalFeedback = kpis.totalFeedback || 0;
        const pos = kpis.positiveFeedback || 0;
        const neg = kpis.negativeFeedback || 0;
        const neu = kpis.neutralFeedback || 0;
        
        if (totalFeedback > 0) {
          positivePercent = Math.round((pos / totalFeedback) * 100);
          negativePercent = Math.round((neg / totalFeedback) * 100);
          neutralPercent = 100 - positivePercent - negativePercent;
        }
      } else {
        // Legacy fallback calculation
        const feedbacks = await prisma.feedback.findMany({
          where: { 
            workspaceId,
            createdAt: { lte: r.createdAt }
          },
          select: { sentimentLabel: true }
        });

        totalFeedback = feedbacks.length;
        let positive = 0, neutral = 0, negative = 0;
        
        feedbacks.forEach(f => {
          const sentiment = (f.sentimentLabel || "").toLowerCase();
          if (sentiment === "positive") positive++;
          else if (sentiment === "negative") negative++;
          else neutral++;
        });

        if (totalFeedback > 0) {
          positivePercent = Math.round((positive / totalFeedback) * 100);
          negativePercent = Math.round((negative / totalFeedback) * 100);
          neutralPercent = 100 - positivePercent - negativePercent;
        }
      }

      return {
        id: r.id,
        title: r.title,
        summary: r.summary,
        status: r.status === "READY" ? "Ready" : "Draft",
        date: new Date(r.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        }),
        stats: {
          totalFeedback,
          positive: positivePercent,
          neutral: neutralPercent,
          negative: negativePercent
        }
      };
    }));

    return NextResponse.json({ items: formatted }, { status: 200 });
  } catch (error) {
    console.error("Fetch reports error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 2. POST - Generate a new VOC report snapshot
export async function POST(req: Request) {
  const session = await auth();
  try {
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace isolated for session" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { startDate: startDateParam, endDate: endDateParam } = body;

    if (!startDateParam || !endDateParam) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    const startDate = new Date(startDateParam);
    startDate.setUTCHours(0, 0, 0, 0);
    
    const endDate = new Date(endDateParam);
    endDate.setUTCHours(23, 59, 59, 999);
    
    const dateFilter = { gte: startDate, lte: endDate };

    // Fetch Matching Imports by their ingestion timestamp
    const matchingImports = await prisma.import.findMany({
      where: {
        workspaceId,
        createdAt: dateFilter
      },
      select: { id: true }
    });

    if (matchingImports.length === 0) {
      return NextResponse.json(
        { error: "Cannot generate reports without workspace imports in the selected date range." },
        { status: 400 }
      );
    }

    const importIds = matchingImports.map(i => i.id);

    // Fetch Feedback tied to these exact imports
    const feedbacks = await prisma.feedback.findMany({
      where: { workspaceId, importId: { in: importIds } },
      select: { id: true, content: true, customerName: true, sentimentLabel: true, createdAt: true }
    });

    if (feedbacks.length === 0) {
      return NextResponse.json(
        { error: "No feedback found in the matched imports." },
        { status: 400 }
      );
    }

    // Build KPIs
    const totalFeedback = feedbacks.length;
    let positiveFeedback = 0, negativeFeedback = 0, neutralFeedback = 0;
    
    feedbacks.forEach(f => {
      const sentiment = (f.sentimentLabel || "").toLowerCase();
      if (sentiment === "positive") positiveFeedback++;
      else if (sentiment === "negative") negativeFeedback++;
      else neutralFeedback++;
    });

    // Build Quotes
    const quotes = feedbacks
      .filter(f => (f.content || "").length > 50)
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map(f => ({
        id: f.id,
        content: f.content,
        customerName: f.customerName,
        sentimentLabel: f.sentimentLabel
      }));

    // Build Themes
    const themesData = await prisma.theme.findMany({
      where: { workspaceId },
      include: {
        feedback: {
          where: { feedback: { importId: { in: importIds } } },
        }
      }
    });

    const themes = themesData
      .filter(t => t.feedback.length > 0)
      .map(t => ({
        id: t.id,
        name: t.name,
        _count: { feedback: t.feedback.length }
      }))
      .sort((a, b) => b._count.feedback - a._count.feedback)
      .slice(0, 5);

    // Build Insights and Recommendations
    const insights = themes.slice(0, 3).map(t => 
      `Customers frequently mention "${t.name}", accounting for ${t._count.feedback} feedback items.`
    );

    const recommendations = [
      { priority: "High", text: `Investigate root causes for negative feedback in the "${themes[0]?.name || 'Product'}" category to reduce churn.` },
      { priority: "Medium", text: `Capitalize on positive sentiment regarding "${themes[1]?.name || 'Support'}" in marketing campaigns.` },
      { priority: "Low", text: "Regularly audit the duplicate rate of incoming feedback to ensure clean data pipelines." }
    ];

    // Build Trend
    const trendMap = new Map<string, number>();
    feedbacks.forEach(f => {
      const dateKey = new Date(f.createdAt).toISOString().split("T")[0];
      trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + 1);
    });
    
    const trend = Array.from(trendMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, total]) => ({ date, total }));

    // Construct JSON Snapshot payload
    const snapshotPayload = {
      kpis: {
        totalFeedback,
        positiveFeedback,
        neutralFeedback,
        negativeFeedback
      },
      themes,
      quotes,
      insights,
      recommendations,
      trend
    };

    const sDate = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const eDate = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const reportTitle = `Voice of Customer Brief (${sDate} - ${eDate})`;
    const summaryText = `This report audits ${totalFeedback} customer feedback items between ${sDate} and ${eDate}. We detected ${positiveFeedback} positive praise records and ${negativeFeedback} negative pain points.`;

    const report = await prisma.report.create({
      data: {
        workspaceId,
        title: reportTitle,
        summary: summaryText,
        status: "READY",
        startDate,
        endDate,
        snapshot: snapshotPayload as any
      }
    });

    return NextResponse.json({ message: "Report generated successfully", item: report }, { status: 201 });
  } catch (error) {
    console.error("Generate report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
