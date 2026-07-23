import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// Helper to get week number
function getISOWeekInfo(date: Date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return { year: target.getFullYear(), week: weekNumber };
}

export async function GET(req: Request) {
  if (process.env.NEXT_BUILD_PHASE === "true" || process.env.npm_lifecycle_event === "build") return NextResponse.json([]);

  const session = await auth();
  try {
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let workspaceId = (session.user as any).workspaceId;
    
    // Check membership just to ensure we have the correct active workspace
    const membership = await prisma.workspaceMembership.findFirst({
      where: { userId: session.user.id }
    });
    if (membership) {
      workspaceId = membership.workspaceId;
    }

    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace isolated for session" }, { status: 400 });
    }

    const searchParams = (req.nextUrl?.searchParams || new URL(req.url || 'http://localhost').searchParams);
    const period = searchParams.get("period") || "daily";

    // Define the date range based on the period to keep graphs readable
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (period === "daily") {
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
    } else if (period === "weekly") {
      startDate.setDate(startDate.getDate() - 7 * 12); // Last 12 weeks
    } else if (period === "monthly") {
      startDate.setMonth(startDate.getMonth() - 12); // Last 12 months
      startDate.setDate(1);
    } else if (period === "yearly") {
      startDate = new Date(1970, 0, 1); // Get all time data for yearly
    }

    // Fetch all feedback within the date range based on upload date
    const feedbacks = await prisma.feedback.findMany({
      where: {
        workspaceId,
        importedAt: { gte: startDate }
      },
      select: { importedAt: true, sentimentLabel: true, occurrenceCount: true }
    });

    const groupedData = new Map<string, { value: number; negativeValue: number }>();

    feedbacks.forEach(f => {
      const d = new Date(f.importedAt);
      let groupKey = "";
      
      if (period === "daily") {
        groupKey = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      } else if (period === "weekly") {
        const { week } = getISOWeekInfo(d);
        groupKey = `Week ${week}`;
      } else if (period === "monthly") {
        groupKey = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      } else if (period === "yearly") {
        groupKey = d.getFullYear().toString();
      }

      if (!groupedData.has(groupKey)) {
        groupedData.set(groupKey, { value: 0, negativeValue: 0 });
      }

      const count = f.occurrenceCount || 1;
      const current = groupedData.get(groupKey)!;
      current.value += count;
      if (f.sentimentLabel && f.sentimentLabel.toLowerCase() === "negative") {
        current.negativeValue += count;
      }
    });

    // Generate full timeline blanks to ensure no missing gaps in the chart
    const trendData: { name: string; value: number; negativeValue: number }[] = [];
    const now = new Date();
    
    if (period === "daily") {
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        trendData.push({
          name: key,
          value: groupedData.get(key)?.value || 0,
          negativeValue: groupedData.get(key)?.negativeValue || 0,
        });
      }
    } else if (period === "weekly") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i * 7);
        const { week } = getISOWeekInfo(d);
        const key = `Week ${week}`;
        trendData.push({
          name: key,
          value: groupedData.get(key)?.value || 0,
          negativeValue: groupedData.get(key)?.negativeValue || 0,
        });
      }
    } else if (period === "monthly") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        trendData.push({
          name: key,
          value: groupedData.get(key)?.value || 0,
          negativeValue: groupedData.get(key)?.negativeValue || 0,
        });
      }
    } else if (period === "yearly") {
      const years = Array.from(groupedData.keys()).map(y => parseInt(y)).filter(y => !isNaN(y));
      if (years.length > 0) {
        const minYear = Math.min(...years, now.getFullYear() - 4); // Show at least last 5 years context if small
        const maxYear = Math.max(...years, now.getFullYear());
        for (let y = minYear; y <= maxYear; y++) {
          const key = y.toString();
          trendData.push({
            name: key,
            value: groupedData.get(key)?.value || 0,
            negativeValue: groupedData.get(key)?.negativeValue || 0,
          });
        }
      } else {
        trendData.push({
          name: now.getFullYear().toString(),
          value: 0,
          negativeValue: 0,
        });
      }
    }

    return NextResponse.json(trendData, { status: 200 });
  } catch (error) {
    console.error("Trends API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
