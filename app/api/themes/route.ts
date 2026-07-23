export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  if (process.env.npm_lifecycle_event === "build") return NextResponse.json([]);

  const session = await auth();
  try {
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace isolated for session" }, { status: 400 });
    }

    const themes = await prisma.theme.findMany({
      where: { workspaceId },
      include: {
        feedback: {
          include: {
            feedback: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const items = themes.map((theme) => {
      // Calculate positive sentiment percentage
      const feedbackItems = theme.feedback.map(f => f.feedback);
      const total = feedbackItems.length;
      const positive = feedbackItems.filter(f => f.sentiment !== null && f.sentiment > 0.1).length;
      
      let sentimentSummary = "Insufficient data";
      if (total > 0) {
        const positivePercentage = Math.round((positive / total) * 100);
        sentimentSummary = `${positivePercentage}% positive sentiment`;
      }

      return {
        id: theme.id,
        name: theme.name,
        description: theme.description,
        count: total,
        sentiment: sentimentSummary
      };
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error("Fetch themes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
