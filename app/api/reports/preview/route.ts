import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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

    const searchParams = (req.nextUrl?.searchParams || new URL(req.url || 'http://localhost').searchParams);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (!startDateParam || !endDateParam) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    const startDate = new Date(startDateParam);
    startDate.setUTCHours(0, 0, 0, 0);
    
    const endDate = new Date(endDateParam);
    endDate.setUTCHours(23, 59, 59, 999);

    const dateFilter = {
      gte: startDate,
      lte: endDate,
    };

    // 1. Fetch Matching Imports by their ingestion timestamp
    const matchingImports = await prisma.import.findMany({
      where: {
        workspaceId,
        createdAt: dateFilter
      },
      select: {
        id: true,
        fileName: true,
        createdAt: true,
        validRecords: true
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    if (matchingImports.length === 0) {
      return NextResponse.json({
        totalFeedback: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        themesCount: 0,
        channelsCount: 0,
        duplicateCount: 0,
        matchingImports: []
      });
    }

    const importIds = matchingImports.map(i => i.id);

    // 2. Fetch feedbacks tied ONLY to those imports
    const allFeedbacks = await prisma.feedback.findMany({
      where: {
        workspaceId,
        importId: { in: importIds }
      },
      select: {
        sentimentLabel: true,
        source: true,
        duplicateOf: true
      },
    });

    const totalFeedback = allFeedbacks.length;
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    let duplicateCount = 0;

    allFeedbacks.forEach((f) => {
      const sentiment = (f.sentimentLabel || "").toLowerCase();
      if (sentiment === "positive") positive++;
      else if (sentiment === "negative") negative++;
      else neutral++;

      if (f.duplicateOf !== null) duplicateCount++;
    });

    // 3. Determine unique themes in this dataset
    const themesData = await prisma.theme.findMany({
      where: { workspaceId },
      include: {
        feedback: {
          where: {
            feedback: {
              importId: { in: importIds }
            },
          },
        },
      },
    });
    
    // Only count themes that actually have feedback in this range
    const themesCount = themesData.filter(t => t.feedback.length > 0).length;

    // Unique Channels
    const channels = new Set(allFeedbacks.map(f => f.source));
    const channelsCount = channels.size;

    return NextResponse.json({
      totalFeedback,
      positive,
      neutral,
      negative,
      themesCount,
      channelsCount,
      duplicateCount,
      matchingImports
    });
  } catch (error) {
    console.error("Preview report API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
